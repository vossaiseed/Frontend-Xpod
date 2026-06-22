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
    Plus
} from "lucide-react";

export const Lead_BASE = "/LeadManagerDashboard";

export const menuItems = [
    { name: "Overview", path: Lead_BASE, icon: LayoutDashboard },
    { name: "Leads", path: `${Lead_BASE}/Leads`, icon: ClipboardList },
    { name: "Sales Team", path: `${Lead_BASE}/Sales-Team`, icon: Users },
    { name: "Alerts", path: `${Lead_BASE}/Alerts`, icon: GitPullRequest },
    {
        name: "Add Lead",
        icon: Plus,
        type: "button",
        action: "addLead",
    },
];

// Resolve a human-readable page title from a pathname.
// Falls back to "Overview" for the index route or unknown paths.
export const titleForPath = (pathname) => {
    // Prefer the most specific (longest) matching path.
    const match = [...menuItems]
        .filter((item) => item.path)
        .sort((a, b) => b.path.length - a.path.length)
        .find((item) =>
            item.path === Lead_BASE
                ? pathname === Lead_BASE || pathname === `${Lead_BASE}/`
                : pathname.startsWith(item.path)
        );

    return match?.name ?? "Overview";
};
