import { useOutletContext } from "react-router-dom";
import SalesLeadList from "../../components/sales/SalesLeadList.jsx";

// Leads this salesman has sent for conversion approval (read-only here).
const SalesConversionRequests = () => {
    const { data } = useOutletContext();
    const leads = (data?.leads || []).filter(
        (l) => l.status === "conversion_requested"
    );
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500">
                Leads awaiting admin conversion approval.
            </p>
            <SalesLeadList
                leads={leads}
                actions={false}
                emptyText="No pending conversion requests."
            />
        </div>
    );
};

export default SalesConversionRequests;
