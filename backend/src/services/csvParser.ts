import Papa from "papaparse";

export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const csvText = buffer.toString("utf-8");

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,        // use the first row as keys, whatever they are
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    // PapaParse is lenient by default; we only bail on fatal errors.
    const fatal = result.errors.filter((e) => e.type === "Quotes" || e.type === "Delimiter");
    if (fatal.length > 0) {
      throw new Error("CSV file could not be parsed. Please check its formatting.");
    }
  }

  return result.data;
}

// Splits rows into fixed-size batches so each AI call stays small and fast.
export function batchRows<T>(rows: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }
  return batches;
}