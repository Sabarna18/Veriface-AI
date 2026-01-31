// src/api/index.js

import { publicApi } from "./publicApi";
import { adminApi } from "./adminApi";

/* ======================================================
   ATTENDANCE (PUBLIC)
   ====================================================== */

export const markAttendance =
    publicApi.markAttendance;

export const fetchTodayAttendance =
    publicApi.fetchTodayAttendance;

export const fetchAttendanceByDate =
    publicApi.fetchAttendanceByDate;

export const fetchAllAttendanceForClassroom =
    publicApi.fetchAllAttendanceForClassroom;

export const fetchUserAttendanceStatus =
    publicApi.fetchUserAttendanceStatus;

/* ======================================================
   CLASSROOMS (PUBLIC)
   ====================================================== */

export const listClassrooms =
    publicApi.listClassrooms;

export const fetchUsersInClassroom =
    publicApi.listUsersInClassroom;

export const fetchTodayAttendanceForClassroom =
    publicApi.getTodayAttendanceForClassroom;

/* ======================================================
   USERS (PUBLIC)
   ====================================================== */

export const fetchUser =
    publicApi.fetchUser;

export const fetchUsers =
    publicApi.fetchUsers;

export const getUserFaceImage =
    publicApi.getUserFaceImage;

/* ======================================================
   FACE RECOGNITION (PUBLIC)
   ====================================================== */

export const recognizeUser =
    publicApi.recognizeUser;

/* ======================================================
   ATTENDANCE (ADMIN)
   ====================================================== */

export const deleteTodayAttendanceForUser =
    adminApi.deleteTodayAttendanceForUser;

export const deleteAllTodayAttendance =
    adminApi.deleteAllTodayAttendance;

export const deleteAllAttendanceForUser =
    adminApi.deleteAllAttendanceForUser;

/* ======================================================
   CLASSROOMS (ADMIN)
   ====================================================== */

export const createClassroom =
    adminApi.createClassroom;

export const deleteClassroom =
    adminApi.deleteClassroom;

/* ======================================================
   USERS (ADMIN)
   ====================================================== */

export const deleteAllUsers =
    adminApi.deleteAllUsers;

export const deleteMultipleUsers =
    adminApi.deleteMultipleUsers;

export const deleteUser =
    adminApi.deleteUser;

/* ======================================================
   REGISTRATION (ADMIN)
   ====================================================== */

export const registerUser =
    adminApi.registerUser;

export const getAllRegisteredUsers =
    adminApi.getAllRegisteredUsers;
