import { z } from "zod";
import { ALLOWED_CRM_STATUS, ALLOWED_DATA_SOURCE, CrmRecord } from "../types/crm";

// What we expect back from the AI for a single row (includes skip flag/reason).
export const AiRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z.string().default(""),
  crm_note: z.string().default(""),
  data_source: z.string().default(""),
  possession_time: z.string().default(""),
  description: z.string().default(""),
  skip: z.boolean().default(false),
  skipReason: z.string().default(""),
});

export type AiRecord = z.infer<typeof AiRecordSchema>;

// Final enforcement pass: even if the AI schema validated, double-check the business rules.
export function sanitizeRecord(record: AiRecord): {
  valid: boolean;
  reason?: string;
  record?: CrmRecord;
} {
  // Rule: must have email OR mobile
  const hasEmail = record.email.trim().length > 0;
  const hasMobile = record.mobile_without_country_code.trim().length > 0;
  if (record.skip || (!hasEmail && !hasMobile)) {
    return {
      valid: false,
      reason: record.skipReason || "Missing both email and mobile number",
    };
  }

  // Rule: crm_status must be an allowed value, else blank
  const status = ALLOWED_CRM_STATUS.includes(record.crm_status as any)
    ? record.crm_status
    : "";

  // Rule: data_source must be an allowed value, else blank
  const source = ALLOWED_DATA_SOURCE.includes(record.data_source as any)
    ? record.data_source
    : "";

  // Rule: created_at must be parseable by JS Date, else blank
  const dateOk = record.created_at && !isNaN(new Date(record.created_at).getTime());
  const created_at = dateOk ? record.created_at : "";

  // Rule: no raw newlines in any field
  const singleLine = (v: string) => v.replace(/\r?\n/g, "\\n");

  const clean: CrmRecord = {
    created_at,
    name: singleLine(record.name),
    email: singleLine(record.email),
    country_code: singleLine(record.country_code),
    mobile_without_country_code: singleLine(record.mobile_without_country_code),
    company: singleLine(record.company),
    city: singleLine(record.city),
    state: singleLine(record.state),
    country: singleLine(record.country),
    lead_owner: singleLine(record.lead_owner),
    crm_status: status,
    crm_note: singleLine(record.crm_note),
    data_source: source,
    possession_time: singleLine(record.possession_time),
    description: singleLine(record.description),
  };

  return { valid: true, record: clean };
}