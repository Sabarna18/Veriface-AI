// src/api/httpAdmin.js

import { getToken, removeToken } from "../utils/auth";

const API_BASE = "http://localhost:8002";

export async function httpAdmin(
    url,
    { method = "GET", body, headers = {}, isFormData = false } = {}
) {
    const token = getToken();

    if (!token) {
        throw new Error("AUTH_REQUIRED");
    }

    const finalHeaders = {
        Authorization: `Bearer ${token}`,
        ...headers,
    };

    // Only set JSON header when NOT FormData
    if (body && !isFormData && method !== "DELETE") {
        finalHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${url}`, {
        method,
        headers: finalHeaders,
        body: body
            ? isFormData
                ? body
                : method === "DELETE"
                    ? undefined
                    : JSON.stringify(body)
            : undefined,
    });

    if (res.status === 401 || res.status === 403) {
        removeToken();
        throw new Error("AUTH_REQUIRED");
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(data?.detail || "Admin request failed");
    }

    return data;
}
