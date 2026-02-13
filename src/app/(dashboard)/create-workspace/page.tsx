import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";

export default async function CreateWorkspacePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // If user already has an active org, redirect to dashboard
  if (session.session.activeOrganizationId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your workspace
          </h1>
          <p className="text-muted-foreground">
            Set up your company workspace to start managing invoices
          </p>
        </div>
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
