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
 * Change the logged-in user's password (POST /api/auth/change-password).
 * Throws Error(message) on failure.
 */
export const changePassword = async (currentPassword, newPassword) => {
  const res = await fetch(`${API}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to change password");
  return body;
};

/** Change the phone number used to log in. */
export const changePhone = async (newPhone, currentPassword) => {
  const res = await fetch(`${API}/api/auth/change-phone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ newPhone, currentPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to change phone");
  return body;
};
