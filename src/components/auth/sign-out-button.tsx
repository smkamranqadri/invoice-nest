"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sign out
    </Button>
  );
}
