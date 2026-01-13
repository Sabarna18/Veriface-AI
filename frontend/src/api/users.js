// frontend/src/api/users.js

/**
 * Frontend API layer for:
 * backend/src/api/users.py
 */

const API_BASE = "http://localhost:8002";

/* ======================================================
   GET USERS
   ====================================================== */

/**
 * Get a single user within a classroom
 *
 * Backend:
 * GET /users/{user_id}?classroom_id=
 */
export async function fetchUser(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/users/${userId}?classroom_id=${classroomId}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Get multiple users within a classroom
 *
 * Backend:
 * GET /users/?classroom_id=&user_ids=
 *
 * userIds is optional (array of strings)
 */
export async function fetchUsers(classroomId, userIds = []) {
  const params = new URLSearchParams();
  params.append("classroom_id", classroomId);

  if (userIds.length > 0) {
    userIds.forEach((id) => params.append("user_ids", id));
  }

  const response = await fetch(`${API_BASE}/users/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ======================================================
   DELETE USERS
   ====================================================== */

/**
 * Delete all users in a classroom
 *
 * Backend:
 * DELETE /users/delete-all?classroom_id=
 */
export async function deleteAllUsers(classroomId) {
  const response = await fetch(
    `${API_BASE}/users/delete-all?classroom_id=${classroomId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Delete multiple users in a classroom
 *
 * Backend:
 * POST /users/delete-multiple?classroom_id=
 *
 * Body:
 * [ "user1", "user2", ... ]
 */
export async function deleteMultipleUsers(classroomId, userIds) {
  const response = await fetch(
    `${API_BASE}/users/delete-multiple?classroom_id=${classroomId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userIds),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Delete a single user in a classroom
 *
 * Backend:
 * DELETE /users/{user_id}?classroom_id=
 */
export async function deleteUser(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/users/${userId}?classroom_id=${classroomId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}


