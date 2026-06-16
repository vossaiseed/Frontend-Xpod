import React, { useMemo, useState } from 'react'
import { Delete, Edit, Eye, FileType, ImageIcon, LocateIcon, Lock, Mail, Pencil, Upload, UserPlus, View } from 'lucide-react';

import { useCrud } from '../../hooks/useCrud';
import { createResource } from '../../api/resource';
import { supabase } from '../../components/supabase/supabaseConnection';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { signupClient } from '../../components/supabase/signupClient';
import LanguageSelector from '../../components/admin/LanguageSelector';
import LeadPermissionSelector from '../../components/admin/LeadPermissionSelector';



const PHOTO_BUCKET = "SalesMan"

const makeLoginEmail = (phone) => {
  return `${phone}@SalesMan.com`;
};

const uploadPhoto = async (file) => {
  if (!file) return ''

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)
    }.${ext}`

  const filePath = `SalesMan/${fileName}`

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })
  
  console.log("UPLOAD ERROR:", error);

  if (error) throw error

  const { data } = supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}

const EmptyForm = {
  name: "",
  phone: "",
  email: "",
  location: "",
  state: "",
  password: "",

  closing_capacity: "other",
  max_lead_capacity: 10,

  languages: [],

  restricted_access: false,

  partner_categories: [],
  specific_partners: [],
  lead_sources: [],

  lead_permissions: {
    access_type: "full",
    allowed_categories: [],
  },

  role: "Official Sales Person",

  photo_url: "",
}

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  tone = "gray",
  disabled,
  className = "",
}) => {
  const tones = {
    gray: "border-gray-200 text-gray-600 hover:bg-gray-50",
    blue: "border-blue-200 text-blue-600 hover:bg-blue-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
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
const SalesManCard = ({ salesman, onEdit, onView, onResetPwd, onDelete }) => {
  const photo = salesman.photo_url || salesman.avatar_url
  const initial = (salesman.name?.charAt(0) || '?').toUpperCase()

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={salesman.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {salesman.name}
            </h3>

            {salesman.phone && (
              <p className="text-sm text-gray-600">{salesman.phone}</p>
            )}
            {salesman.email && (
              <p className="truncate text-sm text-gray-500">
                {salesman.email}
              </p>
            )}

            {(salesman.location || salesman.state) && (
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <LocateIcon size={14} />
                <span className="truncate">
                  {[salesman.location, salesman.state].filter(Boolean).join(", ")}
                </span>
              </p>
            )}
            <span className="mt-1 inline-block rounded-2xl bg-[#ccfbf1] px-2 py-1 text-xs text-[#0f746c]">
              Lead Manager
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:w-28">
          <ActionButton icon={Pencil} label="Edit" tone="gray" onClick={() => onEdit(salesman)} />
          <ActionButton icon={Eye} label="View" tone="blue" onClick={() => onView(salesman)} />
          <ActionButton icon={Lock} label="Reset Pwd" tone="blue" onClick={() => onResetPwd(salesman)} />
          <ActionButton icon={Delete} label="Delete" tone="red" onClick={() => onDelete(salesman)} />
        </div>
      </div>
    </div>
  );
}



const SalesMan = () => {
  const resource = useMemo(() => createResource("sales_team"), []);
  const { rows, loading, error, create, update, remove } = useCrud(resource);
  const [formOpen, setFormOpen] = useState('')
  const [editing, setEditing] = useState('')
  const [form, setForm] = useState(EmptyForm)
  const [saving, setSaving] = useState('')
  const [formError, setFormError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(EmptyForm)
    setPhotoFile(null)
    setPhotoPreview(null)
    setFormError('')
    setFormOpen(true)
  }



  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name || "",
      phone: row.phone || "",
      email: row.email || "",
      location: row.location || "",
      state: row.state || "",

      closing_capacity: row.closing_capacity || "other",
      max_lead_capacity: row.max_lead_capacity || 10,

      languages: row.languages || [],

      restricted_access: row.restricted_access || false,

      partner_categories: row.partner_categories || [],
      specific_partners: row.specific_partners || [],
      lead_sources: row.lead_sources || [],

      role: row.role || "Official Sales Person",

      password: "",
      photo_url: row.photo_url || "",
    })

    setPhotoFile(null);
    setPhotoPreview(row.photo_url || "");
    setFormError("");
    setFormOpen(true);
  }

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };


  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview('')
    setForm((f) => ({ ...f, photo_url: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      let photoUrl = form.photo_url;

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      let authUserId = editing?.user_id || null;
      let loginEmail = editing?.login_email || makeLoginEmail(form.phone);

      if (!editing) {
        const { data, error } = await signupClient.auth.signUp({
          email: loginEmail,
          password: form.password,
          options: {
            data: {
              name: form.name,
              phone: form.phone,
              role: "salesMan",
            },
          },
        });

        console.log("SIGNUP DATA:", data);
        console.log("SIGNUP ERROR:", error);

        if (error) {
          setFormError(error.message);
          setSaving(false);
          return;
        }

        authUserId = data.user?.id;

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: authUserId,
            name: form.name,
            email: loginEmail,
            phone: form.phone.trim(),
            role: "salesman",
            status: "active",
          });


        console.log("PROFILE ERROR:", profileError);
        if (profileError) {
          setFormError(profileError.message);
          return;
        }
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        state: form.state,

        closing_capacity: form.closing_capacity,
        max_lead_capacity: form.max_lead_capacity,

        languages: form.languages,

        restricted_access: form.restricted_access,

        partner_categories: form.partner_categories,
        specific_partners: form.specific_partners,
        lead_sources: form.lead_sources,
        lead_permissions: form.lead_permissions,
        role: form.role,

        photo_url: photoUrl,

        login_email: loginEmail,
        user_id: authUserId,
      }

      const res = editing
        ? await update(editing.id, payload)
        : await create(payload);

      console.log("CREATE RESULT:", res);
      console.log("TABLE ERROR:", res.error);

      if (res.error) {
        setFormError(res.error.message);
        return;
      }

      setFormOpen(false);
    } catch (err) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async () => {
    if (!toDelete) return

    setDeleting(true)

    const res = await remove(toDelete.id)

    setDeleting(false)

    if (!res.error) {
      setToDelete(null)
    }
  }

  const handleResetPwd = (manager) => {
    alert(`Reset password for ${manager.phone} coming soon`)
  }

  return (
    <div  >
      <div className='flex items-center justify-between mb-5'>
        <div></div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <UserPlus size={18} />
          Add  SalesMan
        </button>
      </div>
      {error && (
        <div>{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-400 shadow-sm">No lead manager yet</div>
      ) : (
        <div className='p-5 grid grid-cols-1 md:grid-cols-2 gap-5'>
          {rows.map((salesman) => (
            <SalesManCard key={salesman.id}
              salesman={salesman}
              onEdit={openEdit}
              onView={setViewing}
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
        <form id="partner-form" onSubmit={handleSubmit} className="space-y-4 md:w-115">
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

          {/* Row 5: Partner Type (full width) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Closing Capacity"
              name="closing_capacity"
              type="select"
              value={form.closing_capacity}
              onChange={handleChange}
              options={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
                { label: "Other", value: "other" },
              ]}
            />
            <FormField
              label="Max Lead Capacity"
              name="max_lead_capacity"
              type="number"
              value={form.max_lead_capacity}
              onChange={handleChange}
            />
          </div>
          <div className='grid grid-cols-1 gap-4 '>
            <LanguageSelector
              value={form.languages}
              onChange={(languages) =>
                setForm((f) => ({
                  ...f,
                  languages,
                }))
              }
            />
          </div>
          <div className='grid grid-cols-1 gap-4'>
            <LeadPermissionSelector
              value={form.lead_permissions}
              onChange={(lead_permissions) =>
                setForm((f) => ({
                  ...f,
                  lead_permissions,
                }))
              }
            />
          </div>
          <div>
            <FormField
              label="Role"
              name="role"
              type="select"
              value={form.role}
              onChange={handleChange}
              options={[
                {
                  label: "Official Sales Person",
                  value: "Official Sales Person",
                },
                {
                  label: "Senior Sales Person",
                  value: "Senior Sales Person",
                },
              ]}
            />
          </div>
          {/* Row 6: Photo upload with preview */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700">Partner Photo</span>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ImageIcon size={22} />
                </div>
              )}

              <label className="cursor-pointer rounded-xl border border-[#fde68a] px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <span className="flex items-center gap-2 ">
                  <Upload size={15} />
                  {photoPreview ? "Change photo" : "Upload photo"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>

              {photoPreview && (
                <button type="button" onClick={clearPhoto} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#d57307] py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Account"}
          </button>
        </form>
      </Modal>
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Lead Manager Details"
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            {[
              ["Name", viewing.name],
              ["Phone/Login Number", viewing.phone],
              ["Email", viewing.email],
              [
                "Location",
                [viewing.location, viewing.state].filter(Boolean).join(", "),
              ],
              ["Role", "Lead Manager"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-medium text-gray-900">
                  {value || "—"}
                </dd>
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
      />
    </div>
  )
}

export default SalesMan