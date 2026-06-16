import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseConnection.js";

/**
 * Route guard.
 *
 * - No session            -> redirect to /login
 * - Session but wrong role -> redirect to /login
 * - Authorised             -> render children
 *
 * Props:
 *  - allow:    string[] of permitted roles (empty = any authenticated user)
 *  - children: protected element tree
 */
const ProtectedRoute = ({ allow = [], children }) => {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let active = true;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) setStatus("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const ok = allow.length === 0 || allow.includes(profile?.role);
      if (active) setStatus(ok ? "ok" : "denied");
    })();

    return () => {
      active = false;
    };
  }, [allow]);

  if (status === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f8fafc] text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (status === "denied") return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
