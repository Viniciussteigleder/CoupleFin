import { NextResponse } from "next/server";
import { aiPrompts } from "@/lib/ai/prompts";
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
  notes?: string;
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
  return { dateKey, descriptionKey, amountKey, confidence: 0.75 };
};

export async function POST(request: Request) {
  const body = (await request.json()) as CsvMappingRequest;
  const fields = body.fields ?? [];
  const samples = body.samples ?? [];

  const heuristic = detectMapping(fields, samples);
  if (heuristic) {
    return NextResponse.json({ ok: true, data: heuristic });
  }

  const prompt = aiPrompts.csvMapping;
  const aiResult = await callOpenAI([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user({ fields, samples }) },
  ]);

  if (!aiResult?.dateKey && !aiResult?.descriptionKey && !aiResult?.amountKey) {
    return NextResponse.json({ ok: true, data: null });
  }

  return NextResponse.json({
    ok: true,
    data: {
      dateKey: aiResult.dateKey ?? "",
      descriptionKey: aiResult.descriptionKey ?? "",
      amountKey: aiResult.amountKey ?? "",
      confidence: typeof aiResult.confidence === "number" ? aiResult.confidence : 0.5,
      notes: aiResult.notes ?? "",
    } as MappingResponse,
  });
}
