import { createContext, useContext, useEffect, useState } from "react";
import { getLeads, createLead, updateLead, addReport } from "../services/LeadServices.js";
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
  customDesignation: "",
  leadSource: "",
  language: "",
  units: "",
  model: "",
  requirement: "",
  notes: "",
};

// Designation values offered by the select; anything else is a custom entry.
export const KNOWN_DESIGNATIONS = [
  "",
  "VIP",
  "Architects",
  "Resort Owners",
  "celebrity & influencers",
  "others",
];
const isOtherDesignation = (d) => ["others", "Others", "Other"].includes(d);

// Maps the camelCase form onto the real `leads` columns
// (leadSource -> source; whatsapp has its own column).
const toPayload = (form) => {
  // A custom "Others" designation is stored as the typed value.
  const designation =
    isOtherDesignation(form.designation) && form.customDesignation?.trim()
      ? form.customDesignation.trim()
      : form.designation;

  return {
    name: form.name,
    phone: form.phone,
    whatsapp: form.whatsapp,
    email: form.email,
    location: form.location,
    state: form.state,
    urgency: form.urgency,
    designation,
    language: form.language,
    units: form.units,
    model: form.model,
    requirement: form.requirement,
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
    // A stored designation that isn't one of the presets is a custom "Others".
    const isCustom =
      lead.designation && !KNOWN_DESIGNATIONS.includes(lead.designation);
    setForm({
      ...EMPTY_FORM,
      ...lead,
      leadSource: lead.source ?? lead.leadSource ?? "",
      whatsapp: lead.whatsapp ?? "",
      requirement: lead.requirement ?? "",
      designation: isCustom ? "others" : lead.designation ?? "",
      customDesignation: isCustom ? lead.designation : "",
    });
    setEditing(lead);
    setFormOpen(true);
  };

  const saveLead = async (extra = {}) => {
    const payload = { ...toPayload(form), ...extra };
    const isEditing = Boolean(editing && editing.id);

    // Reviewing a partner-submitted lead: saving it promotes pending → new,
    // which moves it out of "Pending Review" and into the claimable Lead Pool.
    const reviewingPending = isEditing && editing.status === "pending";
    if (reviewingPending) {
      payload.status = "new";
    }

    const res = isEditing
      ? await updateLead(editing.id, payload)
      : await createLead(payload);

    if (res?.message && !res?.data) {
      return { error: { message: res.message } };
    }

    // Timeline entry when a lead manager approves a pending lead into the pool.
    if (reviewingPending) {
      await addReport(editing.id, {
        status: "new",
        note: "Reviewed by Lead Manager — moved to the Lead Pool.",
      }).catch(() => {});
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
