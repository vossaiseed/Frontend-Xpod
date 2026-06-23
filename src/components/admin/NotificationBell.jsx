import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bell, X, CheckCheck, FilePlus2, UserCheck, GitPullRequest,
    FileText, CheckCircle2, Trash2, Archive,
} from "lucide-react";
import { getActivity } from "../../api/trash.js";

const SEEN_KEY = "admin_notif_seen";

const fmtTime = (d) =>
    new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }) + " IST";

const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const dayLabel = (d) => {
    const x = new Date(d);
    const t = new Date();
    const y = new Date(t);
    y.setDate(t.getDate() - 1);
    if (sameDay(x, t)) return "TODAY";
    if (sameDay(x, y)) return "YESTERDAY";
    return x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
};

const titleFor = (r) => {
    const a = r.actor_name || "Someone";
    const n = r.entity_name || "";
    const t = r.entity_type || "item";
    switch (r.action) {
        case "created": return `${a} created a new lead: ${n}`;
        case "claimed": return `${a} claimed lead ${n}`;
        case "requested_conversion": return `${a} requested conversion for lead ${n}`;
        case "report": return `${a} added a report${n ? `, ${n}` : ""}`;
        case "converted": return `${a} converted ${n}`;
        case "deleted": return `${a} deleted ${t} ${n}`;
        case "archived": return `${a} archived ${t} ${n}`;
        case "unarchived": return `${a} unarchived ${t} ${n}`;
        case "restored": return `${a} restored ${t} ${n}`;
        case "purged": return `${a} permanently deleted ${t} ${n}`;
        case "impersonate_start": return `${a} started viewing ${t} ${n}`;
        default: return `${a} ${r.action} ${t} ${n}`.trim();
    }
};

const iconFor = (action) =>
    ({
        created: [FilePlus2, "bg-amber-50 text-amber-600"],
        claimed: [UserCheck, "bg-blue-50 text-blue-600"],
        requested_conversion: [GitPullRequest, "bg-purple-50 text-purple-600"],
        report: [FileText, "bg-indigo-50 text-indigo-600"],
        converted: [CheckCircle2, "bg-green-50 text-green-600"],
        deleted: [Trash2, "bg-red-50 text-red-600"],
        archived: [Archive, "bg-gray-100 text-gray-500"],
    }[action] || [Bell, "bg-orange-50 text-orange-600"]);

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [seen, setSeen] = useState(() => localStorage.getItem(SEEN_KEY) || "1970-01-01T00:00:00.000Z");
    const ref = useRef(null);

    const load = async () => {
        const a = await getActivity();
        setItems(Array.isArray(a) ? a : []);
    };

    useEffect(() => {
        load();
        const id = setInterval(load, 60000); // refresh every minute
        return () => clearInterval(id);
    }, []);

    // Close on outside click.
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        window.addEventListener("mousedown", onClick);
        return () => window.removeEventListener("mousedown", onClick);
    }, [open]);

    const unread = useMemo(
        () => items.filter((i) => new Date(i.created_at) > new Date(seen)).length,
        [items, seen]
    );

    const groups = useMemo(() => {
        const out = [];
        let cur = null;
        for (const it of items) {
            const label = dayLabel(it.created_at);
            if (!cur || cur.label !== label) {
                cur = { label, rows: [] };
                out.push(cur);
            }
            cur.rows.push(it);
        }
        return out;
    }, [items]);

    const markAllRead = () => {
        const now = new Date().toISOString();
        localStorage.setItem(SEEN_KEY, now);
        setSeen(now);
    };

    const toggle = () => {
        setOpen((o) => !o);
        if (!open) load();
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggle}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-orange-600" />
                            <span className="font-semibold text-gray-900">Notifications</span>
                            {unread > 0 && (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                                    {unread} new
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1 text-xs font-medium text-green-600 hover:underline"
                            >
                                <CheckCheck size={14} /> All read
                            </button>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[26rem] overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="px-4 py-10 text-center text-sm text-gray-400">No notifications.</p>
                        ) : (
                            groups.map((g) => (
                                <div key={g.label}>
                                    <p className="bg-gray-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        {g.label}
                                    </p>
                                    {g.rows.map((r) => {
                                        const [Icon, tone] = iconFor(r.action);
                                        const isNew = new Date(r.created_at) > new Date(seen);
                                        return (
                                            <div key={r.id} className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0">
                                                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                                                    <Icon size={15} />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-gray-800">{titleFor(r)}</p>
                                                    <p className="mt-0.5 text-xs text-gray-400">{fmtTime(r.created_at)}</p>
                                                </div>
                                                {isNew && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
