import { useEffect, useState } from "react";
import { Trash2, RotateCcw, ClipboardList, User, Users, FileText, Archive, ArchiveRestore } from "lucide-react";
import { getTrash, getActivity, getArchived, restoreItem, unarchiveItem, purgeItem } from "../../api/trash";

const TYPE_META = {
    lead: { label: "Lead", icon: FileText, tone: "bg-blue-50 text-blue-600" },
    partner: { label: "Partner", icon: User, tone: "bg-amber-50 text-amber-700" },
    sales: { label: "Sales Staff", icon: Users, tone: "bg-purple-50 text-purple-600" },
    lead_manager: { label: "Lead Manager", icon: Users, tone: "bg-teal-50 text-teal-700" },
};

const RETENTION_DAYS = 30;

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const daysLeft = (deletedAt) => {
    if (!deletedAt) return RETENTION_DAYS;
    const ms = RETENTION_DAYS * 86400000 - (Date.now() - new Date(deletedAt).getTime());
    return Math.max(0, Math.ceil(ms / 86400000));
};

const Trash = () => {
    const [tab, setTab] = useState("trash");
    const [items, setItems] = useState([]);
    const [archived, setArchived] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(null);
    const [notice, setNotice] = useState("");

    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    const load = async () => {
        setLoading(true);
        const [t, ar, a] = await Promise.all([getTrash(), getArchived(), getActivity()]);
        setItems(Array.isArray(t) ? t : []);
        setArchived(Array.isArray(ar) ? ar : []);
        setActivity(Array.isArray(a) ? a : []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const restore = async (it) => {
        setBusy(it.id);
        const res = await restoreItem(it.type, it.id);
        setBusy(null);
        if (res?.data || res?.message === "Restored") {
            setItems((prev) => prev.filter((x) => x.id !== it.id));
            flash(`Restored "${it.name}"`);
            load();
        } else flash(res?.message || "Restore failed");
    };

    const purge = async (it) => {
        if (!window.confirm(`Permanently delete "${it.name}"? This cannot be undone.`)) return;
        setBusy(it.id);
        const res = await purgeItem(it.type, it.id);
        setBusy(null);
        if (res?.message) {
            setItems((prev) => prev.filter((x) => x.id !== it.id));
            flash(`Permanently deleted "${it.name}"`);
            load();
        }
    };

    const unarchive = async (it) => {
        setBusy(it.id);
        const res = await unarchiveItem(it.type, it.id);
        setBusy(null);
        if (res?.data || res?.message === "Unarchived") {
            setArchived((prev) => prev.filter((x) => x.id !== it.id));
            flash(`Unarchived "${it.name}"`);
            load();
        } else flash(res?.message || "Unarchive failed");
    };

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Trash</h2>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab("trash")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                        tab === "trash" ? "bg-orange-600 text-white" : "bg-white text-gray-600 shadow-sm"
                    }`}
                >
                    <Trash2 size={16} /> Trash ({items.length})
                </button>
                <button
                    onClick={() => setTab("archived")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                        tab === "archived" ? "bg-orange-600 text-white" : "bg-white text-gray-600 shadow-sm"
                    }`}
                >
                    <Archive size={16} /> Archived ({archived.length})
                </button>
                <button
                    onClick={() => setTab("activity")}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${
                        tab === "activity" ? "bg-orange-600 text-white" : "bg-white text-gray-600 shadow-sm"
                    }`}
                >
                    <ClipboardList size={16} /> Activity Log ({activity.length})
                </button>
            </div>

            {notice && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div>
            )}

            {tab === "trash" && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Items in trash are automatically permanently deleted after {RETENTION_DAYS} days. Restore them before then.
                </div>
            )}

            {tab === "archived" && (
                <div className="rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
                    Archived records are hidden from their list but kept indefinitely. Unarchive to restore them.
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                    ))}
                </div>
            ) : tab === "trash" ? (
                items.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                        Trash is empty.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((it) => {
                            const meta = TYPE_META[it.type] || TYPE_META.lead;
                            const Icon = meta.icon;
                            return (
                                <div key={`${it.type}-${it.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${meta.tone}`}>
                                            <Icon size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {it.name}
                                                <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}>
                                                    {meta.label}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Deleted {fmtDateTime(it.deleted_at)} · Auto-deletes in {daysLeft(it.deleted_at)} days
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => restore(it)}
                                            disabled={busy === it.id}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <RotateCcw size={15} /> Restore
                                        </button>
                                        <button
                                            onClick={() => purge(it)}
                                            disabled={busy === it.id}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <Trash2 size={15} /> Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : tab === "archived" ? (
                archived.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                        Nothing archived.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {archived.map((it) => {
                            const meta = TYPE_META[it.type] || TYPE_META.lead;
                            const Icon = meta.icon;
                            return (
                                <div key={`${it.type}-${it.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${meta.tone}`}>
                                            <Icon size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {it.name}
                                                <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}>
                                                    {meta.label}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Archived {fmtDateTime(it.archived_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => unarchive(it)}
                                            disabled={busy === it.id}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            <ArchiveRestore size={15} /> Unarchive
                                        </button>
                                        <button
                                            onClick={() => purge(it)}
                                            disabled={busy === it.id}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <Trash2 size={15} /> Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : activity.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    No activity yet.
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {activity.map((a) => {
                        const meta = TYPE_META[a.entity_type] || TYPE_META.lead;
                        return (
                            <div key={a.id} className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-0">
                                <div>
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold capitalize">{a.action}</span>{" "}
                                        {meta.label.toLowerCase()}{" "}
                                        <span className="font-medium">{a.entity_name || ""}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {a.actor_name || "—"} · {fmtDateTime(a.created_at)}
                                    </p>
                                </div>
                                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}>
                                    {meta.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Trash;
