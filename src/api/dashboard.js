const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getToken = () => {
  const direct = localStorage.getItem("token");
  if (direct && direct !== "null" && direct !== "undefined") return direct;
  try {
    return JSON.parse(localStorage.getItem("session"))?.access_token || "";
  } catch {
    return "";
  }
};

/** Role-aware dashboard payload (admin overview / lead-manager / partner). */
export const getDashboard = async () => {
  const res = await fetch(`${API}/api/dashboard`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
};
