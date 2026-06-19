import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Single source of truth for auth (user / role / token) and the login/logout
 * lifecycle. Backend calls (/api/auth/login, /api/auth/me) are unchanged — they
 * just live here now instead of being scattered across components.
 */
const AuthContext = createContext(null);

const readJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};

const readToken = () => {
  const t = localStorage.getItem("token");
  if (t && t !== "null" && t !== "undefined") return t;
  return readJSON("session")?.access_token || null;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Hydrate synchronously from localStorage so guards have it on first render.
  const [user, setUser] = useState(() => readJSON("user"));
  const [profile, setProfile] = useState(() => readJSON("profile"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [token, setToken] = useState(() => readToken());

  // POST /api/auth/login — stores session/token/role/user (same as before).
  const login = async (phone, password) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.message };

    const tok = data.token || data.session?.access_token || "";
    const r = data.role || "staff";
    localStorage.setItem("session", JSON.stringify(data.session));
    localStorage.setItem("token", tok);
    localStorage.setItem("role", r);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.profile) localStorage.setItem("profile", JSON.stringify(data.profile));
    setUser(data.user);
    setProfile(data.profile ?? null);
    setRole(r);
    setToken(tok);
    return { ok: true, ...data, role: r };
  };

  // GET /api/auth/me — refresh the current user from the backend.
  const loadMe = async () => {
    const t = token || readToken();
    if (!t) return null;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      setUser(data.user);
      if (data.profile) {
        setProfile(data.profile);
        localStorage.setItem("profile", JSON.stringify(data.profile));
      }
      if (data.role) setRole(data.role);
      return data.user;
    } catch {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    setUser(null);
    setProfile(null);
    setRole(null);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, token, login, logout, loadMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) ?? {};
