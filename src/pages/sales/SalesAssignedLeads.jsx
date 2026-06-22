import { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Search, Phone, MapPin, Clock, User, Mic, ChevronRight } from "lucide-react";

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

const FILTERS = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "discussion", label: "Discussion" },
    { key: "pending", label: "Pending" },
    { key: "converted", label: "Converted" },
    { key: "not_interested", label: "Not Interested" },
];

const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " IST" : "";

const SalesAssignedLeads = () => {
    const { data } = useOutletContext();
    const navigate = useNavigate();
    const leads = data?.leads || [];
    const memberName = data?.member?.name || "You";

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const counts = useMemo(() => {
        const c = { all: leads.length };
        for (const f of FILTERS) if (f.key !== "all") c[f.key] = leads.filter((l) => l.status === f.key).length;
        return c;
    }, [leads]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return leads.filter((l) => {
            const byFilter = filter === "all" || l.status === filter;
            const bySearch = !q || l.name?.toLowerCase().includes(q) || l.phone?.toLowerCase?.().includes(q);
            return byFilter && bySearch;
        });
    }, [leads, search, filter]);

    return (
        <div className="space-y-5">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
                />
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            filter === f.key ? "bg-orange-600 text-white" : "bg-white text-gray-600 shadow-sm hover:bg-orange-50"
                        }`}
                    >
                        {f.label} ({counts[f.key] ?? 0})
                    </button>
                ))}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    No leads assigned to you yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((lead) => {
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
                                    <p className="flex items-center gap-1.5">
                                        <Clock size={14} className="shrink-0 text-orange-500" />
                                        {fmtDate(lead.created_at)}
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

export default SalesAssignedLeads;
