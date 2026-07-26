import { useContext } from "react";

import ClassroomContext from "./classroomContext";

/**
 * Access the currently active classroom context.
 *
 * Must be used inside ClassroomProvider.
 */
export const useClassroomContext = () => {
  const context = useContext(ClassroomContext);

  if (!context) {
    throw new Error(
      "useClassroomContext must be used inside ClassroomProvider",
    );
  }

  return context;
};
