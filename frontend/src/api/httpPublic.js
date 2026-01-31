// src/api/httpPublic.js
const API_BASE = "http://localhost:8002";

export async function httpPublic(
    url,
    { method = "GET", body, headers = {}, isFormData = false } = {}
) {
    const finalHeaders = { ...headers };

    if (body && !isFormData && method !== "DELETE") {
        finalHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: finalHeaders,
        body: body
            ? isFormData
                ? body
                : JSON.stringify(body)
            : undefined,
    });

    // 🔥 HANDLE NO-CONTENT RESPONSES
    if (res.status === 204) {
        return null;
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
        throw new Error(data?.detail || "Public request failed");
    }

    return data;
}
