import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, User } from "lucide-react";
import { fetchUser, fetchUserAttendanceStatus } from "../api";
import { useClassroom } from "../hooks/useClassroom";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const { classroomId } = useClassroom();

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl =
    user && classroomId
      ? `http://localhost:8002/users/${user.user_id}/image?classroom_id=${classroomId}`
      : null;

  useEffect(() => {
    if (!userId || !classroomId) return;

    const loadUserDetails = async () => {
      setLoading(true);
      try {
        const userRes = await fetchUser(userId, classroomId);
        setUser(userRes.user);

        const attendanceRes =
          await fetchUserAttendanceStatus(userId, classroomId);
        setAttendance(attendanceRes);
      } catch (err) {
        setError(err.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [userId, classroomId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-gray-500">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center text-gray-500">
        User not found.
      </div>
    );
  }

  const percentage =
    attendance?.total_days > 0
      ? Math.round(
        (attendance.present_days / attendance.total_days) * 100
      )
      : 0;

  const percentageColor =
    percentage >= 75
      ? "text-green-700 bg-green-100"
      : percentage >= 50
        ? "text-yellow-700 bg-yellow-100"
        : "text-red-700 bg-red-100";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          User Details
        </h1>
        <p className="text-sm text-gray-500">
          Profile information and attendance overview
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= PROFILE COLUMN ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden sticky top-6">
            {/* Image */}
            <div className="relative aspect-square bg-gray-50">
              {!imageError ? (
                <>
                  <img
                    src={imageUrl}
                    alt={`${user.name}'s profile`}
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />

                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  )}

                  <a
                    href={imageUrl}
                    download={`${user.user_id}_profile.jpg`}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-md shadow transition"
                    title="Download image"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </a>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <User className="w-20 h-20 mb-2" />
                  <span className="text-sm font-medium">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="p-5 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.user_id}
              </h2>
              <p className="text-sm text-gray-500">
                Classroom: {user.classroom_id}
              </p>
              <p className="text-sm text-gray-500">
                Registered:
                <br />
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ================= ATTENDANCE COLUMN ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Days</p>
              <p className="text-2xl font-semibold">
                {attendance.total_days}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">Present</p>
              <p className="text-2xl font-semibold text-green-800">
                {attendance.present_days}
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">Absent</p>
              <p className="text-2xl font-semibold text-red-800">
                {attendance.absent_days}
              </p>
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-2">
                Attendance %
              </p>
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold ${percentageColor}`}
              >
                {percentage}%
              </div>
            </div>
          </div>

          {/* Day-wise Attendance */}
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              Day-wise Attendance
            </h3>

            {attendance.records.length === 0 ? (
              <p className="text-sm text-gray-500">
                No attendance records found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {attendance.records.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {r.date}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === "PRESENT"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
