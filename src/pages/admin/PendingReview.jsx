import { useEffect, useState } from "react";
import { CircleCheckBig, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLeads } from "../../services/LeadServices";

const PendingReview = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await getLeads("?status=pending");
      setLeads(data || []);
    } catch {
      setError("Failed to load pending leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Pending Review</h2>
        <p className="text-sm text-gray-500">
          New leads submitted by partners awaiting admin review.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="justify-items-center text-center my-30 text-[#dfe2e6]">
          <CircleCheckBig size={90} color="#dfe2e6" />
          No leads pending review
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => navigate(`/AdminCRM/lead/${lead.id}`)}
              className="rounded-2xl border border-orange-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                Pending Review
              </span>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{lead.name}</h3>
              {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}
              {(lead.created_by || lead.source) && (
                <p className="mt-1 text-sm text-gray-400">
                  By: {lead.created_by || lead.source}
                </p>
              )}
              {lead.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0 text-red-400" />
                  {lead.location}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingReview;
