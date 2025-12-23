export function daysBetween(a: string, b: string) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function normalizeDate(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (slashMatch) {
    const a = Number(slashMatch[1]);
    const b = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const day = a > 12 && b <= 12 ? a : b > 12 && a <= 12 ? b : a;
    const month = day === a ? b : a;
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : iso;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
