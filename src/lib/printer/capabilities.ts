import { env, hasPrinterConfigured } from "@/lib/env";
import gx7100Attrs from "@/lib/printer/fixtures/gx7100-printer-attributes.json";
import type {
  PrinterCapabilities,
  Quality,
  Sides,
} from "@/lib/printer/types";

/**
 * Static capability profile for the Canon GX7100 series. Used when the printer
 * is unreachable (offline development, or a transient network issue) and as the
 * base that live IPP attributes are merged onto.
 *
 * TODO(multi-printer): register additional fallback profiles here keyed by
 * model, and pick one based on printer-make-and-model.
 */
export const GX7100_FALLBACK: PrinterCapabilities = {
  model: "Canon GX7100 series",
  source: "fallback",
  color: { supportsColor: true, supportsMonochrome: true },
  duplex: {
    supported: true,
    modes: ["one-sided", "two-sided-long-edge", "two-sided-short-edge"],
  },
  media: [
    "iso_a4_210x297mm",
    "iso_a5_148x210mm",
    "jis_b5_182x257mm",
    "na_letter_8.5x11in",
    "na_legal_8.5x14in",
  ],
  defaultMedia: "iso_a4_210x297mm",
  copies: { min: 1, max: 99 },
  numberUp: [1, 2, 4],
  quality: ["draft", "normal", "high"],
  orientation: ["portrait", "landscape"],
  collateSupported: true,
};

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null) return [];
  return [String(value)];
}

/** IPP print-quality enum (RFC 8011): 3=draft, 4=normal, 5=high. */
function mapIppQuality(value: unknown): Quality[] {
  const nums = (Array.isArray(value) ? value : [value])
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  const out: Quality[] = [];
  if (nums.includes(3)) out.push("draft");
  if (nums.includes(4)) out.push("normal");
  if (nums.includes(5)) out.push("high");
  return out.length ? out : GX7100_FALLBACK.quality;
}

/**
 * Translate a raw IPP Get-Printer-Attributes response into normalized
 * capabilities. Missing attributes fall back to the GX7100 profile, so a sparse
 * printer still yields a usable UI.
 */
export function fromIppAttributes(
  attrs: Record<string, unknown>,
  fallback: PrinterCapabilities = GX7100_FALLBACK,
): PrinterCapabilities {
  const sides = asArray(attrs["sides-supported"]) as Sides[];
  const colorModes = asArray(attrs["print-color-mode-supported"]);
  const media = asArray(attrs["media-supported"]);
  const numberUp = (
    Array.isArray(attrs["number-up-supported"])
      ? attrs["number-up-supported"]
      : [attrs["number-up-supported"]]
  )
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);

  const copiesRaw = attrs["copies-supported"];
  const copies =
    typeof copiesRaw === "object" &&
    copiesRaw !== null &&
    "lower" in copiesRaw &&
    "upper" in copiesRaw
      ? {
          min: Number((copiesRaw as { lower: number }).lower) || fallback.copies.min,
          max: Number((copiesRaw as { upper: number }).upper) || fallback.copies.max,
        }
      : fallback.copies;

  const duplexModes = (
    sides.length ? sides : fallback.duplex.modes
  ).filter((s): s is Sides =>
    ["one-sided", "two-sided-long-edge", "two-sided-short-edge"].includes(s),
  );

  return {
    model: String(attrs["printer-make-and-model"] ?? fallback.model),
    source: "live",
    color: {
      supportsColor: colorModes.length
        ? colorModes.includes("color")
        : fallback.color.supportsColor,
      supportsMonochrome: colorModes.length
        ? colorModes.includes("monochrome")
        : fallback.color.supportsMonochrome,
    },
    duplex: {
      supported: duplexModes.some((s) => s.startsWith("two-sided")),
      modes: duplexModes.length ? duplexModes : fallback.duplex.modes,
    },
    media: media.length ? media : fallback.media,
    defaultMedia: String(attrs["media-default"] ?? fallback.defaultMedia),
    copies,
    numberUp: numberUp.length ? numberUp : fallback.numberUp,
    quality: attrs["print-quality-supported"]
      ? mapIppQuality(attrs["print-quality-supported"])
      : fallback.quality,
    orientation: fallback.orientation, // IPP orientation enums rarely advertised
    collateSupported: fallback.collateSupported,
  };
}

/**
 * Resolve the printer's capabilities for the UI.
 * - PRINTER_MOCK: parse the bundled GX7100 fixture (offline dev).
 * - no printer configured: static fallback profile.
 * - otherwise: live IPP query (wired in M4), falling back on any error.
 */
export async function getPrinterCapabilities(): Promise<PrinterCapabilities> {
  if (env.PRINTER_MOCK) {
    return fromIppAttributes(gx7100Attrs as Record<string, unknown>);
  }
  if (!hasPrinterConfigured()) {
    return GX7100_FALLBACK;
  }
  // TODO(M4): query live IPP Get-Printer-Attributes via lib/print/ipp.ts and
  // fall back to GX7100_FALLBACK on connection/parse errors.
  return GX7100_FALLBACK;
}
