import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import SalesSidebar from "../components/sales/SalesSidebar.jsx";
import ImpersonationBanner from "../components/common/ImpersonationBanner.jsx";
import { getMine } from "../api/sales.js";

const TITLES = {
    "": "Dashboard",
    assigned: "Assigned Leads",
    "follow-ups": "Follow-ups",
    "conversion-requests": "Conversion Requests",
    earnings: "Earnings",
    milestones: "Milestones",
    "lead-pool": "Lead Pool",
};

const SalesLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();

    const title = useMemo(() => {
        const seg = location.pathname.split("/SalesmanDashboard")[1]?.replace(/^\//, "") || "";
        return TITLES[seg] || "Dashboard";
    }, [location.pathname]);

    const load = async () => {
        try {
            setData(await getMine());
            setError("");
        } catch (err) {
            setError(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const member = data?.member;

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
            )}

            <SalesSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                member={member}
                leads={data?.leads}
                loading={loading}
            />

            <div className="lg:ml-64">
                <ImpersonationBanner />
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 mt-5">
                    <div className="flex items-center gap-3 ">
                        <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
                            <Menu size={22} />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{member?.name || "Sales"}</span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">Sales</span>
                    </div>
                </header>

                <main className="p-4 md:p-8">
                    {loading ? (
                        <div className="py-20 text-center text-gray-500">Loading…</div>
                    ) : error ? (
                        <div className="rounded-2xl bg-red-50 px-4 py-6 text-center text-red-600">{error}</div>
                    ) : (
                        <Outlet context={{ data, reload: load }} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default SalesLayout;
