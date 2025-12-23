
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logTransactionEvent } from "@/lib/server/audit";
import { buildCoupleName } from "@/lib/couples";

type CsvSource = "MM" | "AMEX" | "OTHER";

type ImportRow = {
  merchant: string;
  amount: number;
  date: string;
  sourceMeta?: Record<string, unknown>;
  categoryId?: string;
};

type RawRow = Record<string, string>;

type LayoutPayload = {
  name?: string;
  headerHash: string;
  mapping: Record<string, string>;
  parsing?: Record<string, unknown>;
};

const ensureCoupleId = async (
  supabase: ReturnType<typeof createClient>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null }
) => {
  const { data: member } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.couple_id) return member.couple_id as string;

  const coupleId = crypto.randomUUID();
  const { error: coupleError } = await supabase
    .from("couples")
    .insert({ id: coupleId, name: buildCoupleName(user) });
  if (coupleError) throw coupleError;

  const { error: memberError } = await supabase.from("couple_members").insert({
    couple_id: coupleId,
    user_id: user.id,
    role: "admin",
  });
  if (memberError) {
    const { data: retry } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (retry?.couple_id) return retry.couple_id as string;
    throw memberError;
  }

  return coupleId;
};

const SOURCE_TABLES: Record<
  CsvSource,
  { raw: "mm_raw_transactions" | "amex_raw_transactions" | "other_raw_transactions"; clean: string }
> = {
  MM: { raw: "mm_raw_transactions", clean: "mm_clean_transactions" },
  AMEX: { raw: "amex_raw_transactions", clean: "amex_clean_transactions" },
  OTHER: { raw: "other_raw_transactions", clean: "other_clean_transactions" },
};

const normalizeMerchant = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const buildDedupeKey = (row: ImportRow) => {
  const normalized = normalizeMerchant(row.merchant ?? "");
  const amount = Number(row.amount ?? 0).toFixed(2);
  return `${row.date}|${amount}|${normalized}`;
};

