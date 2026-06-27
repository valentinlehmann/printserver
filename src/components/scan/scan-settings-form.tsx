"use client";

import { useState } from "react";
import {
  Loader2Icon,
  ScanLineIcon,
  XIcon,
  DownloadIcon,
  RotateCcwIcon,
  CheckCircle2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, SettingSelect, type Option } from "@/components/settings-field";
import { useScanJob } from "@/hooks/use-scan-job";
import type {
  ScanColorMode,
  ScannerCapabilities,
  ScanSettings,
  ScanSource,
} from "@/lib/scan/types";
import { t } from "@/lib/messages";

const COLOR_LABELS: Record<ScanColorMode, string> = {
  RGB24: t.scan.color,
  Grayscale8: t.scan.grayscale,
  BlackAndWhite1: t.scan.blackwhite,
};

export function ScanSettingsForm({
  capabilities,
}: {
  capabilities: ScannerCapabilities;
}) {
  const { snapshot, starting, start, cancel, reset, resultUrl } = useScanJob();

  const [source, setSource] = useState<ScanSource>(capabilities.sources[0]);
  const [duplex, setDuplex] = useState(false);
  const [colorMode, setColorMode] = useState<ScanColorMode>(
    capabilities.colorModes.includes("RGB24")
      ? "RGB24"
      : capabilities.colorModes[0],
  );
  const [resolution, setResolution] = useState(
    capabilities.resolutions.includes(300)
      ? 300
      : capabilities.resolutions[Math.floor(capabilities.resolutions.length / 2)],
  );
  const [documentSizeId, setDocumentSizeId] = useState(
    capabilities.documentSizes[0]?.id ?? "a4",
  );
  const [mode, setMode] = useState<"document" | "photo">("document");

  const adfDuplexAvailable = source === "Adf" && capabilities.adfDuplex;

  const sourceOptions: Option[] = capabilities.sources.map((s) => ({
    value: s,
    label: s === "Adf" ? t.scan.adf : t.scan.platen,
  }));
  const colorOptions: Option[] = capabilities.colorModes.map((c) => ({
    value: c,
    label: COLOR_LABELS[c],
  }));
  const resolutionOptions: Option[] = capabilities.resolutions.map((r) => ({
    value: String(r),
    label: `${r} ${t.scan.dpi}`,
  }));
  const sizeOptions: Option[] = capabilities.documentSizes.map((d) => ({
    value: d.id,
    label: d.label,
  }));
  const modeOptions: Option[] = [
    { value: "document", label: t.scan.outputDocument },
    { value: "photo", label: t.scan.outputPhoto },
  ];

  function handleSourceChange(value: string) {
    const next = value as ScanSource;
    setSource(next);
    if (next !== "Adf") setDuplex(false);
  }

  function handleStart() {
    const settings: ScanSettings = {
      source,
      duplex: adfDuplexAvailable ? duplex : false,
      colorMode,
      resolution,
      documentSizeId,
      intent: mode === "photo" ? "Photo" : "Document",
      output: mode,
    };
    void start(settings);
  }

  const state = snapshot?.state;
  const isRunning =
    state === "pending" || state === "scanning" || state === "assembling";
  const isDone = state === "done";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.scan.sourceGroup}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label={t.scan.source}>
            <SettingSelect
              value={source}
              onChange={handleSourceChange}
              options={sourceOptions}
            />
          </Field>
          <div className="flex items-end">
            <Label className="flex items-center gap-2">
              <Checkbox
                checked={duplex}
                onCheckedChange={(v) => setDuplex(Boolean(v))}
                disabled={!adfDuplexAvailable}
              />
              {t.scan.duplex}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.scan.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label={t.scan.colorMode}>
            <SettingSelect
              value={colorMode}
              onChange={(v) => setColorMode(v as ScanColorMode)}
              options={colorOptions}
            />
          </Field>
          <Field label={t.scan.resolution}>
            <SettingSelect
              value={String(resolution)}
              onChange={(v) => setResolution(Number(v))}
              options={resolutionOptions}
            />
          </Field>
          <Field label={t.scan.documentSize}>
            <SettingSelect
              value={documentSizeId}
              onChange={setDocumentSizeId}
              options={sizeOptions}
            />
          </Field>
          <Field label={t.scan.output}>
            <SettingSelect
              value={mode}
              onChange={(v) => setMode(v as "document" | "photo")}
              options={modeOptions}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Action / status */}
      {!isRunning && !isDone && (
        <div className="flex flex-col items-end gap-2">
          {state === "error" && (
            <p className="text-sm text-destructive">
              {snapshot?.error ?? t.scan.failed}
            </p>
          )}
          <Button size="lg" onClick={handleStart} disabled={starting}>
            {starting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ScanLineIcon />
            )}
            {starting ? t.scan.starting : t.scan.submit}
          </Button>
        </div>
      )}

      {isRunning && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {state === "assembling" ? t.scan.assembling : t.scan.scanning}
                </p>
                <p className="text-xs text-muted-foreground">
                  {snapshot?.pagesPulled ?? 0} {t.scan.pagesScanned}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={cancel}>
              <XIcon />
              {t.scan.cancel}
            </Button>
          </CardContent>
        </Card>
      )}

      {isDone && resultUrl && (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2Icon className="size-5 text-emerald-600" />
              <p className="text-sm font-medium">{t.scan.done}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>
                <RotateCcwIcon />
                {t.scan.submit}
              </Button>
              <Button render={<a href={resultUrl} download />}>
                <DownloadIcon />
                {snapshot?.resultMime === "application/zip"
                  ? t.scan.downloadZip
                  : t.scan.downloadPdf}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
