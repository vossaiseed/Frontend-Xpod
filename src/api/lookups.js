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

const get = async (path) => {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) return [];
  const body = await res.json();
  return Array.isArray(body) ? body : body.data || [];
};

// Read-only lookups for mapping ids -> names in admin lead views.
export const getSalesTeam = () => get("/api/sales-team");
// Sales members enriched with per-member lead stats (Sales Team board).
export const getSalesTeamStats = () => get("/api/sales-team/stats");
export const getPartners = () => get("/api/partners");
export const getLeadManagers = () => get("/api/lead-managers");
