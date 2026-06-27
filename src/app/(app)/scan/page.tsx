import { CapabilitiesBanner } from "@/components/capabilities-banner";
import { ScanSettingsForm } from "@/components/scan/scan-settings-form";
import { getScannerCapabilities } from "@/lib/scan/capabilities";
import { t } from "@/lib/messages";

export const runtime = "nodejs";

export default async function ScanPage() {
  const capabilities = await getScannerCapabilities();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {capabilities.source === "fallback" && (
        <CapabilitiesBanner message={t.printer.scannerOfflineBanner} />
      )}
      <ScanSettingsForm capabilities={capabilities} />
    </div>
  );
}
