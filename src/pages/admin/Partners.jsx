import { useMemo, useState } from "react";
import { Plus, Pencil, Eye, EyeOff, Star, Power, KeyRound, Trash2, MapPin, Mail, Phone, Building2, Upload, Image as ImageIcon, } from "lucide-react";

import { createResource } from "../../api/resource.js";
import { useCrud } from "../../hooks/useCrud.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../../components/admin/Modal.jsx";
import ArchiveTrashDialog from "../../components/admin/ArchiveTrashDialog.jsx";
import FormField from "../../components/admin/FormField.jsx";
import PhotoUpload from "../../components/admin/PhotoUpload.jsx";

/* ── helpers ──────────────────────────────────────────────────────────── */

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;


// Partner-type badge colours. Reads partner.partner_type, defaults to Authorized.
const TYPE_STYLES = {
  "Authorized Partner": "bg-amber-50 text-amber-700 border border-amber-200",
  "Exclusive Partner": "bg-purple-50 text-purple-700 border border-purple-200",
  Architect: "bg-blue-50 text-blue-700 border border-blue-200",
};

const PARTNER_TYPES = [
  { value: "Authorized Partner", label: "Authorized Partner" },
  { value: "Exclusive Partner", label: "Exclusive Partner" },
  { value: "Architect", label: "Architect" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  location: "",
  state: "",
  password: "",
  company: "",
  partner_type: "Authorized Partner",
  photo_url: "",
};

const PHOTO_BUCKET = "partner-photos";
// Upload a file to Supabase Storage and return its public URL.
// const uploadPhoto = async (file) => {
//   if (!file) return "";

//   const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
//   const fileName = `${Date.now()}-${Math.random()
//     .toString(36)
//     .substring(2)}.${ext}`;

//   const filePath = `partners/${fileName}`;

//   const { data, error } = await supabase.storage
//     .from(PHOTO_BUCKET)
//     .upload(filePath, file, {
//       cacheControl: "3600",
//       upsert: false,
//       contentType: file.type,
//     });

//   console.log("UPLOAD DATA:", data);
//   console.log("UPLOAD ERROR:", error);

//   if (error) throw error;

//   const { data: urlData } = supabase.storage
//     .from(PHOTO_BUCKET)
//     .getPublicUrl(filePath);

//   return urlData.publicUrl;
// };

/* ── small UI pieces ──────────────────────────────────────────────────── */

const ActionButton = ({ icon: Icon, label, onClick, tone = "gray", disabled, className = "" }) => {
  const tones = {
    gray: "border-gray-200 text-gray-600 hover:bg-gray-50",
    blue: "border-blue-200 text-blue-600 hover:bg-blue-50",
    amber: "border-amber-200 text-amber-700 hover:bg-amber-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
    green: "border-green-200 text-green-600 hover:bg-green-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
};

const PartnerCard = ({
  partner,
  busy,
  onEdit,
  onView,
  onUpgrade,
  onToggleStatus,
  onResetPwd,
  onDelete,
}) => {
  const [showPwd, setShowPwd] = useState(false);

  const isActive = partner.status !== "inactive";
  const type = partner.partner_type || "Authorized Partner";
  const typeClass = TYPE_STYLES[type] || TYPE_STYLES["Authorized Partner"];
  const photo = partner.photo_url || partner.avatar_url;
  const initial = (partner.name?.charAt(0) || "?").toUpperCase();

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex gap-4">
        {photo ? (
          <img
            src={photo}
            alt={partner.name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-700">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-gray-900">{partner.name}</h3>

          {partner.phone && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
              <Phone size={13} className="shrink-0" />
              {partner.phone}
            </p>
          )}
          {partner.email && (
            <p className="flex items-center gap-1.5 truncate text-sm text-gray-400">
              <Mail size={13} className="shrink-0" />
              <span className="truncate">{partner.email}</span>
            </p>
          )}
          {partner.company && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <Building2 size={13} className="shrink-0" />
              {partner.company}
            </p>
          )}
          {(partner.location || partner.state) && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={13} className="shrink-0 text-red-400" />
              {[partner.location, partner.state].filter(Boolean).join(", ")}
            </p>
          )}

          <span className={`mt-2 inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold ${typeClass}`}>
            {type}
          </span>
        </div>

        {!isActive && (
          <span className="h-fit rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
            inactive
          </span>
        )}
      </div>

      {/* Sales / Royalty */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span className="text-gray-500">
          Sales: <span className="font-semibold text-gray-900">{inr(partner.sales_amount ?? partner.sales)}</span>
        </span>
        <span className="text-gray-500">
          Royalty:{" "}
          <span className="font-semibold text-gray-900">
            {partner.royalty_amount != null
              ? inr(partner.royalty_amount)
              : `${Number(partner.royalty_percent || 0)}%`}
          </span>
        </span>
      </div>

      {/* Password (visual; shows a stored temp password if present) */}
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span>Pwd:</span>
        <span className="tracking-widest">
          {showPwd ? partner.temp_password || "Not set" : "••••••"}
        </span>
        <button
          onClick={() => setShowPwd((s) => !s)}
          className="text-gray-400 hover:text-gray-600"
          aria-label={showPwd ? "Hide password" : "Show password"}
        >
          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        <ActionButton icon={Pencil} label="Edit" tone="gray" onClick={() => onEdit(partner)} />
        <ActionButton icon={Eye} label="View" tone="blue" onClick={() => onView(partner)} />
        <ActionButton icon={Star} label="Upgrade" tone="amber" onClick={() => onUpgrade(partner)} />
        <ActionButton
          icon={Power}
          label={isActive ? "Deactivate" : "Activate"}
          tone={isActive ? "red" : "green"}
          disabled={busy}
          onClick={() => onToggleStatus(partner)}
        />
        <ActionButton icon={KeyRound} label="Reset Pwd" tone="blue" onClick={() => onResetPwd(partner)} />
        <ActionButton
          icon={Trash2}
          label="Delete"
          tone="red"
          className="ml-auto"
          onClick={() => onDelete(partner)}
        />
      </div>
    </div>
  );
};

/* ── page ─────────────────────────────────────────────────────────────── */

const Partners = () => {
  // Memoise so useCrud's effect is stable. (unchanged backend wiring)
  const resource = useMemo(
    () => createResource("partners"),
    []
  );
  const { rows, loading, error, create, update, remove, action } = useCrud(resource);
  const { impersonate } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Photo upload state
  // const [photoFile, setPhotoFile] = useState(null);
  // const [photoPreview, setPhotoPreview] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const flash = (msg) => {
    setNotice(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setNotice(""), 3000);
  };

  /* ── form open / close ── */

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview("");
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
      company: row.company ?? "",
      partner_type: row.partner_type ?? "Authorized Partner",
      photo_url: row.photo_url ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(row.photo_url ?? "");
    setFormError("");
    setFormOpen(true);
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = editing
        ? await update(editing.id, form)
        : await create(form);

      if (res.error) {
        alert(res.error.message || "Something went wrong");
        return;
      }

      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await remove(toDelete.id);
    setDeleting(false);
    if (!res.error) setToDelete(null);
  };

  const handleArchive = async () => {
    setDeleting(true);
    const res = await action(toDelete.id, "archive");
    setDeleting(false);
    if (!res?.error) {
      setToDelete(null);
      flash("Partner archived");
    } else {
      flash(res.error.message || "Archive failed");
    }
  };

  /* ── card actions ── */

  const handleToggleStatus = async (row) => {
    setBusyId(row.id);
    const next = row.status === "inactive" ? "active" : "inactive";
    const res = await update(row.id, { status: next });
    setBusyId(null);
    flash(res.error ? res.error.message : `Partner ${next === "active" ? "activated" : "deactivated"}.`);
  };

  // View → open this partner's dashboard as admin ("View as").
  const handleView = async (row) => {
    flash(`Opening ${row.name}'s dashboard…`);
    const res = await impersonate("partner", row.id);
    if (!res?.ok) flash(res?.message || "Could not open dashboard");
  };

  const handleUpgrade = (row) => flash(`Upgrade tier for "${row.name}" — coming soon.`);
  const handleResetPwd = async (row) => {
    const password = window.prompt(
      `Set a login password for ${row.name} (they log in with phone ${row.phone}):`
    );
    if (!password) return;
    const res = await action(row.id, "reset-password", { password });
    flash(res?.error ? res.error.message : `Login enabled for ${row.name}.`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div></div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Partner
        </button>
      </div>

      {notice && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Card grid: 1 col mobile, 2 cols tablet+desktop */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">
          No partners yet. Add your first partner.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {rows.map((p) => (
            <PartnerCard
              key={p.id}
              partner={p}
              busy={busyId === p.id}
              onEdit={openEdit}
              onView={handleView}
              onUpgrade={handleUpgrade}
              onToggleStatus={handleToggleStatus}
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
        title={editing ? "Edit Partner" : "Create Partner Account"}
      >
        <form id="partner-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}

          {/* Row 1: Full Name | Phone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Partner full name" />
            <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone number" />
          </div>

          {/* Row 2: Email | Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="City / area" />
          </div>

          {/* Row 3: State | Password (password only when creating) */}
          {editing ? (
            <FormField label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="State" name="state" value={form.state} onChange={handleChange} placeholder="State" />
              <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters" />
            </div>
          )}

          {/* Row 4: Company (full width) */}
          <FormField label="Company Name (optional)" name="company" value={form.company} onChange={handleChange} placeholder="Company / firm" />

          {/* Row 5: Partner Type (full width) */}
          <FormField
            label="Partner Type"
            name="partner_type"
            type="select"
            value={form.partner_type}
            onChange={handleChange}
            options={PARTNER_TYPES}
          />

          {/* Row 6: Photo upload */}
          <PhotoUpload
            label="Partner Photo"
            folder="partners"
            value={form.photo_url}
            onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </Modal>

      {/* View (read-only) modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Partner Details">
        {viewing && (
          <dl className="space-y-3 text-sm">
            {[
              ["Name", viewing.name],
              ["Company", viewing.company],
              ["Email", viewing.email],
              ["Phone", viewing.phone],
              ["Location", [viewing.location, viewing.state].filter(Boolean).join(", ")],
              ["Type", viewing.partner_type || "Authorized Partner"],
              ["Royalty", `${Number(viewing.royalty_percent || 0)}%`],
              ["Status", viewing.status || "active"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      {/* Archive or Move to Trash */}
      <ArchiveTrashDialog
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        onArchive={handleArchive}
        onTrash={handleDelete}
        name={toDelete?.name}
        typeLabel="Partner"
        note="may contain linked leads and royalty history."
        busy={deleting}
      />
    </div>
  );
};

export default Partners;
