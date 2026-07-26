import { useEffect, useState } from "react";

import { httpAdmin } from "../api/httpAdmin";
import { getToken, removeToken, setToken } from "../utils/auth";

import AuthContext from "./authContext";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     INITIAL AUTH CHECK
     ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const adminData = await httpAdmin("/auth/me");

        if (!cancelled) {
          setAdmin(adminData);
        }
      } catch {
        removeToken();

        if (!cancelled) {
          setAdmin(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     LOGIN
     ===================================================== */

  const login = async (token) => {
    setToken(token);
    setLoading(true);

    try {
      const adminData = await httpAdmin("/auth/me");

      setAdmin(adminData);

      return true;
    } catch {
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
     CONTEXT VALUE
     ===================================================== */

  const value = {
    admin,
    isAuthenticated: Boolean(admin),
    isAdmin: admin?.role === "ADMIN",
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
