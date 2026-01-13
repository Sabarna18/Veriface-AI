import { useClassroomContext } from "../context/ClassroomContext";

/**
 * useClassroom Hook
 * -----------------
 * Thin wrapper over ClassroomContext.
 * This is what components should import and use.
 *
 * Exposes:
 * - classroomId
 * - setClassroom
 * - clearClassroom
 */
export const useClassroom = () => {
  const { classroomId, setClassroom, clearClassroom } =
    useClassroomContext();

  return {
    classroomId,
    setClassroom,
    clearClassroom,
  };
};
