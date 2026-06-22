import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, MapPin, Clock, UserPlus } from "lucide-react";
import { getLeads, leadAction } from "../../services/LeadServices.js";
import { useAuth } from "../../context/AuthContext.jsx";

const relTime = (d) => {
    if (!d) return "";
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
};

const SalesLeadPool = () => {
    const { reload } = useOutletContext();
    const [pool, setPool] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState("");
    const { impersonation } = useAuth();

    const isAdminView = !!impersonation;

    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    const loadPool = async () => {
        setLoading(true);
        const res = await getLeads("?pool=true");
        setPool(res?.data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadPool();
    }, []);

    const claim = async (lead) => {
        setBusy(lead.id);
        const res = await leadAction(lead.id, "claim");
        setBusy(null);
        if (!res?.data) return flash(res?.message || "Could not claim");
        flash(`Claimed "${lead.name}"`);
        setPool((p) => p.filter((l) => l.id !== lead.id));
        reload?.(); // refresh my-leads/stats in the layout
    };

    const filtered = pool.filter((l) => {
        const q = search.trim().toLowerCase();
        return (
            !q ||
            l.name?.toLowerCase().includes(q) ||
            l.location?.toLowerCase().includes(q) ||
            (l.source || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-4">
            {notice && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, location, source..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
                />
            </div>

            <p className="text-sm text-gray-500">{filtered.length} leads available</p>
            <div className="mx-auto max-w-3xl space-y-4">
                {loading ? (
                    <div className="space-y-3">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-white"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                        No unclaimed leads in the pool.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((lead) => (
                            <div
                                key={lead.id}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                        Unclaimed
                                    </span>

                                    <span className="flex items-center gap-1 text-sm text-gray-400">
                                        <Clock size={14} />
                                        {relTime(lead.created_at)}
                                    </span>
                                </div>

                                {/* Lead Name */}
                                <h3 className="mt-3 text-xl font-bold text-gray-900">
                                    {lead.name}
                                </h3>

                                {/* Details */}
                                <div className="mt-4 space-y-2 text-sm text-gray-500">
                                    {lead.location && (
                                        <p className="flex items-center gap-2">
                                            <MapPin
                                                size={14}
                                                className="text-orange-500"
                                            />
                                            {lead.location}
                                        </p>
                                    )}

                                    {lead.created_by_name && (
                                        <p className="flex items-center gap-2">
                                            <UserPlus
                                                size={14}
                                                className="text-orange-500"
                                            />
                                            By: {lead.created_by_name}
                                        </p>
                                    )}

                                    <p>
                                        Source{" "}
                                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                            {lead.source || "Direct"}
                                        </span>
                                    </p>
                                </div>

                                {/* Claim Button (Hidden in Admin View) */}
                                {!isAdminView && (
                                    <button
                                        onClick={() => claim(lead)}
                                        disabled={busy === lead.id}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <UserPlus size={16} />
                                        {busy === lead.id ? "Claiming..." : "Claim Lead"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesLeadPool;
