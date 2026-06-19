import Leads from './Leads';
import AddLeadModal from './AddLeadModel';

// Leads list + add/edit modal both read from LeadContext now — no prop drilling.
const LeadData = () => {
    return (
        <div>
            <Leads />
            <AddLeadModal />
        </div>
    )
}

export default LeadData
