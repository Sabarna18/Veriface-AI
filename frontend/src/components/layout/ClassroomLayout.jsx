import { Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useClassroom } from "../../hooks/useClassroom";

const ClassroomLayout = () => {
  const { classroomId } = useParams();
  const { setClassroom } = useClassroom();

  // Sync classroom from URL into global context
  useEffect(() => {
    if (classroomId) {
      setClassroom(classroomId);
    }
  }, [classroomId, setClassroom]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navigation */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Side navigation */}
        <Sidebar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClassroomLayout;