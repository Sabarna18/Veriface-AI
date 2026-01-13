import { createContext, useContext, useState, useEffect } from "react";

/**
 * Classroom Context
 * -----------------
 * Stores the currently active classroom ID
 */

const ClassroomContext = createContext(null);

export const ClassroomProvider = ({ children }) => {
    const [classroomId, setClassroomId] = useState(null);

    // Load classroom from localStorage on first render
    useEffect(() => {
        const storedClassroom = localStorage.getItem("classroom_id");
        if (storedClassroom) {
            setClassroomId(storedClassroom);
        }
    }, []);

    /**
     * Set active classroom
     */
    const setClassroom = (id) => {
        setClassroomId(id);
        localStorage.setItem("classroom_id", id);
    };

    /**
     * Clear classroom (e.g. when leaving classroom context)
     */
    const clearClassroom = () => {
        setClassroomId(null);
        localStorage.removeItem("classroom_id");
    };

    return (
        <ClassroomContext.Provider
            value={{
                classroomId,
                setClassroom,
                clearClassroom,
            }}
        >
            {children}
        </ClassroomContext.Provider>
    );
};

/**
 * Hook to consume classroom context
 */
export const useClassroomContext = () => {
    const context = useContext(ClassroomContext);

    if (!context) {
        throw new Error(
            "useClassroomContext must be used inside ClassroomProvider"
        );
    }

    return context;
};
