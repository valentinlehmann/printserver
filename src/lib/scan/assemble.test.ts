import { describe, expect, it } from "vitest";

import { jpegsToPdf, jpegsToZip } from "@/lib/scan/assemble";
import { SAMPLE_JPEG } from "@/lib/scan/fixtures/sample-page";

describe("assemble", () => {
  it("combines JPEGs into a PDF", async () => {
    const pdf = await jpegsToPdf([SAMPLE_JPEG, SAMPLE_JPEG]);
    // PDF magic header.
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("packs JPEGs into a ZIP", async () => {
    const zip = await jpegsToZip([SAMPLE_JPEG]);
    // ZIP local file header magic "PK\x03\x04".
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    expect(zip.length).toBeGreaterThan(0);
  });
});
