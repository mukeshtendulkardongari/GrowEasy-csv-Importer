import { ImportResponse } from "@/types/crm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function importCsv(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Import failed with status ${response.status}`);
  }

  return response.json();
}