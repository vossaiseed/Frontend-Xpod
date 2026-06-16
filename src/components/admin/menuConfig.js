// Single source of truth for the Admin sidebar navigation.
// Shared by the Sidebar (to render links) and the layout/Topbar
// (to resolve the active page title from the current route).
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Settings,
  Trash2,
  GitPullRequest,
  UserPlus,
  Briefcase,
  Layers,
} from "lucide-react";

export const ADMIN_BASE = "/AdminCRM";

export const menuItems = [
  { name: "Overview", path: ADMIN_BASE, icon: LayoutDashboard },
  { name: "Pending Review", path: `${ADMIN_BASE}/pending-review`, icon: ClipboardList },
  { name: "Assigned Leads", path: `${ADMIN_BASE}/assigned-leads`, icon: Users },
  { name: "Conversion Requests", path: `${ADMIN_BASE}/conversion-requests`, icon: GitPullRequest },
  { name: "Partners", path: `${ADMIN_BASE}/partners`, icon: UserPlus },
  { name: "Lead Managers", path: `${ADMIN_BASE}/lead-managers`, icon: UserCog },
  { name: "Sales Team", path: `${ADMIN_BASE}/sales-team`, icon: Briefcase },
  { name: "General Leads", path: `${ADMIN_BASE}/general-leads`, icon: ClipboardList },
  { name: "Trash", path: `${ADMIN_BASE}/trash`, icon: Trash2 },
  { name: "Settings", path: `${ADMIN_BASE}/settings`, icon: Settings },
  { name: "Lead Pool", path: `${ADMIN_BASE}/lead-pool`, icon: Layers, badge: "View" },
];

// Resolve a human-readable page title from a pathname.
// Falls back to "Overview" for the index route or unknown paths.
export const titleForPath = (pathname) => {
  // Prefer the most specific (longest) matching path.
  const match = [...menuItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) =>
      item.path === ADMIN_BASE
        ? pathname === ADMIN_BASE || pathname === `${ADMIN_BASE}/`
        : pathname.startsWith(item.path)
    );

  return match?.name ?? "Overview";
};
