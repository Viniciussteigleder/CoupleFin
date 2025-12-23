import { NextResponse } from "next/server";
import { aiPromptsEnterprise } from "@/lib/ai/promptsEnterprise";
import { callOpenAI } from "@/lib/ai/openai";

const headerAliases = {
  date: [
    "date",
    "data",
    "transactiondate",
    "posteddate",
    "datum",
    "authorisedon",
    "processedon",
  ],
  description: [
    "description",
    "merchant",
    "descricao",
    "historico",
    "memo",
    "beschreibung",
    "keymmdesc",
    "keyamexdesc",
    "erscheintaufihrerabrechnungals",
    "betreff",
  ],
  amount: ["amount", "valor", "value", "total", "amt", "betrag", "weiteredetails"],
};

type CsvMappingRequest = {
  fields: string[];
  samples?: Array<Record<string, string>>;
};

type MappingResponse = {
  dateKey: string;
  descriptionKey: string;
  amountKey: string;
  confidence: number;
  notes?: string[];
  detectedSource?: "MM" | "AMEX" | "UNKNOWN";
  parsing?: {
    date?: { format?: string; preferPurchaseDate?: boolean };
    amount?: {
      decimalSeparator?: string;
      thousandSeparator?: string;
      expenseSign?: string;
    };
    currencyDefault?: string;
  };
};

const scoreAmountKey = (key: string, rows: Array<Record<string, string>>) => {
  let score = 0;
  rows.slice(0, 20).forEach((row) => {
    const value = row[key] ?? "";
    if (/[\\d]/.test(value)) score += 1;
    if (/[\\.,]\\d{1,2}/.test(value)) score += 2;
    if (/^-/.test(value.trim())) score += 1;
  });
  return score;
};

const inferParsing = (rows: Array<Record<string, string>>, amountKey: string, dateKey: string) => {
  const values = rows.map((row) => String(row[amountKey] ?? "")).filter(Boolean);
  const dateValues = rows.map((row) => String(row[dateKey] ?? "")).filter(Boolean);
  const hasComma = values.some((value) => value.includes(","));
  const hasDot = values.some((value) => value.includes("."));
  const decimalSeparator = hasComma && !hasDot ? "," : hasDot && !hasComma ? "." : hasComma && hasDot ? "," : "UNKNOWN";
  const thousandSeparator = hasComma && hasDot ? "." : "NONE";
  const negativeCount = values.filter((value) => value.trim().startsWith("-")).length;
  const positiveCount = values.length - negativeCount;
  const expenseSign =
    negativeCount > 0 && positiveCount > 0
      ? "MIXED"
      : negativeCount > 0
      ? "NEGATIVE"
      : positiveCount > 0
      ? "POSITIVE"
      : "UNKNOWN";
  const format = dateValues.some((value) => /\d{2}\.\d{2}\.\d{4}/.test(value))
    ? "DD.MM.YYYY"
    : dateValues.some((value) => /\d{2}\/\d{2}\/\d{4}/.test(value))
    ? "DD/MM/YYYY"
    : dateValues.some((value) => /\d{4}-\d{2}-\d{2}/.test(value))
    ? "YYYY-MM-DD"
    : "UNKNOWN";

  return {
    date: { format, preferPurchaseDate: true },
    amount: { decimalSeparator, thousandSeparator, expenseSign },
    currencyDefault: "",
  };
};

const detectMapping = (fields: string[], rows: Array<Record<string, string>>): MappingResponse | null => {
  const getKey = (key: keyof typeof headerAliases) =>
    fields.find((field) => headerAliases[key].includes(field));

  const preferredDesc = fields.find((field) => ["keymmdesc", "keyamexdesc"].includes(field));
  const descriptionKey = preferredDesc ?? getKey("description") ?? "";

  const preferredDate = fields.find((field) =>
    ["authorisedon", "processedon", "datum", "date", "data"].includes(field)
  );
  const dateKey = preferredDate ?? getKey("date") ?? "";

  const amountCandidates = fields.filter((field) => headerAliases.amount.includes(field));
  const amountKey = amountCandidates.sort((a, b) => scoreAmountKey(b, rows) - scoreAmountKey(a, rows))[0] ?? "";

  if (!dateKey || !descriptionKey || !amountKey) return null;
  const detectedSource =
    fields.some((field) => ["authorisedon", "processedon", "paymenttype", "status"].includes(field))
      ? "MM"
      : fields.some((field) => ["datum", "beschreibung", "betrag", "weiteredetails"].includes(field))
      ? "AMEX"
      : "UNKNOWN";
  return {
    dateKey,
    descriptionKey,
    amountKey,
    confidence: 0.75,
    detectedSource,
    parsing: inferParsing(rows, amountKey, dateKey),
  };
};

const normalizeAiMapping = (aiResult: Record<string, unknown>): MappingResponse | null => {
  if (!aiResult) return null;
  if (aiResult.version === "2.0" && typeof aiResult.mapping === "object") {
    const mapping = aiResult.mapping as { dateKey?: string; descriptionKey?: string; amountKey?: string };
    if (!mapping?.dateKey || !mapping?.descriptionKey || !mapping?.amountKey) return null;
    return {
      dateKey: String(mapping.dateKey),
      descriptionKey: String(mapping.descriptionKey),
      amountKey: String(mapping.amountKey),
      confidence: typeof aiResult.confidence === "number" ? aiResult.confidence : 0.5,
      notes: Array.isArray(aiResult.notes) ? (aiResult.notes as string[]) : [],
      detectedSource: (aiResult.detectedSource as "MM" | "AMEX" | "UNKNOWN") ?? "UNKNOWN",
      parsing: aiResult.parsing as MappingResponse["parsing"],
    };
  }

  if (
    typeof aiResult.dateKey === "string" &&
    typeof aiResult.descriptionKey === "string" &&
    typeof aiResult.amountKey === "string"
  ) {
    return {
      dateKey: aiResult.dateKey,
      descriptionKey: aiResult.descriptionKey,
      amountKey: aiResult.amountKey,
      confidence: typeof aiResult.confidence === "number" ? aiResult.confidence : 0.5,
      notes: Array.isArray(aiResult.notes) ? (aiResult.notes as string[]) : [],
    };
  }

  return null;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CsvMappingRequest;
  const fields = body.fields ?? [];
  const samples = body.samples ?? [];

  const heuristic = detectMapping(fields, samples);
  if (heuristic) {
    return NextResponse.json({ ok: true, data: heuristic });
  }

  const prompt = aiPromptsEnterprise.csvMapping_v2;
  const aiResult = await callOpenAI([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user({ fields, samples }) },
  ]);

  const normalized = normalizeAiMapping(aiResult ?? {});
  if (!normalized?.dateKey && !normalized?.descriptionKey && !normalized?.amountKey) {
    return NextResponse.json({ ok: true, data: null });
  }

  return NextResponse.json({
    ok: true,
    data: {
      dateKey: normalized?.dateKey ?? "",
      descriptionKey: normalized?.descriptionKey ?? "",
      amountKey: normalized?.amountKey ?? "",
      confidence: normalized?.confidence ?? 0.5,
      notes: normalized?.notes ?? [],
      detectedSource: normalized?.detectedSource ?? "UNKNOWN",
      parsing: normalized?.parsing ?? inferParsing(samples, normalized?.amountKey ?? "", normalized?.dateKey ?? ""),
    } as MappingResponse,
  });
}
