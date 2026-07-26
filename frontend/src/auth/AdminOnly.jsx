import { useAuth } from "./AuthContext";

export default function AdminOnly({
  children,
  mode = "block",
  fallback = null,
}) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAdmin) {
    return children;
  }

  if (mode === "disable") {
    return (
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
    );
  }

  return fallback;
}