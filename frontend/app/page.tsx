"use client";

import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import PreviewTable from "@/components/PreviewTable";
import ResultTable from "@/components/ResultTable";
import SummaryCards from "@/components/SummaryCards";
import { parseCsvFile, ParsedCsv } from "@/lib/csv";
import { importCsv } from "@/lib/api";
import { ImportResponse } from "@/types/crm";

type Step = "upload" | "preview" | "result";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "result", label: "Result" },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center gap-3">
      {STEPS.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx <= currentIndex ? "bg-teal-500" : "bg-border"
              }`}
            />
            <span
              className={`text-sm transition-colors ${
                idx === currentIndex ? "text-navy font-medium" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`w-8 h-px transition-colors ${
                idx < currentIndex ? "bg-teal-500" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Navbar() {
  return (
    <header className="bg-navbar">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          GrowEasy CSV Importer
        </h1>
        <p className="text-white/70 mt-1.5 text-sm">
          Upload any CSV — AI maps it to your CRM format automatically.
        </p>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-black mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-white/70">
          GrowEasy CSV Importer — AI-powered lead extraction for CRM import.
        </p>
        <p className="text-sm text-white font-medium">Built by Dongari Mukesh Tendulkar</p>
      </div>
    </footer>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(selectedFile: File) {
    setError(null);
    try {
      const parsed = await parseCsvFile(selectedFile);
      setFile(selectedFile);
      setPreview(parsed);
      setStep("preview");
    } catch {
      setError("Could not parse this CSV file. Please check its formatting.");
    }
  }

  async function handleConfirmImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const response = await importCsv(file);
      setResult(response);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          <StepIndicator current={step} />

          {error && (
            <div className="bg-orange-50 border border-orange-400/30 text-orange-600 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {step === "upload" && <UploadDropzone onFileSelected={handleFileSelected} />}

          {step === "preview" && preview && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-medium text-navy">
                Preview — {preview.rows.length} rows found
              </h2>
              <PreviewTable headers={preview.headers} rows={preview.rows} />
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmImport}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400/50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  {loading ? "Processing with AI…" : "Confirm Import"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="border border-border hover:bg-teal-50 text-navy font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "result" && result && (
            <div className="flex flex-col gap-8">
              <SummaryCards
                totalRows={result.meta.totalRows}
                imported={result.meta.imported}
                skipped={result.meta.skipped}
              />

              <div className="flex flex-col gap-3">
                <h2 className="text-base font-medium text-navy">Imported Records</h2>
                <ResultTable records={result.parsedRecords} />
              </div>

              {result.skippedRecords.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h2 className="text-base font-medium text-navy">Skipped Records</h2>
                  <div className="border border-border rounded-xl overflow-hidden bg-white">
                    <div className="max-h-64 overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-tablehead z-10">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-white border-b border-border">
                              Row
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-white border-b border-border">
                              Reason
                            </th>
                            </tr>
                          </thead>
                        <tbody>
                          {result.skippedRecords.map((rec) => (
                            <tr key={rec.rowNumber} className="border-b border-border last:border-b-0">
                              <td className="px-4 py-2 text-muted">{rec.rowNumber}</td>
                              <td className="px-4 py-2 text-muted">{rec.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="self-start border border-border hover:bg-teal-50 text-navy font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Import Another File
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}