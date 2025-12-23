export function trackEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    navigator.sendBeacon?.(
      "/api/analytics",
      JSON.stringify({ name, payload, timestamp: new Date().toISOString() })
    );
  } catch {
    // no-op
  }
  // Fallback log for MVP
  console.info("[analytics]", name, payload ?? {});
}
