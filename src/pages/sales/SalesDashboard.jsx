import { useOutletContext } from "react-router-dom";
import { Users, Clock, CircleCheckBig, IndianRupee, Trophy, Activity } from "lucide-react";
import { inr, inrShort, milestoneProgress } from "../../utils/milestones.js";

const StatCard = ({ icon: Icon, tone, value, label }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5  shadow-sm">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
            <Icon size={18} />
        </span>
        <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
);

const SalesDashboard = () => {
    const { data } = useOutletContext();
    const stats = data?.stats || {};
    const m = milestoneProgress(stats.earnings);

    return (
        <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} tone="bg-blue-50 text-blue-600" value={stats.totalLeads ?? 0} label="Total Assigned" />
                <StatCard icon={Clock} tone="bg-amber-50 text-amber-600" value={stats.active ?? 0} label="Active" />
                <StatCard icon={CircleCheckBig} tone="bg-green-50 text-green-600" value={stats.converted ?? 0} label="Converted" />
                <StatCard icon={IndianRupee} tone="bg-orange-50 text-orange-600" value={inr(stats.earnings)} label="My Earnings" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Milestone progress */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-amber-500" />
                        <h3 className="font-semibold text-gray-900">Milestone Progress</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">
                            {m.current ? `${m.current.emoji} ${m.current.name}` : "Not started"}
                        </p>
                        <p className="font-semibold text-orange-600">{inr(m.earnings)}</p>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-orange-500" style={{ width: `${m.pct}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        {m.next
                            ? `Next: ${m.next.emoji} ${m.next.name} — ${inrShort(m.remaining)} more to go`
                            : "Top milestone reached 🎉"}
                    </p>
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" />
                        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <p className="text-sm text-gray-400">No recent activity.</p>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
