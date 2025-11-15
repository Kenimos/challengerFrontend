export type JwtPayload = { exp?: number; [k: string]: any };

export function parseJwt(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
        const base64 = token.split(".")[1];
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function isExpired(token: string | null): boolean {
    const p = parseJwt(token);
    if (!p?.exp) return true; // bez exp ber jako expirované
    const now = Math.floor(Date.now() / 1000);
    return p.exp <= now;
}
