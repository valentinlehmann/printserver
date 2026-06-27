import { describe, expect, it } from "vitest";

import { fromIppAttributes, GX7100_FALLBACK } from "@/lib/printer/capabilities";

describe("fromIppAttributes", () => {
  it("normalizes a typical IPP attribute set", () => {
    const caps = fromIppAttributes({
      "printer-make-and-model": "Canon GX7000 series",
      "sides-supported": [
        "one-sided",
        "two-sided-long-edge",
        "two-sided-short-edge",
      ],
      "print-color-mode-supported": ["color", "monochrome", "auto"],
      "media-supported": ["iso_a4_210x297mm", "na_letter_8.5x11in"],
      "media-default": "iso_a4_210x297mm",
      "copies-supported": { lower: 1, upper: 99 },
      "number-up-supported": [1, 2, 4],
      "print-quality-supported": [3, 4, 5],
    });

    expect(caps.source).toBe("live");
    expect(caps.model).toBe("Canon GX7000 series");
    expect(caps.color).toEqual({ supportsColor: true, supportsMonochrome: true });
    expect(caps.duplex.supported).toBe(true);
    expect(caps.copies).toEqual({ min: 1, max: 99 });
    expect(caps.numberUp).toEqual([1, 2, 4]);
    expect(caps.quality).toEqual(["draft", "normal", "high"]);
    expect(caps.media).toContain("iso_a4_210x297mm");
  });

  it("falls back for missing attributes", () => {
    const caps = fromIppAttributes({});
    expect(caps.media).toEqual(GX7100_FALLBACK.media);
    expect(caps.copies).toEqual(GX7100_FALLBACK.copies);
    expect(caps.duplex.modes).toEqual(GX7100_FALLBACK.duplex.modes);
  });

  it("detects monochrome-only printers", () => {
    const caps = fromIppAttributes({
      "print-color-mode-supported": ["monochrome"],
      "sides-supported": ["one-sided"],
    });
    expect(caps.color.supportsColor).toBe(false);
    expect(caps.color.supportsMonochrome).toBe(true);
    expect(caps.duplex.supported).toBe(false);
  });
});
