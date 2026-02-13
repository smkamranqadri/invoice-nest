import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">InvoiceNest</h1>
          <p className="text-sm text-muted-foreground">
            Invoicing made simple for teams
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
