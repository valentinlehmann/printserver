import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/messages";

// TODO(M5/M6): replace this placeholder with the capability-driven scan form.
export default function ScanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.scan.title}</CardTitle>
        <CardDescription>{t.scan.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        In Vorbereitung …
      </CardContent>
    </Card>
  );
}
