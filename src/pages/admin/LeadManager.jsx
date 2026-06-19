import { useMemo, useState } from "react";
import { Eye, EyeOff, LocateIcon, Lock, Pencil, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCrud } from "../../hooks/useCrud.js";
import { createResource } from "../../api/resource.js";
import Modal from "../../components/admin/Modal.jsx";
import FormField from "../../components/admin/FormField.jsx";
import ConfirmDialog from "../../components/admin/ConfirmDialog.jsx";
import PhotoUpload from "../../components/admin/PhotoUpload.jsx";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  location: "",
  state: "",
  password: "",
  photo_url: "",
};

const ActionButton = ({ icon: Icon, label, onClick, tone = "gray", disabled }) => {
  const tones = {
    gray: "border-gray-200 text-gray-600 hover:bg-gray-50",
    blue: "border-blue-200 text-blue-600 hover:bg-blue-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
};

const LeadManagerCard = ({ manager, onEdit, onView, onOpen, onResetPwd, onDelete }) => {
  const photo = manager.photo_url || manager.avatar_url;
  const initial = (manager.name?.charAt(0) || "?").toUpperCase();
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {photo ? (
            <img src={photo} alt={manager.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <button
              onClick={() => onOpen(manager)}
              className="truncate text-left text-lg font-semibold text-gray-900 hover:text-teal-700"
            >
              {manager.name}
            </button>
            {manager.phone && <p className="text-sm text-gray-600">{manager.phone}</p>}
            {manager.email && <p className="truncate text-sm text-gray-500">{manager.email}</p>}
            {(manager.location || manager.state) && (
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <LocateIcon size={14} />
                <span className="truncate">
                  {[manager.location, manager.state].filter(Boolean).join(", ")}
                </span>
              </p>
            )}
            <span className="mt-1 inline-block rounded-2xl bg-[#ccfbf1] px-2 py-1 text-xs text-[#0f746c]">
              Lead Manager
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:w-28">
          <ActionButton icon={Pencil} label="Edit" tone="gray" onClick={() => onEdit(manager)} />
          <ActionButton icon={Eye} label="View" tone="blue" onClick={() => onView(manager)} />
          <ActionButton icon={Lock} label="Reset Pwd" tone="blue" onClick={() => onResetPwd(manager)} />
          <ActionButton icon={Trash2} label="Delete" tone="red" onClick={() => onDelete(manager)} />
        </div>
      </div>

      {/* Password reveal */}
      <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <span>Pwd:</span>
        <span className="tracking-widest">
          {showPwd ? manager.temp_password || "Not set" : "••••••"}
        </span>
        <button
          type="button"
          onClick={() => setShowPwd((s) => !s)}
          className="text-gray-400 hover:text-gray-600"
          aria-label={showPwd ? "Hide password" : "Show password"}
        >
          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};

const LeadManager = () => {
  const resource = useMemo(() => createResource("lead-managers"), []);
  const { rows, loading, error, create, update, remove, action } = useCrud(resource);
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); 
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [viewing, setViewing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");

  const flash = (msg) => {
    setNotice(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setNotice(""), 3000);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      location: row.location ?? "",
      state: row.state ?? "",
      password: "",
      photo_url: row.photo_url ?? "",
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      // Don't send an empty password on edit.
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      const res = editing
        ? await update(editing.id, payload)
        : await create(payload);

      if (res?.error) {
        setFormError(res.error.message || "Something went wrong");
        return;
      }
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await remove(toDelete.id);
    setDeleting(false);
    if (!res?.error) setToDelete(null);
    else flash(res.error.message);
  };

  const handleResetPwd = async (manager) => {
    const password = window.prompt(
      `Set a login password for ${manager.name} (they log in with phone ${manager.phone}):`
    );
    if (!password) return;
    const res = await action(manager.id, "reset-password", { password });
    flash(res?.error ? res.error.message : `Login enabled for ${manager.name}.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <UserPlus size={18} />
          Add Lead Manager
        </button>
      </div>

      {notice && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
          No lead managers yet. Add your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {rows.map((manager) => (
            <LeadManagerCard
              key={manager.id}
              manager={manager}
              onEdit={openEdit}
              onView={setViewing}
              onOpen={(m) => navigate(`/AdminLeadManager/${m.id}`)}
              onResetPwd={handleResetPwd}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size="lg"
        title={editing ? "Edit Lead Manager" : "Add Lead Manager"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone number" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="City / area" />
          </div>

          {editing ? (
            <FormField label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
              <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters" />
            </div>
          )}

          <PhotoUpload
            folder="lead-managers"
            value={form.photo_url}
            onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#0d9488] py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </Modal>

      {/* View modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Lead Manager Details">
        {viewing && (
          <dl className="space-y-3 text-sm">
            {[
              ["Name", viewing.name],
              ["Phone", viewing.phone],
              ["Email", viewing.email],
              ["Location", [viewing.location, viewing.state].filter(Boolean).join(", ")],
              ["Role", "Lead Manager"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete lead manager"
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
      />
    </div>
  );
};

export default LeadManager;
