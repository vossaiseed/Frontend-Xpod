import { useNavigate } from "react-router-dom";
import LeadBoard from "../../components/admin/LeadBoard";

const FILTERS = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "in_progress", label: "In Progress" },
    { key: "converted", label: "Converted" },
    { key: "failed", label: "Failed" },
];

 
const AssignedLeads = () => (
    <LeadBoard
        title="Assigned Leads"
        subtitle="All leads in the system."
        query=""
        filters={FILTERS}
        emptyText="No leads yet."
        
    />
);

export default AssignedLeads;
