import { useState } from "react";
import { ToastContext } from "./ToastContext";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (message, type = "info") => {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const toast = {
    success: (message) => showToast(message, "success"),
    error: (message) => showToast(message, "error"),
    info: (message) => showToast(message, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div style={styles.container}>
        {toasts.map((item) => (
          <div
            key={item.id}
            style={{
              ...styles.toast,
              ...styles[item.type],
            }}
            onClick={() => removeToast(item.id)}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

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
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
