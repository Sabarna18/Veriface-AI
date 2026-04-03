// src/api/adminApi.js
import { httpAdmin } from "./httpAdmin";

export const adminApi = {
    /* ===============================
       ATTENDANCE (ADMIN)
       =============================== */

    // DELETE /attendance/today/{user_id}
    deleteTodayAttendanceForUser: (userId, classroomId) => {
        return httpAdmin(
            `/attendance/today/${userId}?classroom_id=${classroomId}`,
            { method: "DELETE" }
        );
    },

    // DELETE /attendance/today
    deleteAllTodayAttendance: (classroomId) => {
        return httpAdmin(
            `/attendance/today?classroom_id=${classroomId}`,
            { method: "DELETE" }
        );
    },

    // DELETE /attendance/user/{user_id}
    deleteAllAttendanceForUser: (userId, classroomId) => {
        return httpAdmin(
            `/attendance/user/${userId}?classroom_id=${classroomId}`,
            { method: "DELETE" }
        );
    },

    /* ===============================
     CLASSROOMS (ADMIN)
     =============================== */

    // POST /classrooms/create
    createClassroom: (classroomId) => {
        return httpAdmin("/classrooms/create", {
            method: "POST",
            body: ({ classroom_id: classroomId }),
        });
    },

    // DELETE /classrooms/{classroom_id}
    deleteClassroom: (classroomId) => {
        return httpAdmin(`/classrooms/${classroomId}`, {
            method: "DELETE",
        });
    },

    /* ===============================
     USERS (ADMIN)
     =============================== */

    // DELETE /users/delete-all
    deleteAllUsers: (classroomId) => {
        return httpAdmin(
            `/users/admin/delete-all?classroom_id=${classroomId}`,
            { method: "DELETE" }
        );
    },

    // POST /users/delete-multiple
    deleteMultipleUsers: (userIds, classroomId) => {
        return httpAdmin(
            `/users/admin/delete-multiple?classroom_id=${classroomId}`,
            {
                method: "POST",
                body: ({"user_ids":userIds}),
            }
        );
    },

    // DELETE /users/{user_id}
    deleteUser: (userId, classroomId) => {
        return httpAdmin(
            `/users/admin/${userId}?classroom_id=${classroomId}`,
            { method: "DELETE" }
        );
    },

    /* ===============================
    REGISTRATION (ADMIN)
    =============================== */

    // POST /register/
    registerUser: (userId, classroomId, imageFile) => {
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("classroom_id", classroomId);
        formData.append("image", imageFile); // MUST match backend name

        return httpAdmin("/register/", {
            method: "POST",
            body: formData,
            isFormData: true, // 🔥 THIS FIXES 422
        });
    },

    // GET /register/users
    getAllRegisteredUsers: () => {
        return httpAdmin("/register/users");
    },
};
