import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

/**
 * Route guard (backend-based)
 */
const ProtectedRoute = ({ allow = [], children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("session"));
        const role = localStorage.getItem("role");

        if (!session || !role) {
          setStatus("denied");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.valid) {
          setStatus("denied");
          return;
        }

        const ok = allow.length === 0 || allow.includes(role);

        setStatus(ok ? "ok" : "denied");
      } catch (err) {
        setStatus("denied");
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, [allow]);

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