import { useState } from "react";
import {
    fetchTodayAttendance,
    fetchAttendanceByDate,
    fetchAllAttendanceForClassroom,
    fetchUserAttendanceStatus,
    deleteTodayAttendanceForUser,
    deleteAllTodayAttendance,
    deleteAllAttendanceForUser,
} from "../api";

/**
 * useAttendance
 * -------------
 * Centralized attendance logic (classroom-scoped)
 */
export const useAttendance = (classroomId) => {
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ------------------ FETCH ------------------

    const loadTodayAttendance = async () => {
        if (!classroomId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchTodayAttendance(classroomId);
            setRecords(res.records || []);
            return res;
        } catch (err) {
            setError(err.message || "Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceByDate = async (date) => {
        if (!classroomId || !date) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchAttendanceByDate(
                classroomId,
                date
            );
            setRecords(res.records || []);
            return res;
        } catch (err) {
            setError(err.message || "Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const loadAllAttendance = async () => {
        if (!classroomId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchAllAttendanceForClassroom(classroomId);
            setRecords(res.records || []);
            return res;
        } catch (err) {
            setError(err.message || "Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const loadUserAttendanceStatus = async (userId) => {
        if (!classroomId || !userId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetchUserAttendanceStatus(
                userId,
                classroomId
            );
            setSummary(res);
            return res;
        } catch (err) {
            setError(
                err.message ||
                "Failed to fetch user attendance status"
            );
        } finally {
            setLoading(false);
        }
    };

    // ------------------ DELETE ------------------

    const removeTodayAttendanceForUser = async (
        userId
    ) => {
        if (!classroomId || !userId) return;

        setLoading(true);
        setError(null);

        try {
            await deleteTodayAttendanceForUser(
                userId,
                classroomId
            );
            await loadTodayAttendance();
        } catch (err) {
            setError(
                err.message ||
                "Failed to delete today's attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    const removeAllTodayAttendance = async () => {
        if (!classroomId) return;

        setLoading(true);
        setError(null);

        try {
            await deleteAllTodayAttendance(classroomId);
            setRecords([]);
        } catch (err) {
            setError(
                err.message ||
                "Failed to delete today's attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    const removeAllAttendanceForUser = async (
        userId
    ) => {
        if (!classroomId || !userId) return;

        setLoading(true);
        setError(null);

        try {
            await deleteAllAttendanceForUser(
                userId,
                classroomId
            );
            setRecords([]);
        } catch (err) {
            setError(
                err.message ||
                "Failed to delete user attendance"
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        // data
        records,
        summary,

        // state
        loading,
        error,

        // fetchers
        loadTodayAttendance,
        loadAttendanceByDate,
        loadAllAttendance,
        loadUserAttendanceStatus,

        // mutators
        removeTodayAttendanceForUser,
        removeAllTodayAttendance,
        removeAllAttendanceForUser,
    };
};
