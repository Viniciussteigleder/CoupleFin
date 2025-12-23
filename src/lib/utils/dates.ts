export function daysBetween(a: string, b: string) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function normalizeDate(raw: string): string | null {
  if (!raw) return null;
  const clean = raw.trim();

  // PT-BR: DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) {
    const [day, month, year] = clean.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  
  // Try casting and see if valid
  const date = new Date(clean);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}
