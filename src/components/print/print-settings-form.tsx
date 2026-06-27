"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2Icon, PrinterIcon } from "lucide-react";

import { FileDropzone } from "@/components/print/file-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, SettingSelect, type Option } from "@/components/settings-field";
import { mediaLabel } from "@/lib/printer/media";
import { parsePageRanges } from "@/lib/printer/page-ranges";
import type {
  PrinterCapabilities,
  PrintSettings,
  Sides,
} from "@/lib/printer/types";
import { t } from "@/lib/messages";

const SIDES_LABELS: Record<Sides, string> = {
  "one-sided": t.print.oneSided,
  "two-sided-long-edge": t.print.twoSidedLong,
  "two-sided-short-edge": t.print.twoSidedShort,
};

export function PrintSettingsForm({
  capabilities,
}: {
  capabilities: PrinterCapabilities;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [copies, setCopies] = useState(1);
  const [collate, setCollate] = useState(true);
  const [pageRangeMode, setPageRangeMode] = useState<"all" | "custom">("all");
  const [pageRangeText, setPageRangeText] = useState("");
  const [sides, setSides] = useState<Sides>("one-sided");
  const [colorMode, setColorMode] = useState<string>(
    capabilities.color.supportsColor ? "color" : "monochrome",
  );
  const [orientation, setOrientation] = useState<string>("portrait");
  const [numberUp, setNumberUp] = useState(1);
  const [media, setMedia] = useState<string>(capabilities.defaultMedia);
  const [quality, setQuality] = useState<string>(
    capabilities.quality.includes("normal") ? "normal" : capabilities.quality[0],
  );

  const sidesOptions: Option[] = capabilities.duplex.modes.map((s) => ({
    value: s,
    label: SIDES_LABELS[s],
  }));
  const colorOptions: Option[] = [
    ...(capabilities.color.supportsColor
      ? [{ value: "color", label: t.print.color }]
      : []),
    ...(capabilities.color.supportsMonochrome
      ? [{ value: "monochrome", label: t.print.monochrome }]
      : []),
  ];
  const orientationOptions: Option[] = capabilities.orientation.map((o) => ({
    value: o,
    label: o === "landscape" ? t.print.landscape : t.print.portrait,
  }));
  const numberUpOptions: Option[] = capabilities.numberUp.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const mediaOptions: Option[] = capabilities.media.map((m) => ({
    value: m,
    label: mediaLabel(m),
  }));
  const qualityOptions: Option[] = capabilities.quality.map((q) => ({
    value: q,
    label:
      q === "draft"
        ? t.print.qualityDraft
        : q === "high"
          ? t.print.qualityHigh
          : t.print.qualityNormal,
  }));

  async function handlePrint() {
    if (!file) {
      toast.error(t.print.noFile);
      return;
    }

    let pageRanges: [number, number][] | undefined;
    if (pageRangeMode === "custom") {
      const parsed = parsePageRanges(pageRangeText);
      if (!parsed) {
        toast.error(t.print.pageRangeInvalid);
        return;
      }
      pageRanges = parsed;
    }

    const settings: PrintSettings = {
      copies,
      collate,
      pageRangeMode,
      pageRanges,
      sides,
      colorMode: colorMode as PrintSettings["colorMode"],
      orientation: orientation as PrintSettings["orientation"],
      numberUp,
      media,
      quality: quality as PrintSettings["quality"],
    };

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("settings", JSON.stringify(settings));
      const res = await fetch("/api/print", { method: "POST", body: form });
      if (!res.ok) {
        toast.error(t.print.failed);
        return;
      }
      toast.success(t.print.success);
    } catch {
      toast.error(t.print.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.print.file}</CardTitle>
        </CardHeader>
        <CardContent>
          <FileDropzone file={file} onFile={setFile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.print.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {/* Copies & collate */}
          <Field label={t.print.copies}>
            <Input
              type="number"
              min={capabilities.copies.min}
              max={capabilities.copies.max}
              value={copies}
              onChange={(e) =>
                setCopies(
                  Math.min(
                    capabilities.copies.max,
                    Math.max(capabilities.copies.min, Number(e.target.value) || 1),
                  ),
                )
              }
            />
          </Field>
          {capabilities.collateSupported && (
            <div className="flex items-end">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={collate}
                  onCheckedChange={(v) => setCollate(Boolean(v))}
                />
                {t.print.collate}
              </Label>
            </div>
          )}

          {/* Page range */}
          <Field label={t.print.pagesGroup}>
            <SettingSelect
              value={pageRangeMode}
              onChange={(v) => setPageRangeMode(v as "all" | "custom")}
              options={[
                { value: "all", label: t.print.allPages },
                { value: "custom", label: t.print.pageRange },
              ]}
            />
          </Field>
          {pageRangeMode === "custom" && (
            <Field label={t.print.pageRange}>
              <Input
                value={pageRangeText}
                onChange={(e) => setPageRangeText(e.target.value)}
                placeholder={t.print.pageRangePlaceholder}
              />
            </Field>
          )}

          {/* Color */}
          <Field label={t.print.colorMode}>
            <SettingSelect value={colorMode} onChange={setColorMode} options={colorOptions} />
          </Field>

          {/* Sides / duplex */}
          <Field label={t.print.sides}>
            <SettingSelect
              value={sides}
              onChange={(v) => setSides(v as Sides)}
              options={sidesOptions}
              disabled={!capabilities.duplex.supported}
            />
          </Field>

          {/* Orientation */}
          <Field label={t.print.orientation}>
            <SettingSelect
              value={orientation}
              onChange={setOrientation}
              options={orientationOptions}
            />
          </Field>

          {/* Pages per sheet */}
          <Field label={t.print.pagesPerSheet}>
            <SettingSelect
              value={String(numberUp)}
              onChange={(v) => setNumberUp(Number(v))}
              options={numberUpOptions}
            />
          </Field>

          {/* Paper */}
          <Field label={t.print.paperSize}>
            <SettingSelect value={media} onChange={setMedia} options={mediaOptions} />
          </Field>

          {/* Quality */}
          <Field label={t.print.quality}>
            <SettingSelect value={quality} onChange={setQuality} options={qualityOptions} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handlePrint} disabled={submitting || !file}>
          {submitting ? <Loader2Icon className="animate-spin" /> : <PrinterIcon />}
          {submitting ? t.print.submitting : t.print.submit}
        </Button>
      </div>
    </div>
  );
}
