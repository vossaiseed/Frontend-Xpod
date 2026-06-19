let DB = {
  leads: [],
  partners: [],
  lead_managers: [],
};

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async list(table) {
    await delay();
    return { data: DB[table] || [], error: null };
  },

  async create(table, payload) {
    await delay();
    const item = { ...payload, id: Date.now().toString() };
    DB[table].push(item);
    return { data: item, error: null };
  },

  async update(table, id, payload) {
    await delay();
    DB[table] = DB[table].map((i) =>
      i.id === id ? { ...i, ...payload } : i
    );
    return { data: true, error: null };
  },

  async remove(table, id) {
    await delay();
    DB[table] = DB[table].filter((i) => i.id !== id);
    return { data: true, error: null };
  },
};