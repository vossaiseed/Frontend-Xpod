import { Edit } from "lucide-react";
import { useLeads } from "../../context/LeadContext.jsx";

const Leads = () => {
    const { leads = [], search, setSearch, openEdit } = useLeads();

    const filteredLeads = leads.filter((lead) => {
        const value = search.toLowerCase();

        return (
            (lead.name || "").toLowerCase().includes(value) ||
            (lead.phone || "").includes(value) ||
            (lead.source || "").toLowerCase().includes(value) ||
            (lead.status || "").toLowerCase().includes(value)
        );
    });

    const handleEdit = (lead) => openEdit(lead);

    return (
        <div className="space-y-6">

            {/* Tabs */}
            <div className="flex gap-2">
                <button className="rounded-xl bg-[#d97706] px-4 py-2 text-white">
                    All Leads ({filteredLeads.length})
                </button>

                <button className="rounded-xl border px-4 py-2">
                    Pending Review (
                    {leads.filter(
                        (lead) => lead.status === "pending_review"
                    ).length}
                    )
                </button>
            </div>

            {/* Search */}
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, source..."
                className="w-full rounded-xl border p-3 outline-none"
            />

            <p className="text-sm text-gray-500">
                {filteredLeads.length} leads
            </p>

            {/* Lead Cards */}
            <div className="space-y-4">
                {filteredLeads.map((lead) => (
                    <div
                        key={lead.id}
                        className="rounded-2xl border bg-white p-4 shadow-sm"
                    >
                        <div className="flex justify-between">

                            <div>

                                <div className="mb-2 flex gap-2">

                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                                        {lead.status || "new"}
                                    </span>

                                    {lead.is_vip && (
                                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-600">
                                            VIP
                                        </span>
                                    )}

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                                        {lead.source || "Direct"}
                                    </span>

                                </div>

                                <h3 className="font-semibold text-lg">
                                    {lead.name}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {lead.phone}
                                </p>

                                <p className="text-sm text-gray-400">
                                    {new Date(
                                        lead.created_at
                                    ).toLocaleDateString()}
                                </p>

                            </div>

                            <button
                                onClick={() => handleEdit(lead)}
                                className="h-fit rounded-lg border p-2 hover:bg-gray-100"
                            >
                                <Edit size={18} />
                            </button>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Leads;