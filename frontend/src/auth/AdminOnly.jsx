import { useAuth } from "./AuthContext";

/**
 * AdminOnly
 *
 * Controls access to admin-only UI or pages.
 *
 * Modes:
 * - block: hide content completely
 * - disable: show content but disabled (recommended for UX)
 */
export default function AdminOnly({
    children,
    mode = "block", // "block" | "disable"
    fallback = null,
}) {
    const { isAdmin, loading } = useAuth();

    // Still resolving auth → render nothing
    if (loading) return null;

    // Not admin
    if (!isAdmin) {
        if (mode === "disable") {
            return (
                <div className="opacity-50 pointer-events-none select-none">
                    {children}
                </div>
            );
        }

        // mode === "block"
        return fallback;
    }

    // Admin → render normally
    return children;
}
