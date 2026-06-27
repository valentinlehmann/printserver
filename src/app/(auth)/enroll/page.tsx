import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnrollForm } from "@/components/enroll-form";
import { t } from "@/lib/messages";

// Landing page for the admin-issued magic enrollment link. better-auth verifies
// the magic-link token (creating a session) and redirects here, where the user
// registers their passkey.
export default function EnrollPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t.auth.enrollTitle}</CardTitle>
        <CardDescription>{t.auth.enrollSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <EnrollForm />
      </CardContent>
    </Card>
  );
}
