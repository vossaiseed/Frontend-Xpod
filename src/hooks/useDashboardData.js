import { useEffect, useState } from "react";
import { supabase } from "/src/components/supabase/supabaseConnection.js";

/**
 * Single source of truth for the Admin dashboard's data.
 *
 * Queries the CRM tables defined in supabase/schema.sql. Every query is wrapped
 * in `safe()` so a missing table / RLS denial degrades to the empty state
 * instead of crashing the dashboard.
 */
const EMPTY = {
  stats: {
    totalLeads: 0,
    converted: 0,
    pendingReview: 0,
    conversionRequests: 0,
    totalRevenue: 0,
    totalRoyalty: 0,
  },
  pendingReview: [],      // [{ id, name, source, date }]
  hotLeads: [],           // [{ id, name, value, score }]
  conversionRequests: [], // [{ id, name, agent, status }]
  salesCapacity: [],      // [{ id, name, assigned, capacity }]
  partners: [],           // [{ id, name, revenue, royalty }]
};

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : "—";

// Run a query block; swallow errors so one failure never breaks the dashboard.
const safe = async (fn) => {
  try {
    await fn();
  } catch {
    /* keep defaults */
  }
};

const countOf = async (table, apply = (q) => q) => {
  const { count } = await apply(
    supabase.from(table).select("*", { count: "exact", head: true })
  );
  return count ?? 0;
};

export function useDashboardData() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const next = structuredClone(EMPTY);
      let convertedLeads = []; // reused for partner performance

      // ── Stat counts ───────────────────────────────────────────────
      await safe(async () => {
        next.stats.totalLeads = await countOf("leads", (q) => q.is("deleted_at", null));
      });
      await safe(async () => {
        next.stats.converted = await countOf("leads", (q) =>
          q.eq("status", "converted").is("deleted_at", null)
        );
      });
      await safe(async () => {
        next.stats.pendingReview = await countOf("leads", (q) =>
          q.eq("status", "pending_review").is("deleted_at", null)
        );
      });
      await safe(async () => {
        next.stats.conversionRequests = await countOf("conversion_requests", (q) =>
          q.eq("status", "pending")
        );
      });

      // ── Revenue (sum of converted lead values) ────────────────────
      await safe(async () => {
        const { data: rows } = await supabase
          .from("leads")
          .select("value, partner_id")
          .eq("status", "converted")
          .is("deleted_at", null);
        convertedLeads = rows ?? [];
        next.stats.totalRevenue = convertedLeads.reduce(
          (s, r) => s + Number(r.value || 0),
          0
        );
      });

      // ── Royalty (sum of approved conversion-request royalties) ────
      await safe(async () => {
        const { data: rows } = await supabase
          .from("conversion_requests")
          .select("royalty")
          .eq("status", "approved");
        next.stats.totalRoyalty = (rows ?? []).reduce(
          (s, r) => s + Number(r.royalty || 0),
          0
        );
      });

      // ── Pending review list ───────────────────────────────────────
      await safe(async () => {
        const { data: rows } = await supabase
          .from("leads")
          .select("id, name, source, created_at")
          .eq("status", "pending_review")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(5);
        next.pendingReview = (rows ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          source: l.source || "—",
          date: fmtDate(l.created_at),
        }));
      });

      // ── Hot leads (highest value, not yet converted) ──────────────
      await safe(async () => {
        const { data: rows } = await supabase
          .from("leads")
          .select("id, name, value")
          .in("status", ["new", "pending_review", "assigned"])
          .is("deleted_at", null)
          .order("value", { ascending: false })
          .limit(5);
        const list = rows ?? [];
        const max = Math.max(1, ...list.map((r) => Number(r.value || 0)));
        next.hotLeads = list.map((l) => ({
          id: l.id,
          name: l.name,
          value: Number(l.value || 0),
          score: Math.max(1, Math.round((Number(l.value || 0) / max) * 99)),
        }));
      });

      // ── Conversion requests list ──────────────────────────────────
      await safe(async () => {
        const { data: rows } = await supabase
          .from("conversion_requests")
          .select("id, status, leads(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);
        next.conversionRequests = (rows ?? []).map((r) => ({
          id: r.id,
          name: r.leads?.name || "Lead",
          agent: "—",
          status: r.status,
        }));
      });

      // ── Sales capacity ────────────────────────────────────────────
      await safe(async () => {
        const { data: team } = await supabase
          .from("sales_team")
          .select("id, name, capacity")
          .eq("active", true);
        const { data: assigned } = await supabase
          .from("leads")
          .select("assigned_to")
          .not("assigned_to", "is", null)
          .is("deleted_at", null)
          .neq("status", "converted");

        const counts = {};
        (assigned ?? []).forEach((l) => {
          counts[l.assigned_to] = (counts[l.assigned_to] || 0) + 1;
        });

        next.salesCapacity = (team ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          assigned: counts[t.id] || 0,
          capacity: t.capacity || 10,
        }));
      });

      // ── Partner performance ───────────────────────────────────────
      await safe(async () => {
        const { data: partners } = await supabase
          .from("partners")
          .select("id, name, royalty_percent");

        const revByPartner = {};
        convertedLeads.forEach((r) => {
          if (r.partner_id)
            revByPartner[r.partner_id] =
              (revByPartner[r.partner_id] || 0) + Number(r.value || 0);
        });

        next.partners = (partners ?? []).map((p) => {
          const revenue = revByPartner[p.id] || 0;
          return {
            id: p.id,
            name: p.name,
            revenue,
            royalty: (revenue * Number(p.royalty_percent || 0)) / 100,
          };
        });
      });

      if (active) {
        setData(next);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { ...data, loading };
}
