// src/auth/ProtectedRoute.jsx

import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAdmin, loading } = useAuth();

    // Prevent UI flicker on initial load
    if (loading) {
        return null; // or <Loader />
    }

    // Admin → full access
    if (isAdmin) {
        return children;
    }

    // Public user → show disabled state
    return (
        <div className="relative">
            {/* Dimmed content */}
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-xl p-6 text-center max-w-sm">
                    <div className="text-3xl mb-2">🔒</div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Admin Access Required
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                        Please login as an admin to use this feature.
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                        You can login anytime using the <strong>Admin Login</strong> button above.
                    </p>
                </div>
            </div>
        </div>
    );
}
