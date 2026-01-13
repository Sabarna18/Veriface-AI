// frontend/src/api/classroom.js

/**
 * Frontend API layer for:
 * backend/src/api/classroom.py
 */

const API_BASE = "http://localhost:8002";

/* ======================================================
   CLASSROOMS
   ====================================================== */

/**
 * List all classrooms
 *
 * Backend:
 * GET /classrooms/
 */
export async function listClassrooms() {
  const response = await fetch(`${API_BASE}/classrooms/`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Create a classroom (logical creation)
 *
 * Backend:
 * POST /classrooms/create
 *
 * Note:
 * classroom_id is sent as query/body parameter
 */
export async function createClassroom(classroomId) {
  const response = await fetch(
    `${API_BASE}/classrooms/create?classroom_id=${classroomId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ======================================================
   CLASSROOM USERS
   ====================================================== */

/**
 * List users in a classroom
 *
 * Backend:
 * GET /classrooms/{classroom_id}/users
 */
export async function fetchUsersInClassroom(classroomId) {
  const response = await fetch(
    `${API_BASE}/classrooms/${classroomId}/users`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ======================================================
   CLASSROOM ATTENDANCE
   ====================================================== */

/**
 * Get today's attendance for a classroom
 *
 * Backend:
 * GET /classrooms/{classroom_id}/attendance/today
 */
export async function fetchTodayAttendanceForClassroom(classroomId) {
  const response = await fetch(
    `${API_BASE}/classrooms/${classroomId}/attendance/today`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Delete a classroom
 *
 * Backend:
 * DELETE /classrooms/{classroom_id}
 */
export async function deleteClassroom(classroomId) {
  const response = await fetch(
    `${API_BASE}/classrooms/${classroomId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
