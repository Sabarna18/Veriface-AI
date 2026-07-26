import { useState } from "react";

import ClassroomContext from "./classroomContext";

/**
 * ClassroomProvider
 *
 * Maintains the currently active classroom and persists
 * the selection across browser sessions using localStorage.
 */
export const ClassroomProvider = ({ children }) => {
  /*
   * Lazy initialization avoids an additional render and
   * eliminates the need for a mount effect.
   */
  const [classroomId, setClassroomId] = useState(() =>
    localStorage.getItem("classroom_id"),
  );

  /**
   * Set the currently active classroom.
   */
  const setClassroom = (id) => {
    setClassroomId(id);
    localStorage.setItem("classroom_id", id);
  };

  /**
   * Clear the currently active classroom.
   */
  const clearClassroom = () => {
    setClassroomId(null);
    localStorage.removeItem("classroom_id");
  };

  const value = {
    classroomId,
    setClassroom,
    clearClassroom,
  };

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
};
