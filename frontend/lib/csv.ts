import Papa from "papaparse";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

// Parses a CSV file entirely in the browser — no network call, no AI.
// Used only for the Step 2 preview table before the user confirms import.
export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields || [];
        resolve({ headers, rows: result.data });
      },
      error: (err) => reject(err),
    });
  });
}