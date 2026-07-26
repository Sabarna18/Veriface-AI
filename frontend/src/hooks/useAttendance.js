import { useCallback, useState } from "react";
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
 * Centralized classroom-scoped attendance logic.
 */
export const useAttendance = (classroomId) => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =======================
     FETCH TODAY
     ======================= */

  const loadTodayAttendance = useCallback(async () => {
    if (!classroomId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchTodayAttendance(classroomId);

      setRecords(response.records || []);

      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch today's attendance");
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  /* =======================
     FETCH BY DATE
     ======================= */

  const loadAttendanceByDate = useCallback(
    async (date) => {
      if (!classroomId || !date) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchAttendanceByDate(classroomId, date);

        setRecords(response.records || []);

        return response;
      } catch (err) {
        setError(err.message || "Failed to fetch attendance");
      } finally {
        setLoading(false);
      }
    },
    [classroomId],
  );

  /* =======================
     FETCH ALL
     ======================= */

  const loadAllAttendance = useCallback(async () => {
    if (!classroomId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchAllAttendanceForClassroom(classroomId);

      setRecords(response.records || []);

      return response;
    } catch (err) {
      setError(err.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  /* =======================
     USER ATTENDANCE STATUS
     ======================= */

  const loadUserAttendanceStatus = useCallback(
    async (userId) => {
      if (!classroomId || !userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchUserAttendanceStatus(userId, classroomId);

        setSummary(response);

        return response;
      } catch (err) {
        setError(err.message || "Failed to fetch user attendance status");
      } finally {
        setLoading(false);
      }
    },
    [classroomId],
  );

  /* =======================
     DELETE TODAY FOR USER
     ======================= */

  const removeTodayAttendanceForUser = useCallback(
    async (userId) => {
      if (!classroomId || !userId) return;

      setLoading(true);
      setError(null);

      try {
        await deleteTodayAttendanceForUser(userId, classroomId);

        await loadTodayAttendance();
      } catch (err) {
        setError(err.message || "Failed to delete today's attendance");
      } finally {
        setLoading(false);
      }
    },
    [classroomId, loadTodayAttendance],
  );

  /* =======================
     DELETE ALL TODAY
     ======================= */

  const removeAllTodayAttendance = useCallback(async () => {
    if (!classroomId) return;

    setLoading(true);
    setError(null);

    try {
      await deleteAllTodayAttendance(classroomId);

      setRecords([]);
    } catch (err) {
      setError(err.message || "Failed to delete today's attendance");
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  /* =======================
     DELETE ALL FOR USER
     ======================= */

  const removeAllAttendanceForUser = useCallback(
    async (userId) => {
      if (!classroomId || !userId) return;

      setLoading(true);
      setError(null);

      try {
        await deleteAllAttendanceForUser(userId, classroomId);

        setRecords([]);
      } catch (err) {
        setError(err.message || "Failed to delete user attendance");
      } finally {
        setLoading(false);
      }
    },
    [classroomId],
  );

  /* =======================
     PUBLIC API
     ======================= */

  return {
    // Data
    records,
    summary,

    // State
    loading,
    error,

    // Fetchers
    loadTodayAttendance,
    loadAttendanceByDate,
    loadAllAttendance,
    loadUserAttendanceStatus,

    // Mutators
    removeTodayAttendanceForUser,
    removeAllTodayAttendance,
    removeAllAttendanceForUser,
  };
};
