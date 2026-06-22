import { useOutletContext } from "react-router-dom";
import { IndianRupee } from "lucide-react";
import { inr } from "../../utils/milestones.js";
import { commissionPct, commissionAmount } from "../../utils/commission.js";

const Row = ({ label, value, valueClass = "text-gray-900" }) => (
    <div className="flex items-center justify-between border-b border-gray-50 py-4 last:border-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
);

const SalesEarnings = () => {
    const { data } = useOutletContext();
    const stats = data?.stats || {};
    const member = data?.member;

    const totalClosed = Number(stats.earnings || 0);
    const convertedCount = stats.converted ?? 0;
    const rate = commissionPct(member);
    const commission = commissionAmount(totalClosed, member);
    const avgDeal = convertedCount ? Math.round(totalClosed / convertedCount) : 0;

    return (
        <div className="max-w-md">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                    <IndianRupee size={18} className="text-orange-600" />
                    <h3 className="font-semibold text-gray-900">My Earnings</h3>
                </div>
                <Row label="Total Closed Value" value={inr(totalClosed)} />
                <Row label="Total Commission Earned" value={inr(commission)} valueClass="text-orange-600" />
                <Row label="Leads Converted" value={convertedCount} valueClass="text-green-600" />
                <Row label="Avg. Deal Value" value={inr(avgDeal)} />
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">
                Commission is calculated at {rate}% of each closed deal value.
            </p>
        </div>
    );
};

export default SalesEarnings;
