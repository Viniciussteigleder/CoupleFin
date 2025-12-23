export async function withLatency<T>(fn: () => T, ms = 650): Promise<T> {
  const jitter = Math.floor(Math.random() * 250);
  await new Promise((r) => setTimeout(r, ms + jitter));
  return fn();
}
