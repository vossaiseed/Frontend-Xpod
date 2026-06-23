import { createContext, useContext, useEffect, useState } from "react";
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
  const [impersonation, setImpersonation] = useState(() => readJSON("impersonation"));

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

  // Admin "View as" — open & use an entity's dashboard with their session.
  const HOME_BY_ROLE = {
    partner: "/PartnerDashboard",
    salesman: "/SalesmanDashboard",
    leadmanager: "/LeadManagerDashboard",
    admin: "/AdminCRM",
  };

  const impersonate = async (type, id) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/impersonate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || readToken()}`,
      },
      body: JSON.stringify({ type, id }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, message: data.message };

    // Back up the admin session once (so nested "View" can't lose it).
    if (!localStorage.getItem("admin_backup")) {
      localStorage.setItem(
        "admin_backup",
        JSON.stringify({
          token: localStorage.getItem("token"),
          role: localStorage.getItem("role"),
          user: localStorage.getItem("user"),
          profile: localStorage.getItem("profile"),
          session: localStorage.getItem("session"),
        })
      );
    }

    const tok = data.token || data.session?.access_token || "";
    const r = data.role;
    // Impersonation uses a bare token (no Supabase session object).
    if (data.session) localStorage.setItem("session", JSON.stringify(data.session));
    else localStorage.removeItem("session");
    localStorage.setItem("token", tok);
    localStorage.setItem("role", r);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.profile) localStorage.setItem("profile", JSON.stringify(data.profile));

    const imp = {
      name: data.name || data.profile?.name || "",
      role: r,
      home: HOME_BY_ROLE[r] || "/",
    };
    localStorage.setItem("impersonation", JSON.stringify(imp));

    setUser(data.user);
    setProfile(data.profile ?? null);
    setRole(r);
    setToken(tok);
    setImpersonation(imp);
    navigate(imp.home);
    return { ok: true };
  };

  // Restore the admin session WITHOUT navigating — used when the browser Back
  // button lands on an admin route mid-impersonation. The current (admin) route
  // then re-renders as admin instead of bouncing to /login. If the restored
  // admin access token is stale, ProtectedRoute's refresh fallback renews it.
  const exitImpersonation = () => {
    const backup = readJSON("admin_backup");
    if (backup) {
      for (const k of ["token", "role", "user", "profile", "session"]) {
        if (backup[k] == null) localStorage.removeItem(k);
        else localStorage.setItem(k, backup[k]);
      }
    }
    localStorage.removeItem("admin_backup");
    localStorage.removeItem("impersonation");
    setImpersonation(null);
    setToken(readToken());
    setRole(localStorage.getItem("role"));
    setUser(readJSON("user"));
    setProfile(readJSON("profile"));
  };

  const stopImpersonate = async () => {
    const backup = readJSON("admin_backup");

    // First restore the raw backup as a baseline.
    if (backup) {
      for (const k of ["token", "role", "user", "profile", "session"]) {
        if (backup[k] == null) localStorage.removeItem(k);
        else localStorage.setItem(k, backup[k]);
      }
    }

    // The admin's original access token may have expired during the View
    // session — renew it via the refresh token so we don't bounce to /login.
    try {
      const sess = backup?.session ? JSON.parse(backup.session) : null;
      const rt = sess?.refresh_token;
      if (rt) {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: rt }),
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("session", JSON.stringify(data.session));
          localStorage.setItem("token", data.token);
          if (data.role) localStorage.setItem("role", data.role);
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.profile) localStorage.setItem("profile", JSON.stringify(data.profile));
        }
      }
    } catch {
      /* fall back to the raw restored backup */
    }

    localStorage.removeItem("admin_backup");
    localStorage.removeItem("impersonation");
    setImpersonation(null);
    setToken(readToken());
    setRole(localStorage.getItem("role"));
    setUser(readJSON("user"));
    setProfile(readJSON("profile"));
    navigate("/AdminCRM");
  };

  // While impersonating, slide the session forward on real user activity so an
  // active admin never gets dropped — but only via the backend, which enforces
  // the absolute cap. Idle → the token lapses and View must be used again.
  useEffect(() => {
    if (!impersonation) return;

    let active = false;
    const bump = () => { active = true; };
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

    const id = setInterval(async () => {
      if (!active) return; // only extend when the admin is actually using it
      active = false;
      const t = localStorage.getItem("token");
      if (!t) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/impersonate/refresh`,
          { method: "POST", headers: { Authorization: `Bearer ${t}` } }
        );
        if (!res.ok) return; // cap reached / expired — let it lapse naturally
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        }
      } catch {
        /* transient network error — retry on the next tick */
      }
    }, 4 * 60 * 1000); // every 4 min; token TTL is 15 min

    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [impersonation]);

  // Renew the Supabase session from the stored refresh token so the access
  // token doesn't expire mid-session (the cause of spurious "Invalid token").
  // Skipped while impersonating (that uses a separate short-lived token).
  const refreshSession = async () => {
    if (localStorage.getItem("impersonation")) return false;
    let rt = null;
    try {
      rt = JSON.parse(localStorage.getItem("session"))?.refresh_token;
    } catch {
      rt = null;
    }
    if (!rt) return false;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) return false;
      localStorage.setItem("session", JSON.stringify(data.session));
      localStorage.setItem("token", data.token);
      if (data.role) localStorage.setItem("role", data.role);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data.profile) localStorage.setItem("profile", JSON.stringify(data.profile));
      setToken(data.token);
      if (data.role) setRole(data.role);
      if (data.user) setUser(data.user);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch {
      return false;
    }
  };

  // Proactively renew every 45 min (access tokens last ~60 min).
  useEffect(() => {
    const id = setInterval(refreshSession, 45 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const logout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("impersonation");
    localStorage.removeItem("admin_backup");
    setUser(null);
    setProfile(null);
    setRole(null);
    setToken(null);
    setImpersonation(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user, profile, role, token,
        impersonation, impersonate, stopImpersonate, exitImpersonation,
        login, logout, loadMe, refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) ?? {};
