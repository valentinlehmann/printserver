"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { ScanJobSnapshot, ScanSettings } from "@/lib/scan/types";
import { t } from "@/lib/messages";

const TERMINAL: ScanJobSnapshot["state"][] = ["done", "error", "canceled"];
const POLL_INTERVAL_MS = 1000;

/**
 * Drives a scan: POST /api/scan to start, then poll /api/scan/[id]/status until
 * a terminal state. The result is downloaded from /api/scan/[id]/result.
 */
export function useScanJob() {
  const [snapshot, setSnapshot] = useState<ScanJobSnapshot | null>(null);
  const [starting, setStarting] = useState(false);
  const jobIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    // Clean up polling if the component unmounts.
    return () => {
      stoppedRef.current = true;
      clearTimer();
    };
  }, []);

  const poll = useCallback((jobId: string) => {
    const tick = async () => {
      if (stoppedRef.current) return;
      try {
        const res = await fetch(`/api/scan/${jobId}/status`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const snap = (await res.json()) as ScanJobSnapshot;
        setSnapshot(snap);
        if (!TERMINAL.includes(snap.state)) {
          timerRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        }
      } catch {
        setSnapshot((prev) =>
          prev ? { ...prev, state: "error", error: t.scan.failed } : prev,
        );
      }
    };
    void tick();
  }, []);

  const start = useCallback(
    async (settings: ScanSettings) => {
      stoppedRef.current = false;
      setStarting(true);
      setSnapshot(null);
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(settings),
        });
        if (!res.ok) {
          toast.error(t.scan.failed);
          return;
        }
        const { jobId } = (await res.json()) as { jobId: string };
        jobIdRef.current = jobId;
        setSnapshot({ id: jobId, state: "pending", pagesPulled: 0 });
        poll(jobId);
      } catch {
        toast.error(t.scan.failed);
      } finally {
        setStarting(false);
      }
    },
    [poll],
  );

  const cancel = useCallback(async () => {
    const jobId = jobIdRef.current;
    if (!jobId) return;
    stoppedRef.current = true;
    clearTimer();
    await fetch(`/api/scan/${jobId}`, { method: "DELETE" }).catch(() => {});
    setSnapshot((prev) => (prev ? { ...prev, state: "canceled" } : prev));
  }, []);

  const reset = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    jobIdRef.current = null;
    setSnapshot(null);
  }, []);

  // Derive from state (not the ref) so it's render-safe.
  const resultUrl = snapshot?.id ? `/api/scan/${snapshot.id}/result` : null;

  return { snapshot, starting, start, cancel, reset, resultUrl };
}
