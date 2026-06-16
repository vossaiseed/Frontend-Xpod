import React, { useMemo, useState } from 'react'
import { Delete, Edit, Eye, FileType, ImageIcon, LocateIcon, Lock, Mail, Pencil, Upload, UserPlus, View } from 'lucide-react';

import { useCrud } from '../../hooks/useCrud';
import { createResource } from '../../api/resource';
import { supabase } from '../../components/supabase/supabaseConnection';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { signupClient } from '../../components/supabase/signupClient';
import { useNavigate } from 'react-router-dom';




const PHOTO_BUCKET = "Lead-manager-photos"

const makeLoginEmail = (phone) => {
  return `${phone}@leadmanager.com`;
};

const uploadPhoto = async (file) => {
  if (!file) return ''

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)
    }.${ext}`

  const filePath = `lead-manager/${fileName}`

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

  if (error) throw error

  const { data } = supabase.storage
    .from(PHOTO_BUCKET)
    .getPublicUrl(filePath)

  return data.publicUrl
}


const EmptyForm = {
  name: '',
  phone: '',
  email: '',
  location: '',
  state: '',
  password: '',
  photo_url: '',
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


const LeadManagerCard = ({ manager, onEdit, onView, onResetPwd, onDelete }) => {
  const photo = manager.photo_url || manager.avatar_url
  const initial = (manager.name?.charAt(0) || '?').toUpperCase()


  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={manager.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {manager.name}
            </h3>

            {manager.phone && (
              <p className="text-sm text-gray-600">{manager.phone}</p>
            )}
            {manager.email && (
              <p className="truncate text-sm text-gray-500">
                {manager.email}
              </p>
            )}

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
          <ActionButton icon={Delete} label="Delete" tone="red" onClick={() => onDelete(manager)} />
        </div>
      </div>
    </div>
  );
}



const LeadManager = () => {
  const resource = useMemo(() => createResource("lead_managers"), []);
  const { rows, loading, error, create, update, remove } = useCrud(resource);
  const [formOpen, setFormOpen] = useState('')
  const [editing, setEditing] = useState('')
  const [form, setForm] = useState(EmptyForm)
  const [saving, setSaving] = useState('')
  const [formError, setFormError] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const navigate = useNavigate('')


  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)


  const handleView = (manager) => {
    navigate(`/AdminLeadManager/${manager.id}`)
  }

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
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || "",
      location: row.location || "",
      state: row.state || "",
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
              role: "lead_manager",
            },
          },
        });

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
            role: "leadmanager",
            status: "active",
          });

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
        photo_url: photoUrl,
        login_email: loginEmail,
        user_id: authUserId,
      };

      const res = editing
        ? await update(editing.id, payload)
        : await create(payload);

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


  const handleDelete = () => {
    setDeleting(true)
    const res = remove(toDelete.id)
    setDeleting(false)

    if (!res.error) {
      setDeleting(null)
    }
  }

  const handleResetPwd = (manager) => {
    alert(`Reset password for ${manager.phone} coming soon`)
  }

  return (
    <div  >
      <div className='flex items-center justify-between'>
        <div></div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#0d9488] px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <UserPlus size={18} />
          Add Lead Manager
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
          {rows.map((manager) => (
            <LeadManagerCard key={manager.id}
              manager={manager}
              onEdit={openEdit}
              onView={handleView}
              onResetPwd={handleResetPwd}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        size='lg'
        title={editing ? 'Edit Lead Manager' : 'Add Lead Manager'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formError && (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Full Name'
              name='name'
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
            />

            <FormField
              label='Phone'
              name='phone'
              type='tel'
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Phone number"
            />
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email"
            />

            <FormField
              label='Location'
              name='location'
              value={form.location}
              onChange={handleChange}
              placeholder="city"
            />
          </div>

          {editing ? (
            <FormField
              label='state'
              name='state'
              value={form.state}
              onChange={handleChange}
              placeholder='State'
            />
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
              />

            </div>
          )}
          <div className='my-2'>
            <span className='mb-1 block text-sm font-medium text-gray-700'>Photo (Optional)</span>
            <div className='flex gap-2 items-center my-3'>
              {photoPreview ? (
                <img src={photoPreview}
                  alt='preview'
                  className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                  <ImageIcon size={22} />
                </div>
              )}
              <label className="cursor-pointer rounded-xl border border-teal-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50">
                <span className='flex gap-2 items-center border-1 border-[#0f746c]  rounded-xl p-1 text-sm'>
                  <Upload size={15} />
                  Upload Photo
                </span>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handlePhotoChange}
                />
              </label>

              {photoPreview && (
                <button
                  type='button'
                  onClick={clearPhoto}
                >Remove</button>
              )}
            </div>
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#0d9488] py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60  hover:bg-teal-700 my-3"
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
        onConfirm={setToDelete}
        loading={deleting}
        title="Delete lead manager"
        message={`Delete "${toDelete?.name}"? This cannot be undone.`}
      />
    </div>
  )
}

export default LeadManager