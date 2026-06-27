"use client";

import { useActionState } from "react";
import { Loader2Icon, UserPlusIcon } from "lucide-react";

import { createUserAction } from "@/app/(app)/admin/actions";
import { ADMIN_INITIAL_RESULT } from "@/app/(app)/admin/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnrollmentLink } from "@/components/admin/enrollment-link";
import { t } from "@/lib/messages";

export function CreateUserCard() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    ADMIN_INITIAL_RESULT,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.admin.createUserTitle}</CardTitle>
        <CardDescription>{t.admin.createUserDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t.admin.nameLabel}</Label>
            <Input id="name" name="name" required autoComplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t.admin.emailLabel}</Label>
            <Input id="email" name="email" type="email" required autoComplete="off" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <UserPlusIcon />}
            {isPending ? t.admin.creating : t.admin.createButton}
          </Button>
        </form>

        {state && !state.ok && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state && state.ok && <EnrollmentLink url={state.link} />}
      </CardContent>
    </Card>
  );
}
