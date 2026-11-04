/**
 * Secure File Upload Validation Utility
 * Validates file types, extensions, size caps, and file header magic bytes to prevent polyglot and malware execution.
 */

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const ALLOWED_DOCUMENT_MIMES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

export const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  // SVG intentionally NOT allowed: it can carry inline <script> (stored XSS).
]);

/**
 * Checks magic numbers (header bytes) for supported binary file types
 */
export function verifyMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
  if (mimeType === "application/pdf") {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // PNG magic bytes: 0x89 0x50 0x4E 0x47
  if (mimeType === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // JPEG magic bytes: 0xFF 0xD8 0xFF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // DOCX (ZIP archive header): 0x50 0x4B 0x03 0x04
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
  }

  // WEBP: "RIFF"...."WEBP"
  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    );
  }

  // Text/CSV: no magic bytes, but reject binary content (NUL bytes) and embedded HTML/script.
  if (mimeType === "text/plain" || mimeType === "text/csv") {
    const head = buffer.subarray(0, Math.min(buffer.length, 8192));
    if (head.includes(0x00)) return false;
    const sample = new TextDecoder("utf-8", { fatal: false }).decode(head).toLowerCase();
    return !/<\s*(script|iframe|object|embed)\b/.test(sample);
  }

  // Unknown types are rejected by default.
  return false;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validates an uploaded document file before ingestion or cloud storage.
 */
export function validateDocumentUpload(
  filename: string,
  sizeBytes: number,
  mimeType: string,
  buffer?: Uint8Array
): FileValidationResult {
  // 1. Size verification
  if (sizeBytes <= 0) {
    return { isValid: false, error: "Uploaded file is empty." };
  }
  if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
    return { isValid: false, error: `File exceeds maximum allowed size of 10MB (got ${Math.round(sizeBytes / 1024 / 1024)}MB).` };
  }

  // 2. MIME type verification
  if (!ALLOWED_DOCUMENT_MIMES.has(mimeType)) {
    return { isValid: false, error: `MIME type '${mimeType}' is not permitted. Allowed: PDF, DOCX, TXT, CSV.` };
  }

  // 3. Extension verification
  const lowerName = filename.toLowerCase();
  const validExtensions = [".pdf", ".docx", ".txt", ".csv"];
  const hasValidExt = validExtensions.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExt) {
    return { isValid: false, error: "Invalid file extension. Only .pdf, .docx, .txt, and .csv are allowed." };
  }

  // 4. Magic bytes verification if buffer is available
  if (buffer && !verifyMagicBytes(buffer, mimeType)) {
    return { isValid: false, error: "File header content does not match the declared MIME type (tampered file detected)." };
  }

  // 5. Filename sanitization (prevent path traversal attacks e.g. ../../etc/passwd)
  const base = filename.split(/[\\/]/).pop() || "upload";
  const sanitizedFilename = base
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .replace(/^\.+/, "")
    .slice(0, 150) || "upload";

  return { isValid: true, sanitizedFilename };
}
