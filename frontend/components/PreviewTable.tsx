interface PreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
}

export default function PreviewTable({ headers, rows }: PreviewTableProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-tablehead z-10">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left font-medium text-white border-b border-border whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-teal-50/40">
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-2 text-muted whitespace-nowrap max-w-xs truncate"
                  >
                    {row[header] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-muted border-t border-border bg-teal-50/40">
        Showing {rows.length} row{rows.length !== 1 ? "s" : ""} — preview only, no AI processing yet
      </div>
    </div>
  );
}