// src/api/publicApi.js
import { httpPublic } from "./httpPublic";

export const publicApi = {
    /* ===============================
       ATTENDANCE (PUBLIC)
       =============================== */

    // POST /attendance/mark/{user_id}
    markAttendance: (userId, classroomId) => {
        return httpPublic(
            `/attendance/mark/${userId}?classroom_id=${classroomId}`,
            { method: "POST" }
        );
    },

    // GET /attendance/today
    fetchTodayAttendance: (classroomId) => {
        return httpPublic(
            `/attendance/today?classroom_id=${classroomId}`
        );
    },

    // GET /attendance/by-date
    fetchAttendanceByDate: (classroomId, attendanceDate) => {
        return httpPublic(
            `/attendance/by-date?classroom_id=${classroomId}&attendance_date=${attendanceDate}`
        );
    },

    // GET /attendance/all
    fetchAllAttendanceForClassroom: (classroomId) => {
        return httpPublic(
            `/attendance/all?classroom_id=${classroomId}`
        );
    },

    // GET /attendance/status/{user_id}
    fetchUserAttendanceStatus: (userId, classroomId) => {
        return httpPublic(
            `/attendance/status/${userId}?classroom_id=${classroomId}`
        );
    },

    /* ===============================
     CLASSROOMS (PUBLIC)
     =============================== */

    // GET /classrooms
    listClassrooms: () => {
        return httpPublic("/classrooms");
    },

    // GET /classrooms/{classroom_id}/users
    listUsersInClassroom: (classroomId) => {
        return httpPublic(`/classrooms/${classroomId}/users`);
    },

    // GET /classrooms/{classroom_id}/attendance/today
    getTodayAttendanceForClassroom: (classroomId) => {
        return httpPublic(
            `/classrooms/${classroomId}/attendance/today`
        );
    },

    /* ===============================
    USERS (PUBLIC)
    =============================== */

    // GET /users/{user_id}
    fetchUser: (userId, classroomId) => {
        return httpPublic(
            `/users/${userId}?classroom_id=${classroomId}`
        );
    },

    // GET /users
    fetchUsers: (classroomId, userIds = []) => {
        const params = new URLSearchParams({
            classroom_id: classroomId,
        });

        userIds.forEach((id) => params.append("user_ids", id));

        return httpPublic(`/users?${params.toString()}`);
    },

    // GET /users/{user_id}/image
    getUserFaceImage: (userId, classroomId) => {
        return httpPublic(
            `/users/${userId}/image?classroom_id=${classroomId}`,
            { responseType: "blob" }
        );
    },

    /* ===============================
    FACE RECOGNITION (PUBLIC)
    =============================== */

    // POST /recognize/
    recognizeUser: (userId, imageFile) => {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("image", imageFile); // MUST match backend

        return httpPublic("/recognize/", {
            method: "POST",
            body: formData,
            isFormData: true,
        });
    },
};
