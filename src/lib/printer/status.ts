import { env, hasPrinterConfigured } from "@/lib/env";
import { getJobsRaw, queryPrinterAttributes } from "@/lib/print/ipp";

// Attributes requested for the status page.
const STATUS_ATTRIBUTES = [
  "printer-make-and-model",
  "printer-state",
  "printer-state-reasons",
  "printer-state-message",
  "queued-job-count",
  "printer-icons",
  "marker-names",
  "marker-levels",
  "marker-colors",
  "marker-types",
];

export type PrinterRunState = "idle" | "processing" | "stopped" | "offline";

export interface PrinterMarker {
  name: string;
  level: number; // 0..100
  color?: string;
  type?: string;
}

export interface PrinterJob {
  id: number;
  name: string;
  state: string; // IPP job-state keyword, e.g. "processing", "aborted"
  user?: string;
  reasons: string[];
}

export interface PrinterStatus {
  source: "live" | "fallback";
  online: boolean;
  model: string;
  state: PrinterRunState;
  stateReasons: string[];
  stateMessage?: string;
  queuedJobCount: number;
  hasIcon: boolean;
  markers: PrinterMarker[];
  jobs: PrinterJob[];
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function offlineStatus(): PrinterStatus {
  return {
    source: "fallback",
    online: false,
    model: "Canon GX7100 series",
    state: "offline",
    stateReasons: [],
    queuedJobCount: 0,
    hasIcon: false,
    markers: [],
    jobs: [],
  };
}

function normalizeMarkers(attrs: Record<string, unknown>): PrinterMarker[] {
  const names = asArray(attrs["marker-names"]).map(String);
  const levels = asArray(attrs["marker-levels"]).map((v) => Number(v));
  const colors = asArray(attrs["marker-colors"]).map(String);
  const types = asArray(attrs["marker-types"]).map(String);
  if (names.length === 0 || levels.length === 0) return [];
  return names.map((name, i) => ({
    name,
    level: Number.isFinite(levels[i]) ? Math.max(0, Math.min(100, levels[i])) : 0,
    color: colors[i],
    type: types[i],
  }));
}

/**
 * Live printer status (state, queue, ink, jobs). Falls back to an "offline"
 * status when the printer is unreachable; serves a fixture in PRINTER_MOCK.
 */
export async function getPrinterStatus(): Promise<PrinterStatus> {
  if (env.PRINTER_MOCK) {
    return {
      source: "live",
      online: true,
      model: "Canon GX7000 series",
      state: "idle",
      stateReasons: [],
      queuedJobCount: 0,
      hasIcon: false,
      markers: [
        { name: "Schwarz", level: 80, color: "#000000", type: "ink" },
        { name: "Cyan", level: 65, color: "#00b7eb", type: "ink" },
        { name: "Magenta", level: 70, color: "#e3007f", type: "ink" },
        { name: "Gelb", level: 60, color: "#ffe600", type: "ink" },
      ],
      jobs: [],
    };
  }
  if (!hasPrinterConfigured()) return offlineStatus();

  try {
    const attrs = await queryPrinterAttributes(STATUS_ATTRIBUTES);
    const jobsRaw = await getJobsRaw("not-completed").catch(() => []);

    const rawState = String(attrs["printer-state"] ?? "idle");
    const state: PrinterRunState =
      rawState === "processing" || rawState === "stopped" ? rawState : "idle";

    const jobs: PrinterJob[] = jobsRaw.map((j) => ({
      id: Number(j["job-id"] ?? 0),
      name: String(j["job-name"] ?? ""),
      state: String(j["job-state"] ?? "unknown"),
      user:
        j["job-originating-user-name"] != null
          ? String(j["job-originating-user-name"])
          : undefined,
      reasons: asArray(j["job-state-reasons"]).map(String).filter((r) => r !== "none"),
    }));

    return {
      source: "live",
      online: true,
      model: String(attrs["printer-make-and-model"] ?? "Drucker"),
      state,
      stateReasons: asArray(attrs["printer-state-reasons"])
        .map(String)
        .filter((r) => r && r !== "none"),
      stateMessage: attrs["printer-state-message"]
        ? String(attrs["printer-state-message"])
        : undefined,
      queuedJobCount: Number(attrs["queued-job-count"] ?? jobs.length) || 0,
      hasIcon: asArray(attrs["printer-icons"]).length > 0,
      markers: normalizeMarkers(attrs),
      jobs,
    };
  } catch {
    return offlineStatus();
  }
}

/**
 * Resolve the printer's icon URL (the same PNG macOS shows). Picks the largest
 * advertised icon. Returns null if none / unreachable.
 */
export async function getPrinterIconUrl(): Promise<string | null> {
  if (env.PRINTER_MOCK || !hasPrinterConfigured()) return null;
  try {
    const attrs = await queryPrinterAttributes(["printer-icons"]);
    const icons = asArray(attrs["printer-icons"]).map(String).filter(Boolean);
    // IPP lists icons small -> large; the last is the highest resolution.
    return icons.length ? icons[icons.length - 1] : null;
  } catch {
    return null;
  }
}
