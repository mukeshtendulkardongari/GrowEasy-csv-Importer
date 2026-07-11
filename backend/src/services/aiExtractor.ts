import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/extractionPrompt";
import { AiRecordSchema, AiRecord } from "./validator";

let ai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}
// The JSON schema Gemini must conform to. Guarantees valid, parseable JSON back.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    records: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          created_at: { type: Type.STRING },
          name: { type: Type.STRING },
          email: { type: Type.STRING },
          country_code: { type: Type.STRING },
          mobile_without_country_code: { type: Type.STRING },
          company: { type: Type.STRING },
          city: { type: Type.STRING },
          state: { type: Type.STRING },
          country: { type: Type.STRING },
          lead_owner: { type: Type.STRING },
          crm_status: { type: Type.STRING },
          crm_note: { type: Type.STRING },
          data_source: { type: Type.STRING },
          possession_time: { type: Type.STRING },
          description: { type: Type.STRING },
          skip: { type: Type.BOOLEAN },
          skipReason: { type: Type.STRING },
        },
        required: [
          "created_at", "name", "email", "country_code",
          "mobile_without_country_code", "company", "city", "state",
          "country", "lead_owner", "crm_status", "crm_note",
          "data_source", "possession_time", "description", "skip", "skipReason",
        ],
      },
    },
  },
  required: ["records"],
};

async function callGemini(rows: Record<string, string>[]): Promise<AiRecord[]> {
    const response = await getClient().models.generateContent({    model: "gemini-3.5-flash",
    contents: buildUserPrompt(rows),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("AI returned an empty response");

  const parsed = JSON.parse(raw);
  const records: AiRecord[] = parsed.records.map((r: unknown) => AiRecordSchema.parse(r));
  return records;
}

// Runs one batch through the AI, retrying once on any failure (network, parse, validation).
export async function extractBatch(rows: Record<string, string>[]): Promise<AiRecord[]> {
  try {
    return await callGemini(rows);
  } catch (firstError) {
    console.warn("AI batch failed, retrying once:", (firstError as Error).message);
    try {
      return await callGemini(rows);
    } catch (secondError) {
      console.error("AI batch failed twice, skipping this batch:", (secondError as Error).message);
      return rows.map(() => AiRecordSchema.parse({
        skip: true,
        skipReason: "AI processing failed for this batch after retry",
      }));
    }
  }
}