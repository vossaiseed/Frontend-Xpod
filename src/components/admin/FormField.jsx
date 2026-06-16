/**
 * Reusable form control (label + input/select/textarea).
 *
 * Props:
 *  - label, name, value, onChange (receives the native event)
 *  - type: "text" | "email" | "tel" | "number" | "textarea" | "select"
 *  - options: [{ value, label }] — required for type="select"
 *  - required, placeholder, min, max, step
 */
const baseInput =
  "w-full rounded-xl border border-[#fde68a] px-3 py-2 text-sm outline-none transition-colors focus:border-orange-500";

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  options = [],
  required = false,
  placeholder,
  ...rest
}) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-gray-700 ">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>

    {type === "textarea" ? (
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={3}
        className={`${baseInput} resize-y`}
        {...rest}
      />
    ) : type === "select" ? (
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className={baseInput}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={baseInput}
        {...rest}
      />
    )}
  </label>
);

export default FormField;
