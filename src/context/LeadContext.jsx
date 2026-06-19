import { createContext, useContext, useEffect, useState } from "react";
import { getLeads, createLead, updateLead } from "../services/LeadServices.js";
import { useDashboard } from "./DashboardContext.jsx";

/**
 * Owns the leads list + the add/edit form modal state, replacing the duplicated
 * blocks in LeadData and LeadManagerDashboard and the 6/7-prop drills into
 * Leads and AddLeadModal. Backend calls (getLeads/createLead/updateLead) are
 * unchanged.
 */
const EMPTY_FORM = {
  phone: "",
  name: "",
  location: "",
  state: "",
  whatsapp: "",
  email: "",
  urgency: "",
  designation: "",
  leadSource: "",
  language: "",
  units: "",
  model: "",
  notes: "",
};

// Maps the camelCase form onto the real `leads` columns
// (leadSource -> source; whatsapp has its own column).
const toPayload = (form) => {
  return {
    name: form.name,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    location: form.location,
    state: form.state,
    urgency: form.urgency,
    designation: form.designation,
    language: form.language,
    units: form.units,
    model: form.model,
    notes: form.notes,
    source: form.source ?? form.leadSource ?? "",
    // A "VIP" designation flags the lead so the VIP badge shows.
    is_vip: form.designation === "VIP",
  };
};

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const { refresh } = useDashboard();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await getLeads();
      setLeads(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  // Open the modal in "create" mode with a clean form.
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormOpen(true);
  };

  // Open in "edit" mode, mapping DB columns onto the form fields
  // (source -> leadSource so the Lead Source select is pre-filled).
  const openEdit = (lead) => {
    setForm({
      ...EMPTY_FORM,
      ...lead,
      leadSource: lead.source ?? lead.leadSource ?? "",
      whatsapp: lead.whatsapp ?? "",
    });
    setEditing(lead);
    setFormOpen(true);
  };

  const saveLead = async (extra = {}) => {
    const payload = { ...toPayload(form), ...extra };
    const isEditing = Boolean(editing && editing.id);

    const res = isEditing
      ? await updateLead(editing.id, payload)
      : await createLead(payload);

    if (res?.message && !res?.data) {
      return { error: { message: res.message } };
    }

    await fetchLeads();
    refresh();
    closeForm();
    return {};
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        loading,
        form,
        setForm,
        editing,
        setEditing,
        formOpen,
        setFormOpen,
        search,
        setSearch,
        fetchLeads,
        openCreate,
        openEdit,
        closeForm,
        saveLead,
        EMPTY_FORM,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

// Tolerant default so a <Leads/> rendered without a provider (the bare
// /AdminLeadManager/:id/leads route) renders empty instead of crashing.
const DEFAULT = {
  leads: [],
  loading: false,
  form: EMPTY_FORM,
  setForm: () => {},
  editing: "",
  setEditing: () => {},
  formOpen: false,
  setFormOpen: () => {},
  search: "",
  setSearch: () => {},
  fetchLeads: async () => {},
  openCreate: () => {},
  openEdit: () => {},
  closeForm: () => {},
  saveLead: async () => ({}),
  EMPTY_FORM,
};

export const useLeads = () => useContext(LeadContext) ?? DEFAULT;
