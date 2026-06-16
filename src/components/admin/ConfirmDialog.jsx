import Modal from "./Modal.jsx";

/**
 * Confirmation dialog built on top of Modal.
 *
 * Props:
 *  - open, onCancel, onConfirm
 *  - title, message
 *  - confirmLabel (default "Delete")
 *  - loading: disables buttons while an async action runs
 *  - danger:  red confirm button (default true)
 */
const ConfirmDialog = ({
  open,
  onCancel,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  loading = false,
  danger = true,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    footer={
      <>
        <button
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {loading ? "Working…" : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm text-gray-600">{message}</p>
  </Modal>
);

export default ConfirmDialog;
