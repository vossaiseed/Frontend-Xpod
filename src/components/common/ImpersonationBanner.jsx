import { ArrowLeft, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_LABEL = {
  partner: "Partner",
  salesman: "Sales",
  leadmanager: "Lead Manager",
};

const ImpersonationBanner = () => {
  const { impersonation, stopImpersonate } = useAuth();

  if (!impersonation) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-center bg-purple-700 px-4 py-1 text-sm font-semibold text-white">
      <div className="flex items-center gap-2">
        <Eye size={16} />
        <span>
          Admin View: {ROLE_LABEL[impersonation.role] || "User"} Dashboard
          {impersonation.name && ` — ${impersonation.name}`}
        </span>
      </div>

      {/* Uncomment if you want the Back button on the right */}
      {/*
      <button
        onClick={stopImpersonate}
        className="absolute right-4 flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1 hover:bg-white/30"
      >
        <ArrowLeft size={15} />
        Back to Admin CRM
      </button>
      */}
    </div>
  );
};

export default ImpersonationBanner;