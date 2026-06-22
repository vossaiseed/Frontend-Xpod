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

/** The logged-in salesman's own profile + stats + assigned leads. */
export const getMine = async () => {
  const res = await fetch(`${API}/api/sales-team/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to load");
  return body;
};
