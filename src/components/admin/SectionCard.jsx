import { ArrowRight } from "lucide-react";

/**
 * Reusable panel for dashboard sections (lists, tables, summaries).
 *
 * Props:
 *  - title:    string
 *  - icon:     lucide-react component (optional)
 *  - count:    number — optional badge shown next to the title
 *  - action:   { label, onClick } — optional footer/header CTA
 *  - children: panel body
 *  - className:string — extra classes (e.g. grid spans)
 */
const SectionCard = ({ title, icon: Icon,  iconClassName = "", count, action, children, className = "" }) => (
  <section
    className={`flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
  >
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-2">
         {Icon && (
          <Icon
            size={18}
            className={`text-gray-400 ${iconClassName}`}
          />
        )}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {typeof count === "number" && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {count}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
        >
          {action.label}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
    <div className="flex-1 p-5">{children}</div>
  </section>
);

export default SectionCard;
