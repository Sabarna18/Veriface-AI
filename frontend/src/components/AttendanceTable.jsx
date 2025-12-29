import { useEffect, useState } from "react";
import { Trash2, Users, Calendar, Clock, AlertCircle, RefreshCw } from "lucide-react";
import {
  fetchTodayAttendance,
  deleteTodayAttendanceForUser,
  deleteAllTodayAttendance,
} from "../api";

export default function AttendanceTable({ refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function loadAttendance() {
    setLoading(true);
    try {
      const res = await fetchTodayAttendance();
      setRecords(res.records || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, [refreshKey]);

  async function handleDeleteUser(userId) {
    if (!confirm(`Delete today's attendance for ${userId}?`)) return;

    setDeleting(userId);
    try {
      await deleteTodayAttendanceForUser(userId);
      await loadAttendance();
    } finally {
      setDeleting(null);
    }
  }

  async function handleDeleteAll() {
    if (!confirm("Delete ALL today's attendance records? This action cannot be undone.")) return;

    setDeleting("all");
    try {
      await deleteAllTodayAttendance();
      await loadAttendance();
    } finally {
      setDeleting(null);
    }
  }

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Today's Attendance
                </h2>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{formatDate()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-3xl font-bold text-white">{records.length}</div>
                <div className="text-xs text-blue-100 font-medium">Present</div>
              </div>
              
              {records.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting === "all"}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {deleting === "all" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading attendance records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <AlertCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Attendance Records
              </h3>
              <p className="text-gray-500 text-sm">
                No one has marked their attendance yet today.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r, i) => (
                <div
                  key={i}
                  className="group relative bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {r.user_id.charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {r.user_id}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{r.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span>{r.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="hidden sm:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Present
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteUser(r.user_id)}
                      disabled={deleting === r.user_id}
                      className="ml-4 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-red-200 hover:border-red-300 disabled:border-gray-200 disabled:cursor-not-allowed group-hover:shadow-sm"
                    >
                      {deleting === r.user_id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="hidden sm:inline">Deleting</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {records.length > 0 && !loading && (
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total records: <span className="font-semibold text-gray-800">{records.length}</span>
              </span>
              <span className="text-gray-500 text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}