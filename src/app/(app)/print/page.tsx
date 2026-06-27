import { CapabilitiesBanner } from "@/components/capabilities-banner";
import { PrintSettingsForm } from "@/components/print/print-settings-form";
import { getPrinterCapabilities } from "@/lib/printer/capabilities";
import { t } from "@/lib/messages";

export const runtime = "nodejs";

export default async function PrintPage() {
  const capabilities = await getPrinterCapabilities();

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {capabilities.source === "fallback" && (
        <CapabilitiesBanner message={t.printer.offlineBanner} />
      )}
      <PrintSettingsForm capabilities={capabilities} />
    </div>
  );
}
