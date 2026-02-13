import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Welcome to InvoiceNest
      </h2>
      <p className="text-muted-foreground">
        Hello, {session.user.name}! Your dashboard is ready.
      </p>
    </div>
  );
}
