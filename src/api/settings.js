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

const headers = (json = false) => ({
  ...(json ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${getToken()}`,
});

const json = async (res) => {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed");
  return body;
};

export const getSettings = async () => {
  const res = await fetch(`${API}/api/settings`, { headers: headers() });
  return res.ok ? res.json() : {};
};

export const updateSettings = (patch) =>
  fetch(`${API}/api/settings`, {
    method: "PUT",
    headers: headers(true),
    body: JSON.stringify(patch),
  }).then(json);

export const getSources = async () => {
  const res = await fetch(`${API}/api/settings/sources`, { headers: headers() });
  return res.ok ? res.json() : [];
};

export const createSource = (name) =>
  fetch(`${API}/api/settings/sources`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({ name }),
  }).then(json);

export const deleteSource = (id) =>
  fetch(`${API}/api/settings/sources/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then(json);
