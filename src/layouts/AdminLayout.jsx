import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";
import { useAuth } from "../context/AuthContext.jsx";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loadMe } = useAuth();

  const location = useLocation();

  const pageTitle = "Admin Dashboard";

  // Refresh the logged-in admin from the backend (same GET /api/auth/me).
  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-64">
        <Topbar
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
