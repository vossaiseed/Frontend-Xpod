import { Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Login from "./components/auth/Login.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Partners from "./pages/admin/Partners.jsx";
import LeadManager from "./pages/admin/LeadManager.jsx";
import SalesMan from "./pages/admin/SalesMan.jsx";
import LeadManagerDashboard from "./pages/LeadManager/LeadManagerDashboard.jsx";
import LeadManagerLayout from "./layouts/LeadManagerLayout.jsx";
import Overview from "./pages/LeadManager/Overview.jsx";
import Leads from "./pages/LeadManager/Leads.jsx";
import SalesTeam from "./pages/LeadManager/SalesTeam.jsx";
import Alerts from "./pages/LeadManager/Alerts.jsx";
import LeadData from "./pages/LeadManager/LeadData.jsx";
import PendingReview from "./pages/admin/PendingReview.jsx";
import AssignedLeads from "./pages/admin/AssignedLeads.jsx";
import ConversionRequests from "./pages/admin/ConversionRequests.jsx";
import GeneralLeads from "./pages/admin/GeneralLeads.jsx";
import PartnerDashboard from "./pages/partner/PartnerDashboard.jsx";

// Placeholder for admin sub-pages not built yet.
const EmptyPage = ({ title }) => <h1 className="text-2xl font-bold">{title}</h1>;

// Lightweight landing for non-admin roles until their dashboards are built.
const ComingSoon = ({ title }) => (
  <div className="grid min-h-screen place-items-center bg-[#f8fafc] px-4 text-center">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">This dashboard is coming soon.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Admin CRM — admin only */}
      <Route
        path="/AdminCRM"
        element={
          <ProtectedRoute allow={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<AdminDashboard />} />
        <Route path="pending-review" element={<PendingReview/>} />
        <Route path="assigned-leads" element={ <AssignedLeads/>} />
        <Route path="conversion-requests" element={<ConversionRequests/>} />
        <Route path="partners" element={<Partners />} />
        <Route path="lead-managers" element={<LeadManager />} />
        <Route path="sales-team" element={<SalesMan />} />
        <Route path="general-leads" element={<GeneralLeads/>} />
        <Route path="trash" element={<EmptyPage title="Trash" />} />
        <Route path="settings" element={<EmptyPage title="Settings" />} />
        <Route path="lead-pool" element={<EmptyPage title="Lead Pool" />} />
      </Route>




      {/* Role dashboards (stubs for now, role-guarded) */}
      <Route
        path="/SalesmanDashboard"
        element={
          <ProtectedRoute allow={["salesman"]}>
            <ComingSoon title="Salesman Dashboard" />
          </ProtectedRoute>
        }
      />
      {/* Separate Lead Manager Dashboard for Admin */}
      <Route
        path="/LeadManagerDashboard"
        element={
          <ProtectedRoute allow={["leadmanager"]}>
            <LeadManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LeadManagerDashboard />} />

        <Route path="leads" element={<LeadData />} />

        <Route path="sales-team" element={<SalesTeam />} />

        <Route path="alerts" element={<Alerts />} />

        {/* <Route path="add-lead" element={<AddLead />} /> */}

      </Route>

      <Route
        path="/AdminLeadManager/:id"
        element={
          <ProtectedRoute allow={["admin"]}>
            <LeadManagerLayout adminView />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />

        <Route path="leads" element={<Leads />} />

        <Route path="sales-team" element={<SalesTeam />} />

        <Route path="alerts" element={<Alerts />} />

        {/* <Route path="add-lead" element={<AddLead />} /> */}

      </Route>
      <Route
        path="/PartnerDashboard"
        element={
          <ProtectedRoute allow={["partner"]}>
            <PartnerDashboard/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
