// frontend/src/api/recognition.js

/**
 * Frontend API layer for:
 * backend/src/api/recognition.py
 */

const API_BASE = "http://localhost:8002";

/**
 * Recognize (verify) a user using face image
 *
 * Backend:
 * POST /recognize/
 *
 * Form Data:
 * - user_id
 * - image
 *
 * Response (success):
 * {
 *   verified: boolean,
 *   user_id: string,
 *   distance: number,
 *   threshold: number
 * }
 */
export async function recognizeUser(userId, imageFile) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE}/recognize/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
