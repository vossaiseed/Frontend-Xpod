import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Route guard (backend-based)
 */
const ProtectedRoute = ({ allow = [], children }) => {
  const { token, role } = useAuth();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        if (!token || !role) {
          if (active) setStatus("denied");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.valid) {
          if (active) setStatus("denied");
          return;
        }

        const ok = allow.length === 0 || allow.includes(role);

        if (active) setStatus(ok ? "ok" : "denied");
      } catch (err) {
        if (active) setStatus("denied");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
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