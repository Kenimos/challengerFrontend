import { isExpired } from "./jwt";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5220/api";

export async function apiFetch(input: string, init: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");

    // když je token expirovaný → odhlaš a na login
    if (!token || isExpired(token)) {
        localStorage.removeItem("auth_token");
        // kdyby sis ukládal i user_id apod.
        localStorage.removeItem("user_id");
        // přesměruj hned
        location.assign("/login");
        // vyhoď, aby volající kód skončil
        throw new Error("Unauthorized: token missing/expired");
    }

    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API}${input}`, { ...init, headers });

    // pokud backend vrátí 401 → auto-logout
    if (res.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        location.assign("/login");
        throw new Error("Unauthorized (401)");
    }

    return res;
}
