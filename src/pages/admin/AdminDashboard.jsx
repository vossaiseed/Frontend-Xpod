import { ClipboardList, Flame, GitPullRequest, BarChart3 } from "lucide-react";

import DashboardCard from "../../components/admin/DashboardCard.jsx";
import SectionCard from "../../components/admin/SectionCard.jsx";

/* ── Mock Data (UI ONLY MODE) ───────────────────────────── */

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const stats = {
  totalLeads: 120,
  converted: 45,
  pendingReview: 12,
  conversionRequests: 5,
  totalRevenue: 850000,
  totalRoyalty: 120000,
};

const pendingReview = [
  { id: 1, name: "Rahul Kumar", source: "Website", date: "12 Jun" },
  { id: 2, name: "Anjali S", source: "Instagram", date: "11 Jun" },
];

const hotLeads = [
  { id: 1, name: "John Doe", value: 120000, score: 92 },
  { id: 2, name: "Sara Ali", value: 95000, score: 85 },
];

const conversionRequests = [
  { id: 1, name: "Lead A", agent: "Agent 1", status: "pending" },
  { id: 2, name: "Lead B", agent: "Agent 2", status: "pending" },
];

const salesCapacity = [
  { id: 1, name: "Alex", assigned: 6, capacity: 10 },
  { id: 2, name: "John", assigned: 3, capacity: 8 },
];

const partners = [
  { id: 1, name: "Partner A", revenue: 300000, royalty: 45000 },
  { id: 2, name: "Partner B", revenue: 250000, royalty: 30000 },
];

/* ── Helpers ───────────────────────────────────────────── */

const EmptyState = ({ children }) => (
  <p className="text-sm text-gray-400">{children}</p>
);

const Avatar = ({ name, color = "bg-amber-100 text-amber-700" }) => (
  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${color}`}>
    {(name?.charAt(0) || "?").toUpperCase()}
  </div>
);

const CapacityRow = ({ name, assigned, capacity }) => {
  const pct = (assigned / capacity) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-xs text-gray-500">{assigned}/{capacity}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const PartnerCard = ({ name, revenue, royalty }) => (
  <div className="flex justify-between rounded-xl border bg-gray-50 px-4 py-3">
    <div className="flex items-center gap-3">
      <Avatar name={name} />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-gray-500">{formatINR(revenue)}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold">{formatINR(royalty)}</p>
      <p className="text-xs text-gray-400">royalty</p>
    </div>
  </div>
);

/* ── Dashboard ───────────────────────────────────────────── */

const AdminDashboard = () => {
  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard label="Total Leads" value={stats.totalLeads} />
        <DashboardCard label="Converted" value={stats.converted} />
        <DashboardCard label="Pending Review" value={stats.pendingReview} />
        <DashboardCard label="Conversion Requests" value={stats.conversionRequests} />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DashboardCard label="Total Revenue" value={formatINR(stats.totalRevenue)} />
        <DashboardCard label="Total Royalty" value={formatINR(stats.totalRoyalty)} />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Pending */}
        <SectionCard title="Pending Review" icon={ClipboardList}>
          {pendingReview.length ? pendingReview.map((l) => (
            <div key={l.id} className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-gray-500">{l.source}</p>
              </div>
              <span className="text-xs text-gray-400">{l.date}</span>
            </div>
          )) : <EmptyState>No data</EmptyState>}
        </SectionCard>

        {/* Hot leads */}
        <SectionCard title="Hot Leads" icon={Flame}>
          {hotLeads.map((l) => (
            <div key={l.id} className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
              <div>
                <p className="font-medium">{l.name}</p>
                <p className="text-xs text-gray-500">{formatINR(l.value)}</p>
              </div>
              <span className="text-xs text-red-500 font-bold">{l.score}</span>
            </div>
          ))}
        </SectionCard>

        {/* Conversion */}
        <SectionCard title="Conversion Requests" icon={GitPullRequest}>
          {conversionRequests.map((r) => (
            <div key={r.id} className="flex justify-between px-3 py-2 hover:bg-gray-50 rounded">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-gray-500">{r.agent}</p>
              </div>
              <span className="text-xs text-purple-500">{r.status}</span>
            </div>
          ))}
        </SectionCard>

        {/* Capacity */}
        <SectionCard title="Sales Capacity" icon={BarChart3}>
          {salesCapacity.map((s) => (
            <CapacityRow key={s.id} {...s} />
          ))}
        </SectionCard>

        {/* Partners */}
        <SectionCard title="Partners" className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-3">
            {partners.map((p) => (
              <PartnerCard key={p.id} {...p} />
            ))}
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default AdminDashboard;