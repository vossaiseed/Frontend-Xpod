import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Sidebar from "../components/LeadManager/Sidebar.jsx";
import Topbar from "../components/LeadManager/Topbar.jsx";
import { titleForPath } from "../components/LeadManager/LmenuConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import ImpersonationBanner from "../components/common/ImpersonationBanner.jsx";

const LeadManagerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, loadMe } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const pageTitle = useMemo(
        () => titleForPath(location.pathname),
        [location.pathname]
    );

    // ✅ LOAD USER FROM BACKEND (same GET /api/auth/me, now via AuthContext)
    useEffect(() => {
        (async () => {
            const u = await loadMe();
            if (!u) navigate("/login");
        })();
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <ImpersonationBanner />

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="pt-8 lg:ml-64">
                <Topbar
                    title={pageTitle}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="p-4 md:p-8">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default LeadManagerLayout;