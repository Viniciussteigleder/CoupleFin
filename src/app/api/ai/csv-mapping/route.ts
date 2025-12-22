import { NextResponse } from "next/server";
import { aiPrompts } from "@/lib/ai/prompts";
import { callOpenAI } from "@/lib/ai/openai";

const headerAliases = {
  date: ["date", "data", "transactiondate", "posteddate", "datum"],
  description: ["description", "merchant", "descricao", "historico", "memo", "beschreibung"],
  amount: ["amount", "valor", "value", "total", "amt", "betrag"],
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

const detectMapping = (fields: string[]): MappingResponse | null => {
  const getKey = (key: keyof typeof headerAliases) =>
    fields.find((field) => headerAliases[key].includes(field));

  const dateKey = getKey("date") ?? "";
  const descriptionKey = getKey("description") ?? "";
  const amountKey = getKey("amount") ?? "";

  if (!dateKey || !descriptionKey || !amountKey) return null;
  return { dateKey, descriptionKey, amountKey, confidence: 0.75 };
};

export async function POST(request: Request) {
  const body = (await request.json()) as CsvMappingRequest;
  const fields = body.fields ?? [];
  const samples = body.samples ?? [];

  const heuristic = detectMapping(fields);
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
