import { useEffect, useState } from "react";
import Modal from "../admin/Modal.jsx";
import FormField from "../admin/FormField.jsx";
import { createLead } from "../../services/LeadServices.js";
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

const EMPTY_FORM = {
    name: "",
    phone: "",
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

// Map the form onto the real `leads` columns (source / whatsapp / is_vip).
// partner_id is NOT sent — the backend stamps it from the logged-in partner.
const toPayload = (form) => {
    return {
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        location: form.location,
        state: form.state,
        email: form.email,
        urgency: form.urgency,
        designation: form.designation,
        language: form.language,
        units: form.units,
        model: form.model,
        notes: form.notes,
        source: form.leadSource || "",
        is_vip: form.designation === "VIP",
    };
};

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

const PartnerAddLeadModel = ({ openForm, setOpenForm, partner, onSaved }) => {
    const [form, setForm] = useState(EMPTY_FORM);

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const resetAudio = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
        setAudioBlob(null);
    };

    // Start each open with a clean form.
    useEffect(() => {
        if (openForm) {
            setForm(EMPTY_FORM);
            setError("");
            resetAudio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openForm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = toPayload(form);

            // The lead's source is this partner (shown in the form as the
            // "Lead source" row); the backend also stamps partner_id.
            if (partner?.name) payload.source = partner.name;

            // Persist the voice note (if any).
            if (audioBlob) {
                const dataUrl = await blobToDataUrl(audioBlob);
                payload.audio_url = await uploadFile(dataUrl, "lead-audio");
            }

            const res = await createLead(payload);
            // createLead resolves to { data } on success, or { message } on error.
            if (!res?.data) {
                setError(res?.message || "Something went wrong");
                return;
            }

            resetAudio();
            setForm(EMPTY_FORM);
            onSaved?.();          // refresh the dashboard
            setOpenForm(false);
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
            open={openForm}
            onClose={() => setOpenForm(false)}
            title="Add New Lead"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                {error && (
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <p className="text-sm text-[#d97706]">
                    Lead will be auto-assigned if a matching sales
                    staff is available, otherwise added directly
                    to the Lead Pool.
                </p>

                <FormField
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                />

                <FormField
                    label="Client Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    required
                />

                <FormField
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City"
                />

                <FormField
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                />

                <FormField
                    label="WhatsApp"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp number (optional)"
                />

                <FormField
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email (optional)"
                    type="email"
                />

                <FormField
                    label="Urgency"
                    name="urgency"
                    type="select"
                    value={form.urgency}
                    onChange={handleChange}
                    options={[
                        { value: "Not Mentioned", label: "Not Mentioned" },
                        { value: "within 1 month", label: "within 1 month" },
                        { value: "within 3 month", label: "within 3 month" },
                        { value: "within 6 month", label: "within 6 month" },
                        { value: "within 1 year", label: "within 1 year" },
                    ]}
                />

                <FormField
                    label="Designation"
                    name="designation"
                    type="select"
                    value={form.designation}
                    onChange={handleChange}
                    options={[
                        { value: "", label: "— Select designation —" },
                        { value: "VIP", label: "VIP" },
                        { value: "Architects", label: "Architects" },
                        { value: "Resort Owners", label: "Resort Owners" },
                        { value: "celebrity & influencers", label: "celebrity & influencers" },
                        { value: "others", label: "others" },
                    ]}
                />

                <div className="flex justify-between shadow rounded-2xl p-3">
                    <p>Lead source</p>
                    {partner?.name} ({partner?.partner_type})
                </div>

                <FormField
                    label="Primary Language"
                    name="language"
                    type="select"
                    value={form.language}
                    onChange={handleChange}
                    options={LANGUAGES.map((language) => ({
                        value: language,
                        label: language,
                    }))}
                />

                <FormField
                    label="Number Of Units"
                    name="units"
                    value={form.units}
                    onChange={handleChange}
                    placeholder="Quantity requested"
                />

                <FormField
                    label="Enquired Model & Details"
                    name="model"
                    type="textarea"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="Model name, customizations, specifications..."
                />

                <FormField
                    label="Notes"
                    name="notes"
                    type="textarea"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional notes..."
                />

                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`rounded-xl px-5 py-3 font-semibold ${isRecording
                        ? "bg-red-500 text-white"
                        : "bg-gray-100"
                        }`}
                >
                    {isRecording ? "⏹ Stop Recording" : "🎤 Record"}
                </button>

                {audioUrl && (
                    <audio controls className="w-full" src={audioUrl} />
                )}

                {audioUrl && (
                    <button
                        type="button"
                        onClick={deleteRecording}
                        className="rounded-xl bg-red-500 px-4 py-2 text-white"
                    >
                        🗑 Delete Recording
                    </button>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[#d97706] py-4 text-lg font-semibold text-white disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Save Lead"}
                </button>

            </form>
        </Modal>
    );
};

export default PartnerAddLeadModel;
