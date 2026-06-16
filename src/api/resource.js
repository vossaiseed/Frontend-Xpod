import { supabase } from "/src/components/supabase/supabaseConnection.js";

/**
 * Generic Supabase CRUD resource factory.
 *
 * Every CRM module (partners, sales_team, lead_managers, leads, …) can share
 * this instead of repeating query boilerplate.
 *
 *   const partners = createResource("partners");
 *   const { data, error } = await partners.list();
 *
 * Options:
 *  - select:      columns/relations to fetch (default "*")
 *  - orderColumn: default "created_at"
 *  - ascending:   default false (newest first)
 */
export function createResource(
  table,
  { select = "*", orderColumn = "created_at", ascending = false } = {}
) {
  return {
    table,

    list: () =>
      supabase.from(table).select(select).order(orderColumn, { ascending }),

    getById: (id) => supabase.from(table).select(select).eq("id", id).single(),

    create: (payload) =>
      supabase.from(table).insert(payload).select().single(),

    update: (id, payload) =>
      supabase.from(table).update(payload).eq("id", id).select().single(),

    remove: (id) => supabase.from(table).delete().eq("id", id),
  };
}
