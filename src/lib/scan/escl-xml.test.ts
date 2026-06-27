import { describe, expect, it } from "vitest";

import {
  buildScanSettingsXml,
  parseScannerCapabilities,
} from "@/lib/scan/escl-xml";
import { GX7100_SCANNER_CAPS_XML } from "@/lib/scan/fixtures/scanner-capabilities-fixture";
import { GX7100_SCANNER_FALLBACK } from "@/lib/scan/capabilities-fallback";
import type { ScanSettings } from "@/lib/scan/types";

describe("parseScannerCapabilities", () => {
  it("parses the GX7100 eSCL fixture", () => {
    const caps = parseScannerCapabilities(GX7100_SCANNER_CAPS_XML);
    expect(caps.source).toBe("live");
    expect(caps.sources).toEqual(["Platen", "Adf"]);
    expect(caps.adfDuplex).toBe(true);
    expect(caps.colorModes).toEqual([
      "BlackAndWhite1",
      "Grayscale8",
      "RGB24",
    ]);
    expect(caps.resolutions).toEqual([75, 150, 300, 600, 1200]);
  });

  it("returns the fallback profile on unparseable input", () => {
    const caps = parseScannerCapabilities("<not-escl/>");
    expect(caps).toEqual(GX7100_SCANNER_FALLBACK);
  });
});

describe("buildScanSettingsXml", () => {
  const settings: ScanSettings = {
    source: "Adf",
    duplex: true,
    colorMode: "Grayscale8",
    resolution: 300,
    documentSizeId: "a4",
    intent: "Document",
    output: "document",
  };

  it("includes source, color, resolution, intent and duplex for ADF", () => {
    const xml = buildScanSettingsXml(settings, { width: 2480, height: 3508 });
    expect(xml).toContain("<pwg:InputSource>Adf</pwg:InputSource>");
    expect(xml).toContain("<scan:ColorMode>Grayscale8</scan:ColorMode>");
    expect(xml).toContain("<scan:XResolution>300</scan:XResolution>");
    expect(xml).toContain("<scan:Intent>Document</scan:Intent>");
    expect(xml).toContain("<scan:Duplex>true</scan:Duplex>");
    expect(xml).toContain("<pwg:Width>2480</pwg:Width>");
  });

  it("omits the duplex element for the flatbed", () => {
    const xml = buildScanSettingsXml(
      { ...settings, source: "Platen" },
      { width: 2480, height: 3508 },
    );
    expect(xml).not.toContain("<scan:Duplex>");
    expect(xml).toContain("<pwg:InputSource>Platen</pwg:InputSource>");
  });
});
