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

// GET LEADS — optional query string, e.g. getLeads("?status=pending")
export const getLeads = async (query = "") => {
  const res = await fetch(`${API}/api/leads${query}`, {
    method: "GET",
    headers: authHeaders(),
  });

  return res.json();
};

// Lightweight badge counts for the admin sidebar (no lead rows transferred).
// Returns { pending, conversionRequested, assigned, general, trash }.
export const getLeadCounts = async () => {
  const res = await fetch(`${API}/api/leads/counts`, {
    method: "GET",
    headers: authHeaders(),
  });
  return res.ok ? res.json() : {};
};

// Lifecycle action, e.g. leadAction(id, "approve-review") / "reject-review"
export const leadAction = async (id, action, body) => {
  const res = await fetch(`${API}/api/leads/${id}/${action}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};

// Assign / reassign a lead to a sales person.
export const assignLead = (id, assigned_to) =>
  leadAction(id, "assign", { assigned_to });

// Update a lead's status (PATCH).
export const setLeadStatus = async (id, status) => {
  const res = await fetch(`${API}/api/leads/${id}/status`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// Soft-delete a lead (moves it to Trash).
export const deleteLead = async (id) => {
  const res = await fetch(`${API}/api/leads/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

// Single lead.
export const getLead = async (id) => {
  const res = await fetch(`${API}/api/leads/${id}`, { headers: authHeaders() });
  return res.json();
};

// Reports / activity timeline.
export const getReports = async (id) => {
  const res = await fetch(`${API}/api/leads/${id}/reports`, { headers: authHeaders() });
  return res.ok ? res.json() : [];
};

export const addReport = async (id, body) => {
  const res = await fetch(`${API}/api/leads/${id}/reports`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
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
