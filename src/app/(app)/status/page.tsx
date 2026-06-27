import { PrinterStatusView } from "@/components/status/printer-status";
import { getPrinterStatus } from "@/lib/printer/status";

export const runtime = "nodejs";

export default async function StatusPage() {
  const initial = await getPrinterStatus();
  return <PrinterStatusView initial={initial} />;
}
