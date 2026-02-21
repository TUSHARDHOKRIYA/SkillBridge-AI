/**
 * Shared API helper for SkillBridge AI frontend.
 * Automatically attaches the Firebase auth token to every request.
 */
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the current user's Firebase ID token, or null if not logged in.
 */
async function getAuthToken(): Promise<string | null> {
    if (!auth || !auth.currentUser) return null;
    try {
        return await auth.currentUser.getIdToken();
    } catch {
        return null;
    }
}

/**
 * Build headers with optional Authorization token.
 */
async function buildHeaders(extra: Record<string, string> = {}): Promise<HeadersInit> {
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

/**
 * GET request with auth token.
 */
export async function apiGet<T = any>(path: string): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${API_URL}${path}`, { method: "GET", headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `GET ${path} failed: ${res.status}`);
    }
    return res.json();
}

/**
 * POST request with JSON body and auth token.
 */
export async function apiPost<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `POST ${path} failed: ${res.status}`);
    }
    return res.json();
}

/**
 * POST request with FormData (for file uploads) and auth token.
 */
export async function apiPostForm<T = any>(path: string, formData: FormData): Promise<T> {
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `POST ${path} (form) failed: ${res.status}`);
    }
    return res.json();
}

/**
 * PATCH request with JSON body and auth token.
 */
export async function apiPatch<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${API_URL}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `PATCH ${path} failed: ${res.status}`);
    }
    return res.json();
}
