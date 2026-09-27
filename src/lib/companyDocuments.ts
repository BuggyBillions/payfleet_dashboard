export type DocumentKey = "logo" | "cac" | "mermat" | "status_report";

export const DOCUMENT_FIELDS: Array<{ key: DocumentKey; label: string }> = [
  { key: "logo", label: "Company Logo" },
  { key: "cac", label: "CAC Document" },
  { key: "mermat", label: "MEMAT Document" },
  { key: "status_report", label: "Status Report" },
];

export type DocumentFiles = Partial<Record<DocumentKey, File>>;
