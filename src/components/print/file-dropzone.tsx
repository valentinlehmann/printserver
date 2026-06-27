"use client";

import { useRef, useState } from "react";
import { FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { t } from "@/lib/messages";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function FileDropzone({
  file,
  onFile,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const picked = files?.[0];
    if (picked && isPdf(picked)) onFile(picked);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-3">
        <FileTextIcon className="size-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onFile(null)}
          aria-label={t.print.removeFile}
        >
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors",
        dragging ? "border-primary bg-accent" : "hover:bg-accent/50",
      )}
    >
      <UploadCloudIcon className="size-8 text-muted-foreground" />
      <span className="text-sm font-medium">{t.print.dropzone}</span>
      <span className="text-xs text-muted-foreground">{t.print.dropzoneHint}</span>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </button>
  );
}
