import { useNavigate } from "react-router-dom";
import { useClassroomContext } from "../../context/ClassroomContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { classroomId, clearClassroom } = useClassroomContext();

  const handleExitClassroom = () => {
    clearClassroom();
    navigate("/classrooms");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Face Attendance System
            </h2>
          </div>

          {/* Center section */}
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

          {/* Right section */}
          <div className="flex-shrink-0">
            {classroomId && (
              <button
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm sm:text-base hover:bg-indigo-50 active:bg-indigo-100 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                onClick={handleExitClassroom}
              >
                Exit Classroom
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;