import { createContext, useContext, useState } from "react";

/**
 * ToastContext
 */
const ToastContext = createContext(null);

/**
 * ToastProvider
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = (id) => {
        setToasts((prev) =>
            prev.filter((toast) => toast.id !== id)
        );
    };

    const showToast = (message, type = "info") => {
        const id = Date.now();

        setToasts((prev) => [
            ...prev,
            { id, message, type },
        ]);

        // Auto dismiss
        setTimeout(() => removeToast(id), 3000);
    };

    const toast = {
        success: (msg) => showToast(msg, "success"),
        error: (msg) => showToast(msg, "error"),
        info: (msg) => showToast(msg, "info"),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Toast Container */}
            <div style={styles.container}>
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            ...styles.toast,
                            ...styles[t.type],
                        }}
                        onClick={() => removeToast(t.id)}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

/**
 * useToast hook
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error(
            "useToast must be used inside ToastProvider"
        );
    }
    return context;
};

/* ------------------ Styles ------------------ */

const styles = {
    container: {
        position: "fixed",
        top: "16px",
        right: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 2000,
    },
    toast: {
        minWidth: "240px",
        padding: "12px 16px",
        borderRadius: "6px",
        color: "#ffffff",
        fontSize: "14px",
        cursor: "pointer",
        boxShadow:
            "0 4px 12px rgba(0,0,0,0.15)",
    },
    success: {
        backgroundColor: "#16a34a",
    },
    error: {
        backgroundColor: "#dc2626",
    },
    info: {
        backgroundColor: "#2563eb",
    },
};
