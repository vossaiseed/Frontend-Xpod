import { createContext, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useLeadDashboardData } from "../hooks/useLeadDashboardData.js";

/**
 * Lead-manager dashboard stats. Wraps the existing useLeadDashboardData hook
 * (same GET /api/dashboard call) and exposes a refresh() so other contexts can
 * trigger a re-fetch without prop-drilling refreshDashboard/fetchLeads.
 */
const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  const data = useLeadDashboardData(id ?? null, refreshKey);

  return (
    <DashboardContext.Provider value={{ ...data, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

const EMPTY = {
  stats: {},
  pipeline: {},
  recentActivity: [],
  inactiveLeads: [],
  salesStaff: [],
  loading: false,
  refresh: () => {},
};

export const useDashboard = () => useContext(DashboardContext) ?? EMPTY;
