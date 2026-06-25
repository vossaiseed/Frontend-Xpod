import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import { LeadProvider } from "./context/LeadContext.jsx";


// Route pages are code-split so each role only downloads the JS it uses, and
// landing/login visitors don't pull the whole CRM. lazy() only defers the chunk
// load — routing, auth guards, and impersonation are unchanged.
const Home = lazy(() => import("./components/Home.jsx"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const Partners = lazy(() => import("./pages/admin/Partners.jsx"));
const LeadManager = lazy(() => import("./pages/admin/LeadManager.jsx"));
const SalesMan = lazy(() => import("./pages/admin/SalesMan.jsx"));
const LeadManagerDashboard = lazy(() => import("./pages/LeadManager/LeadManagerDashboard.jsx"));
const LeadManagerLayout = lazy(() => import("./layouts/LeadManagerLayout.jsx"));
const SalesTeam = lazy(() => import("./pages/LeadManager/SalesTeam.jsx"));
const Alerts = lazy(() => import("./pages/LeadManager/Alerts.jsx"));
const LeadData = lazy(() => import("./pages/LeadManager/LeadData.jsx"));
const PendingReview = lazy(() => import("./pages/admin/PendingReview.jsx"));
const AssignedLeads = lazy(() => import("./pages/admin/AssignedLeads.jsx"));
const ConversionRequests = lazy(() => import("./pages/admin/ConversionRequests.jsx"));
const GeneralLeads = lazy(() => import("./pages/admin/GeneralLeads.jsx"));
const Trash = lazy(() => import("./pages/admin/Trash.jsx"));
const Setting = lazy(() => import("./pages/admin/Setting.jsx"));
const LeadPool = lazy(() => import("./pages/admin/LeadPool.jsx"));
const LeadDetail = lazy(() => import("./pages/admin/LeadDetail.jsx"));
const SalesLayout = lazy(() => import("./layouts/SalesLayout.jsx"));
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard.jsx"));
const SalesAssignedLeads = lazy(() => import("./pages/sales/SalesAssignedLeads.jsx"));
const SalesFollowups = lazy(() => import("./pages/sales/SalesFollowups.jsx"));
const SalesConversionRequests = lazy(() => import("./pages/sales/SalesConversionRequests.jsx"));
const SalesEarnings = lazy(() => import("./pages/sales/SalesEarnings.jsx"));
const SalesMilestones = lazy(() => import("./pages/sales/SalesMilestones.jsx"));
const SalesLeadPool = lazy(() => import("./pages/sales/SalesLeadPool.jsx"));
const PartnerDashboard = lazy(() => import("./pages/partner/PartnerDashboard.jsx"));
const GalleryManagement = lazy(() => import("./pages/admin/GalleryManagement.jsx"));
const ProductSettings = lazy(() => import("./pages/admin/ProductSettings.jsx"));



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

// Shown briefly while a route's code chunk loads.
const PageFallback = () => (
  <div className="grid min-h-screen place-items-center bg-[#f8fafc]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageFallback />}>
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
          <Route path="pending-review" element={<PendingReview />} />
          <Route path="assigned-leads" element={<AssignedLeads />} />
          <Route path="conversion-requests" element={<ConversionRequests />} />
          <Route path="partners" element={<Partners />} />
          <Route path="lead-managers" element={<LeadManager />} />
          <Route path="sales-team" element={<SalesMan />} />
          <Route path="general-leads" element={<GeneralLeads />} />
          <Route path="gallery-management" element={<GalleryManagement />} />
          <Route path="product-settings" element={<ProductSettings />} / >
        <Route path="trash" element={<Trash />} />
        <Route path="settings" element={<Setting />} />
      </Route>

        {/* Lead detail & pool — standalone full pages (no dashboard sidebar) */}
        <Route
          path="/AdminCRM/lead/:id"
          element={
            <ProtectedRoute allow={["admin"]}>
              <LeadDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminCRM/lead-pool"
          element={
            <ProtectedRoute allow={["admin"]}>
              <LeadPool />
            </ProtectedRoute>
          }
        />




        {/* Role dashboards (stubs for now, role-guarded) */}
        <Route
          path="/SalesmanDashboard"
          element={
            <ProtectedRoute allow={["salesman"]}>
              <SalesLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SalesDashboard />} />
          <Route path="assigned" element={<SalesAssignedLeads />} />
          <Route path="follow-ups" element={<SalesFollowups />} />
          <Route path="conversion-requests" element={<SalesConversionRequests />} />
          <Route path="earnings" element={<SalesEarnings />} />
          <Route path="milestones" element={<SalesMilestones />} />
          <Route path="lead-pool" element={<SalesLeadPool />} />
        </Route>

        {/* Lead detail — standalone full page (no dashboard sidebar) */}
        <Route
          path="/SalesmanDashboard/lead/:id"
          element={
            <ProtectedRoute allow={["salesman"]}>
              <LeadDetail />
            </ProtectedRoute>
          }
        />
        {/* Separate Lead Manager Dashboard for Admin */}
        <Route
          path="/LeadManagerDashboard"
          element={
            <ProtectedRoute allow={["leadmanager"]}>
              <DashboardProvider>
                <LeadProvider>
                  <LeadManagerLayout />
                </LeadProvider>
              </DashboardProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<LeadManagerDashboard />} />

          <Route path="leads" element={<LeadData />} />

          <Route path="sales-team" element={<SalesTeam />} />

          <Route path="alerts" element={<Alerts />} />

          {/* <Route path="add-lead" element={<AddLead />} /> */}

        </Route>

        {/* Lead Manager — standalone lead detail */}
        <Route
          path="/LeadManagerDashboard/lead/:id"
          element={
            <ProtectedRoute allow={["leadmanager"]}>
              <LeadDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/PartnerDashboard"
          element={
            <ProtectedRoute allow={["partner"]}>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/PartnerLead/:id"
          element={
            <ProtectedRoute allow={["partner"]}>
              <LeadDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
};

export default App;
