import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock, User, Mic, ChevronRight, CalendarClock } from "lucide-react";
import { getMyFollowups } from "../../api/sales.js";

const STATUS = {
    new: { label: "New", badge: "bg-blue-50 text-blue-600" },
    in_progress: { label: "In-Progress", badge: "bg-amber-50 text-amber-700" },
    discussion: { label: "Discussion", badge: "bg-indigo-50 text-indigo-600" },
    followup: { label: "Follow-up", badge: "bg-orange-50 text-orange-600" },
    conversion_requested: { label: "Conversion Requested", badge: "bg-purple-50 text-purple-600" },
    converted: { label: "Converted", badge: "bg-green-50 text-green-700" },
    not_interested: { label: "Not Interested", badge: "bg-gray-100 text-gray-500" },
    failed: { label: "Failed", badge: "bg-red-50 text-red-600" },
    pending: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
};
const statusInfo = (s) => STATUS[s] || { label: s || "—", badge: "bg-gray-100 text-gray-500" };

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " IST" : "";

const SalesFollowups = () => {
    const { data } = useOutletContext();
    const navigate = useNavigate();
    const memberName = data?.member?.name || "You";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            // Server resolves which leads have a follow-up date in one request.
            const res = await getMyFollowups().catch(() => ({ leads: [] }));
            if (!active) return;
            setRows(Array.isArray(res?.leads) ? res.leads : []);
            setLoading(false);
        })();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500">Leads with scheduled follow-up dates.</p>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    No follow-ups right now.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {rows.map((lead) => {
                        const info = statusInfo(lead.status);
                        return (
                            <button
                                key={lead.id}
                                onClick={() => navigate(`/SalesmanDashboard/lead/${lead.id}`)}
                                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${info.badge}`}>
                                        {info.label}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                                            <Mic size={15} />
                                        </span>
                                        <ChevronRight size={18} className="text-gray-300" />
                                    </div>
                                </div>

                                <h3 className="mt-2 text-lg font-bold text-gray-900">{lead.name}</h3>

                                <div className="mt-1.5 space-y-1 text-sm text-gray-500">
                                    {lead.phone && (
                                        <p className="flex items-center gap-1.5">
                                            <Phone size={14} className="shrink-0 text-orange-500" />
                                            {lead.phone}
                                        </p>
                                    )}
                                    {lead.location && (
                                        <p className="flex items-center gap-1.5">
                                            <MapPin size={14} className="shrink-0 text-orange-500" />
                                            {lead.location}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-1.5">
                                        <User size={14} className="shrink-0 text-orange-500" />
                                        Sales: {memberName}
                                    </p>
                                    <p className="flex items-center gap-1.5 font-medium text-orange-600">
                                        <CalendarClock size={14} className="shrink-0" />
                                        Follow-up: {fmtDate(lead.followup)}
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        <Clock size={14} className="shrink-0 text-orange-500" />
                                        {fmtDateTime(lead.created_at)}
                                    </p>
                                </div>

                                {lead.created_by && (
                                    <p className="mt-2 self-end text-xs text-gray-400">{lead.created_by}</p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SalesFollowups;
