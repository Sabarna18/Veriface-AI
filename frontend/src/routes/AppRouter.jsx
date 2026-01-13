import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage from "../pages/LandingPage";
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
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/classrooms" element={<ClassroomListPage />} />

        {/* Classroom scoped routes */}
        <Route path="/classrooms/:classroomId" element={<ClassroomLayout />}>
          {/* Default classroom route */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<ClassroomDashboardPage />} />
          <Route path="register" element={<RegisterUserPage />} />
          <Route path="recognize" element={<FaceScanPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
