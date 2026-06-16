import { Pencil, Trash2 } from "lucide-react";

/**
 * Reusable, responsive data table.
 *
 * Props:
 *  - columns:  [{ key, header, render?(row) }]
 *  - rows:     array of records (must have an `id`)
 *  - loading:  boolean
 *  - emptyText:string shown when there are no rows
 *  - onEdit(row), onDelete(row): optional row actions (render an Actions column)
 */
const DataTable = ({
  columns,
  rows = [],
  loading = false,
  emptyText = "No records yet.",
  onEdit,
  onDelete,
}) => {
  const hasActions = onEdit || onDelete;

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-medium">
                {c.header}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="px-4 py-10 text-center text-gray-400"
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="px-4 py-10 text-center text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-gray-700">
                    {c.render ? c.render(row) : row[c.key] ?? "—"}
                  </td>
                ))}

                {hasActions && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
