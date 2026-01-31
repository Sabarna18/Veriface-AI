import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";

// Pages
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import ClassroomListPage from "../pages/ClassroomListPage";
import ClassroomDashboardPage from "../pages/ClassroomDashboardPage";
import RegisterUserPage from "../pages/RegisterUserPage";
import FaceScanPage from "../pages/FaceScanPage";
import AttendancePage from "../pages/AttendancePage";
import UsersPage from "../pages/UsersPage";
import UserDetailsPage from "../pages/UserDetailsPage";

// Layout
import ClassroomLayout from "../components/layout/ClassroomLayout";

const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();

  // ⏳ Wait for auth bootstrap before routing decisions
  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>

        {/* =======================
            🌍 PUBLIC ROUTES
           ======================= */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/classrooms" element={<ClassroomListPage />} />

        {/* ✅ ADMIN LOGIN (PUBLIC, SAFE) */}
        <Route
          path="/auth/login"
          element={
            isAuthenticated
              ? <Navigate to="/classrooms" replace />
              : <LoginPage />
          }
        />

        {/* =======================
            🌍 CLASSROOM SCOPE
           ======================= */}

        <Route path="/classrooms/:classroomId" element={<ClassroomLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Public classroom pages */}
          <Route path="dashboard" element={<ClassroomDashboardPage />} />
          <Route path="recognize" element={<FaceScanPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />

          {/* 🔒 ADMIN-ONLY */}
          <Route
            path="register"
            element={
              <ProtectedRoute>
                <RegisterUserPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* =======================
            ❌ FALLBACK
           ======================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
