import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Phone, MessageCircle, MapPin, User, Clock,
    CircleCheckBig, XCircle, FileText,
} from "lucide-react";
import { getLead, getReports, addReport, updateLead, assignLead } from "../../services/LeadServices";
import { getSalesTeam, getPartners } from "../../api/lookups";
import Modal from "../../components/admin/Modal";
import { useAuth } from "../../context/AuthContext.jsx";
import { commissionPct, commissionAmount } from "../../utils/commission.js";

const ROYALTY_CHIPS = [6, 7.5, 8, 10];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUS_BADGE = {
    new: "bg-blue-50 text-blue-600",
    in_progress: "bg-amber-50 text-amber-700",
    discussion: "bg-indigo-50 text-indigo-600",
    followup: "bg-orange-50 text-orange-600",
    converted: "bg-green-50 text-green-700",
    not_interested: "bg-gray-100 text-gray-500",
    failed: "bg-red-50 text-red-600",
    pending: "bg-amber-50 text-amber-700",
    conversion_requested: "bg-purple-50 text-purple-600",
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_OPTIONS = [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "discussion", label: "Discussion" },
    { value: "followup", label: "Follow-up" },
    { value: "converted", label: "Converted" },
    { value: "not_interested", label: "Not Interested" },
    { value: "failed", label: "Failed" },
];

