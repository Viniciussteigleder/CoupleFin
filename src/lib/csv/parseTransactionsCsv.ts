import Papa from "papaparse";

type RawRow = Record<string, string>;

export type ParsedTransactionRow = {
  date: string;
  description: string;
  amount: number;
  currency: string;
  category1?: string;
  category2?: string;
  rawRow: RawRow;
};

export type ParseResult = {
  rows: ParsedTransactionRow[];
  errors: string[];
  delimiter: "," | ";";
  headers: string[];
};

const REQUIRED_HEADERS = ["date", "description", "amount", "currency"];

const detectDelimiter = (headerLine: string): "," | ";" => {
  const sanitized = headerLine.replace(/"[^"]*"/g, "");
  const commaCount = (sanitized.match(/,/g) ?? []).length;
  const semicolonCount = (sanitized.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ";" : ",";
};

const cleanValue = (value?: string) => value?.trim() ?? "";

const normalizeAmount = (value: string): number | null => {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  let normalized = raw;

  if (raw.includes(",") && raw.includes(".")) {
    normalized = raw.replace(/\./g, "").replace(/,/g, ".");
  } else if (raw.includes(",")) {
    normalized = raw.replace(/,/g, ".");
  }

  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return null;
};

const normalizeDate = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().split("T")[0];
};

export const parseTransactionsCsv = (content: string): ParseResult => {
  const firstLineMatch = content.split(/\r?\n/).find((line) => line.trim().length > 0);
  const delimiter = firstLineMatch ? detectDelimiter(firstLineMatch) : ",";

  const parsed = Papa.parse<RawRow>(content, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (header) => header?.trim().toLowerCase() ?? "",
  });

  const headers = parsed.meta.fields
    ? parsed.meta.fields.map((field) => field?.trim().toLowerCase() ?? "")
    : [];

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    return {
      rows: [],
      errors: [
        `Faltam colunas obrigatórias: ${missingHeaders.join(", ")}. ` +
          "Use um CSV com date, description, amount e currency.",
      ],
      delimiter,
      headers,
    };
  }

  const errors: string[] = [];
  const rows: ParsedTransactionRow[] = [];

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const rawRow: RawRow = {};
    Object.entries(row).forEach(([key, value]) => {
      rawRow[key] = value?.trim() ?? "";
    });

    const dateValue = cleanValue(row["date"]);
    const descValue = cleanValue(row["description"]);
    const amountValue = cleanValue(row["amount"]);
    const currencyValue = cleanValue(row["currency"]);

    if (!dateValue) {
      errors.push(`Linha ${rowNumber}: campo "date" ausente.`);
      return;
    }

    if (!descValue) {
      errors.push(`Linha ${rowNumber}: campo "description" ausente.`);
      return;
    }

    if (!amountValue) {
      errors.push(`Linha ${rowNumber}: campo "amount" ausente.`);
      return;
    }

    if (!currencyValue) {
      errors.push(`Linha ${rowNumber}: campo "currency" ausente.`);
      return;
    }

    const parsedDate = normalizeDate(dateValue);
    if (!parsedDate) {
      errors.push(`Linha ${rowNumber}: data inválida (${dateValue}).`);
      return;
    }

    const parsedAmount = normalizeAmount(amountValue);
    if (parsedAmount === null) {
      errors.push(`Linha ${rowNumber}: valor inválido (${amountValue}).`);
      return;
    }

    const category1 = cleanValue(row["category1"]);
    const category2 = cleanValue(row["category2"]);

    rows.push({
      date: parsedDate,
      description: descValue,
      amount: parsedAmount,
      currency: currencyValue,
      category1: category1 || undefined,
      category2: category2 || undefined,
      rawRow,
    });
  });

  return {
    rows,
    errors,
    delimiter,
    headers,
  };
};
