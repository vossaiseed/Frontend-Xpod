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

const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const getTrash = async () => {
  const res = await fetch(`${API}/api/trash`, { headers: headers() });
  return res.ok ? res.json() : [];
};

export const getActivity = async () => {
  const res = await fetch(`${API}/api/trash/activity`, { headers: headers() });
  return res.ok ? res.json() : [];
};

export const getArchived = async () => {
  const res = await fetch(`${API}/api/trash/archived`, { headers: headers() });
  return res.ok ? res.json() : [];
};

export const unarchiveItem = async (type, id) => {
  const res = await fetch(`${API}/api/trash/${type}/${id}/unarchive`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
};

export const restoreItem = async (type, id) => {
  const res = await fetch(`${API}/api/trash/${type}/${id}/restore`, {
    method: "POST",
    headers: headers(),
  });
  return res.json();
};

export const purgeItem = async (type, id) => {
  const res = await fetch(`${API}/api/trash/${type}/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
};
