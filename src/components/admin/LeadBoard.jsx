import { useEffect, useMemo, useState } from "react";
import { Phone, MapPin, Clock, Search, Trash2, User, Check, X } from "lucide-react";
import Modal from "./Modal";
import {
    getLeads,
    updateLead,
    assignLead,
    deleteLead,
} from "../../services/LeadServices";
import { getSalesTeam, getPartners, getLeadManagers } from "../../api/lookups";
import { useNavigate } from "react-router-dom";

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
        : "—";

const STATUS = {
    new: { label: "New", badge: "bg-blue-50 text-blue-600" },
    in_progress: { label: "In-Progress", badge: "bg-amber-50 text-amber-700" },
    discussion: { label: "Discussion", badge: "bg-indigo-50 text-indigo-600" },
    followup: { label: "Follow-up", badge: "bg-orange-50 text-orange-600" },
    converted: { label: "Converted", badge: "bg-green-50 text-green-700" },
    not_interested: { label: "Not Interested", badge: "bg-gray-100 text-gray-500" },
    failed: { label: "Failed", badge: "bg-red-50 text-red-600" },
    pending: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
    conversion_requested: {
        label: "Conversion Requested",
        badge: "bg-purple-50 text-purple-600",
    },
};
const statusInfo = (s) =>
    STATUS[s] || { label: s || "—", badge: "bg-gray-100 text-gray-500" };

const DEFAULT_FILTERS = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "in_progress", label: "In-Progress" },
    { key: "discussion", label: "Discussion" },
    { key: "converted", label: "Converted" },
    { key: "failed", label: "Failed" },
];

/**
 * Reusable admin lead board: search + status tabs + card grid + detail modal
 * (reassign / convert / reject / trash). Shared by Assigned & General Leads.
 *
 * Props:
 *  - title, subtitle
 *  - query: leads query string, e.g. "?assigned=true" / "?is_general=true"
 *  - filters: [{ key, label }]
 *  - emptyText
 */
