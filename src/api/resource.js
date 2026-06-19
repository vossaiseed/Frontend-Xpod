const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Describe a REST resource for useCrud.
 * Pass a short name ("partners", "sales-team") or a full URL.
 *
 *   createResource("partners")  -> http://localhost:5000/api/partners
 */
export const createResource = (name) => {
  const endpoint = /^https?:\/\//.test(name) ? name : `${API}/api/${name}`;
  return { name, endpoint };
};
