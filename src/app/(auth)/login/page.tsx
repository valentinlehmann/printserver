import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { t } from "@/lib/messages";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t.auth.loginTitle}</CardTitle>
        <CardDescription>{t.auth.loginSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* useSearchParams requires a Suspense boundary. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {t.auth.noPasskeyHint}
      </CardFooter>
    </Card>
  );
}
