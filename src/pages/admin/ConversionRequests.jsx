import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "lucide-react";
import { getLeads, getReports } from "../../services/LeadServices";
import { getSalesTeam, getPartners } from "../../api/lookups";

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }) + " IST"
        : "";

const ConversionRequests = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const [leadRes, sales, partners] = await Promise.all([
                getLeads("?status=conversion_requested"),
                getSalesTeam(),
                getPartners(),
            ]);
            const leads = leadRes?.data || [];
            const salesById = Object.fromEntries(sales.map((s) => [s.id, s]));
            const partnersById = Object.fromEntries(partners.map((p) => [p.id, p]));

            // Pull the latest report note per lead (the sales rep's conversion note).
            const enriched = await Promise.all(
                leads.map(async (l) => {
                    const reps = await getReports(l.id).catch(() => []);
                    const latest = Array.isArray(reps) && reps.length ? reps[0] : null;
                    return {
                        ...l,
                        requestedBy: salesById[l.assigned_to]?.name || "—",
                        partnerName: partnersById[l.partner_id]?.name || null,
                        note: latest?.note || l.notes || "",
                        requestedAt: latest?.created_at || l.updated_at || l.created_at,
                    };
                })
            );
            setRows(enriched);
            setLoading(false);
        })();
    }, []);

    return (
        <div className="space-y-5">
            <p className="text-sm text-gray-500">
                Leads where sales staff have requested conversion approval.
            </p>

            {loading ? (
                <div className="space-y-3">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-white" />
                    ))}
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
                    No conversion requests.
                </div>
            ) : (
                <div className="space-y-4">
                    {rows.map((lead) => (
                        <button
                            key={lead.id}
                            onClick={() => navigate(`/AdminCRM/lead/${lead.id}`)}
                            className="block w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                        >
                            {/* badge + time */}
                            <div className="flex items-start justify-between">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                                    <Hourglass size={13} /> Pending Approval
                                </span>
                                <span className="text-xs text-gray-400">{fmtDate(lead.requestedAt)}</span>
                            </div>

                            {/* name + phone */}
                            <h3 className="mt-3 text-lg font-bold text-gray-900">{lead.name}</h3>
                            {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}

                            {/* requested by / partner */}
                            <p className="mt-2 text-sm font-medium text-blue-600">
                                Requested by: {lead.requestedBy}
                            </p>
                            {lead.partnerName && (
                                <p className="text-sm text-gray-500">Partner: {lead.partnerName}</p>
                            )}

                            {/* note */}
                            {lead.note && (
                                <div className="mt-3 rounded-xl bg-purple-50/60 px-4 py-3 text-sm italic text-gray-600">
                                    "{lead.note}"
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConversionRequests;