const Row = ({ icon: Icon, children, tone = "text-gray-500" }) =>
    children ? (
        <p className={`flex items-center gap-2 text-sm ${tone}`}>
            <Icon size={14} className="shrink-0 text-gray-400" />
            {children}
        </p>
    ) : null;

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, role } = useAuth();
    // Only admins / lead managers may reassign a lead to a different salesperson.
    const canReassign = role === "admin" || role === "leadmanager";

    const [lead, setLead] = useState(null);
    const [reports, setReports] = useState([]);
    const [salesTeam, setSalesTeam] = useState([]);
    const [salesById, setSalesById] = useState({});
    const [partnersById, setPartnersById] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reassigning, setReassigning] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");

    // Add-report form
    const [note, setNote] = useState("");
    const [status, setStatus] = useState("new");
    const [followup, setFollowup] = useState("");

    // Approve-conversion modal
    const [convertOpen, setConvertOpen] = useState(false);
    const [dealAmount, setDealAmount] = useState("");
    const [royalty, setRoyalty] = useState(6);
    const [adminNotes, setAdminNotes] = useState("");
    const [convertErr, setConvertErr] = useState("");

    const flash = (m) => {
        setNotice(m);
        window.clearTimeout(flash._t);
        flash._t = window.setTimeout(() => setNotice(""), 3000);
    };

    const load = async () => {
        setLoading(true);
        const [leadRes, reps, sales, partners] = await Promise.all([
            getLead(id),
            getReports(id),
            getSalesTeam(),
            getPartners(),
        ]);
        if (leadRes?.data) {
            setLead(leadRes.data);
            setStatus(leadRes.data.status || "new");
        } else {
            setError(leadRes?.message || "Lead not found");
        }
        setReports(Array.isArray(reps) ? reps : []);
        setSalesTeam(sales);
        setSalesById(Object.fromEntries(sales.map((s) => [s.id, s])));
        setPartnersById(Object.fromEntries(partners.map((p) => [p.id, p])));
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const partner = lead ? partnersById[lead.partner_id] : null;
    const salesMember = lead ? salesById[lead.assigned_to] : null;
    const salesName = salesMember?.name || null;

    const sourceLabel = useMemo(() => {
        if (partner) return `${partner.name} (${partner.partner_type || "Partner"})`;
        return lead?.source || "—";
    }, [partner, lead]);

    const setLeadStatusDirect = async (newStatus, label) => {
        setBusy(true);
        const res = await updateLead(id, { status: newStatus });
        setBusy(false);
        if (res?.error) return flash(res.error.message || "Failed");
        flash(label);
        load();
    };

    const openConvert = () => {
        setDealAmount(lead?.value ? String(lead.value) : "");
        setRoyalty(partner?.royalty_percent ?? 6);
        setAdminNotes("");
        setConvertErr("");
        setConvertOpen(true);
    };

    const approveConversion = async () => {
        if (!dealAmount) return setConvertErr("Enter the final deal amount");
        if (royalty === "" || royalty === null) return setConvertErr("Enter the royalty percentage");

        setBusy(true);
        const amount = Number(dealAmount);
        const royaltyAmt = Math.round((amount * Number(royalty)) / 100);
        const commissionAmt = commissionAmount(amount, salesMember);
        const commPct = commissionPct(salesMember);
        const approver = profile?.name || "Admin";

        const res = await updateLead(id, {
            status: "converted",
            value: amount,
            royalty_percent: Number(royalty),
        });
        if (res?.error) {
            setBusy(false);
            return setConvertErr(res.error.message || "Conversion failed");
        }
        // Log it on the timeline (best-effort — needs the lead_reports table).
        await addReport(id, {
            status: "converted",
            note: `✅ Conversion approved by ${approver}. Deal: ${inr(amount)}. Partner Royalty: ${royalty}% = ${inr(royaltyAmt)}. Sales Commission: ${commPct}% = ${inr(commissionAmt)}${salesName ? ` (${salesName})` : ""}.${adminNotes ? " " + adminNotes : ""}`,
        }).catch(() => {});
        setBusy(false);
        setConvertOpen(false);
        load(); // stay on the page and show conversion details
    };

    const reassign = async (salesId) => {
        if (!salesId) return;
        setBusy(true);
        await assignLead(id, salesId);
        setBusy(false);
        setReassigning(false);
        flash("Sales assignment updated");
        load();
    };

    const sendWhatsApp = () => {
        const num = (lead?.whatsapp || lead?.phone || "").replace(/\D/g, "");
        if (!num) return flash("No phone / WhatsApp number on this lead");
        const msg =
            `Hi ${lead.name || "there"}, thank you for your interest with XPOD.` +
            (salesName ? ` Your dedicated executive ${salesName} will be assisting you.` : "");
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
    };

    const submitReport = async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await addReport(id, { note, status, next_followup: followup || null });
        setBusy(false);
        if (!res?.data) return flash(res?.message || "Could not add report");
        setNote("");
        setFollowup("");
        flash("Report added");
        load();
    };

    const downloadPdf = () => {
        const w = window.open("", "_blank");
        if (!w) return;
        const rows = reports
            .map(
                (r) =>
                    `<div style="border-bottom:1px solid #eee;padding:8px 0">
                        <b>${(r.status || "").replace(/_/g, " ")}</b> — ${r.author_name || ""}
                        <div>${r.note || ""}</div>
                        <small style="color:#888">${fmtDate(r.created_at)}${r.next_followup ? " · next: " + r.next_followup : ""}</small>
                    </div>`
            )
            .join("");
        w.document.write(`
            <h2>Lead Report — ${lead?.name || ""}</h2>
            <p>Phone: ${lead?.phone || "—"} · Location: ${lead?.location || "—"}</p>
            <p>Source: ${sourceLabel} · Status: ${(lead?.status || "").replace(/_/g, " ")}</p>
            <h3>Activity Timeline</h3>
            ${rows || "<p>No reports yet.</p>"}
        `);
        w.document.close();
        w.print();
    };

    if (loading)
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <div className="mx-auto max-w-2xl px-4 py-10 text-center text-gray-500">Loading…</div>
            </div>
        );
    if (error)
        return (
            <div className="min-h-screen bg-[#f8fafc]">
                <div className="mx-auto max-w-2xl px-4 py-8">
                    <div className="rounded-2xl bg-red-50 px-4 py-6 text-center text-red-600">{error}</div>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                <ArrowLeft size={16} /> Back
            </button>

            {notice && (
                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{notice}</div>
            )}

            {/* Lead card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                        <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[lead.status] || "bg-gray-100 text-gray-500"}`}>
                            {(lead.status || "").replace(/_/g, " ")}
                        </span>
                    </div>
                    {lead.value > 0 && (
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-gray-400">Deal Amount</p>
                            <p className="text-lg font-bold text-green-700">{inr(lead.value)}</p>
                            {partner?.partner_type && (
                                <p className="text-xs font-medium text-blue-600">{partner.partner_type}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-3 space-y-1.5">
                    <Row icon={Phone}>{lead.phone}</Row>
                    <Row icon={MessageCircle} tone="text-green-600">{lead.whatsapp}</Row>
                    <Row icon={MapPin}>{lead.location}</Row>
                    {partner && <Row icon={User}>Partner: {partner.name}</Row>}
                    <Row icon={Clock}>{fmtDate(lead.created_at)}</Row>
                </div>
                <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
                    <p className="text-gray-400">
                        SOURCE:{" "}
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                            {sourceLabel}
                        </span>
                    </p>
                    {lead.designation && (
                        <p className="mt-1 text-gray-500">
                            Designation: <span className="font-medium text-gray-800">{lead.designation}</span>
                        </p>
                    )}
                    {lead.notes && (
                        <div className="mt-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</p>
                            <p className="text-gray-700">{lead.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* WhatsApp welcome */}
            {(lead.phone || lead.whatsapp) && lead.status !== "converted" && lead.status !== "failed" && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <MessageCircle size={18} />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">WhatsApp Welcome Message Ready</p>
                            <p className="text-xs text-gray-500">
                                {salesName ? `Assigned to ${salesName}` : "Not yet claimed"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={sendWhatsApp}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        <MessageCircle size={15} /> Send WhatsApp
                    </button>
                </div>
            )}

            {/* Conversion details (shown once converted) */}
            {lead.status === "converted" && (() => {
                const pct = lead.royalty_percent ?? partner?.royalty_percent ?? 0;
                const royaltyAmt = Math.round((Number(lead.value || 0) * Number(pct)) / 100);
                const approvedBy =
                    reports.find((r) => /conversion approved/i.test(r.note || ""))?.author_name ||
                    profile?.name ||
                    "Admin";
                const detailRow = (label, value, valueClass = "font-medium text-gray-900") => (
                    <div className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className={valueClass}>{value}</span>
                    </div>
                );
                return (
                    <div className="rounded-2xl border border-green-200 bg-green-50/60 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                            Conversion Details
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                            {detailRow("Final Deal Amount", inr(lead.value))}
                            {detailRow("Partner Type", partner?.partner_type || "—", "font-medium text-blue-600")}
                            {detailRow("Royalty %", `${pct}%`)}
                            {detailRow("Royalty Amount", inr(royaltyAmt), "font-medium text-green-700")}
                            {detailRow("Approved By", approvedBy)}
                        </div>
                    </div>
                );
            })()}

            {/* Sales assignment */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-gray-400">Sales Assignment</p>
                    {canReassign && (
                        <button onClick={() => setReassigning((v) => !v)} className="text-sm font-medium text-orange-600 hover:underline">
                            Change
                        </button>
                    )}
                </div>
                {canReassign && reassigning ? (
                    <select
                        defaultValue={lead.assigned_to || ""}
                        onChange={(e) => reassign(e.target.value)}
                        disabled={busy}
                        className="mt-2 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-orange-400"
                    >
                        <option value="" disabled>Select sales person</option>
                        {salesTeam.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                ) : (
                    <p className="mt-1 text-sm text-gray-500">
                        {salesName ? `Assigned to ${salesName}` : "Not yet claimed — in pool"}
                    </p>
                )}
            </div>

            {/* Convert / Fail */}
            <div className="flex gap-3">
                <button
                    onClick={openConvert}
                    disabled={busy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                    <CircleCheckBig size={16} /> Convert Lead
                </button>
                <button
                    onClick={() => setLeadStatusDirect("failed", "Lead marked failed")}
                    disabled={busy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                    <XCircle size={16} /> Mark Failed
                </button>
            </div>

            {/* Add report */}
            <form onSubmit={submitReport} className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                <h3 className="font-semibold text-gray-900">Add Report</h3>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="What happened? (e.g. called, interested, follow-up needed...)"
                    className="mt-3 w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-orange-400"
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="mb-1 block text-xs text-gray-500">Update Status</span>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-orange-400"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1 block text-xs text-gray-500">Next Follow-up</span>
                        <input
                            type="date"
                            value={followup}
                            onChange={(e) => setFollowup(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-orange-400"
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={busy}
                    className="mt-3 w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                >
                    Add Report
                </button>
            </form>

            {/* Activity timeline */}
            <div>
                <h3 className="mb-2 font-semibold text-gray-900">Activity Timeline</h3>
                {reports.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">No reports yet. Add the first report above.</p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((r) => (
                            <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            {(r.author_name || "?").charAt(0).toUpperCase()}
                                        </span>
                                        {r.author_name || "—"}
                                    </span>
                                    {r.status && (
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-500"}`}>
                                            {r.status.replace(/_/g, " ")}
                                        </span>
                                    )}
                                </div>
                                {r.note && <p className="mt-2 text-sm text-gray-600">{r.note}</p>}
                                <p className="mt-1 text-xs text-gray-400">
                                    {fmtDate(r.created_at)}
                                    {r.next_followup ? ` · next follow-up: ${r.next_followup}` : ""}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF */}
            <div className="space-y-2">
                <button
                    onClick={downloadPdf}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-black"
                >
                    <FileText size={16} /> Follow-up Report
                </button>
                <button onClick={downloadPdf} className="mx-auto block text-xs text-orange-600 hover:underline">
                    Download all lead reports as PDF
                </button>
            </div>

            {/* Approve Conversion modal */}
            <Modal open={convertOpen} onClose={() => setConvertOpen(false)} title="Approve Conversion" size="md">
                <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                        Finalize the deal amount and royalty to convert this lead.
                    </p>

                    <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Partner</span>
                            <span className="font-medium text-gray-900">{partner?.name || "—"}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-gray-500">Partner Type</span>
                            <span className="font-medium text-blue-600">{partner?.partner_type || "—"}</span>
                        </div>
                    </div>

                    {convertErr && (
                        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{convertErr}</div>
                    )}

                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Final Deal Amount *
                        </span>
                        <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-orange-400">
                            <span className="text-gray-400">₹</span>
                            <input
                                type="number"
                                value={dealAmount}
                                onChange={(e) => setDealAmount(e.target.value)}
                                placeholder="Enter deal amount"
                                className="w-full px-2 py-2.5 text-sm outline-none"
                            />
                        </div>
                    </label>

                    <div>
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Royalty Percentage *
                        </span>
                        <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:border-orange-400">
                            <input
                                type="number"
                                value={royalty}
                                onChange={(e) => setRoyalty(e.target.value)}
                                className="w-full px-1 py-2.5 text-sm outline-none"
                            />
                            <span className="text-gray-400">%</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                            {ROYALTY_CHIPS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setRoyalty(c)}
                                    className={`rounded-lg px-3 py-1 text-xs font-medium ${
                                        Number(royalty) === c
                                            ? "bg-orange-600 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                                    }`}
                                >
                                    {c}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto sales commission */}
                    <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Auto Sales Commission
                        </p>
                        <div className="mt-1 flex justify-between">
                            <span className="text-gray-500">Sales Person</span>
                            <span className="font-medium text-gray-900">{salesName || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Commission Rate</span>
                            <span className="font-medium text-blue-600">{commissionPct(salesMember)}%</span>
                        </div>
                        {dealAmount && (
                            <div className="mt-1 flex justify-between border-t border-blue-100 pt-1">
                                <span className="text-gray-500">Commission Amount</span>
                                <span className="font-medium text-gray-900">
                                    {inr(commissionAmount(dealAmount, salesMember))}
                                </span>
                            </div>
                        )}
                    </div>

                    <label className="block">
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Admin Notes (optional)
                        </span>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={2}
                            placeholder="Any notes..."
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-orange-400"
                        />
                    </label>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setConvertOpen(false)}
                            disabled={busy}
                            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={approveConversion}
                            disabled={busy}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                        >
                            <CircleCheckBig size={15} /> Approve
                        </button>
                    </div>
                </div>
            </Modal>
            </div>
        </div>
    );
};

export default LeadDetail;
