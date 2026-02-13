import Link from "next/link";
import { Users, FileText } from "lucide-react";
import {
  getRequiredOrganization,
  getFullOrganization,
} from "@/lib/queries/workspace";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const { session, organizationId } = await getRequiredOrganization();
  const organization = await getFullOrganization(organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to {organization?.name ?? "your workspace"}
        </h2>
        <p className="text-muted-foreground">
          Hello, {session.user.name}! Your invoicing dashboard is ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Info</CardTitle>
          <CardDescription>Your current workspace details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Name
              </dt>
              <dd className="text-sm">{organization?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Slug
              </dt>
              <dd className="text-sm">{organization?.slug ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Members
              </dt>
              <dd className="text-sm">
                {organization?.members?.length ?? 0}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This is where your invoicing dashboard will appear.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/customers">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add Customer
              </CardTitle>
              <CardDescription>
                Add your first customer to start invoicing
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Invoice
              </CardTitle>
              <CardDescription>
                Create and send professional invoices
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
