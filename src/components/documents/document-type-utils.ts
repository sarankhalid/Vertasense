/**
 * Utility functions for document type detection and processing
 */

/**
 * Determines the document type based on MIME type
 * @param mimeType The MIME type of the document
 * @returns A user-friendly document type string
 */
export function getDocumentTypeFromMime(mimeType: string): string {
  const lowerMimeType = mimeType.toLowerCase();
  
  if (lowerMimeType.includes("pdf")) {
    return "PDF";
  } else if (lowerMimeType.includes("word") || lowerMimeType.includes("doc")) {
    return "Word Document";
  } else if (
    lowerMimeType.includes("sheet") ||
    lowerMimeType.includes("excel") ||
    lowerMimeType.includes("xls")
  ) {
    return "Spreadsheet";
  } else if (
    lowerMimeType.includes("presentation") ||
    lowerMimeType.includes("powerpoint") ||
    lowerMimeType.includes("ppt")
  ) {
    return "Presentation";
  } else if (lowerMimeType.includes("image")) {
    return "Image";
  }
  
  return "Document";
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(1) + " MB";
}

/**
 * Gets a certificate name from its ID
 * @param certificateId The certificate ID
 * @returns A user-friendly certificate name
 */
export function getCertificateName(certificateId: string | undefined): string {
  if (!certificateId) return "Not Specified";
  
  switch (certificateId) {
    case "iso9001":
      return "ISO 9001:2015";
    case "iso14001":
      return "ISO 14001:2015";
    case "iso45001":
      return "ISO 45001:2018";
    default:
      return certificateId;
  }
}

/**
 * Generates a unique document ID
 * @returns A unique document ID string
 */
export function generateDocumentId(): string {
  return `DOC-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Removes the file extension from a filename
 * @param fileName The full filename with extension
 * @returns The filename without extension
 */
export function removeFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return fileName;
  return fileName.substring(0, lastDotIndex);
}
