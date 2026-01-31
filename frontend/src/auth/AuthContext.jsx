// src/auth/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, removeToken } from "../utils/auth";
import { httpAdmin } from "../api/httpAdmin";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [admin, setAdmin] = useState(null);      // { user_id, role }
    const [loading, setLoading] = useState(true); // auth bootstrap

    /* =====================================================
       INITIAL AUTH CHECK (ON APP LOAD)
       ===================================================== */
    useEffect(() => {
        const bootstrapAuth = async () => {
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const adminData = await httpAdmin("/auth/me");
                setAdmin(adminData);
            } catch (err) {
                // Token invalid / expired
                removeToken();
                setAdmin(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrapAuth();
    }, []);

    /* =====================================================
       LOGIN (ADMIN)
       ===================================================== */
    const login = async (token) => {
        setToken(token);
        setLoading(true);

        try {
            const adminData = await httpAdmin("/auth/me");
            setAdmin(adminData);
            return true;
        } catch (err) {
            removeToken();
            setAdmin(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       LOGOUT
       ===================================================== */
    const logout = () => {
        removeToken();
        setAdmin(null);
    };

    /* =====================================================
       DERIVED STATE (SINGLE SOURCE OF TRUTH)
       ===================================================== */
    const value = {
        admin,                         // null | { user_id, role }
        isAuthenticated: !!admin,      // logged in
        isAdmin: admin?.role === "ADMIN",
        loading,                       // auth initializing
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/* =====================================================
   HOOK
   ===================================================== */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
