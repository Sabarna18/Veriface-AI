import RegisterUser from "../components/RegisterUser";
import RecognizeUser from "../components/RecognizeUser";
import AttendanceTable from "../components/AttendanceTable";
import UserManagement from "../components/UserManagement";
import { useState } from "react";

export default function Dashboard() {
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  function refreshAttendance() {
    setAttendanceRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      {/* Background Pattern Overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDEzNGg3djJ2LTJoLTd6bTAgNGg3djJoLTd2LTJ6bS0yOCAwaDd2Mmg3di0yaC03di0yaC03djJ6bS0xNyAwaDd2Mmg3di0yaC03di0yaC03djJ6bTctOGg3djJoLTd2LTJ6bTI4IDB2Mmg3di0yaDd2LTJoLTd2LTJoLTd2Mmg3djJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 pointer-events-none"></div>
      
      <div className="relative px-6 py-8 max-w-[1800px] mx-auto">
        {/* ---------- HEADER ---------- */}
        <header className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Face Recognition Dashboard
                  </h1>
                  <p className="mt-2 text-gray-400 text-lg">
                    AI-powered identity verification & attendance management
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="flex gap-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System Status</span>
                </div>
                <p className="text-xl font-bold text-white">Online</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Today</div>
                <p className="text-xl font-bold text-white">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ---------- GRID LAYOUT ---------- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6 xl:col-span-1">
            <SectionCard
              title="User Registration"
              description="Register new users by capturing facial data"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
              gradient="from-green-500 to-emerald-600"
            >
              <RegisterUser />
            </SectionCard>

            <SectionCard
              title="Face Recognition"
              description="Verify identity and mark attendance"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              gradient="from-indigo-500 to-purple-600"
            >
              <RecognizeUser onAttendanceMarked={refreshAttendance} />
            </SectionCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 xl:col-span-2">
            <SectionCard
              title="Today's Attendance"
              description="Live attendance records for today"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              gradient="from-blue-500 to-cyan-600"
            >
              <AttendanceTable refreshKey={attendanceRefreshKey}/>
            </SectionCard>

            <SectionCard
              title="User Management"
              description="View, manage or remove registered users"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              gradient="from-amber-500 to-orange-600"
            >
              <UserManagement />
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              Powered by AI • Secure • Real-time Processing
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- REUSABLE CARD COMPONENT ---------- */
function SectionCard({ title, description, icon, gradient, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 hover:border-white/20">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-4 relative overflow-hidden`}>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-sm text-white/80 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        {children}
      </div>
    </div>
  );
}