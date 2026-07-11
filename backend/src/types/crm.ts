export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  rowNumber: number;
  reason: string;
  raw: Record<string, string>;
}

export interface ImportResponse {
  success: boolean;
  meta: {
    totalRows: number;
    processedRows: number;
    imported: number;
    skipped: number;
    batches: number;
  };
  parsedRecords: CrmRecord[];
  skippedRecords: SkippedRecord[];
}

export const ALLOWED_CRM_STATUS = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const ALLOWED_DATA_SOURCE = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;