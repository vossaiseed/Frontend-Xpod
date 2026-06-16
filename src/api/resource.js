export function createResource(baseUrl) {
  return {
    list: async () => {
      const res = await fetch(baseUrl);
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },

    getById: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`);
      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },

    create: async (payload) => {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },

    update: async (id, payload) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },

    remove: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      return { data, error: res.ok ? null : data };
    },
  };
}