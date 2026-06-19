import { useEffect, useState } from "react";

const EMPTY = {
    stats: {
        totalLeads: 0,
        converted: 0,
        pendingReview: 0,
        conversionRequests: 0,
        totalRevenue: 0,
        totalRoyalty: 0,
    },
    pendingReview: [],
    hotLeads: [],
    conversionRequests: [],
    salesCapacity: [],
    partners: [],
};

export const formatINR = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function useDashboardData() {
    const [data, setData] = useState(EMPTY);

    useEffect(() => {
        setData(EMPTY);
    }, []);

    return { ...data, loading: false };
}