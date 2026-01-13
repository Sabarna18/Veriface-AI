// frontend/src/api/attendance.js

/**
 * Frontend API layer for:
 * backend/src/api/attendance.py
 */

const API_BASE = "http://localhost:8002";

/* ======================================================
   MARK ATTENDANCE
   ====================================================== */

/**
 * Mark attendance for a user in a classroom
 *
 * Backend:
 * POST /attendance/mark/{user_id}?classroom_id=
 */
export async function markAttendance(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/mark/${userId}?classroom_id=${classroomId}`,
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
   GET ATTENDANCE (CLASSROOM)
   ====================================================== */

/**
 * Get today's attendance for a classroom
 *
 * Backend:
 * GET /attendance/today?classroom_id=
 */
export async function fetchTodayAttendance(classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/today?classroom_id=${classroomId}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Get attendance for a classroom by date
 *
 * Backend:
 * GET /attendance/by-date?classroom_id=&attendance_date=YYYY-MM-DD
 */
export async function fetchAttendanceByDate(classroomId, attendanceDate) {
  const response = await fetch(
    `${API_BASE}/attendance/by-date?classroom_id=${classroomId}&attendance_date=${attendanceDate}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/**
 * Get all attendance records for a classroom (all dates)
 *
 * Backend:
 * GET /attendance/all?classroom_id=
 */
export async function fetchAllAttendanceForClassroom(classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/all?classroom_id=${classroomId}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ======================================================
   USER ATTENDANCE STATUS
   ====================================================== */

/**
 * Get day-wise attendance status for a user in a classroom
 *
 * Backend:
 * GET /attendance/status/{user_id}?classroom_id=
 */
export async function fetchUserAttendanceStatus(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/status/${userId}?classroom_id=${classroomId}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

/* ======================================================
   DELETE ATTENDANCE
   ====================================================== */

/**
 * Delete today's attendance for a user (classroom-specific)
 *
 * Backend:
 * DELETE /attendance/today/{user_id}?classroom_id=
 */
export async function deleteTodayAttendanceForUser(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/today/${userId}?classroom_id=${classroomId}`,
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
 * Delete all today's attendance for a classroom
 *
 * Backend:
 * DELETE /attendance/today?classroom_id=
 */
export async function deleteAllTodayAttendance(classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/today?classroom_id=${classroomId}`,
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
 * Delete all attendance records for a user in a classroom
 *
 * Backend:
 * DELETE /attendance/user/{user_id}?classroom_id=
 */
export async function deleteAllAttendanceForUser(userId, classroomId) {
  const response = await fetch(
    `${API_BASE}/attendance/user/${userId}?classroom_id=${classroomId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
