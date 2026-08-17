import { useLocation } from "wouter";
import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { label: "Roles", href: "#roles" },
  { label: "Workflow", href: "#workflow" },
  { label: "Reviews", href: "#reviews" },
  { label: "Team", href: "#team" },
];

export function Navbar() {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-[100] border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card/80 text-primary shadow-sm">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-semibold text-foreground">JobConnect</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Hiring portal
            </p>
          </div>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button
            onClick={() => setLocation("/give-feedback")}
            variant="outline"
            size="sm"
            className="hidden rounded-full border-border/70 bg-background/70 px-4 text-sm font-medium sm:inline-flex"
          >
            Feedback
          </Button>
          <Button
            onClick={() => setLocation("/login")}
            variant="outline"
            size="sm"
            className="rounded-full border-border/70 bg-background/70 px-4 text-sm font-medium"
          >
            Sign In
          </Button>
          <Button
            onClick={() => setLocation("/register")}
            size="sm"
            className="rounded-full px-4 text-sm font-medium shadow-sm"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
