import { NavLink } from "react-router-dom";
import { X, LogOut, ArrowLeft } from "lucide-react";
import { menuItems, Lead_BASE } from "./LmenuConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLeads } from "../../context/LeadContext.jsx";

const Sidebar = ({ open, onClose, onAddLead }) => {
    const { user, logout, impersonation, stopImpersonate } = useAuth();
    const { openCreate } = useLeads();


    const displayName = user?.name || "Admin";
    const role = user?.role || "admin";
    const initial = displayName.charAt(0).toUpperCase();

    const handleLogout = () => logout();

    const handleAction = (action) => {
        if (action === "addLead") {
            onAddLead?.();
        }

        onClose?.();
    };

    return (
        <aside
            className={`fixed top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-[left] duration-300 lg:left-0 mt-8 ${open ? "left-0" : "-left-64"
                }`}
        >
            {/* Brand header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bb882e] text-lg font-bold text-white">
                        X
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight text-gray-900">
                            XPOD CRM
                        </h1>
                        <p className="text-xs text-gray-500">Lead Manager</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {menuItems.map((item) => {
                    const { name, path, icon: Icon, badge, type, action } = item;

                    if (type === "button") {
                        return (
                            <button
                                key={name}
                                onClick={openCreate}
                                className="flex w-full items-center gap-3 rounded-xl  px-3 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-orange-600"
                            >
                                <Icon size={18} className="shrink-0" />
                                <span className="flex-1 truncate text-left">{name}</span>
                            </button>
                        );
                    }

                    return (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === Lead_BASE}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`
                            }
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="flex-1 truncate">{name}</span>

                            {badge && (
                                <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                                    {badge}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3">
                <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                        {initial}
                    </div>

                    <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-900">
                            {displayName}
                        </h4>
                        <p className="truncate text-xs capitalize text-gray-500">
                            {role.replace(/_/g, " ")}
                        </p>
                    </div>
                </div>

                {impersonation ? (
                    <button
                        onClick={stopImpersonate}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                        <ArrowLeft size={16} />
                        Back to Admin CRM
                    </button>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;