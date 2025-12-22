export function parseAmount(value: string): number | null {
  if (!value) return null;
  const normalized = value
    .replace(/[^0-9,.-]/g, "")
    .replace(/\.(?=\d{3,})/g, "")
    .replace(/,/g, ".");

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export function toAmount(raw: number) {
  return Math.abs(raw);
}

export function toAmountCf(raw: number) {
  return raw;
}
