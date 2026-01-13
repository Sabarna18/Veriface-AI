import { useEffect, useState } from "react";
import { useClassroom } from "../hooks/useClassroom";
import { useAttendance } from "../hooks/useAttendance";
import AttendanceTable from "../components/tables/AttendanceTable";

/**
 * AttendancePage
 * --------------
 * Classroom-scoped attendance viewer
 */
const AttendancePage = () => {
  const { classroomId } = useClassroom();

  const [mode, setMode] = useState("today"); // today | date | all
  const [selectedDate, setSelectedDate] = useState("");

  const {
    records,
    loading,
    error,
    loadTodayAttendance,
    loadAttendanceByDate,
    loadAllAttendance,
  } = useAttendance(classroomId);

  useEffect(() => {
    if (!classroomId) return;

    if (mode === "today") loadTodayAttendance();
    if (mode === "date" && selectedDate)
      loadAttendanceByDate(selectedDate);
    if (mode === "all") loadAllAttendance();
  }, [mode, selectedDate, classroomId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Attendance
        </h1>
        <p className="text-sm text-gray-500">
          View and manage classroom attendance records
        </p>
      </div>

      {/* Controls Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col gap-4">
        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode("today")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${mode === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Today
          </button>

          <button
            onClick={() => setMode("date")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${mode === "date"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            By Date
          </button>

          <button
            onClick={() => setMode("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition
              ${mode === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All Records
          </button>
        </div>

        {/* Date Picker */}
        {mode === "date" && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">
              Select date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
            Loading attendance records...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Attendance Table */}
        {!loading && !error && (
          <AttendanceTable
            records={records}
            showDate={mode === "all"}
          />
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
