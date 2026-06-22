import { useOutletContext } from "react-router-dom";
import { Trophy } from "lucide-react";
import { inr, inrShort, TIERS, milestoneProgress } from "../../utils/milestones.js";

const SalesMilestones = () => {
    const { data } = useOutletContext();
    const earnings = data?.stats?.earnings || 0;
    const m = milestoneProgress(earnings);

    return (
        <div className="max-w-md">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Milestone Tracker</h3>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Closed so far</span>
                    <span className="font-bold text-gray-900">{inr(earnings)}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-orange-500" style={{ width: `${m.pct}%` }} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    {m.next
                        ? `${inrShort(m.remaining)} more to reach ${m.next.emoji} ${m.next.name}`
                        : "All milestones achieved 🎉"}
                </p>

                <div className="mt-4 space-y-2">
                    {TIERS.map((t) => {
                        const achieved = earnings >= t.amount;
                        return (
                            <div
                                key={t.name}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                                    achieved ? "bg-green-50" : "bg-gray-50"
                                }`}
                            >
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                    <span>{t.emoji}</span> {t.name}
                                    {achieved && (
                                        <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                            Achieved
                                        </span>
                                    )}
                                </span>
                                <span className="text-sm font-semibold text-gray-500">{inrShort(t.amount)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SalesMilestones;
