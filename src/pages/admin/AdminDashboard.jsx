import { ClipboardList, Flame, GitPullRequest, BarChart3 } from "lucide-react";

import DashboardCard from "../../components/admin/DashboardCard.jsx";
import SectionCard from "../../components/admin/SectionCard.jsx";
import { useDashboardData, formatINR } from "../../hooks/useDashboardData.js";

/* ── Small presentational helpers ─────────────────────────────────────── */

const EmptyState = ({ children }) => (
  <p className="text-sm text-gray-400">{children}</p>
);

const Avatar = ({ name, color = "bg-amber-100 text-amber-700" }) => (
  <div
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}
  >
    {(name?.charAt(0) || "?").toUpperCase()}
  </div>
);

const CapacityRow = ({ name, assigned = 0, capacity = 10 }) => {
  const pct = capacity > 0 ? Math.min(100, (assigned / capacity) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-gray-800">{name}</span>
        <span className="shrink-0 text-xs text-gray-500">
          {assigned}/{capacity}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const PartnerCard = ({ name, revenue = 0, royalty = 0 }) => (
  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{formatINR(revenue)}</p>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-sm font-semibold text-gray-900">{formatINR(royalty)}</p>
      <p className="text-xs text-gray-400">royalty</p>
    </div>
  </div>
);

/* ── Dashboard ────────────────────────────────────────────────────────── */

const AdminDashboard = () => {
  const {
    stats,
    pendingReview,
    hotLeads,
    conversionRequests,
    salesCapacity,
    partners,
  } = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Leads" value={stats.totalLeads} accent="slate" />
        <DashboardCard label="Converted" value={stats.converted} accent="green" />
        <DashboardCard label="Pending Review" value={stats.pendingReview} accent="orange" />
        <DashboardCard label="Conv. Requests" value={stats.conversionRequests} accent="purple" />
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard
          label="Total Revenue"
          value={formatINR(stats.totalRevenue)}
          accent="slate"
          labelPosition="top"
        />
        <DashboardCard
          label="Total Royalty Paid"
          value={formatINR(stats.totalRoyalty)}
          accent="slate"
          labelPosition="top"
        />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Review */}
        <SectionCard title="Pending Review" icon={ClipboardList}>
          {pendingReview.length ? (
            <div className="space-y-1">
              {pendingReview.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.source}</p>
                  </div>
                  <span className="text-xs text-gray-400">{lead.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>All caught up!</EmptyState>
          )}
        </SectionCard>

        {/* Hot Leads */}
        <SectionCard title="Hot Leads" icon={Flame}>
          {hotLeads.length ? (
            <div className="space-y-1">
              {hotLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">Est. {formatINR(lead.value)}</p>
                  </div>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {lead.score}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No hot leads right now.</EmptyState>
          )}
        </SectionCard>

        {/* Conversion Requests */}
        <SectionCard title="Conversion Requests" icon={GitPullRequest}>
          {conversionRequests.length ? (
            <div className="space-y-1">
              {conversionRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-500">by {req.agent}</p>
                  </div>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No pending requests.</EmptyState>
          )}
        </SectionCard>

        {/* Sales Capacity */}
        <SectionCard title="Sales Capacity" icon={BarChart3}>
          {salesCapacity.length ? (
            <div className="space-y-4">
              {salesCapacity.map((rep) => (
                <CapacityRow
                  key={rep.id}
                  name={rep.name}
                  assigned={rep.assigned}
                  capacity={rep.capacity}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No sales team members yet.</EmptyState>
          )}
        </SectionCard>

        {/* Partner Performance (full width) */}
        <SectionCard title="Partner Performance" className="lg:col-span-2">
          {partners.length ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((p) => (
                <PartnerCard
                  key={p.id}
                  name={p.name}
                  revenue={p.revenue}
                  royalty={p.royalty}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No partners yet.</EmptyState>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
