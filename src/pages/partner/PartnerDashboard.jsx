import { Search, Plus, LogOut, MapPin, Trophy, Lock, Mic, PlusIcon, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PartnerAddLead from "../../components/partner/PartnerAddLead";
import ResetPassword from "../../components/partner/ResetPassword";
import PartnerAddLeadModel from "../../components/partner/PartnerAddLeadModel";
import ImpersonationBanner from "../../components/common/ImpersonationBanner";
import { useAuth } from "../../context/AuthContext";


const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getToken = () => {
    const direct = localStorage.getItem("token");
    if (direct && direct !== "null" && direct !== "undefined") return direct;
    try {
        return JSON.parse(localStorage.getItem("session"))?.access_token || "";
    } catch {
        return "";
    }
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

const STATUS_LABELS = {
    pending: "Pending",
    new: "New",
    in_progress: "In Progress",
    discussion: "Discussion",
    followup: "Follow-up",
    conversion_requested: "Conversion Requested",
    converted: "Converted",
    not_interested: "Not Interested",
    failed: "Failed",
};

const FILTERS = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "discussion", label: "Discussion" },
    { key: "converted", label: "Converted" },
    { key: "not_interested", label: "Not Interested" },
];

export default function PartnerDashboard() {
    const navigate = useNavigate();
    const { impersonation, stopImpersonate } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [formOpen, setFormOpen] = useState(false)
    const [resetOpen, setResetOpen] = useState(false)
    const [addLeadOpen, setAddLeadOpen] = useState(false);


    const load = useCallback(async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch(`${API}/api/partners/me`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || "Failed to load");
            setData(body);
        } catch (err) {
            setErrorMsg(err.message || "Failed to load your data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleLogout = () => {
        localStorage.removeItem("session");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const partner = data?.partner || {};
    const stats = data?.stats || {};
    const leads = data?.leads || [];
    const recentActivity = data?.recentActivity || [];

    const visibleLeads = useMemo(() => {
        const q = search.trim().toLowerCase();
        return leads.filter((l) => {
            const matchesFilter = filter === "all" || l.status === filter;
            const matchesSearch =
                !q ||
                l.name?.toLowerCase().includes(q) ||
                l.phone?.toLowerCase().includes(q);
            return matchesFilter && matchesSearch;
        });
    }, [leads, search, filter]);

    const initial = (partner.name?.charAt(0) || "?").toUpperCase();

    return (
        <div className="min-h-screen bg-[#ebe2d2]">
            <ImpersonationBanner />
            {/* Navbar */}
            <div className="flex flex-row sm:flex-row justify-between items-center gap-4 px-4 sm:px-8 py-8 sm:py-6 mt-5">
                <h1 className="text-2xl font-bold text-amber-700">xpod</h1>

                <div className="flex items-center gap-3 sm:gap-4">
                    <button className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white flex items-center justify-center">
                        <Trophy size={18} />
                    </button>
                    <div>
                        <button
                            onClick={() => setResetOpen(true)}
                            className="w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-white flex items-center justify-center">
                            <Lock size={18} />
                        </button>
                        <ResetPassword
                            openForm={resetOpen}
                            setOpenForm={setResetOpen}
                        />
                    </div>
                    {impersonation ? (
                        <button
                            onClick={stopImpersonate}
                            className="bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 text-sm sm:text-base"
                        >
                            <ArrowLeft size={18} />
                            Back to Admin CRM
                        </button>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center gap-2 text-sm sm:text-base"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
                {loading ? (
                    <div className="py-20 text-center text-gray-500">Loading your dashboard…</div>
                ) : errorMsg ? (
                    <div className="rounded-2xl bg-red-50 px-4 py-6 text-center text-red-600">
                        {errorMsg}
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-row justify-between gap-8">
                            <div>
                                <p className="uppercase text-xs sm:text-xs tracking-widest text-gray-500">
                                    {partner.partner_type || "Partner"}
                                </p>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
                                    {partner.name || "—"}
                                </h1>
                                {partner.email && (
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        {partner.email}
                                    </p>
                                )}
                                {partner.company && (
                                    <p className="font-medium text-sm sm:text-base">
                                        {partner.company}
                                    </p>
                                )}
                                {(partner.location || partner.state) && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm sm:text-base">
                                        <MapPin size={15} />
                                        {[partner.location, partner.state].filter(Boolean).join(", ")}
                                    </div>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="w-32 sm:w-40 md:w-48 h-40 sm:h-52 md:h-60 rounded-3xl bg-[#d7cab8] flex items-center justify-center overflow-hidden">
                                {partner.photo_url ? (
                                    <img src={partner.photo_url} alt={partner.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-500">
                                        {initial}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Voice Button */}
                        <div>
                            <div className="mt-8">

                                <button
                                    onClick={() => setFormOpen(true)}

                                    className="w-full bg-black text-white py-2 sm:py-3 rounded-full text-base sm:text-md font-semibold flex items-center justify-center gap-3">
                                    <Mic />
                                    Quick Voice Action
                                </button>
                                <PartnerAddLead
                                    openForm={formOpen}
                                    setOpenForm={setFormOpen}
                                />
                            </div>

                        </div>
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <StatCard number={stats.totalLeads ?? 0} title="TOTAL LEADS" />
                            <StatCard number={stats.converted ?? 0} title="CONVERTED" />
                            <StatCard number={stats.activeLeads ?? 0} title="ACTIVE LEADS" />
                            <StatCard number={inr(stats.royaltyEarned)} title="ROYALTY EARNED" />
                        </div>

                        {/* {recent activity} */}

                        <div className="mt-6">
                            <h2 className="font-bold text-3xl sm:text-xl">Recent Activity</h2>
                            {recentActivity.length === 0 ? (
                                <div className="bg-white rounded-2xl h-22 flex items-center justify-center text-gray-400 text-sm mt-2 p-4">
                                    No Recent Activity Yet
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl mt-2 divide-y divide-gray-100">
                                    {recentActivity.slice(0, 6).map((a) => (
                                        <div key={a.id} className="flex items-start gap-3 p-3">
                                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                {(a.author_name || "?").charAt(0).toUpperCase()}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-800">
                                                    <span className="font-semibold">{a.author_name || "Update"}</span>
                                                    {a.status ? ` · ${a.status.replace(/_/g, " ")}` : ""}
                                                    {a.lead_name ? ` — ${a.lead_name}` : ""}
                                                </p>
                                                {a.note && <p className="text-sm text-gray-500">{a.note}</p>}
                                                <p className="text-xs text-gray-400">{fmtDate(a.created_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Leads */}
                        <div className="mt-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <h2 className="font-bold text-3xl sm:text-xl">Your Leads</h2>

                                <button
                                    onClick={() => setAddLeadOpen(true)}
                                    className="flex gap-2 bg-black border rounded-2xl p-2 text-md text-white"
                                >
                                    <PlusIcon />
                                    Add lead
                                </button>

                                <PartnerAddLeadModel
                                    openForm={addLeadOpen}
                                    setOpenForm={setAddLeadOpen}
                                    partner={partner}
                                    onSaved={load}
                                />
                            </div>


                            {/* Search */}
                            <div className="relative bg-white rounded-xl h-10 justify-items-center">
                                <Search className="absolute left-3 sm:left-4 top-3 sm:top-3 text-gray-400" size={18} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-2xl py-3 sm:py-2 pl-10 sm:pl-12 outline-none text-sm sm:text-base"
                                    placeholder="Search by name or phone..."
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-4 sm:px-5 py-2 sm:py-3 rounded-full whitespace-nowrap text-sm sm:text-base ${filter === f.key ? "bg-black text-white" : "bg-white"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Lead Cards */}
                            {visibleLeads.length === 0 ? (
                                <div className="bg-white rounded-3xl h-28 flex items-center justify-center text-gray-400 text-sm mt-2">
                                    No leads to show
                                </div>
                            ) : (
                                <div className="space-y-3 mt-2">
                                    {visibleLeads.map((lead) => (
                                        <button
                                            key={lead.id}
                                            onClick={() => navigate(`/PartnerLead/${lead.id}`)}
                                            className="block w-full text-left bg-white rounded-3xl p-5 sm:p-4 transition hover:shadow-md"
                                        >
                                            <div className="text-gray-500 mb-2 text-sm">
                                                {STATUS_LABELS[lead.status] || lead.status}
                                            </div>
                                            <h3 className="text-xl sm:text-2xl md:text-md font-semibold">
                                                {lead.name}
                                            </h3>
                                            {lead.location && (
                                                <p className="text-gray-500 text-sm sm:text-xs">{lead.location}</p>
                                            )}
                                            {lead.notes && (
                                                <p className="text-gray-500 mt-1 text-sm sm:text-xs">{lead.notes}</p>
                                            )}
                                            <p className="text-gray-400 mt-1 text-xs sm:text-xs">
                                                {fmtDate(lead.created_at)} · Tap to view timeline
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({ number, title }) {
    return (
        <div className="bg-white rounded-2xl p-4 sm:p-2 text-center">
            <h2 className="text-xl sm:text-xl font-bold">{number}</h2>
            <p className="text-xs text-gray-500 mt-2">{title}</p>
        </div>
    );
}
