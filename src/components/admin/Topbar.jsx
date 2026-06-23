import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

/**
 * Sticky top bar.
 *
 * Props:
 *  - title:      string — current page title
 *  - onMenuClick:fn     — open the mobile sidebar drawer
 * (user comes from AuthContext)
 */
const Topbar = ({ title, onMenuClick }) => {
  const { user, profile } = useAuth();
  const displayName = profile?.name || user?.name || "Admin";
  const role = profile?.role || user?.role || "admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold capitalize text-orange-600 sm:inline-block">
          {role.replace(/_/g, " ")}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
