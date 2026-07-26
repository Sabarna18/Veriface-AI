import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAdmin) {
    return children;
  }

  return (
    <div className="relative">
      <div
        className="opacity-50 pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="max-w-sm rounded-xl border border-gray-200 bg-white/90 p-6 text-center shadow-lg backdrop-blur-md">
          <div className="mb-2 text-3xl" aria-hidden="true">
            🔒
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            Admin Access Required
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            Please log in as an admin to use this feature.
          </p>

          <p className="mt-3 text-xs text-gray-500">
            You can log in anytime using the <strong>Admin Login</strong> button
            above.
          </p>
        </div>
      </div>
    </div>
  );
}
