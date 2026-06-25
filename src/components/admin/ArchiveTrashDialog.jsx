import { useEffect } from "react";
import { AlertTriangle, Archive, Trash2 } from "lucide-react";

/**
 * Two-action delete dialog: Archive or Move to Trash (or Cancel).
 *
 * Props:
 *  - open, onCancel, onArchive, onTrash
 *  - name:      record name
 *  - typeLabel: "Partner" | "Lead Manager" | ...
 *  - note:      small warning line under the title
 *  - busy:      disables the buttons while an action runs
 */
const ArchiveTrashDialog = ({
    open,
    onCancel,
    onArchive,
    onTrash,
    name,
    typeLabel = "Record",
    note,
    busy = false,
    // Optional overrides so the same dialog can read e.g. "Deactivate Account".
    heading,
    archiveLabel,
}) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onCancel?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

            <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <AlertTriangle size={22} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                    {heading || `Archive or Delete ${typeLabel}?`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    ⚠️ <span className="font-medium text-gray-700">{name}</span>{" "}
                    {note || "may contain linked leads and history."}
                </p>

                <div className="mt-5 space-y-2">
                    {onArchive && (
                        <button
                            onClick={onArchive}
                            disabled={busy}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                        >
                            <Archive size={16} /> {archiveLabel || `Archive ${typeLabel}`}
                        </button>
                    )}
                    <button
                        onClick={onTrash}
                        disabled={busy}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        <Trash2 size={16} /> Move to Trash
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveTrashDialog;
