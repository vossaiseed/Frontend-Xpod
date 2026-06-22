import LeadBoard from "../../components/admin/LeadBoard";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "discussion", label: "Discussion" },
    { key: "converted", label: "Converted" },
    { key: "not_interested", label: "Not-Interested" },
];

// General leads = leads added by a lead manager (lead_manager_id IS NOT NULL).
const GeneralLeads = () => (
    <LeadBoard
        title="General Leads"
        subtitle="Leads added by lead managers."
        query="?managed=true"
        filters={FILTERS}
        emptyText="No manager-added leads yet."
    />
);

export default GeneralLeads;
