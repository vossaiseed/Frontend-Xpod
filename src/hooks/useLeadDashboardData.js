import { useEffect, useState } from "react";
import { supabase } from "../components/supabase/supabaseConnection";

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
    recentActivity:[],

    inactiveLeads: [],

    salesStaff: [],
};

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fmtDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
        : "—";

export function useLeadDashboardData(leadManagerId,refreshKey) {

    const [data, setData] = useState(EMPTY);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const load = async () => {

            setLoading(true);

            const next = structuredClone(EMPTY);

            let id = leadManagerId;

            // If Lead Manager logged in
            if (!id) {

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                id = user?.id;
            }

            if (!id) {
                setLoading(false);
                return;
            }

            // Pending review

            const { count: pending } = await supabase

                .from("leads")

                .select("*", {
                    count: "exact",
                    head: true
                })

                .eq("lead_manager_id", id)

                .eq("status", "pending");

            next.stats.pendingReview = pending || 0;


            // Converted

            const { count: converted } = await supabase

                .from("leads")

                .select("*", {
                    count: "exact",
                    head: true
                })

                .eq("lead_manager_id", id)

                .eq("status", "converted");

            next.stats.converted = converted || 0;


            // Active staff

            const { count: staff } = await supabase

                .from("sales_team")

                .select("*", {
                    count: "exact",
                    head: true
                })

                .eq("lead_manager_id", id);

            next.stats.activeStaff = staff || 0;

            //vip Leads

            const { count: VIPLeads } = await supabase
                .from('leads')
                .select('*', {
                    count: "exact", head: true
                })
                .eq("lead_manager_id", id)
                .eq("is_vip", true)

            next.stats.vipLeads = VIPLeads || 0

            //assigned today

            const today = new Date().toISOString().split("T")[0];
            const { count: assignedToday } = await supabase
                .from('leads')
                .select('*', {
                    count: "exact", head: true
                })
                .eq('lead_manager_id', id)
                .gte("created_at", `${today}T00:00:00`)

            next.stats.assignedToday = assignedToday || 0


            const inactiveDate = new Date(
                Date.now() - 48 * 60 * 60 * 1000
            ).toISOString();

            const { count: inactive } = await supabase
                .from("leads")
                .select("*", { count: "exact", head: true })
                .eq("lead_manager_id", id)
                .lt("updated_at", inactiveDate);

            next.stats.inactive = inactive || 0;

            // Inactive Leads List

            const { data: inactiveLeads } = await supabase
                .from("leads")
                .select("*")
                .eq("lead_manager_id", id)
                .lt("updated_at", inactiveDate);

            next.inactiveLeads = inactiveLeads || [];
            // Pipeline

            const { data: leads } = await supabase

                .from("leads")

                .select("status")

                .eq("lead_manager_id", id);

            (leads || []).forEach((lead) => {

                switch (lead.status) {

                    case "pending":

                        next.pipeline.pending++;

                        break;

                    case "new":

                        next.pipeline.new++;

                        break;

                    case "discussion":

                        next.pipeline.discussion++;

                        break;

                    case "followup":

                        next.pipeline.followup++;

                        break;

                    case "converted":

                        next.pipeline.converted++;

                        break;

                    case "failed":

                        next.pipeline.failed++;

                        break;
                }
            });

            setData(next);

            setLoading(false);

        };

        load();

    }, [leadManagerId,refreshKey]);

    return {

        ...data,

        loading,

    };
}