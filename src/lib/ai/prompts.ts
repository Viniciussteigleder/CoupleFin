export const aiPrompts = {
  csvMapping: {
    system:
      "You are a senior fintech data-import assistant. Map CSV headers to required fields with high precision. Prefer deterministic matches and avoid guessing.",
    user: (payload: { fields: string[]; samples: Array<Record<string, string>> }) => {
      return [
        "We need to map a bank CSV to the required columns:",
        "- date: transaction date",
        "- description: merchant or description",
        "- amount: signed or absolute amount",
        "Special cases:",
        "- M&M: prefer Key_MM_Desc as description, Authorised on or Processed on as date, Amount as amount.",
        "- Amex: prefer Key_Amex_Desc or Beschreibung as description, Datum as date, and Betrag/Amount as amount.",
        "- If a preamble row exists, select the real header row before mapping.",
        "Return JSON only with keys: dateKey, descriptionKey, amountKey, confidence (0-1), notes.",
        "If unsure, leave key empty and set confidence <= 0.4.",
        `Fields: ${JSON.stringify(payload.fields)}`,
        `Samples: ${JSON.stringify(payload.samples)}`,
      ].join("\n");
    },
  },
  categorize: {
    system:
      "You are a precise categorization assistant for personal finance. Only choose from provided categories and be conservative.",
    user: (payload: {
      categories: Array<{ id: string; name: string }>;
      rows: Array<{ description: string; amount: number; date: string }>;
    }) => {
      return [
        "Assign a category to each transaction using the provided category list.",
        "Match vendor names or obvious keywords in the description when possible.",
        "Return JSON only: { assignments: [{ index, categoryId, confidence, rationale }] }.",
        "If unsure, set categoryId to null and confidence <= 0.4.",
        `Categories: ${JSON.stringify(payload.categories)}`,
        `Transactions: ${JSON.stringify(payload.rows)}`,
      ].join("\n");
    },
  },
  ocrExtract: {
    system:
      "You extract receipt data for finance apps. Provide conservative, accurate results. Do not hallucinate.",
    user: (payload: { text?: string }) => {
      return [
        "Extract: description, amount (number), date (YYYY-MM-DD), currency, merchant, confidence (0-1).",
        "Return JSON only. If unsure, keep confidence low and leave fields empty.",
        payload.text ? `OCR Text: ${payload.text}` : "OCR Text: (none)",
      ].join("\n");
    },
  },
  insights: {
    system:
      "You are a finance coach. Use only provided numbers. No hallucination.",
    user: (payload: { context: string }) => {
      return [
        "Write up to 3 short insights. Use only given data.",
        "Return JSON only: { insights: [{ title, body, severity, ctaLabel, ctaHref }] }.",
        payload.context,
      ].join("\n");
    },
  },
};
