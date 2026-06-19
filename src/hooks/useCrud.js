import { useEffect, useState } from "react";

// Resolve the access token from "token" or the stored session.
const getToken = () => {
  const direct = localStorage.getItem("token");
  if (direct && direct !== "null" && direct !== "undefined") return direct;
  try {
    return JSON.parse(localStorage.getItem("session"))?.access_token || "";
  } catch {
    return "";
  }
};

const authHeaders = (extra = {}) => {
  const headers = { ...extra };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// Normalise a response body into { data } / { error }.
// Collection GETs may return a bare array, an { data } envelope, or an
// error-shaped object ({ message }) on failure.
const parseBody = async (res) => {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    return { error: { message: body?.message || `Request failed (${res.status})` } };
  }
  return { data: body?.data ?? body };
};

/**
 * REST-backed CRUD hook. Talks to the endpoint described by the resource
 * (see createResource). Returns the same { rows, create, update, remove }
 * shape the pages already use; create/update/remove resolve to { data } or
 * { error: { message } }.
 */
export const useCrud = (resource) => {
  const endpoint =
    resource?.endpoint ||
    (resource?.name
      ? `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/${resource.name}`
      : null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { headers: authHeaders() });
      const out = await parseBody(res);
      if (out.error) {
        setError(out.error.message);
        setRows([]);
      } else {
        setRows(Array.isArray(out.data) ? out.data : out.data ? [out.data] : []);
      }
    } catch (err) {
      setError(err.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const create = async (data) => {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      });
      const out = await parseBody(res);
      if (!out.error) await load();
      return out;
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const update = async (id, data) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data),
      });
      const out = await parseBody(res);
      if (!out.error) await load();
      return out;
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const out = await parseBody(res);
      if (!out.error) await load();
      return out;
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  // Generic sub-action: POST ${endpoint}/${id}/${path} (e.g. "reset-password").
  const action = async (id, path, body) => {
    try {
      const res = await fetch(`${endpoint}/${id}/${path}`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: body ? JSON.stringify(body) : undefined,
      });
      const out = await parseBody(res);
      if (!out.error) await load();
      return out;
    } catch (err) {
      return { error: { message: err.message } };
    }
  };

  return { rows, loading, error, create, update, remove, action, reload: load };
};
