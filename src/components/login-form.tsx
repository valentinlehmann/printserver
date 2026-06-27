"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, KeyRoundIcon } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.passkey();
      if (error) {
        toast.error(t.auth.loginFailed);
        return;
      }
      const redirect = searchParams.get("redirect") ?? "/print";
      router.replace(redirect);
    } catch {
      toast.error(t.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSignIn} disabled={loading} className="w-full" size="lg">
      {loading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <KeyRoundIcon />
      )}
      {loading ? t.auth.signingIn : t.auth.signInWithPasskey}
    </Button>
  );
}
