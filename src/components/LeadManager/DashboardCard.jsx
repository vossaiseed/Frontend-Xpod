/**
 * Reusable dashboard stat card.
 *
 * Matches the reference UI: a large, colour-accented value with a muted label.
 *
 * Props:
 *  - label:         string — metric name
 *  - value:         string | number — metric value (pre-formatted)
 *  - accent:        keyof typeof ACCENTS — value colour (default "slate")
 *  - icon:          lucide-react component — optional, shown top-right
 *  - hint:          string — optional sub-label under the value
 *  - labelPosition: "top" | "bottom" — where the label sits relative to the
 *                   value. "bottom" (default) for the small stat cards,
 *                   "top" for the wide revenue cards.
 */
const ACCENTS = {
  slate: "text-gray-900",
  green: "text-green-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
};

const DashboardCard = ({
  label,
  value,
  accent = "slate",
  icon: Icon,
  hint,
  labelPosition = "bottom",
}) => {
  const valueColor = ACCENTS[accent] ?? ACCENTS.slate;

  const Label = <p className="text-sm font-medium text-gray-500">{label}</p>;
  const Value = <h2 className={`text-3xl font-bold ${valueColor}`}>{value}</h2>;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {Icon && (
        <div className="mb-2 flex justify-end">
          <Icon size={18} className="text-gray-300" />
        </div>
      )}

      {labelPosition === "top" ? (
        <div className="space-y-2">
          {Label}
          {Value}
        </div>
      ) : (
        <div className="space-y-1">
          {Value}
          {Label}
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
};

export default DashboardCard;
