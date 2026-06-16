import { useCallback, useEffect, useState } from "react";

/**
 * Generic list + CRUD state manager for a `createResource(...)` resource.
 *
 * IMPORTANT: memoise the resource at the call site (useMemo) so this hook's
 * effect doesn't re-run on every render.
 *
 * Returns: { rows, loading, error, create, update, remove, refresh }
 * The create/update/remove helpers return the raw Supabase result
 * ({ data, error }) so the caller can surface validation errors.
 */
export function useCrud(resource) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await resource.list();
    setError(error ? error.message : null);
    setRows(data ?? []);
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload) => {
      const res = await resource.create(payload);
      if (!res.error) await refresh();
      return res;
    },
    [resource, refresh]
  );

  const update = useCallback(
    async (id, payload) => {
      const res = await resource.update(id, payload);
      if (!res.error) await refresh();
      return res;
    },
    [resource, refresh]
  );

  const remove = useCallback(
    async (id) => {
      const res = await resource.remove(id);
      if (!res.error) await refresh();
      return res;
    },
    [resource, refresh]
  );

  return { rows, loading, error, create, update, remove, refresh };
}
