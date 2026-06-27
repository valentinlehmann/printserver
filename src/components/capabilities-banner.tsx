import { TriangleAlertIcon } from "lucide-react";

// Shown when capabilities came from the static fallback (printer unreachable),
// so the user knows the offered options are defaults, not live device state.
export function CapabilitiesBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
    >
      <TriangleAlertIcon className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
