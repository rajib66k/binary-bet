const configuredApiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_URL =
    configuredApiUrl ??
    (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : "http://localhost:5000");

export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem("binary_bet_access_token");
}

export function setAccessToken(token: string) {
    localStorage.setItem("binary_bet_access_token", token);
}

export function clearAccessToken() {
    localStorage.removeItem("binary_bet_access_token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getAccessToken();
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAccessToken();

        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("binary-bet-auth-expired"));
        }
    }

    return response;
}

export { API_URL };