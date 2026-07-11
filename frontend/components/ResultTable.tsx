import { CrmRecord } from "@/types/crm";

interface ResultTableProps {
  records: CrmRecord[];
}

const COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "country_code", label: "Code" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "crm_status", label: "Status" },
  { key: "data_source", label: "Source" },
  { key: "crm_note", label: "Note" },
  { key: "possession_time", label: "Possession Time" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created At" },
  { key: "lead_owner", label: "Lead Owner" },
];

export default function ResultTable({ records }: ResultTableProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-white">
      <div className="max-h-96 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-tablehead z-10">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-white border-b border-border whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-teal-50/40">
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 text-muted whitespace-nowrap max-w-xs truncate"
                  >
                    {record[col.key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}