import type { JobTemplateAttributes } from "ipp";

import type { PrintSettings } from "@/lib/printer/types";

/**
 * Map normalized print settings to an IPP `job-attributes-tag`. Only attributes
 * the user actually chose are emitted. The `ipp` library maps keyword values
 * (sides, print-color-mode, orientation-requested, print-quality) to their IPP
 * enums internally, so we pass keywords directly.
 *
 * TODO(multi-printer): some printers want IPP enum integers for
 * orientation-requested / print-quality; verify against each target model.
 */
export function toIppJobAttributes(s: PrintSettings): JobTemplateAttributes {
  const attrs: JobTemplateAttributes = {
    copies: s.copies,
    sides: s.sides,
    "print-color-mode": s.colorMode,
    media: s.media as JobTemplateAttributes["media"],
    "orientation-requested": s.orientation,
    "number-up": s.numberUp,
    "print-quality": s.quality,
  };

  if (s.pageRangeMode === "custom" && s.pageRanges?.length) {
    // The ipp serializer encodes page-ranges as setof rangeOfInteger, i.e.
    // [[lower, upper], ...]; @types/ipp incorrectly types this as string.
    (attrs as Record<string, unknown>)["page-ranges"] = s.pageRanges;
  }

  if (s.copies > 1) {
    attrs["multiple-document-handling"] = s.collate
      ? "separate-documents-collated-copies"
      : "separate-documents-uncollated-copies";
  }

  return attrs;
}
