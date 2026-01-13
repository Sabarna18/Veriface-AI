/**
 * Button
 * ------
 * Reusable UI button component
 *
 * Props:
 * - children: ReactNode
 * - onClick?: function
 * - type?: "button" | "submit"
 * - variant?: "primary" | "secondary" | "danger"
 * - disabled?: boolean
 * - loading?: boolean
 */

const Button = ({
    children,
    onClick,
    type = "button",
    variant = "primary",
    disabled = false,
    loading = false,
    ...rest
}) => {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            style={{
                ...baseStyle,
                ...variants[variant],
                ...(isDisabled ? disabledStyle : {}),
            }}
            {...rest}
        >
            {loading ? "Please wait..." : children}
        </button>
    );
};

/* ------------------ Styles ------------------ */

const baseStyle = {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
};

const disabledStyle = {
    opacity: 0.6,
    cursor: "not-allowed",
};

const variants = {
    primary: {
        backgroundColor: "#2563eb",
        color: "#ffffff",
    },
    secondary: {
        backgroundColor: "#e5e7eb",
        color: "#111827",
    },
    danger: {
        backgroundColor: "#dc2626",
        color: "#ffffff",
    },
};

export default Button;
