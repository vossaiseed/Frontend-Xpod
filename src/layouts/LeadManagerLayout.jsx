import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "/src/components/supabase/supabaseConnection.js";
import Sidebar from "../components/LeadManager/Sidebar.jsx";
import Topbar from "../components/LeadManager/Topbar.jsx"
import { titleForPath } from "../components/admin/menuConfig.js";

const LeadManagerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Derive the page title from the active route.
    const pageTitle = useMemo(() => titleForPath(location.pathname), [location.pathname]);

    // Load the logged-in user's profile (name + role).
    useEffect(() => {
        const loadProfile = async () => {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            if (!authUser) {
                navigate("/login");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .single();

            setUser(data ?? { name: authUser.email, role: "admin" });
        };

        loadProfile();
    }, [navigate]);

    // Close the mobile drawer whenever the route changes.
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    aria-hidden="true"
                />
            )}
        
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />

            {/* Main content shifts right of the fixed sidebar on desktop */}
            <div className="lg:ml-64">
                <Topbar
                    title={pageTitle}
                    user={user}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="p-4 md:p-8">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default LeadManagerLayout
