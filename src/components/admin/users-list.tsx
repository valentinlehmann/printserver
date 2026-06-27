"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2Icon, LinkIcon } from "lucide-react";

import { reissueLinkAction } from "@/app/(app)/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnrollmentLink } from "@/components/admin/enrollment-link";
import { t } from "@/lib/messages";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function UsersList({ users }: { users: AdminUser[] }) {
  const [pending, startTransition] = useTransition();
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});

  function reissue(email: string) {
    setActiveEmail(email);
    startTransition(async () => {
      const result = await reissueLinkAction(email);
      if (result.ok) {
        setLinks((prev) => ({ ...prev, [email]: result.link }));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.admin.usersTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.admin.noUsers}</p>
        )}
        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="flex flex-col gap-3 py-3 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.name}</span>
                    {user.role === "admin" && (
                      <Badge variant="secondary">{t.admin.roleAdmin}</Badge>
                    )}
                  </div>
                  <span className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reissue(user.email)}
                  disabled={pending && activeEmail === user.email}
                >
                  {pending && activeEmail === user.email ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <LinkIcon />
                  )}
                  {t.admin.reissue}
                </Button>
              </div>
              {links[user.email] && <EnrollmentLink url={links[user.email]} />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
