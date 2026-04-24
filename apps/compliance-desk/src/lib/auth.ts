/** Decode JWT payload (no signature verification — demo only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): string | undefined {
  const p = decodeJwtPayload(token);
  return typeof p?.role === "string" ? p.role : undefined;
}

export const AUTH_TOKEN_KEY = "cd_access_token";
