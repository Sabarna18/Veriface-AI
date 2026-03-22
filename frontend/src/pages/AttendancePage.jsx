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
  const [mode, setMode] = useState("today"); // today | date | all
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

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
    if (!classroomId) return;

    let cancelled = false;
    setUsersLoading(true);
    setUsersError(null);

    fetchUsersInClassroom(classroomId)
      .then((res) => !cancelled && setUsersInClassroom(res))
      .catch((err) => !cancelled && setUsersError(err.message))
      .finally(() => !cancelled && setUsersLoading(false));

    return () => {
      cancelled = true;
    };
  }, [classroomId]);

  /* =======================
     LOAD ATTENDANCE
     ======================= */
  useEffect(() => {
    if (!classroomId) return;

    if (mode === "today") loadTodayAttendance();
    if (mode === "date") loadAttendanceByDate(selectedDate);
    if (mode === "all") loadAllAttendance();
  }, [mode, selectedDate, classroomId]);

  /* =======================
     DATE NAVIGATION
     ======================= */
  const shiftDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500">
          View and manage classroom attendance records
        </p>
      </div>

      {/* ================= MODE CONTROLS ================= */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex gap-2">
          {["today", "date", "all"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium
                ${mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {m === "today" ? "Today" : m === "date" ? "By Date" : "All Records"}
            </button>
          ))}
        </div>

        {mode === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="bg-white border rounded-lg p-4">
        {usersLoading && <p className="text-sm text-gray-500">Loading users…</p>}
        {usersError && <p className="text-sm text-red-600">{usersError}</p>}
        {loading && <p className="text-sm text-gray-500">Loading attendance…</p>}
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
