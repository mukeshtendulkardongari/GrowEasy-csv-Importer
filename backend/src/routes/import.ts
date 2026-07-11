import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middleware/upload";
import { parseCsvBuffer, batchRows } from "../services/csvParser";
import { extractBatch } from "../services/aiExtractor";
import { sanitizeRecord } from "../services/validator";
import { CrmRecord, SkippedRecord, ImportResponse } from "../types/crm";

const router = Router();
const BATCH_SIZE = 20;

router.post(
  "/import",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No CSV file uploaded" });
      }

      const rows = parseCsvBuffer(req.file.buffer);
      if (rows.length === 0) {
        return res.status(400).json({ success: false, error: "CSV file has no data rows" });
      }

      const batches = batchRows(rows, BATCH_SIZE);
      const parsedRecords: CrmRecord[] = [];
      const skippedRecords: SkippedRecord[] = [];

      let rowNumber = 0;
      for (const batch of batches) {
        const aiResults = await extractBatch(batch);

        aiResults.forEach((aiRecord, idxInBatch) => {
          rowNumber += 1;
          const { valid, reason, record } = sanitizeRecord(aiRecord);
          if (valid && record) {
            parsedRecords.push(record);
          } else {
            skippedRecords.push({
              rowNumber,
              reason: reason || "Skipped",
              raw: batch[idxInBatch] ?? {},
            });
          }
        });
      }

      const response: ImportResponse = {
        success: true,
        meta: {
          totalRows: rows.length,
          processedRows: rowNumber,
          imported: parsedRecords.length,
          skipped: skippedRecords.length,
          batches: batches.length,
        },
        parsedRecords,
        skippedRecords,
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

export default router;