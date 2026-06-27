"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, FingerprintIcon } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export function EnrollForm() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  async function handleAddPasskey() {
    setLoading(true);
    try {
      const result = await authClient.passkey.addPasskey({
        authenticatorAttachment: "platform",
      });
      if (result?.error) {
        toast.error(t.auth.enrollFailed);
        return;
      }
      toast.success(t.auth.enrollSuccess);
      router.replace("/print");
    } catch {
      toast.error(t.auth.enrollFailed);
    } finally {
      setLoading(false);
    }
  }

  // The magic link creates the session before redirecting here; if it is
  // missing the link was invalid or already used.
  if (!isPending && !session) {
    return (
      <p className="text-sm text-destructive">{t.auth.enrollInvalidToken}</p>
    );
  }

  return (
    <Button
      onClick={handleAddPasskey}
      disabled={loading || isPending}
      className="w-full"
      size="lg"
    >
      {loading ? <Loader2Icon className="animate-spin" /> : <FingerprintIcon />}
      {loading ? t.auth.enrolling : t.auth.enrollButton}
    </Button>
  );
}
