import { useRef, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { uploadImage } from "../../api/upload.js";

/**
 * Photo picker. Compresses the image client-side, uploads it to Supabase
 * Storage via the backend, and stores the returned public URL in `value`
 * (persisted to the row's photo_url column). If the upload fails it falls
 * back to embedding the compressed base64 data URL so it still works.
 *
 * Props:
 *  - value: current photo_url (remote URL or data URL)
 *  - onChange(url): called with the new URL ("" when removed)
 *  - label: field label
 *  - folder: storage folder grouping (e.g. "partners")
 *  - maxSize: longest edge in px (default 400)
 */
const fileToDataUrl = (file, maxSize = 400, quality = 0.8) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PhotoUpload = ({
  value,
  onChange,
  label = "Photo (optional)",
  folder = "misc",
  maxSize = 400,
}) => {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file, maxSize);
      try {
        // Preferred: upload to storage, store the short public URL.
        const url = await uploadImage(dataUrl, folder);
        onChange(url);
      } catch {
        // Fallback: embed the compressed image directly.
        onChange(dataUrl);
      }
    } catch {
      // ignore — leave previous value
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Preview"
            className="h-16 w-16 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <ImageIcon size={22} />
          </div>
        )}

        <label className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          <span className="flex items-center gap-2">
            <Upload size={15} />
            {busy ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
