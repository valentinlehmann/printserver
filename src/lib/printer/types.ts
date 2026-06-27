// Normalized, printer-agnostic shapes the UI consumes. Vendor/IPP specifics are
// translated into these by lib/printer/capabilities.ts so the rest of the app
// (and other printer models) never touch raw IPP attributes.

export type Sides = "one-sided" | "two-sided-long-edge" | "two-sided-short-edge";
export type ColorMode = "color" | "monochrome";
export type Orientation = "portrait" | "landscape";
export type Quality = "draft" | "normal" | "high";

export interface PrinterCapabilities {
  /** Printer make/model string (from IPP printer-make-and-model). */
  model: string;
  /** Whether these came from a live query or the static fallback profile. */
  source: "live" | "fallback";
  color: {
    supportsColor: boolean;
    supportsMonochrome: boolean;
  };
  duplex: {
    supported: boolean;
    modes: Sides[];
  };
  /** Supported PWG media keywords, e.g. "iso_a4_210x297mm". */
  media: string[];
  defaultMedia: string;
  copies: { min: number; max: number };
  /** Supported pages-per-sheet (number-up) values. */
  numberUp: number[];
  quality: Quality[];
  orientation: Orientation[];
  collateSupported: boolean;
}

export interface PrintSettings {
  copies: number;
  collate: boolean;
  /** "all" prints everything; "custom" honors `pageRanges`. */
  pageRangeMode: "all" | "custom";
  /** Inclusive 1-based ranges, e.g. [[1, 3], [5, 5]]. */
  pageRanges?: [number, number][];
  sides: Sides;
  colorMode: ColorMode;
  orientation: Orientation;
  numberUp: number;
  media: string;
  quality: Quality;
}
