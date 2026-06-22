import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, MapPin, Phone, Globe, User, Tag, Calendar, Clock,
    ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { getLeads } from "../../services/LeadServices";
import { getPartners } from "../../api/lookups";
import { useAuth } from "../../context/AuthContext.jsx";

const relTime = (d) => {
    if (!d) return "";
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const LeadPool = () => {
    const navigate = useNavigate();
    const { role, user, logout } = useAuth();

    const [leads, setLeads] = useState([]);
    const [partnersById, setPartnersById] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    // active filter: { kind: "all" | "source" | "category", value }
    const [active, setActive] = useState({ kind: "all" });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [leadRes, partners] = await Promise.all([
                getLeads("?pool=true"),
                getPartners(),
            ]);
            setLeads(leadRes?.data || []);
            setPartnersById(Object.fromEntries((partners || []).map((p) => [p.id, p])));
            setLoading(false);
        })();
    }, []);

    const partnerType = (lead) => partnersById[lead.partner_id]?.partner_type;
    const creatorRole = (lead) =>
        lead.lead_manager_id ? "Lead Manager" : lead.partner_id ? "Partner" : null;

    // Partner-category counts (only leads linked to a partner).
    const categories = useMemo(() => {
        const map = {};
        for (const l of leads) {
            const t = partnerType(l);
            if (t) map[t] = (map[t] || 0) + 1;
        }
        return Object.entries(map).map(([name, count]) => ({ name, count }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leads, partnersById]);

    // Lead-source counts.
    const sources = useMemo(() => {
        const map = {};
        for (const l of leads) {
            const s = l.source || "Other";
            map[s] = (map[s] || 0) + 1;
        }
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [leads]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return leads.filter((l) => {
            if (active.kind === "source" && (l.source || "Other") !== active.value) return false;
            if (active.kind === "category" && partnerType(l) !== active.value) return false;
            return (
                !q ||
                l.name?.toLowerCase().includes(q) ||
                l.location?.toLowerCase().includes(q) ||
                (l.source || "").toLowerCase().includes(q)
            );
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leads, search, active, partnersById]);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Standalone top bar */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-8">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800" aria-label="Back">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight text-gray-900">Available Leads</h1>
                        <p className="text-xs text-gray-500">
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 font-semibold capitalize text-purple-700">
                                {role || "admin"}
                            </span>{" "}
                            · {user?.name || "Admin"}
                        </p>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600">
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
                {/* Filters panel */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, location, source..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
                        />
                    </div>

                    <button
                        onClick={() => setActive({ kind: "all" })}
                        className={`mt-3 rounded-xl px-4 py-2 text-sm font-semibold ${
                            active.kind === "all" ? "bg-orange-600 text-white" : "bg-gray-50 text-gray-600"
                        }`}
                    >
                        All Sources ({leads.length})
                    </button>

                    {/* By partner category */}
                    {categories.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                By Partner Category
                            </p>
                            <div className="space-y-2">
                                {categories.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setActive({ kind: "category", value: c.name })}
                                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${
                                            active.kind === "category" && active.value === c.name
                                                ? "border-orange-300 bg-orange-50 text-orange-700"
                                                : "border-gray-100 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="font-medium">{c.name}</span>
                                        <span className="flex items-center gap-2">
                                            <span className="rounded-full bg-gray-100 px-2 text-xs text-gray-500">{c.count}</span>
                                            <ChevronRight size={15} className="text-gray-400" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* By lead source */}
                    {sources.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                By Lead Source
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sources.map((s) => (
                                    <button
                                        key={s.name}
                                        onClick={() => setActive({ kind: "source", value: s.name })}
                                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
                                            active.kind === "source" && active.value === s.name
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-gray-50 text-gray-600 hover:bg-orange-50"
                                        }`}
                                    >
                                        {s.name}
                                        <span className="rounded-full bg-white px-2 text-xs text-gray-500">{s.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-4 text-sm text-gray-500">{filtered.length} leads available</p>

                {/* Lead cards */}
                {loading ? (
                    <div className="mt-3 space-y-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-44 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                        No available leads.
                    </div>
                ) : (
                    <div className="mt-3 space-y-4">
                        {filtered.map((lead) => {
                            const role = creatorRole(lead);
                            return (
                                <button
                                    key={lead.id}
                                    onClick={() => navigate(`/AdminCRM/lead/${lead.id}`)}
                                    className="block w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                            Unclaimed
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={12} /> {relTime(lead.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="mt-2 text-lg font-bold text-gray-900">{lead.name}</h3>

                                    <div className="mt-2 space-y-1.5 text-sm text-gray-500">
                                        {lead.phone && (
                                            <p className="flex items-center gap-2">
                                                <Phone size={14} className="shrink-0 text-orange-500" />
                                                {lead.phone}
                                            </p>
                                        )}
                                        {(lead.state || lead.location) && (
                                            <p className="flex items-center gap-2">
                                                <MapPin size={14} className="shrink-0 text-orange-500" />
                                                {[lead.state, lead.location].filter(Boolean).join(" · ")}
                                            </p>
                                        )}
                                        {lead.language && (
                                            <p className="flex items-center gap-2">
                                                <Globe size={14} className="shrink-0 text-orange-500" />
                                                {lead.language}
                                            </p>
                                        )}
                                        {lead.created_by && (
                                            <p className="flex items-center gap-2">
                                                <User size={14} className="shrink-0 text-orange-500" />
                                                Created By: {lead.created_by}
                                                {role ? ` (${role})` : ""}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-2">
                                            <Tag size={14} className="shrink-0 text-orange-500" />
                                            Source:{" "}
                                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                                {lead.source || "Direct"}
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar size={14} className="shrink-0 text-orange-500" />
                                            {fmtDate(lead.created_at)}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadPool;
