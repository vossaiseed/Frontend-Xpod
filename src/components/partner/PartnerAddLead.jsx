import { useState } from "react";
import Modal from "../admin/Modal";
import FormField from "../admin/FormField";
import { useLeads } from "../../context/LeadContext";
import { PiRecord } from "react-icons/pi";
import { Check, Mic } from "lucide-react";


const leads = [
    { value: "No specific leads", label: "--No specific leads--" },

]


const PartnerAddLead = ({ openForm, setOpenForm }) => {
    const { formOpen, form, setForm, editing, closeForm, saveLead } = useLeads();

    const [Lead, setLead] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioUrl, setAudioUrl] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEditing = Boolean(editing && editing.id);

    const resetAudio = () => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
        setAudioBlob(null);
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

    return (
        <Modal
            open={openForm}
            onClose={() => setOpenForm(false)}
            title="Quick Voice Action"
            className="w-xs"

        >
            <div className="">
                <FormField
                    label="Attached To Lead(Optional)"
                    name="No Specific Lead"
                    value={Lead}
                    onChange={(e) => setLead(e.target.value)}
                    required
                    type="select"
                    placeholder="No Specific Lead"
                    options={leads}
                    className=""
                />


            </div>
            <div>

            </div>
            <div className="my-10">

                <div className="hidden">
                    {audioUrl && (
                        <audio controls className="w-full" src={audioUrl} />
                    )}
                </div>
                {audioUrl ? (
                    <div className="text-center justify-items-center">
                        <Check
                            size={50}
                            className="bg-green-100 text-green-600 rounded-full p-3"
                        />
                        <p className="py-4 text-green-600">
                            Recording completed
                        </p>
                    </div>
                ) : (
                    <div className={`text-center justify-items-center ${isRecording ? "animate-pulse" : ""}`}>
                        <Mic
                            size={50}
                            className={`bg-[#ecedef] rounded-full p-3 ${isRecording ? "text-red-500" : "text-[#515151]"
                                }`}
                        />

                        <p className="py-4 text-sm text-[#515151]">
                            {isRecording
                                ? "Recording... tap to stop..."
                                : "Click button to start recording"}
                        </p>
                    </div>
                )}
                
            </div>
            {audioUrl ? (
                <div className="flex items-center justify-center gap-6">
                    <button
                        type="button"
                        onClick={deleteRecording}
                        className="rounded-xl  px-4 py-2 p-2 text-black border w-full"
                    >
                        Re-Record
                    </button>
                    <button
                        type="button"
                        onClick={deleteRecording}
                        className="rounded-xl bg-green-500 px-4 py-2 text-white w-full">
                        Save
                    </button>
                </div>

            ) : (
                <div>
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-full rounded-2xl bg-black py-2 text-md font-semibold text-white disabled:opacity-60 ${isRecording
                            ? "bg-red-500" : "bg-black"
                            }`}
                    >
                        {isRecording ? "⏹ Stop Recording" : "🎤 Start Recording"}
                    </button>
                </div>
)}
        </Modal>
    );
};

export default PartnerAddLead;