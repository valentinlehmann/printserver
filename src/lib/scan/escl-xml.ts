import { XMLParser } from "fast-xml-parser";

import {
  DOCUMENT_SIZES,
  GX7100_SCANNER_FALLBACK,
} from "@/lib/scan/capabilities-fallback";
import type {
  ScanColorMode,
  ScannerCapabilities,
  ScanSettings,
  ScanSource,
} from "@/lib/scan/types";

const KNOWN_COLOR_MODES: ScanColorMode[] = [
  "RGB24",
  "Grayscale8",
  "BlackAndWhite1",
];

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstProfile(inputCaps: any) {
  return toArray(inputCaps?.SettingProfiles?.SettingProfile)[0];
}

/**
 * Parse an eSCL ScannerCapabilities XML document into normalized capabilities.
 * Namespace prefixes are stripped; missing fields fall back to the GX7100
 * profile so a sparse/odd response still yields a usable UI.
 *
 * TODO(multi-printer/quirk): element names and namespacing vary across firmware
 * (e.g. SupportedIntents placement); broaden parsing as new devices appear.
 */
export function parseScannerCapabilities(xml: string): ScannerCapabilities {
  const fb = GX7100_SCANNER_FALLBACK;
  try {
    const parser = new XMLParser({
      ignoreAttributes: true,
      removeNSPrefix: true,
      parseTagValue: true,
    });
    const caps = parser.parse(xml)?.ScannerCapabilities;
    if (!caps) return fb;

    const sources: ScanSource[] = [];
    if (caps.Platen) sources.push("Platen");
    if (caps.Adf) sources.push("Adf");

    const adf = caps.Adf;
    const adfDuplex = Boolean(
      adf?.AdfDuplexInputCaps ||
        toArray<string>(adf?.AdfOptions?.AdfOption).includes("Duplex"),
    );

    const inputCaps =
      caps.Platen?.PlatenInputCaps ??
      adf?.AdfSimplexInputCaps ??
      adf?.AdfDuplexInputCaps;
    const profile = firstProfile(inputCaps);

    const colorModes = toArray<string>(profile?.ColorModes?.ColorMode).filter(
      (m): m is ScanColorMode => (KNOWN_COLOR_MODES as string[]).includes(m),
    );

    const resolutions = Array.from(
      new Set(
        toArray(
          profile?.SupportedResolutions?.DiscreteResolutions?.DiscreteResolution,
        )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((d: any) => Number(d?.XResolution))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    ).sort((a, b) => a - b);

    return {
      model: String(caps.MakeAndModel ?? fb.model),
      source: "live",
      sources: sources.length ? sources : fb.sources,
      adfDuplex,
      colorModes: colorModes.length ? colorModes : fb.colorModes,
      resolutions: resolutions.length ? resolutions : fb.resolutions,
      intents: fb.intents, // Document/Photo selected per scan request
      documentSizes: DOCUMENT_SIZES,
    };
  } catch {
    return fb;
  }
}

/**
 * Build an eSCL ScanSettings request body. The scan region is given in eSCL
 * units (1/300 inch). We always request JPEG pages and assemble PDF/ZIP
 * ourselves, so the document-vs-photo choice maps to Intent only.
 *
 * TODO(quirk): namespace/element expectations (InputSource, Duplex,
 * ContentRegionUnits) vary by firmware — adjust per target model.
 */
export function buildScanSettingsXml(
  s: ScanSettings,
  region: { width: number; height: number },
): string {
  const duplex =
    s.source === "Adf" ? `\n  <scan:Duplex>${s.duplex}</scan:Duplex>` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">
  <pwg:Version>2.6</pwg:Version>
  <pwg:ScanRegions pwg:MustHonor="true">
    <pwg:ScanRegion>
      <pwg:XOffset>0</pwg:XOffset>
      <pwg:YOffset>0</pwg:YOffset>
      <pwg:Width>${region.width}</pwg:Width>
      <pwg:Height>${region.height}</pwg:Height>
    </pwg:ScanRegion>
  </pwg:ScanRegions>
  <pwg:InputSource>${s.source}</pwg:InputSource>
  <scan:ColorMode>${s.colorMode}</scan:ColorMode>
  <scan:XResolution>${s.resolution}</scan:XResolution>
  <scan:YResolution>${s.resolution}</scan:YResolution>
  <scan:Intent>${s.intent}</scan:Intent>${duplex}
  <scan:DocumentFormatExt>image/jpeg</scan:DocumentFormatExt>
</scan:ScanSettings>`;
}
