import React, { useState } from 'react'
import Modal from '../../components/admin/Modal'
import FormField from '../../components/admin/FormField'


const EMPTY_FORM = {
    name: "",
    phone: "",
    email: "",
    location: "",
    state: "",
    password: "",
    company: "",
}

const GeneralLeads = () => {

    const buttons = [
        "All(0)",
        "Discussion(0)",
        "Converted(0)",
        "Not-Interested(0)"
    ]

    const [form, setForm] = useState('')
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState('')
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);


    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setFormOpen(true);
    };



    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    return (
        <div>
            <div className='flex justify-between'>
                <p>0 general leads (not linked to partners)</p>
                <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-xl bg-[#d97706] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8b4e07]">+ Add General Lead</button>
            </div>
            <div className='flex gap-3'>
                {buttons.map((buttons) => (
                    <div key={buttons} className='border-0 shadow p-2 rounded-2xl text-sm'>
                        <button>{buttons}</button>
                    </div>
                ))}

            </div>

            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                size="lg"
                title={editing ? "Edit Partner" : "Create Partner Account"}
            >
                <form id="add General lead" className="space-y-4">
                    {formError && (
                        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
                    )}

                    {/* Row 1: Full Name | Phone */}
                    <div className="w-xs grid gap-4">
                        <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Partner full name" />
                        <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone number" />
                        <FormField label="Place" name="Place" value={form.place} onChange={handleChange} placeholder="city/place" />
                        <FormField label="source" name="source" value={form.source} type='select' onChange={handleChange} placeholder="select sources" />
                    </div>
                    

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
        </div>
    )
}

export default GeneralLeads