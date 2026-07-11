import Groq from "groq-sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/extractionPrompt";
import { AiRecordSchema, AiRecord } from "./validator";

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

async function callGroq(rows: Record<string, string>[]): Promise<AiRecord[]> {
  const completion = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + "\n\nRespond ONLY with a JSON object of the form: {\"records\": [...]}. No prose, no markdown fences." },
      { role: "user", content: buildUserPrompt(rows) },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("AI returned an empty response");

  const parsed = JSON.parse(raw);
  const records: AiRecord[] = parsed.records.map((r: unknown) => AiRecordSchema.parse(r));
  return records;
}

export async function extractBatch(rows: Record<string, string>[]): Promise<AiRecord[]> {
  try {
    return await callGroq(rows);
  } catch (firstError) {
    console.warn("AI batch failed, retrying once:", (firstError as Error).message);
    try {
      return await callGroq(rows);
    } catch (secondError) {
      console.error("AI batch failed twice, skipping this batch:", (secondError as Error).message);
      return rows.map(() => AiRecordSchema.parse({
        skip: true,
        skipReason: "AI processing failed for this batch after retry",
      }));
    }
  }
}