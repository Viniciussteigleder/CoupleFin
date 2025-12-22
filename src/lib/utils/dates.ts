export function daysBetween(a: string, b: string) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffMs = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
