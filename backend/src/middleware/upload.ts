import multer from "multer";

// Store the uploaded file in memory as a Buffer, not on disk.
// This keeps the backend stateless — nothing to clean up after the request.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max, matches the assignment's screenshot hint
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      cb(new Error("Only CSV files are allowed"));
      return;
    }
    cb(null, true);
  },
});