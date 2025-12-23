
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findDuplicates } from "@/lib/server/deduplication";
import { logTransactionEvent } from "@/lib/server/audit";

type ImportRow = {
  merchant: string;
  amount: number;
  date: string;
  sourceMeta?: Record<string, unknown>;
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

    // 1. Get couple_id
    const { data: member } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "No couple found" }, { status: 400 });
    }
    const coupleId = member.couple_id;

    // 2. Parse Payload
    const body = await request.json();
    const rows = body.rows as ImportRow[];
    const fileName = body.fileName as string;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Invalid rows" }, { status: 400 });
    }

    // 3. Deduplication Check
    const candidates = rows.map((r) => ({
      merchant: r.merchant,
      amount: r.amount, // Expecting signed amount (amount_cf)
      date: r.date,
    }));
    
    const duplicatesMap = await findDuplicates(candidates);

    // 4. Prepare Inserts
    const toInsert = [];
    let duplicatesCount = 0;
    
    // Create upload record first to link transactions
    const { data: uploadData, error: uploadError } = await supabase
      .from("uploads")
      .insert({
        filename: fileName,
        url: `local://${fileName}`,
        status: "processing",
        couple_id: coupleId,
        metadata: { type: "csv", count: rows.length }
      })
      .select("id")
      .single();
      
    if (uploadError) throw uploadError;
    const uploadId = uploadData.id;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const duplicateMatch = duplicatesMap.get(i);
        
        toInsert.push({
            merchant: row.merchant,
            amount: Math.abs(row.amount),
            amount_cf: row.amount,
            date: row.date,
            status: duplicateMatch ? "duplicate" : "pending",
            source: "csv",
            couple_id: coupleId,
            upload_id: uploadId,
            source_meta: row.sourceMeta ?? null,
            // If duplicate, could store reference to original? 
            // For now, MVP just marks status=duplicate
        });

        if (duplicateMatch) duplicatesCount++;
    }

    // 5. Bulk Insert
    const { data: inserted, error: insertError } = await supabase
      .from("transactions")
      .insert(toInsert)
      .select("id, merchant, category_id");

    if (insertError) throw insertError;
    
    // 6. Apply Rules (Server-side)
    // Fetch all rules for this couple
    const { data: rules } = await supabase
        .from("rules")
        .select("id, keyword, category_id")
        .eq("couple_id", coupleId);
        
    let rulesApplied = 0;
    
    if (rules && rules.length > 0 && inserted && inserted.length > 0) {
        // Simple iterating for now. Optimize with SQL `UPDATE ... FROM ...` later if slow.
        // Or do client-side style matching but on server
        
        for (const rule of rules) {
             const matchedIds = inserted
                .filter(tx => 
                    tx.merchant.toLowerCase().includes(rule.keyword.toLowerCase())
                )
                .map(tx => tx.id);
                
             if (matchedIds.length > 0) {
                 await supabase
                    .from("transactions")
                    .update({ category_id: rule.category_id, status: 'confirmed' }) // Auto-confirm? Maybe just categorize
                    .in("id", matchedIds);
                 rulesApplied += matchedIds.length;
             }
        }
    }

    // 7. Update Upload Status & Log Event
    await supabase
        .from("uploads")
        .update({ status: "processed" })
        .eq("id", uploadId);

    await logTransactionEvent("import_csv", uploadId, {
        fileName,
        total: rows.length,
        duplicates: duplicatesCount,
        rulesApplied
    });

    return NextResponse.json({
        success: true,
        summary: {
            total: rows.length,
            duplicates: duplicatesCount,
            inserted: inserted?.length ?? 0
        }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
