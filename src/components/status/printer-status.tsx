"use client";

import { useEffect, useState } from "react";
import {
  PrinterIcon,
  RefreshCwIcon,
  CircleIcon,
  FileTextIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PrinterStatus, PrinterRunState } from "@/lib/printer/status";
import { t } from "@/lib/messages";

const POLL_MS = 5000;

const STATE_LABEL: Record<PrinterRunState, string> = {
  idle: t.status.stateIdle,
  processing: t.status.stateProcessing,
  stopped: t.status.stateStopped,
  offline: t.status.stateOffline,
};

const STATE_COLOR: Record<PrinterRunState, string> = {
  idle: "text-emerald-600",
  processing: "text-blue-600",
  stopped: "text-amber-600",
  offline: "text-muted-foreground",
};

const JOB_STATE_LABEL: Record<string, string> = {
  pending: t.status.jobPending,
  "pending-held": t.status.jobHeld,
  processing: t.status.jobProcessing,
  "processing-stopped": t.status.jobHeld,
  completed: t.status.jobCompleted,
  canceled: t.status.jobCanceled,
  aborted: t.status.jobAborted,
};

const REASON_LABEL: Record<string, string> = {
  "media-empty": t.status.reasonMediaEmpty,
  "media-needed": t.status.reasonMediaNeeded,
  "media-jam": t.status.reasonMediaJam,
  "marker-supply-low": t.status.reasonMarkerSupplyLow,
  "marker-supply-empty": t.status.reasonMarkerSupplyEmpty,
  "cover-open": t.status.reasonCoverOpen,
  "door-open": t.status.reasonDoorOpen,
  paused: t.status.reasonPaused,
  offline: t.status.reasonOffline,
  shutdown: t.status.reasonShutdown,
};

function reasonLabel(reason: string): string {
  const base = reason.replace(/-(warning|report|error)$/, "");
  return REASON_LABEL[reason] ?? REASON_LABEL[base] ?? base.replace(/-/g, " ");
}

function jobStateLabel(state: string): string {
  return JOB_STATE_LABEL[state] ?? state;
}

export function PrinterStatusView({ initial }: { initial: PrinterStatus }) {
  const [status, setStatus] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [iconError, setIconError] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/printer/status", { cache: "no-store" });
      if (res.ok) setStatus((await res.json()) as PrinterStatus);
    } catch {
      /* keep last state */
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Printer + state */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
            {status.hasIcon && !iconError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/api/printer/icon"
                alt={status.model}
                className="size-14 object-contain"
                onError={() => setIconError(true)}
              />
            ) : (
              <PrinterIcon className="size-8 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{status.model}</p>
            <div className={`flex items-center gap-1.5 text-sm ${STATE_COLOR[status.state]}`}>
              <CircleIcon className="size-2.5 fill-current" />
              {STATE_LABEL[status.state]}
            </div>
            {status.stateReasons.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {status.stateReasons.map((r) => (
                  <Badge key={r} variant="secondary">
                    {reasonLabel(r)}
                  </Badge>
                ))}
              </div>
            )}
            {status.stateMessage && (
              <p className="mt-1 text-xs text-muted-foreground">
                {status.stateMessage}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCwIcon className={refreshing ? "animate-spin" : undefined} />
            {t.status.refresh}
          </Button>
        </CardContent>
      </Card>

      {!status.online && (
        <p className="text-sm text-muted-foreground">{t.status.offlineHint}</p>
      )}

      {/* Ink / marker levels */}
      {status.markers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.status.ink}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {status.markers.map((m, i) => (
              <div key={`${m.name}-${i}`} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{m.name}</span>
                  <span className="text-muted-foreground">{m.level}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${m.level}%`,
                      backgroundColor: m.color || "var(--color-foreground)",
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Queue */}
      <Card>
        <CardHeader>
          <CardTitle>{t.status.queue}</CardTitle>
        </CardHeader>
        <CardContent>
          {status.jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.status.noJobs}</p>
          ) : (
            <ul className="divide-y">
              {status.jobs.map((job) => {
                const failed = job.state === "aborted";
                return (
                  <li
                    key={job.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {job.name || `#${job.id}`}
                        </p>
                        {job.user && (
                          <p className="truncate text-xs text-muted-foreground">
                            {job.user}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={failed ? "destructive" : "secondary"}>
                        {jobStateLabel(job.state)}
                      </Badge>
                      {job.reasons.length > 0 && (
                        <span className="text-right text-xs text-muted-foreground">
                          {job.reasons.map(reasonLabel).join(", ")}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
