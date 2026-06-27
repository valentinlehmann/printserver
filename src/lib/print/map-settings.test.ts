import { describe, expect, it } from "vitest";

import { toIppJobAttributes } from "@/lib/print/map-settings";
import type { PrintSettings } from "@/lib/printer/types";

const base: PrintSettings = {
  copies: 1,
  collate: true,
  pageRangeMode: "all",
  sides: "one-sided",
  colorMode: "color",
  orientation: "portrait",
  numberUp: 1,
  media: "iso_a4_210x297mm",
  quality: "normal",
};

describe("toIppJobAttributes", () => {
  it("maps the core attributes as IPP keywords", () => {
    const attrs = toIppJobAttributes(base);
    expect(attrs).toMatchObject({
      copies: 1,
      sides: "one-sided",
      "print-color-mode": "color",
      media: "iso_a4_210x297mm",
      "orientation-requested": "portrait",
      "number-up": 1,
      "print-quality": "normal",
    });
  });

  it("omits page-ranges unless custom mode is set", () => {
    expect(toIppJobAttributes(base)["page-ranges"]).toBeUndefined();
    const custom = toIppJobAttributes({
      ...base,
      pageRangeMode: "custom",
      pageRanges: [
        [1, 3],
        [5, 5],
      ],
    });
    expect(custom["page-ranges"]).toEqual([
      [1, 3],
      [5, 5],
    ]);
  });

  it("adds multiple-document-handling only when copies > 1", () => {
    expect(toIppJobAttributes(base)["multiple-document-handling"]).toBeUndefined();
    const collated = toIppJobAttributes({ ...base, copies: 3, collate: true });
    expect(collated["multiple-document-handling"]).toBe(
      "separate-documents-collated-copies",
    );
    const uncollated = toIppJobAttributes({ ...base, copies: 3, collate: false });
    expect(uncollated["multiple-document-handling"]).toBe(
      "separate-documents-uncollated-copies",
    );
  });
});
