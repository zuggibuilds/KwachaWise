export type AnalyticsPayload = Record<string, unknown>;

export function trackEvent(name: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('analytics:event', {
      detail: {
        name,
        payload,
        timestamp: new Date().toISOString()
      }
    })
  );
}