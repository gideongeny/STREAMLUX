/**
 * Normalizes gateway payloads after axios may unwrap `{ success, data }`.
 */
export function unwrapGatewayList<T = unknown>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (obj.success === true && Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  return [];
}

export function hasHomeContent(data: Record<string, unknown> | null | undefined): boolean {
  if (!data) return false;
  return Object.values(data).some((v) => Array.isArray(v) && v.length > 0);
}
