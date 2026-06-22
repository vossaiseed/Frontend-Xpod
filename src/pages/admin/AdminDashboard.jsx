import { useEffect, useState } from "react";
import { ClipboardList, Flame, GitPullRequest, BarChart3, ClipboardListIcon } from "lucide-react";

import DashboardCard from "../../components/admin/DashboardCard.jsx";
import SectionCard from "../../components/admin/SectionCard.jsx";
import { getDashboard } from "../../api/dashboard.js";

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

/* ── Helpers ───────────────────────────────────────────── */

const EmptyState = ({ children }) => <p className="text-sm text-gray-400">{children}</p>;

const Avatar = ({ name, color = "bg-amber-100 text-amber-700" }) => (
  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${color}`}>
    {(name?.charAt(0) || "?").toUpperCase()}
  </div>
);

const CapacityRow = ({ name, assigned, capacity }) => {
  const pct = capacity > 0 ? (assigned / capacity) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-gray-500">{assigned}/{capacity}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
};

const PartnerCard = ({ name, royalty_percent, status }) => (
  <div className="flex justify-between rounded-xl  bg-gray-50 px-4 py-3">
    <div className="flex items-center gap-3">
      <Avatar name={name} />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-xs capitalize text-gray-500">{status || "active"}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold">{Number(royalty_percent || 0)}%</p>
      <p className="text-xs text-gray-400">royalty</p>
    </div>
  </div>
);

/* ── Dashboard ───────────────────────────────────────────── */

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setData(await getDashboard());
      } catch (e) {
        setError(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="rounded-2xl bg-red-50 px-4 py-6 text-center text-red-600">{error}</div>;

  const stats = data?.stats || {};
  const pendingReview = data?.pendingReview || [];
  const hotLeads = data?.hotLeads || [];
  const conversionRequests = data?.conversionRequests || [];
  const salesCapacity = data?.salesCapacity || [];
  const partners = data?.partners || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Leads" value={stats.totalLeads ?? 0} />
        <DashboardCard label="Converted" value={stats.converted ?? 0} />
        <DashboardCard label="Pending Review" value={stats.pendingReview ?? 0} />
        <DashboardCard label="Conversion Requests" value={stats.conversionRequests ?? 0} />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard label="Total Revenue" value={0} />
        <DashboardCard label="Total Royalty" value={formatINR(stats.totalRoyalty)} />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending */}
        <SectionCard title="Pending Review" icon={ClipboardListIcon}
          iconClassName="text-[#f97316]"
        >
        {pendingReview.length ? (
          pendingReview.map((l) => (
            <div key={l.id} className="flex justify-between rounded px-3 py-2 hover:bg-gray-50">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-gray-500">{l.source || "—"}</p>
              </div>
              <span className="text-xs text-gray-400">{fmtDate(l.created_at)}</span>
            </div>
          ))
        ) : (
          <EmptyState>No leads pending review</EmptyState>
        )}
      </SectionCard>

      {/* Hot leads */}
      <SectionCard title="Hot Leads" icon={Flame}>
        {hotLeads.length ? (
          hotLeads.map((l) => (
            <div key={l.id} className="flex justify-between rounded px-3 py-2 hover:bg-gray-50">
              <div>
                <p className="font-medium">
                  {l.name}
                  {l.is_vip && (
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-600">
                      VIP
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{l.location || "—"}</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">{formatINR(l.value)}</span>
            </div>
          ))
        ) : (
          <EmptyState>No leads yet</EmptyState>
        )}
      </SectionCard>

      {/* Conversion */}
      <SectionCard title="Conversion Requests" icon={GitPullRequest}>
        {conversionRequests.length ? (
          conversionRequests.map((r) => (
            <div key={r.id} className="flex justify-between rounded px-3 py-2 hover:bg-gray-50">
              <p className="font-medium">{r.name}</p>
              <span className="text-xs text-purple-500">pending</span>
            </div>
          ))
        ) : (
          <EmptyState>No conversion requests</EmptyState>
        )}
      </SectionCard>

      {/* Capacity */}
      <SectionCard title="Sales Capacity" icon={BarChart3}>
        {salesCapacity.length ? (
          salesCapacity.map((s) => (
            <CapacityRow
              key={s.id}
              name={s.name}
              assigned={s.capacity || 0}
              capacity={s.max_lead_capacity || 0}
            />
          ))
        ) : (
          <EmptyState>No sales staff</EmptyState>
        )}
      </SectionCard>

      {/* Partners */}
      <SectionCard title="Partners" className="lg:col-span-2">
        {partners.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {partners.map((p) => (
              <PartnerCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <EmptyState>No partners</EmptyState>
        )}
      </SectionCard>
    </div>
    </div >
  );
};

export default AdminDashboard;
