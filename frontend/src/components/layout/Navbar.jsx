// src/components/layout/Navbar.jsx

import { useNavigate } from "react-router-dom";
import { useClassroomContext } from "../../context/ClassroomContext";
import { useAuth } from "../../auth/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { classroomId, clearClassroom } = useClassroomContext();
  const { admin, isAdmin, logout } = useAuth();

  const baseTheme =
    "bg-gradient-to-r from-blue-600 to-indigo-700";

  const adminTheme =
    "bg-gradient-to-r from-slate-900 via-indigo-900 to-zinc-900";

  const navbarTheme = isAdmin ? adminTheme : baseTheme;


  const handleExitClassroom = () => {
    clearClassroom();
    navigate("/classrooms");
  };

  const handleAdminLogin = () => {
    navigate("/auth/login"); // ✅ fixed route
  };

  const handleAdminLogout = () => {
    logout();
    navigate("/classrooms");
  };

  return (
    <header className={`${navbarTheme} shadow-lg transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ================= LEFT ================= */}
          <div className="flex items-center gap-4">
            <h2
              className="text-xl sm:text-2xl font-bold text-white tracking-tight cursor-pointer hover:opacity-90"
              onClick={() => navigate("/")}
            >
              Face Attendance System
            </h2>

            {/* 🔥 ACTIVE ADMIN BADGE */}
            {isAdmin && (
              <div className="flex items-center gap-2 bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-300/30">
                {/* Pulse dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>

                <span className="text-emerald-100 text-xs font-semibold tracking-wide">
                  ADMIN MODE
                </span>

                {admin?.user_id && (
                  <span className="text-emerald-200 text-xs opacity-80">
                    ({admin.user_id})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ================= CENTER ================= */}
          <div className="flex-1 flex justify-center px-4">
            {classroomId && (
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                <span className="text-white/90 text-sm sm:text-base">
                  Classroom:{" "}
                  <strong className="text-white font-semibold">
                    {classroomId}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center gap-3">
            {classroomId && (
              <button
                onClick={handleExitClassroom}
                className="bg-white cursor-pointer text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition shadow-md"
              >
                Exit Classroom
              </button>
            )}

            {!isAdmin ? (
              <button
                onClick={handleAdminLogin}
                className="bg-indigo-500/20 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/30 hover:bg-indigo-500/30 transition"
              >
                Admin Login
              </button>
            ) : (
              <button
                onClick={handleAdminLogout}
                className="bg-red-500/20 cursor-pointer text-red-100 px-4 py-2 rounded-lg text-sm font-medium border border-red-300/30 hover:bg-red-500/30 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
