import { useEffect } from "react";

/**
 * Modal
 * -----
 * Reusable modal dialog component
 *
 * Props:
 * - open: boolean
 * - title?: string
 * - children: ReactNode
 * - onClose: () => void
 */

const Modal = ({ open, title, children, onClose }) => {
    // Close on ESC key
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () =>
            window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || onClose) && (
                    <div style={styles.header}>
                        {title && (
                            <h3 style={styles.title}>{title}</h3>
                        )}

                        <button
                            onClick={onClose}
                            style={styles.closeBtn}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Content */}
                <div style={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ------------------ Styles ------------------ */

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "500px",
        boxShadow:
            "0 10px 25px rgba(0, 0, 0, 0.2)",
        animation: "fadeIn 0.15s ease-out",
    },
    header: {
        padding: "12px 16px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        margin: 0,
        fontSize: "16px",
        fontWeight: 600,
    },
    closeBtn: {
        background: "none",
        border: "none",
        fontSize: "18px",
        cursor: "pointer",
    },
    content: {
        padding: "16px",
    },
};

export default Modal;