const resolveSource = (value?: string): CsvSource => {
  if (!value) return "OTHER";
  const upper = value.toUpperCase();
  if (upper === "MM" || upper === "M&M") return "MM";
  if (upper === "AMEX") return "AMEX";
  return "OTHER";
};

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupleId = await ensureCoupleId(supabase, user);

    // 2. Parse Payload
    const body = await request.json();
    const rows = body.rows as ImportRow[];
    const rawRows = (body.rawRows ?? []) as RawRow[];
    const fileName = body.fileName as string;
    const source = resolveSource(body.source);
    const layoutId = body.layoutId as string | undefined;
    const layout = body.layout as LayoutPayload | undefined;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Invalid rows" }, { status: 400 });
    }

    // 3. Layout registration (new layouts get saved)
    let resolvedLayoutId = layoutId ?? null;
    if (!resolvedLayoutId && layout?.headerHash) {
      const { data: layoutData, error: layoutError } = await supabase
        .from("csv_layouts")
        .upsert(
          {
            couple_id: coupleId,
            source,
            name: layout.name ?? `${source} layout ${new Date().toISOString().slice(0, 10)}`,
            header_hash: layout.headerHash,
            mapping: layout.mapping,
            parsing: layout.parsing ?? null,
            created_by: user.id,
          },
          { onConflict: "couple_id,source,header_hash" }
        )
        .select("id")
        .single();
      if (layoutError) throw layoutError;
      resolvedLayoutId = layoutData?.id ?? null;
    }

    // 4. Prepare Inserts
    const sourceTables = SOURCE_TABLES[source];
    const dedupeRows = rows.map((row, index) => ({
      row,
      index,
      dedupeKey: buildDedupeKey(row),
      rawRow: rawRows[index] ?? {},
    }));
    const dedupeKeys = Array.from(new Set(dedupeRows.map((item) => item.dedupeKey)));

    const { data: existingClean } = await supabase
      .from(sourceTables.clean)
      .select("id, dedupe_key")
      .in("dedupe_key", dedupeKeys)
      .eq("couple_id", coupleId);

    const existingKeys = new Set(
      (existingClean ?? []).map((row) => row.dedupe_key as string)
    );
    const seenKeys = new Set<string>();
    const cleanPayload: Array<Record<string, unknown>> = [];
    const cleanLookup = new Map<string, ImportRow>();
    const rawPayload: Array<Record<string, unknown>> = [];
    let duplicatesCount = 0;
    
    // Create upload record first to link transactions
    const { data: uploadData, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        filename: fileName,
        url: `local://${fileName}`,
        status: "processing",
        couple_id: coupleId,
        source,
        layout_id: resolvedLayoutId,
        metadata: { type: "csv", count: rows.length }
      })
      .select("id")
      .single();
      
    if (uploadError) throw uploadError;
    const uploadId = uploadData.id;

    for (const entry of dedupeRows) {
      const meta = (entry.row.sourceMeta ?? {}) as Record<string, unknown>;
      const isDuplicate = existingKeys.has(entry.dedupeKey) || seenKeys.has(entry.dedupeKey);
      rawPayload.push({
        couple_id: coupleId,
        upload_id: uploadId,
        layout_id: resolvedLayoutId,
        row_index: entry.index,
        raw_row: entry.rawRow,
        dedupe_key: entry.dedupeKey,
        is_duplicate: isDuplicate,
      });

      if (isDuplicate) {
        duplicatesCount += 1;
        continue;
      }

      seenKeys.add(entry.dedupeKey);
      cleanPayload.push({
        couple_id: coupleId,
        upload_id: uploadId,
        raw_id: null,
        date: entry.row.date,
        merchant: entry.row.merchant,
        amount: Math.abs(entry.row.amount),
        amount_cf: entry.row.amount,
        currency: null,
        source_meta: entry.row.sourceMeta ?? null,
        dedupe_key: entry.dedupeKey,
        manual_type: (meta["type"] as string | null) ?? null,
        manual_fixed_var: (meta["fixed_var"] as string | null) ?? null,
        manual_category_i: (meta["category_i"] as string | null) ?? null,
        manual_category_ii: (meta["category_ii"] as string | null) ?? null,
        manual_note: (meta["manual_note"] as string | null) ?? null,
      });
      cleanLookup.set(entry.dedupeKey, entry.row);
    }

    const { error: rawError } = await supabase
      .from(sourceTables.raw)
      .insert(rawPayload);
    if (rawError) throw rawError;

    let cleanInserted: Array<{ id: string; dedupe_key: string }> = [];
    if (cleanPayload.length) {
      const { data: cleanData, error: cleanError } = await supabase
        .from(sourceTables.clean)
        .insert(cleanPayload)
        .select("id, dedupe_key");
      if (cleanError) throw cleanError;
      cleanInserted = cleanData ?? [];
    }

    const consolidatedPayload = cleanInserted.map((row) => {
      const sourceRow = cleanLookup.get(row.dedupe_key);
      return {
        merchant: sourceRow?.merchant ?? "Transação",
        amount: Math.abs(sourceRow?.amount ?? 0),
        amount_cf: sourceRow?.amount ?? 0,
        date: sourceRow?.date,
        status: "pending",
        source: source === "OTHER" ? "csv" : source,
        couple_id: coupleId,
        upload_id: uploadId,
        source_table: sourceTables.clean,
        source_id: row.id,
        source_meta: sourceRow?.sourceMeta ?? null,
        category_id: sourceRow?.categoryId ?? null,
      };
    });

    let insertedTransactions: Array<{ id: string; merchant: string }> = [];
    if (consolidatedPayload.length) {
      const { data: inserted, error: insertError } = await supabase
        .from("transactions")
        .insert(consolidatedPayload)
        .select("id, merchant");
      if (insertError) throw insertError;
      insertedTransactions = inserted ?? [];
    }

    // 5. Update Upload Status & Log Event
    await supabase
        .from("uploads")
        .update({ status: "processed" })
        .eq("id", uploadId);

    let rulesApplied = 0;
    if (insertedTransactions.length) {
      const { data: rules } = await supabase
        .from("rules")
        .select("id, keyword, category_id")
        .eq("couple_id", coupleId);

      if (rules?.length) {
        for (const rule of rules) {
          const matchedIds = insertedTransactions
            .filter((tx) =>
              (tx.merchant ?? "").toLowerCase().includes(rule.keyword.toLowerCase())
            )
            .map((tx) => tx.id);
          if (matchedIds.length > 0) {
            await supabase
              .from("transactions")
              .update({ category_id: rule.category_id, status: "confirmed" })
              .in("id", matchedIds);
            rulesApplied += matchedIds.length;
          }
        }
      }
    }

    await logTransactionEvent("import_csv", uploadId, {
        fileName,
        total: rows.length,
        duplicates: duplicatesCount,
        cleanInserted: cleanInserted.length,
        source,
        rulesApplied
    });

    await supabase
      .from("couple_flags")
      .upsert({ couple_id: coupleId, has_transactions: true }, { onConflict: "couple_id" });

    return NextResponse.json({
        success: true,
        summary: {
            total: rows.length,
            duplicates: duplicatesCount,
            inserted: cleanInserted.length,
            rulesApplied
        }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
