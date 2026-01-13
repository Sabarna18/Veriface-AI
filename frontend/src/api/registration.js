// frontend/src/api/registration.js

/**
 * Frontend API layer for:
 * backend/src/api/registration.py
 */

const API_BASE = "http://localhost:8002";

/**
 * Register a new user with face image
 *
 * Backend:
 * POST /register/
 *
 * Form Data:
 * - user_id
 * - classroom_id
 * - image
 */
export async function registerUser(userId, classroomId, imageFile) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("classroom_id", classroomId);
  formData.append("image", imageFile);

  const response = await fetch(`${API_BASE}/register/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Fetch all registered users
 *
 * Backend:
 * GET /register/users
 */
export async function fetchRegisteredUsers() {
  const response = await fetch(`${API_BASE}/register/users`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
