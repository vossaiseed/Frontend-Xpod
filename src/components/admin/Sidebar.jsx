import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { menuItems, ADMIN_BASE } from "./menuConfig.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getLeads } from "../../services/LeadServices.js";
import { getTrash } from "../../api/trash.js";

/**
 * Admin sidebar.
 *
 * Responsive behaviour:
 *  - Desktop (lg+): fixed, always visible.
 *  - Mobile / tablet: off-canvas drawer toggled via `open` / `onClose`.
 *
 * Props:
 *  - open:     boolean  — drawer visibility on small screens
 *  - onClose:  fn       — close the drawer
 * (user / logout come from AuthContext)
 */
const Sidebar = ({ open, onClose }) => {
  const { user, profile, logout } = useAuth();
  const displayName = profile?.name || user?.name || "Admin";
  const role = profile?.role || user?.role || "admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => logout();

  // Red badges show only NEW items since the section was last opened.
  // We baseline counts on first load, store "seen" counts per section, and
  // clear a section's badge when you open it. Refetched on navigation.
  const SEEN_KEY = "admin_seen_counts";
  const location = useLocation();
  const [counts, setCounts] = useState({});
  const [seen, setSeen] = useState({});

  useEffect(() => {
    let active = true;
    (async () => {
      const [leadRes, trash] = await Promise.all([getLeads(""), getTrash()]);
      if (!active) return;
      const leads = leadRes?.data || [];
      const current = {
        "Pending Review": leads.filter((l) => l.status === "pending").length,
        "Conversion Requests": leads.filter((l) => l.status === "conversion_requested").length,
        "Assigned Leads": leads.filter((l) => l.assigned_to).length,
        "General Leads": leads.filter((l) => l.lead_manager_id).length,
        Trash: Array.isArray(trash) ? trash.length : 0,
      };

      let nextSeen;
      let raw = null;
      try {
        raw = localStorage.getItem(SEEN_KEY);
      } catch {
        raw = null;
      }
      if (raw === null) {
        // First load → baseline everything so existing data isn't flagged new.
        nextSeen = { ...current };
      } else {
        try {
          nextSeen = JSON.parse(raw) || {};
        } catch {
          nextSeen = {};
        }
        // Mark the currently-open section as seen → clears its badge.
        const openItem = menuItems.find(
          (m) => m.path !== ADMIN_BASE && location.pathname.startsWith(m.path)
        );
        if (openItem && current[openItem.name] !== undefined) {
          nextSeen[openItem.name] = current[openItem.name];
        }
      }
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(nextSeen));
      } catch {
        /* ignore */
      }
      setCounts(current);
      setSeen(nextSeen);
    })();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  // Badge = how many NEW items since this section was last seen.
  const countFor = (name) => Math.max(0, (counts[name] || 0) - (seen[name] || 0));

  return (
    <aside
      className={`fixed top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-[left] duration-300 lg:left-0 ${
        open ? "left-0" : "-left-64"
      }`}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bb882e] text-lg font-bold text-white">
            X
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-gray-900">XPOD CRM</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
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
        {menuItems.map(({ name, path, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ADMIN_BASE}
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
                <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                  {badge}
                </span>
              )
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: logged-in user + logout */}
      <div className="border-t border-gray-200 p-3">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
            {initial}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-gray-900">{displayName}</h4>
            <p className="truncate text-xs capitalize text-gray-500">
              {role.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
