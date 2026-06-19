const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Resolve the access token from either the "token" key or the stored session,
// so it works regardless of which one Login wrote.
const getToken = () => {
  const direct = localStorage.getItem("token");
  if (direct && direct !== "null" && direct !== "undefined") return direct;
  try {
    return JSON.parse(localStorage.getItem("session"))?.access_token || "";
  } catch {
    return "";
  }
};

const authHeaders = (extra = {}) => ({
  ...extra,
  Authorization: `Bearer ${getToken()}`,
});

// CREATE LEAD
export const createLead = async (leadData) => {
  const res = await fetch(`${API}/api/leads`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(leadData),
  });

  return res.json();
};

// GET LEADS
export const getLeads = async () => {
  const res = await fetch(`${API}/api/leads`, {
    method: "GET",
    headers: authHeaders(),
  });

  return res.json();
};

// UPDATE LEAD
export const updateLead = async (id, data) => {
  const res = await fetch(`${API}/api/leads/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      ...data,
      updated_at: new Date().toISOString(),
    }),
  });

  return res.json();
};
