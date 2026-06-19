import { useEffect, useState } from "react";

// Shape consumed by LeadManagerDashboard.jsx. Every field is defaulted so the
// component can destructure safely even before data arrives / on error.
const EMPTY = {
    stats: {
        pendingReview: 0,
        vipLeads: 0,
        assignedToday: 0,
        inactive: 0,
        converted: 0,
        activeStaff: 0,
    },
    pipeline: {
        pending: 0,
        new: 0,
        discussion: 0,
        followup: 0,
        converted: 0,
        failed: 0,
    },
    recentActivity: [],
    inactiveLeads: [],
    salesStaff: [],
};

/**
 * Lead-manager dashboard data.
 * @param {string|null} leadManagerId  when an admin views a specific manager
 * @param {number} refreshKey          bump to re-fetch
 */
export function useLeadDashboardData(leadManagerId = null, refreshKey = 0) {
    const [data, setData] = useState(EMPTY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);
            try {
                const session = JSON.parse(localStorage.getItem("session"));
                const token =
                    session?.access_token || localStorage.getItem("token");

                const base =
                    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
                const url = new URL(`${base}/api/dashboard`);
                if (leadManagerId) url.searchParams.set("id", leadManagerId);

                const res = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) throw new Error("Failed to load dashboard");

                const payload = await res.json();
                if (!active) return;

                // Map the backend payload onto the component's shape, keeping
                // EMPTY defaults for anything the backend doesn't provide.
                const s = payload.stats || {};
                setData({
                    ...EMPTY,
                    stats: {
                        ...EMPTY.stats,
                        pendingReview: s.conversionRequests ?? 0,
                        assignedToday: s.assigned ?? 0,
                        converted: s.converted ?? 0,
                        activeStaff: (payload.salesCapacity || []).length,
                    },
                    salesStaff: payload.salesCapacity || [],
                });
            } catch (err) {
                if (active) setData(EMPTY);
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [leadManagerId, refreshKey]);

    return { ...data, loading };
}

// Back-compat alias for any older imports.
export const useDashboardData = useLeadDashboardData;

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
