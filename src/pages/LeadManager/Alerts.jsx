import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, User, Clock } from "lucide-react";
import { useLeads } from "../../context/LeadContext.jsx";
import { getSalesTeam } from "../../api/lookups.js";
import { getSettings } from "../../api/settings.js";
import { assignLead } from "../../services/LeadServices.js";
import Modal from "../../components/admin/Modal.jsx";

const ACTIVE = ["new", "in_progress", "discussion", "followup", "conversion_requested"];

const hoursSince = (d) => (d ? (Date.now() - new Date(d).getTime()) / 3600000 : Infinity);
const agoLabel = (d) => {
    const h = Math.floor(hoursSince(d));
    if (!isFinite(h)) return "—";
    if (h < 1) return "just now";
    if (h < 48) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const Alerts = () => {
    const navigate = useNavigate();
    const { leads = [], fetchLeads } = useLeads();

    const [salesTeam, setSalesTeam] = useState([]);
    const [salesById, setSalesById] = useState({});
    const [threshold, setThreshold] = useState(48);
    const [reassignFor, setReassignFor] = useState(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");

    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    useEffect(() => {
        (async () => {
            const [sales, settings] = await Promise.all([getSalesTeam(), getSettings()]);
            setSalesTeam(sales || []);
            setSalesById(Object.fromEntries((sales || []).map((s) => [s.id, s])));
            if (settings?.inactivity_alert_hours) setThreshold(Number(settings.inactivity_alert_hours));
        })();
    }, []);

    const salesName = (lead) => salesById[lead?.assigned_to]?.name;

    // Inactive = assigned + still active + no update within the threshold.
    const inactive = useMemo(
        () =>
            leads.filter(
                (l) =>
                    l.assigned_to &&
                    ACTIVE.includes(l.status) &&
                    hoursSince(l.updated_at || l.created_at) >= threshold
            ),
        [leads, threshold]
    );

    const reassign = async (salesId) => {
        if (!reassignFor || !salesId) return;
        setBusy(true);
        const res = await assignLead(reassignFor.id, salesId);
        setBusy(false);
        if (!res?.data) return flash(res?.message || "Reassign failed");
        flash(`Reassigned "${reassignFor.name}"`);
        setReassignFor(null);
        fetchLeads();
    };

    return (
        <div className="space-y-4">
            {notice && (
                <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>
            )}

            {/* Banner */}
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                <AlertTriangle size={18} className="shrink-0" />
                {inactive.length} lead{inactive.length === 1 ? "" : "s"} inactive for {threshold}+ hours — action required
            </div>

            {inactive.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    No inactive leads. 🎉
                </div>
            ) : (
                <div className="space-y-3">
                    {inactive.map((lead) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-white p-4 shadow-sm"
                        >
                            <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                                {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                    <User size={13} className="shrink-0 text-gray-400" />
                                    {salesName(lead) || lead.created_by || "Unassigned"}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-red-500">
                                    <Clock size={12} className="shrink-0" />
                                    Last update: {agoLabel(lead.updated_at || lead.created_at)}
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2">
                                <button
                                    onClick={() => navigate(`/LeadManagerDashboard/lead/${lead.id}`)}
                                    className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => setReassignFor(lead)}
                                    className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Reassign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reassign modal */}
            <Modal open={!!reassignFor} onClose={() => setReassignFor(null)} title="Reassign Lead" size="md">
                {reassignFor && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Reassign <span className="font-semibold">{reassignFor.name}</span> to:
                        </p>
                        {salesTeam.length === 0 ? (
                            <p className="text-sm text-gray-400">No sales staff available.</p>
                        ) : (
                            <div className="space-y-2">
                                {salesTeam.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => reassign(s.id)}
                                        disabled={busy}
                                        className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-left hover:bg-orange-50 disabled:opacity-50"
                                    >
                                        <span className="font-medium text-gray-800">{s.name}</span>
                                        {reassignFor.assigned_to === s.id && (
                                            <span className="text-xs text-gray-400">current</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Alerts;
