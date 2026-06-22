import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Route guard (backend-based)
 */
const ProtectedRoute = ({ allow = [], children }) => {
  const { token, role, refreshSession } = useAuth();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const verify = async (tok) => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json().catch(() => ({}));
      return res.ok && data.valid;
    };

    const checkAuth = async () => {
      try {
        if (!token || !role) {
          if (active) setStatus("denied");
          return;
        }

        let ok = await verify(token);

        // Token rejected (often just expired) — try a one-time refresh and
        // re-verify the renewed token before giving up.
        if (!ok) {
          const refreshed = await refreshSession?.();
          if (refreshed) {
            ok = await verify(localStorage.getItem("token"));
          }
        }

        if (!active) return;
        if (!ok) {
          setStatus("denied");
          return;
        }

        const allowed = allow.length === 0 || allow.includes(role);
        setStatus(allowed ? "ok" : "denied");
      } catch (err) {
        if (active) setStatus("denied");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
    // refreshSession intentionally excluded — it changes identity each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allow, token, role]);

  if (status === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;