import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CalendarClock,
    GitPullRequest,
    IndianRupee,
    Trophy,
    Layers,
    LogOut,
    ArrowLeft,
    X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const BASE = "/SalesmanDashboard";
const SEEN_ASSIGNED_KEY = "sales_seen_assigned";

const ITEMS = [
    { name: "Dashboard", to: BASE, icon: LayoutDashboard, end: true },
    { name: "Assigned Leads", to: `${BASE}/assigned`, icon: Users },
    { name: "Follow-ups", to: `${BASE}/follow-ups`, icon: CalendarClock },
    { name: "Conversion Requests", to: `${BASE}/conversion-requests`, icon: GitPullRequest },
    { name: "Earnings", to: `${BASE}/earnings`, icon: IndianRupee },
    { name: "Milestones", to: `${BASE}/milestones`, icon: Trophy },
    { name: "Lead Pool", to: `${BASE}/lead-pool`, icon: Layers, badge: "Claim" },
];

const SalesSidebar = ({ open, onClose, member, leads = [], loading }) => {
    const { logout, impersonation, stopImpersonate } = useAuth();
    const location = useLocation();
    const displayName = member?.name || "Sales";
    const initial = displayName.charAt(0).toUpperCase();

    // Assigned Leads = notification count: only NEW/unseen leads since the
    // Assigned Leads page was last opened. Baseline on first load.
    const totalAssigned = leads.length;
    const [seenAssigned, setSeenAssigned] = useState(() => {
        const raw = localStorage.getItem(SEEN_ASSIGNED_KEY);
        return raw === null ? null : Number(raw) || 0;
    });
    const onAssignedPage = location.pathname.toLowerCase().startsWith(`${BASE}/assigned`.toLowerCase());

    useEffect(() => {
        if (seenAssigned === null) {
            if (!loading) {
                setSeenAssigned(totalAssigned);
                localStorage.setItem(SEEN_ASSIGNED_KEY, String(totalAssigned));
            }
            return;
        }
        if (onAssignedPage && seenAssigned !== totalAssigned) {
            setSeenAssigned(totalAssigned);
            localStorage.setItem(SEEN_ASSIGNED_KEY, String(totalAssigned));
        }
    }, [onAssignedPage, totalAssigned, seenAssigned, loading]);

    const assignedBadge = seenAssigned === null ? 0 : Math.max(0, totalAssigned - seenAssigned);
    const countFor = (name) => (name === "Assigned Leads" ? assignedBadge : 0);

    return (
        <aside
            className={`fixed top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-[left] duration-300 lg:left-0 mt-8 ${
                open ? "left-0" : "-left-64"
            }`}
        >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bb882e] text-lg font-bold text-white">
                        X
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight text-gray-900">XPOD CRM</h1>
                        <p className="text-xs text-gray-500">Sales Dashboard</p>
                    </div>
                </div>
                <button onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Close menu">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {ITEMS.map(({ name, to, icon: Icon, end, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`
                        }
                    >
                        <Icon size={18} className="shrink-0" />
                        <span className="flex-1 truncate">{name}</span>
                        {countFor(name) > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                                {countFor(name)}
                            </span>
                        ) : (
                            badge && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                                    {badge}
                                </span>
                            )
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-gray-200 p-3">
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-900">{displayName}</h4>
                        <p className="text-xs text-gray-500">Sales</p>
                    </div>
                </div>
                {impersonation ? (
                    <button
                        onClick={stopImpersonate}
                        className="flex w-full items-center justify-center mb-10 gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                        <ArrowLeft size={16} /> Back to Admin CRM
                    </button>
                ) : (
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                )}
            </div>
        </aside>
    );
};

export default SalesSidebar;
