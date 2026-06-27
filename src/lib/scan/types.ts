// Normalized, scanner-agnostic shapes for the UI. eSCL specifics are translated
// into these by lib/scan/escl-xml.ts.

export type ScanSource = "Platen" | "Adf";
export type ScanColorMode = "RGB24" | "Grayscale8" | "BlackAndWhite1";
export type ScanIntent = "Document" | "Photo";
/** "document" assembles a PDF; "photo" produces a ZIP of JPEGs. */
export type OutputMode = "document" | "photo";

export interface DocumentSize {
  id: string;
  label: string;
  /** Region dimensions in eSCL units (1/300 inch). */
  width: number;
  height: number;
}

export interface ScannerCapabilities {
  model: string;
  source: "live" | "fallback";
  sources: ScanSource[];
  adfDuplex: boolean;
  colorModes: ScanColorMode[];
  /** Supported scan resolutions in DPI. */
  resolutions: number[];
  intents: ScanIntent[];
  documentSizes: DocumentSize[];
}

export interface ScanSettings {
  source: ScanSource;
  duplex: boolean;
  colorMode: ScanColorMode;
  resolution: number;
  documentSizeId: string;
  intent: ScanIntent;
  output: OutputMode;
}

export type ScanState =
  | "pending"
  | "scanning"
  | "assembling"
  | "done"
  | "error"
  | "canceled";

export interface ScanJobSnapshot {
  id: string;
  state: ScanState;
  pagesPulled: number;
  error?: string;
  output?: OutputMode;
  resultMime?: "application/pdf" | "application/zip";
  resultFilename?: string;
}
