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

/**
 * Upload a base64 data URL (image or audio) to the backend (which stores it in
 * Supabase Storage) and return the public URL.
 */
export const uploadFile = async (dataUrl, folder = "misc") => {
  const res = await fetch(`${API}/api/uploads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ dataUrl, folder }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Upload failed");
  return body.url;
};

// Back-compat alias.
export const uploadImage = uploadFile;
