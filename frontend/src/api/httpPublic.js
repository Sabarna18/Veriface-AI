// src/api/httpPublic.js

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

/**
 * Normalizes an API endpoint URL.
 *
 * Guarantees:
 * 1. Exactly one leading slash.
 * 2. Exactly one trailing slash before query parameters.
 * 3. Removes accidental duplicate slashes in the pathname.
 * 4. Preserves query parameters.
 *
 * Examples:
 *
 * users
 *      -> /users/
 *
 * /users
 *      -> /users/
 *
 * //users//
 *      -> /users/
 *
 * /users?classroom_id=1
 *      -> /users/?classroom_id=1
 *
 * //attendance//today?classroom_id=1
 *      -> /attendance/today/?classroom_id=1
 */
function normalizeApiUrl(url) {
  const [rawPath, query] = url.split("?", 2);

  // Remove accidental duplicate slashes.
  let path = rawPath.replace(/\/+/g, "/");

  // Guarantee exactly one leading slash.
  path = `/${path.replace(/^\/+/, "")}`;

  // Guarantee exactly one trailing slash.
  path = `${path.replace(/\/+$/, "")}/`;

  return query ? `${path}?${query}` : path;
}

export async function httpPublic(
  url,
  { method = "GET", body = null, headers = {}, isFormData = false } = {},
) {
  // ---------------------------------------------------
  // HEADERS
  // ---------------------------------------------------

  const finalHeaders = {
    ...headers,
  };

  /**
   * Never manually set Content-Type for FormData.
   * The browser generates the multipart boundary.
   */
  if (body !== null && !isFormData && method !== "GET" && method !== "HEAD") {
    finalHeaders["Content-Type"] = "application/json";
  }

  // ---------------------------------------------------
  // REQUEST BODY
  // ---------------------------------------------------

  let requestBody;

  if (body !== null) {
    if (isFormData) {
      requestBody = body;
    } else if (method !== "GET" && method !== "HEAD") {
      requestBody = JSON.stringify(body);
    }
  }

  // ---------------------------------------------------
  // URL
  // ---------------------------------------------------

  const requestUrl = `${API_BASE}${normalizeApiUrl(url)}`;

  // ---------------------------------------------------
  // REQUEST
  // ---------------------------------------------------

  const response = await fetch(requestUrl, {
    method,
    headers: finalHeaders,
    body: requestBody,
  });

  // ---------------------------------------------------
  // NO CONTENT
  // ---------------------------------------------------

  if (response.status === 204 || response.status === 205) {
    return null;
  }

  // ---------------------------------------------------
  // RESPONSE PARSING
  // ---------------------------------------------------

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned an invalid response");
    }
  }

  // ---------------------------------------------------
  // ERROR HANDLING
  // ---------------------------------------------------

  if (!response.ok) {
    throw new Error(
      data?.detail ??
        data?.message ??
        `Public request failed (${response.status})`,
    );
  }

  // ---------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------

  return data;
}
