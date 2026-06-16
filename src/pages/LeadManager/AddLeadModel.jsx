// src/components/leadmanager/AddLeadModal.jsx
import { useState } from "react";
import FormField from "../../components/admin/FormField";
import Modal from "../../components/admin/Modal";
import { useNavigate } from "react-router-dom";
import { createLead } from "../../services/LeadServices";
import { supabase } from "../../components/supabase/supabaseConnection";


const AddLeadModal = ({
    open,
    onClose,
    form,
    setForm,
    refreshDashboard,
    fetchLeads
}) => {

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [editing, setEditing] = useState('')

    const [audioUrl, setAudioUrl] = useState("");
    const navigate = useNavigate('')

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            const recorder = new MediaRecorder(stream);

            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, {
                    type: "audio/webm",
                });

                setAudioBlob(blob);

                const url = URL.createObjectURL(blob);
                setAudioUrl(url);

                stream.getTracks().forEach((track) =>
                    track.stop()
                );
            };
            recorder.start();

            setMediaRecorder(recorder);

            setIsRecording(true);

        } catch (error) {
            console.log(error);
        }
    };

    const stopRecording = () => {
        if (!mediaRecorder) return;

        mediaRecorder.stop();

        setIsRecording(false);
    };


    const deleteRecording = () => {

        if (audioUrl) {

            URL.revokeObjectURL(audioUrl);

        }

        setAudioUrl("");

        setMediaRecorder(null);

        setIsRecording(false);

    };


    const handleSubmit = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        let audioFileUrl = null;

        // Upload voice recording first
        if (audioBlob) {
            const fileName = `voice-notes/${Date.now()}.webm`;

            const { error: uploadError } = await supabase.storage
                .from("lead-recordings")
                .upload(fileName, audioBlob);

            if (!uploadError) {
                const { data } = supabase.storage
                    .from("lead-recordings")
                    .getPublicUrl(fileName);

                audioFileUrl = data.publicUrl;
            }
        }

        // Save lead
        const { error } = await createLead({
            name: form.name,
            phone: form.whatsapp || form.phone,
            email: form.email,
            location: form.location,
            state: form.state,
            urgency: form.urgency,
            designation: form.designation,
            language: form.language,
            units: form.units || 0,
            model: form.model,
            notes: form.notes,
            source: form.leadSource,
            status: "pending",
            is_vip: form.designation === "VIP",
            lead_manager_id: user.id,
            audio_url: audioFileUrl,
        });

        if (!error) {
            if (fetchLeads) await fetchLeads();
            if (refreshDashboard) refreshDashboard();

            onClose();
        }
    };
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

    const handleLead = () => {
        navigate('leads')
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Add New Lead"
            size="md"
        >
            <div className="space-y-5">

                <p className="text-sm text-[#d97706]">
                    Lead will be auto-assigned if a matching sales
                    staff is available, otherwise added directly
                    to the Lead Pool.
                </p>

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
                        {
                            value: "Not Mentioned",
                            label: "Not Mentioned",
                        },

                        {
                            value: "within 1 month",
                            label: "within 1 month",
                        },

                        {
                            value: "within 3 month",
                            label: "within 3 month",
                        },

                        {
                            value: "within 6 month",
                            label: "within 6 month",
                        },
                        {
                            value: "within 1 year",
                            label: "within 1 year",
                        },
                    ]}
                />

                <FormField
                    label="Designation"
                    name="designation"
                    type="select"
                    value={form.designation}
                    onChange={handleChange}
                    options={[
                        {
                            value: "",
                            label: "— Select designation —",
                        },
                        {
                            value: "VIP",
                            label: "VIP",
                        },
                        {
                            value: "Architects",
                            label: "Architects",
                        },
                        {
                            value: "Resort Owners",
                            label: "Resort Owners",
                        },
                        {
                            value: "celebrity & influencers",
                            label: "celebrity & influencers",
                        },
                        {
                            value: "others",
                            label: "others",
                        },
                    ]}
                />

                <FormField
                    label="Lead Source"
                    name="leadSource"
                    type="select"
                    value={form.leadSource}
                    onChange={handleChange}
                    options={[
                        {
                            value: "",
                            label: "— Select source —",
                        },
                        {
                            value: "Social media",
                            label: "Social media",
                        },
                        {
                            value: "Exhibition(hyd)",
                            label: "Exhibition(hyd)",
                        },
                        {
                            value: "Direct call and message",
                            label: "Direct call and message",
                        },
                        {
                            value: "Referral",
                            label: "Referral",
                        },
                    ]}
                />

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
                    onClick={
                        isRecording
                            ? stopRecording
                            : startRecording
                    }
                    className={`rounded-xl px-5 py-3 font-semibold ${isRecording
                        ? "bg-red-500 text-white"
                        : "bg-gray-100"
                        }`}
                >

                    {isRecording
                        ? "⏹ Stop Recording"
                        : "🎤 Record"}

                </button>
                {audioUrl && (

                    <audio
                        controls
                        className="w-full"
                        src={audioUrl}
                    />

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

                    type="button"

                    onClick={handleSubmit}

                    className="w-full rounded-2xl bg-[#d97706] py-4 text-lg font-semibold text-white"

                >

                    {editing ? "Update Lead" : "Save Lead"}

                </button>

            </div>
        </Modal>
    );
};

export default AddLeadModal;