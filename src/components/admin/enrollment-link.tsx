"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/messages";

// Read-only display of a generated enrollment link with a copy-to-clipboard
// button. The link is single-use; the admin shares it out-of-band.
export function EnrollmentLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t.admin.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable; the input is selectable as a fallback */
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{t.admin.linkLabel}</p>
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <Button type="button" variant="outline" size="icon" onClick={copy} aria-label={t.admin.copyLink}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t.admin.linkHint}</p>
    </div>
  );
}
