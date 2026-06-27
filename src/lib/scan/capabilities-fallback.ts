import type { DocumentSize, ScannerCapabilities } from "@/lib/scan/types";

// Standard document sizes in eSCL units (1/300 inch). mm -> units = mm/25.4*300.
export const DOCUMENT_SIZES: DocumentSize[] = [
  { id: "a4", label: "A4", width: 2480, height: 3508 },
  { id: "a5", label: "A5", width: 1748, height: 2480 },
  { id: "letter", label: "Letter", width: 2550, height: 3300 },
  { id: "legal", label: "Legal", width: 2550, height: 4200 },
];

/**
 * Static scanner profile for the Canon GX7100 series (50-sheet duplex ADF +
 * flatbed). Used offline and as the base for live eSCL capabilities.
 *
 * TODO(multi-printer): register additional scanner profiles keyed by model.
 */
export const GX7100_SCANNER_FALLBACK: ScannerCapabilities = {
  model: "Canon GX7100 series",
  source: "fallback",
  sources: ["Platen", "Adf"],
  adfDuplex: true,
  colorModes: ["RGB24", "Grayscale8", "BlackAndWhite1"],
  resolutions: [75, 150, 300, 600, 1200],
  intents: ["Document", "Photo"],
  documentSizes: DOCUMENT_SIZES,
};
