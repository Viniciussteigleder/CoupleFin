import { NextResponse } from "next/server";
import { aiPrompts } from "@/lib/ai/prompts";
import { callOpenAI } from "@/lib/ai/openai";

function parseHeuristic(text: string) {
  const amountMatch = text.match(/(\d+[\.,]\d{2})/g)?.pop();
  const dateMatch = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/g)?.[0];
  const amount = amountMatch ? Number(amountMatch.replace(".", "").replace(",", ".")) : null;
  let date = "";
  if (dateMatch) {
    const [d, m, y] = dateMatch.split(/[\/\-]/);
    const year = y.length === 2 ? `20${y}` : y;
    date = `${year}-${m}-${d}`;
  }
  return {
    description: "",
    merchant: "",
    amount,
    date,
    currency: "EUR",
    confidence: amount && date ? 0.45 : 0.2,
  };
}

type OcrRequest = {
  imageDataUrl?: string;
  text?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OcrRequest;

  if (body.imageDataUrl) {
    const prompt = aiPrompts.ocrExtract;
    const aiResult = await callOpenAI([
      { role: "system", content: prompt.system },
      {
        role: "user",
        content: [
          { type: "text", text: prompt.user({ text: "" }) },
          { type: "image_url", image_url: { url: body.imageDataUrl } },
        ],
      },
    ]);

    if (aiResult) {
      return NextResponse.json({ ok: true, data: aiResult });
    }
  }

  const text = body.text ?? "";
  if (!text) {
    return NextResponse.json({ ok: true, data: parseHeuristic("") });
  }

  const prompt = aiPrompts.ocrExtract;
  const aiResult = await callOpenAI([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user({ text }) },
  ]);

  if (aiResult) {
    return NextResponse.json({ ok: true, data: aiResult });
  }

  return NextResponse.json({ ok: true, data: parseHeuristic(text) });
}