const LeadBoard = ({
    title,
    subtitle,
    query = "",
    filters = DEFAULT_FILTERS,
    emptyText = "No leads.",
}) => {
    const [leads, setLeads] = useState([]);
    const [salesTeam, setSalesTeam] = useState([]);
    const [salesById, setSalesById] = useState({});
    const [partnersById, setPartnersById] = useState({});
    const [managersById, setManagersById] = useState({});
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [amount, setAmount] = useState("");
    const [reassigning, setReassigning] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");
    const navigate = useNavigate('')



    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    const load = async () => {
        setLoading(true);
        const [leadRes, sales, partners, managers] = await Promise.all([
            getLeads(query),
            getSalesTeam(),
            getPartners(),
            getLeadManagers(),
        ]);
        const rows = leadRes?.data || [];
        setLeads(rows);
        setSalesTeam(sales);
        setSalesById(Object.fromEntries(sales.map((s) => [s.id, s])));
        setPartnersById(Object.fromEntries(partners.map((p) => [p.id, p])));
        setManagersById(Object.fromEntries(managers.map((m) => [m.id, m])));
        setLoading(false);
        return rows;
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const salesName = (lead) => salesById[lead?.assigned_to]?.name || "—";
    const partnerName = (lead) => partnersById[lead?.partner_id]?.name || null;
    // "By" = who added the lead (created_by), else lead manager / partner / source.
    const byLabel = (lead) =>
        lead?.created_by ||
        managersById[lead?.lead_manager_id]?.name ||
        partnersById[lead?.partner_id]?.name ||
        lead?.source ||
        null;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return leads.filter((l) => {
            const byFilter = filter === "all" || l.status === filter;
            const bySearch =
                !q ||
                l.name?.toLowerCase().includes(q) ||
                l.phone?.toLowerCase?.().includes(q) ||
                l.location?.toLowerCase().includes(q) ||
                salesName(l).toLowerCase().includes(q) ||
                (partnerName(l) || "").toLowerCase().includes(q);
            return byFilter && bySearch;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leads, search, filter, salesById, partnersById]);

    const counts = useMemo(() => {
        const c = { all: leads.length };
        for (const f of filters)
            if (f.key !== "all")
                c[f.key] = leads.filter((l) => l.status === f.key).length;
        return c;
    }, [leads, filters]);

    const openLead = (lead) => {
        setSelected(lead);
        setAmount(lead.value ? String(lead.value) : "");
        setReassigning(false);
    };

    const convertLead = async () => {
        if (!selected) return;
        setBusy(true);
        const res = await updateLead(selected.id, {
            status: "converted",
            value: Number(amount) || 0,
        });
        setBusy(false);
        if (res?.error) return flash(res.error.message || "Failed");
        flash(`Converted "${selected.name}"`);
        await load();
        setSelected(null);
    };

    const rejectLead = async () => {
        if (!selected) return;
        setBusy(true);
        await updateLead(selected.id, { status: "failed" });
        setBusy(false);
        flash(`Rejected "${selected.name}"`);
        await load();
        setSelected(null);
    };

    const reassign = async (assigned_to) => {
        if (!selected || !assigned_to) return;
        setBusy(true);
        await assignLead(selected.id, assigned_to);
        setBusy(false);
        setReassigning(false);
        const rows = await load();
        setSelected(rows.find((l) => l.id === selected.id) || null);
        flash("Sales assignment updated");
    };

    const trashLead = async (lead, e) => {
        e?.stopPropagation();
        if (!window.confirm(`Move "${lead.name}" to Trash?`)) return;
        await deleteLead(lead.id);
        flash(`Moved "${lead.name}" to Trash`);
        await load();
    };

    return (
        <div className="space-y-5">
            <div>

                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>

            {notice && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {notice}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, location, phone or partner"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-400"
                />
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === f.key
                            ? "bg-orange-600 text-white"
                            : "bg-white text-gray-600 shadow-sm hover:bg-orange-50"
                            }`}
                    >
                        {f.label} ({counts[f.key] ?? 0})
                    </button>
                ))}
            </div>

            {/* Cards */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-44 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    {emptyText}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((lead) => {
                        const info = statusInfo(lead.status);
                        const by = byLabel(lead);
                        return (
                            <button
                                key={lead.id}
                                onClick={() => navigate(`/AdminCRM/lead/${lead.id}`)}
                                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                            >

                                <div className="flex items-start justify-between">
                                    <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${info.badge}`}>
                                        {info.label}
                                    </span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span
                                            onClick={(e) => trashLead(lead, e)}
                                            className="rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500"
                                            aria-label="Move to trash"
                                        >
                                            <Trash2 size={16} />
                                        </span>
                                        {by && <span className="text-xs text-gray-400">{by}</span>}
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
                                        <Clock size={14} className="shrink-0 text-orange-500" />
                                        {fmtDate(lead.created_at)}
                                    </p>
                                </div>

                                {/* Sales assignment */}
                                <div className="mt-3 border-t border-gray-100 pt-2">
                                    {lead.assigned_to ? (
                                        <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                            <User size={14} className="shrink-0 text-green-600" />
                                            {salesName(lead)}
                                        </p>
                                    ) : (
                                        <p className="flex items-center gap-1.5 text-sm text-gray-400">
                                            <User size={14} className="shrink-0" />
                                            Unassigned — in pool
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Detail modal */}
            <Modal open={!!selected} onClose={() => setSelected(null)} title="Lead Details" size="md">
                {selected && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400">Lead</p>
                            <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
                            <p className="text-sm text-gray-500">Assigned to {salesName(selected)}</p>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-semibold text-gray-900">{selected.phone || "—"}</p>
                            </div>
                            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusInfo(selected.status).badge}`}>
                                {statusInfo(selected.status).label}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border border-gray-100 p-3">
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="font-medium text-gray-800">{selected.location || "—"}</p>
                            </div>
                            <div className="rounded-xl border border-gray-100 p-3">
                                <p className="text-xs text-gray-400">Time</p>
                                <p className="font-medium text-gray-800">{fmtDate(selected.created_at)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-gray-100 p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase text-gray-400">Sales</p>
                                    <button
                                        onClick={() => setReassigning((v) => !v)}
                                        className="rounded-md border border-orange-200 px-2 py-0.5 text-xs font-medium text-orange-600 hover:bg-orange-50"
                                    >
                                        Change
                                    </button>
                                </div>
                                {reassigning ? (
                                    <select
                                        defaultValue={selected.assigned_to || ""}
                                        onChange={(e) => reassign(e.target.value)}
                                        disabled={busy}
                                        className="mt-1 w-full rounded-lg border border-gray-200 p-1.5 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="" disabled>Select sales person</option>
                                        {salesTeam.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-1 font-medium text-gray-800">{salesName(selected)}</p>
                                )}
                            </div>
                            <div className="rounded-xl border border-gray-100 p-3">
                                <p className="text-xs uppercase text-gray-400">Partner</p>
                                <p className="mt-1 font-medium text-gray-800">{partnerName(selected) || "—"}</p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs uppercase text-gray-400">
                                Conversion amount (₹) — optional
                            </p>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="e.g. 50000"
                                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-orange-400"
                            />
                            {selected.value > 0 && (
                                <p className="mt-1 text-xs text-gray-400">Current: {inr(selected.value)}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={convertLead}
                                disabled={busy}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                            >
                                <Check size={16} /> Convert Lead
                            </button>
                            <button
                                onClick={rejectLead}
                                disabled={busy}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                                <X size={16} /> Reject Lead
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeadBoard;
