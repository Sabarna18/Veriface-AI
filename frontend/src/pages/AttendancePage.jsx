import { useEffect, useState } from "react";
import { useClassroom } from "../hooks/useClassroom";
import { useAttendance } from "../hooks/useAttendance";
import AttendanceTable from "../components/tables/AttendanceTable";
import { fetchUsersInClassroom } from "../api";

const AttendancePage = () => {
  const { classroomId } = useClassroom();

  /* =======================
     USERS STATE
     ======================= */

  const [usersInClassroom, setUsersInClassroom] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  /* =======================
     MODE + DATE STATE
     ======================= */

  const [mode, setMode] = useState("today");

  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  /* =======================
     ATTENDANCE
     ======================= */

  const {
    records,
    loading,
    error,
    loadTodayAttendance,
    loadAttendanceByDate,
    loadAllAttendance,
  } = useAttendance(classroomId);

  /* =======================
     LOAD USERS
     ======================= */

  useEffect(() => {
    if (!classroomId) {
      return undefined;
    }

    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await fetchUsersInClassroom(classroomId);

        if (cancelled) {
          return;
        }

        setUsersInClassroom(response);
        setUsersError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setUsersInClassroom(null);
        setUsersError(err.message || "Failed to load classroom users");
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    };

    /*
     * Schedule loading-state update with the async work rather
     * than synchronously mutating state in the effect body.
     */
    const startLoading = async () => {
      if (!cancelled) {
        setUsersLoading(true);
      }

      await loadUsers();
    };

    void startLoading();

    return () => {
      cancelled = true;
    };
  }, [classroomId]);

  /* =======================
     LOAD ATTENDANCE
     ======================= */

  useEffect(() => {
    if (!classroomId) {
      return;
    }

    const loadAttendance = async () => {
      if (mode === "today") {
        await loadTodayAttendance();
        return;
      }

      if (mode === "date") {
        await loadAttendanceByDate(selectedDate);
        return;
      }

      if (mode === "all") {
        await loadAllAttendance();
      }
    };

    void loadAttendance();
  }, [
    classroomId,
    mode,
    selectedDate,
    loadTodayAttendance,
    loadAttendanceByDate,
    loadAllAttendance,
  ]);

  /* =======================
     DATE NAVIGATION
     ======================= */

  const shiftDate = (delta) => {
    const date = new Date(selectedDate);

    date.setDate(date.getDate() + delta);

    setSelectedDate(date.toISOString().slice(0, 10));
  };

  /* =======================
     RENDER
     ======================= */

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ================= HEADER ================= */}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>

        <p className="text-sm text-gray-500">
          View and manage classroom attendance records
        </p>
      </div>

      {/* ================= MODE CONTROLS ================= */}

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          {["today", "date", "all"].map((currentMode) => (
            <button
              key={currentMode}
              type="button"
              onClick={() => setMode(currentMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mode === currentMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {currentMode === "today"
                ? "Today"
                : currentMode === "date"
                  ? "By Date"
                  : "All Records"}
            </button>
          ))}
        </div>

        {mode === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        )}
      </div>

      {/* ================= CONTENT ================= */}

      <div className="bg-white border rounded-lg p-4">
        {usersLoading && (
          <p className="text-sm text-gray-500">Loading users…</p>
        )}

        {usersError && <p className="text-sm text-red-600">{usersError}</p>}

        {loading && (
          <p className="text-sm text-gray-500">Loading attendance…</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <AttendanceTable
            records={records}
            usersInClassroom={usersInClassroom}
            classroomId={classroomId}
            mode={mode}
            selectedDate={selectedDate}
            onPrevDate={() => shiftDate(-1)}
            onNextDate={() => shiftDate(1)}
          />
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
