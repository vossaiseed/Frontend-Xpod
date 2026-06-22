import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock, GitPullRequest, ChevronRight } from "lucide-react";
import { setLeadStatus, leadAction } from "../../services/LeadServices.js";

const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "discussion", label: "Discussion" },
    { value: "followup", label: "Follow-up" },
    { value: "converted", label: "Converted" },
    { value: "not_interested", label: "Not Interested" },
    { value: "failed", label: "Failed" },
];

const STATUS_PILL = {
    new: "bg-blue-50 text-blue-600",
    in_progress: "bg-amber-50 text-amber-700",
    discussion: "bg-indigo-50 text-indigo-600",
    followup: "bg-orange-50 text-orange-600",
    converted: "bg-green-50 text-green-700",
    not_interested: "bg-gray-100 text-gray-500",
    failed: "bg-red-50 text-red-600",
    conversion_requested: "bg-purple-50 text-purple-600",
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

/**
 * Lead cards for the salesman. With `actions`, shows a status dropdown +
 * Request Conversion; otherwise renders a read-only status pill.
 */
const SalesLeadList = ({ leads = [], onChanged, actions = true, emptyText = "No leads." }) => {
    const navigate = useNavigate();
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState("");

    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    const changeStatus = async (lead, status) => {
        setBusy(lead.id);
        const res = await setLeadStatus(lead.id, status);
        setBusy(null);
        if (res?.error) return flash(res.error.message || "Update failed");
        flash(`Updated "${lead.name}"`);
        onChanged?.();
    };

    const requestConversion = async (lead) => {
        setBusy(lead.id);
        const res = await leadAction(lead.id, "request-conversion");
        setBusy(null);
        if (!res?.data) return flash(res?.message || "Failed");
        flash(`Conversion requested for "${lead.name}"`);
        onChanged?.();
    };

    if (leads.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                {emptyText}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notice && (
                <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{notice}</div>
            )}
            {leads.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <button
                                onClick={() => navigate(`/SalesmanDashboard/lead/${lead.id}`)}
                                className="text-left text-lg font-bold text-gray-900 hover:text-orange-600"
                            >
                                {lead.name}
                            </button>
                            <div className="mt-1 space-y-0.5 text-sm text-gray-500">
                                {lead.phone && (
                                    <p className="flex items-center gap-1.5"><Phone size={13} className="text-orange-500" />{lead.phone}</p>
                                )}
                                {lead.location && (
                                    <p className="flex items-center gap-1.5"><MapPin size={13} className="text-orange-500" />{lead.location}</p>
                                )}
                                <p className="flex items-center gap-1.5"><Clock size={13} className="text-orange-500" />{fmtDate(lead.created_at)}</p>
                            </div>
                        </div>

                        {actions ? (
                            <div className="flex flex-col items-end gap-2">
                                <select
                                    value={lead.status || "new"}
                                    onChange={(e) => changeStatus(lead, e.target.value)}
                                    disabled={busy === lead.id}
                                    className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                                >
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => requestConversion(lead)}
                                    disabled={busy === lead.id}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                                >
                                    <GitPullRequest size={13} /> Request Conversion
                                </button>
                            </div>
                        ) : (
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[lead.status] || "bg-gray-100 text-gray-500"}`}>
                                {(lead.status || "").replace(/_/g, " ")}
                            </span>
                        )}
                    </div>
                    {lead.notes && <p className="mt-2 text-sm text-gray-600">{lead.notes}</p>}

                    <button
                        onClick={() => navigate(`/SalesmanDashboard/lead/${lead.id}`)}
                        className="mt-3 inline-flex items-center gap-1 border-t border-gray-100 pt-3 text-sm font-medium text-orange-600 hover:underline"
                    >
                        View details & timeline <ChevronRight size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SalesLeadList;
