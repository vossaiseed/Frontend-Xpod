import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal dialog.
 *
 * Props:
 *  - open:     boolean
 *  - onClose:  fn
 *  - title:    string
 *  - children: body
 *  - footer:   optional footer node (buttons)
 *  - size:     "md" | "lg" (default "md")
 */
const SIZES = { md: "max-w-md", lg: "max-w-2xl" };

const Modal = ({ open, onClose, title, children, footer, size = "md", className = '' }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 ">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 px-2 overflow-hidden rounded-2xl bg-white shadow-xl ${className || SIZES[size]}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
