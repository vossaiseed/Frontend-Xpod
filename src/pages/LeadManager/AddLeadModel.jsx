import { useEffect, useState } from "react";
import Modal from "../../components/admin/Modal";
import FormField from "../../components/admin/FormField";
import { useLeads } from "../../context/LeadContext.jsx";
import { uploadFile } from "../../api/upload.js";

const LANGUAGES = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Gujarati",
    "Punjabi",
];

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

const DESIGNATIONS = [
    { value: "", label: "— Select designation —" },
    { value: "VIP", label: "VIP" },
    { value: "Architects", label: "Architects" },
    { value: "Resort Owners", label: "Resort Owners" },
    { value: "celebrity & influencers", label: "celebrity & influencers" },
    { value: "others", label: "Others" },
];

const URGENCY = [
    { value: "Not Mentioned", label: "Not Mentioned" },
    { value: "within 1 month", label: "within 1 month" },
    { value: "within 3 month", label: "within 3 month" },
    { value: "within 6 month", label: "within 6 month" },
    { value: "within 1 year", label: "within 1 year" },
];

const LEAD_SOURCES = [
    { value: "", label: "— Select source —" },
    { value: "Social media", label: "Social media" },
    { value: "Exhibition(hyd)", label: "Exhibition(hyd)" },
    { value: "Direct call and message", label: "Direct call and message" },
    { value: "Referral", label: "Referral" },
];

const isOther = (d) => ["others", "Others", "Other"].includes(d);

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const AddLeadModal = () => {
    // Form + save flow live in LeadContext (no prop drilling).
    const { formOpen, form, setForm, editing, closeForm, saveLead } = useLeads();

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(editing && editing.id);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const resetAudio = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
        setAudioBlob(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // Persist the voice note (if any) and pass its URL to the save flow.
            const extra = {};
            if (audioBlob) {
                const dataUrl = await blobToDataUrl(audioBlob);
                extra.audio_url = await uploadFile(dataUrl, "lead-audio");
            }

            const res = await saveLead(extra);
            if (res?.error) {
                setError(res.error.message || "Something went wrong");
                return;
            }
            resetAudio();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => chunks.push(event.data);

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            setError("Microphone access was denied.");
        }
    };

    const stopRecording = () => {
        if (!mediaRecorder) return;
        mediaRecorder.stop();
        setIsRecording(false);
    };

    const deleteRecording = () => {
        resetAudio();
        setMediaRecorder(null);
        setIsRecording(false);
    };

    // Stop the mic / release the blob URL if the modal unmounts mid-recording.
    useEffect(() => {
        return () => {
            try {
                mediaRecorder?.stream?.getTracks().forEach((t) => t.stop());
            } catch {
                /* noop */
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal
            open={formOpen}
            onClose={closeForm}
            title={isEditing ? `Edit Lead — ${editing?.name || ""}` : "Add New Lead"}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!isEditing && (
                    <p className="text-sm text-[#d97706]">
                        Lead will be auto-assigned if a matching sales staff is available,
                        otherwise added directly to the Lead Pool.
                    </p>
                )}

                {/* Client Name | Phone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Client Name" name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
                    <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" required />
                </div>

                {/* WhatsApp | Email */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="WhatsApp" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp number (optional)" />
                    <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" />
                </div>

                {/* Location | State */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Location" name="location" value={form.location} onChange={handleChange} placeholder="City" />
                    <FormField
                        label="State"
                        name="state"
                        type="select"
                        value={form.state}
                        onChange={handleChange}
                        options={[{ value: "", label: "— Select state —" }, ...INDIAN_STATES.map((s) => ({ value: s, label: s }))]}
                    />
                </div>

                {/* Designation | Primary Language */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Designation" name="designation" type="select" value={form.designation} onChange={handleChange} options={DESIGNATIONS} />
                    <FormField label="Primary Language" name="language" type="select" value={form.language} onChange={handleChange} options={LANGUAGES.map((l) => ({ value: l, label: l }))} />
                </div>

                {/* Custom designation (only for "Others") */}
                {isOther(form.designation) && (
                    <FormField
                        label="Custom Designation"
                        name="customDesignation"
                        value={form.customDesignation}
                        onChange={handleChange}
                        placeholder="Enter custom designation"
                    />
                )}

                {/* Urgency | Quantity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Urgency" name="urgency" type="select" value={form.urgency} onChange={handleChange} options={URGENCY} />
                    <FormField label="Quantity" name="units" value={form.units} onChange={handleChange} placeholder="Quantity requested" />
                </div>

                {/* Model Details */}
                <FormField label="Model Details" name="model" value={form.model} onChange={handleChange} placeholder="Enquired model & details" />

                {/* Requirement */}
                <FormField label="Requirement" name="requirement" type="textarea" value={form.requirement} onChange={handleChange} placeholder="What is the client looking for?" />

                {/* Lead Source */}
                <FormField label="Lead Source" name="leadSource" type="select" value={form.leadSource} onChange={handleChange} options={LEAD_SOURCES} />

                {/* Notes */}
                <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={handleChange} placeholder="Additional notes..." />

                {/* Voice note — capture only when adding a new lead */}
                {!isEditing && (
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`rounded-xl px-5 py-3 font-semibold ${isRecording ? "bg-red-500 text-white" : "bg-gray-100"}`}
                        >
                            {isRecording ? "⏹ Stop Recording" : "🎤 Record"}
                        </button>
                        {audioUrl && <audio controls className="w-full" src={audioUrl} />}
                        {audioUrl && (
                            <button type="button" onClick={deleteRecording} className="rounded-xl bg-red-500 px-4 py-2 text-white">
                                🗑 Delete Recording
                            </button>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 pt-4">
                    <button
                        type="button"
                        onClick={closeForm}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-xl bg-[#d97706] py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                        {saving ? "Saving…" : isEditing ? "Save Changes" : "Save Lead"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddLeadModal;
