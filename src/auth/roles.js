// Central definition of the roles the single login can resolve to,
// and where each role lands after authenticating.
//
// Canonical role set (must match the profiles.role check constraint in
// supabase/schema.sql): admin | salesman | lead_manager | partner
export const ROLES = {
  ADMIN: "admin",
  SALESMAN: "salesman",
  LEAD_MANAGER: "leadmanager",
  PARTNER: "partner",
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: "/AdminCRM",
  [ROLES.SALESMAN]: "/SalesmanDashboard",
  [ROLES.LEAD_MANAGER]: "/LeadManagerDashboard",
  [ROLES.PARTNER]: "/PartnerDashboard",
};

export const DEFAULT_HOME = "/login";

export const homeForRole = (role) => ROLE_HOME[role] ?? DEFAULT_HOME;