const API_BASE = "http://localhost:8002";

// ---------------- HEALTH ----------------
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------------- REGISTRATION ----------------
export async function registerUser(userId, imageBlob) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("image", imageBlob);

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAllUsers() {
  const res = await fetch(`${API_BASE}/users/delete-all`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------------- RECOGNITION (UPDATED) ----------------
export async function recognizeUser(userId, imageBlob) {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("image", imageBlob);

  const res = await fetch(`${API_BASE}/recognize`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------------- ATTENDANCE ----------------
export async function markAttendance(userId) {
  const res = await fetch(`${API_BASE}/attendance/mark/${userId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTodayAttendance() {
  const res = await fetch(`${API_BASE}/attendance/today`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTodayAttendanceForUser(userId) {
  const res = await fetch(`${API_BASE}/attendance/today/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAllTodayAttendance() {
  const res = await fetch(`${API_BASE}/attendance/today`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteAllAttendanceForUser(userId) {
  const res = await fetch(`${API_BASE}/attendance/user/${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
