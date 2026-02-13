import Link from "next/link";
import {
  FileText,
  Users,
  Clock,
  Shield,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Workspace Collaboration",
    description:
      "Invite your team and work together in shared workspaces with role-based access.",
  },
  {
    icon: FileText,
    title: "Create & Send Invoices",
    description:
      "Generate professional invoices in seconds and send them directly to your customers.",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    description:
      "Know exactly who owes what with live payment status updates across your team.",
  },
  {
    icon: Shield,
    title: "Self-Hosted & Secure",
    description:
      "Keep full control of your data. Deploy on your own infrastructure with zero vendor lock-in.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Receipt className="size-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            InvoiceNest
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center md:py-32">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Invoicing built for{" "}
            <span className="text-primary">teams that ship</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Create invoices, send them to customers, and know exactly who owes
            what — without spreadsheets or expensive SaaS tools.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get Started
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything your team needs
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              A simple, powerful toolkit to manage invoicing across your
              organization.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-lg border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <feature.icon className="size-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center md:px-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to ditch the spreadsheets?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Set up your first workspace in under a minute. No credit card
            required.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Create Your Workspace
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="size-4" />
            <span>InvoiceNest</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link
              href="/sign-up"
              className="transition-colors hover:text-foreground"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} InvoiceNest
          </p>
        </div>
      </footer>
    </div>
  );
}
