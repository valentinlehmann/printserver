import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/messages";

// TODO(M3/M4): replace this placeholder with the capability-driven print form.
export default function PrintPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.print.title}</CardTitle>
        <CardDescription>{t.print.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        In Vorbereitung …
      </CardContent>
    </Card>
  );
}
