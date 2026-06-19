import { useState } from 'react'
import Modal from '../admin/Modal'
import FormField from '../admin/FormField'
import { LockIcon } from 'lucide-react'
import { changePassword } from '../../api/auth.js'

const ResetPassword = ({ openForm, setOpenForm }) => {
    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const reset = () => {
        setCurrentPwd('')
        setNewPwd('')
        setConfirmPwd('')
        setError('')
        setNotice('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setNotice('')

        if (newPwd.length < 6) {
            setError('New password must be at least 6 characters')
            return
        }
        if (newPwd !== confirmPwd) {
            setError('New password and confirmation do not match')
            return
        }

        setSaving(true)
        try {
            await changePassword(currentPwd, newPwd)
            setNotice('Password changed successfully')
            setCurrentPwd('')
            setNewPwd('')
            setConfirmPwd('')
        } catch (err) {
            setError(err.message || 'Could not change password')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <Modal
                open={openForm}
                onClose={() => {
                    reset()
                    setOpenForm(false)
                }}
                className='w-sm'
                title={"Change Password"}
            >
                <form onSubmit={handleSubmit} className='space-y-5'>
                    {error && (
                        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    {notice && (
                        <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                            {notice}
                        </div>
                    )}

                    <FormField
                        label="Current Password"
                        name="currentPassword"
                        value={currentPwd}
                        type='password'
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        required
                        placeholder="Current Password"
                        className='h-12'
                    />
                    <FormField
                        label="New Password"
                        name="newPassword"
                        value={newPwd}
                        type='password'
                        onChange={(e) => setNewPwd(e.target.value)}
                        required
                        placeholder="New Password"
                        className='h-12'
                    />
                    <FormField
                        label="Confirm Password"
                        name="confirmPassword"
                        value={confirmPwd}
                        type='password'
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        required
                        placeholder="Re-enter Password"
                        className='h-12'
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex gap-2 items-center justify-center w-full rounded-2xl bg-[#d97706] py-3 text-md font-semibold text-white disabled:opacity-60"
                    >
                        <LockIcon size={15} />
                        {saving ? 'Updating…' : 'Update Password'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

export default ResetPassword
