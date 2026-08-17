import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { Review } from "@shared/schema";
import dashboardImage from "@assets/images/modern_job_portal_dashboard_interface.png";
import successImage from "@assets/images/business_success_celebration_moment.png";
import teamImage from "@assets/images/diverse_professionals_collaborating.png";
import hanzlaPic from "@assets/images/hanzla.png";
import mariamPic from "@assets/images/mariam.png";
import safiaPic from "@assets/images/safia.png";
import salmanPic from "@assets/images/salman.png";

const defaultStats = {
  activeJobs: 1,
  topCompanies: 1,
  jobSeekers: 1,
  successfulHires: 0,
};

const roleCards = [
  {
    title: "For candidates",
    eyebrow: "Profile-first discovery",
    description:
      "Build one polished profile, surface relevant openings, and track every application in one place.",
    icon: Search,
    tone: "from-sky-500/15 via-sky-500/5 to-transparent",
    bullets: [
      "Qualification-based job recommendations",
      "CV access, bookmarks, and application tracking",
      "Feedback and company review history",
    ],
  },
  {
    title: "For employers",
    eyebrow: "Smarter shortlists",
    description:
      "Post roles, manage applications, and focus faster on candidates who actually fit the brief.",
    icon: Building2,
    tone: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    bullets: [
      "Company profile and employer dashboard",
      "Match-aware candidate review flow",
      "Job, review, and shortlist visibility",
    ],
  },
  {
    title: "For admins",
    eyebrow: "Platform control",
    description:
      "Oversee users, jobs, applications, and feedback from a single operational command center.",
    icon: Shield,
    tone: "from-amber-500/15 via-amber-500/5 to-transparent",
    bullets: [
      "User, company, and job management",
      "Application and feedback monitoring",
      "Platform-wide health and reporting",
    ],
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Choose your role",
    description:
      "Start as a job seeker, employer, or admin so the experience adapts to what you need next.",
    icon: Users,
  },
  {
    step: "02",
    title: "Complete your foundation",
    description:
      "Candidates add qualifications and CV details. Employers create a company presence and publish roles.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Move work forward",
    description:
      "Discover jobs, review applications, leave feedback, and keep every interaction visible across the portal.",
    icon: TrendingUp,
  },
];

const teamMembers = [
  {
    name: "Salman Khan",
    role: "Software Engineering Student",
    note: "University of Wah Engineering College",
    contact: "+92 321 6230206",
    email: "salmankhanpubg5@gmail.com",
    image: salmanPic,
    accent: "text-sky-600 dark:text-sky-300",
  },
  {
    name: "Safia Batool",
    role: "Software Engineering Student",
    note: "University of Wah Engineering College",
    contact: "+92 313 5729534",
    email: "uw-23-sw-bs-024@wecue.edu.pk",
    image: safiaPic,
    accent: "text-rose-600 dark:text-rose-300",
  },
  {
    name: "Mariam Zaman",
    role: "Software Engineering Student",
    note: "University of Wah Engineering College",
    contact: "+92 307 7600549",
    email: "uw-23-sw-bs-049@wecue.edu.pk",
    image: mariamPic,
    accent: "text-amber-600 dark:text-amber-300",
  },
  {
    name: "Hanzla Shehzad",
    role: "Software Engineering Student",
    note: "University of Wah Engineering College",
    contact: "+92 306 9302388",
    email: "uw-23-sw-bs-031@wecue.edu.pk",
    image: hanzlaPic,
    accent: "text-emerald-600 dark:text-emerald-300",
  },
];

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    let startTime: number | null = null;
    const duration = 1200;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(target * progress));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return (
    <>
      {count.toLocaleString()}
      {suffix}
    </>
  );
}

function ReviewsShowcase() {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-hidden py-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card
            key={index}
            className="min-w-[320px] border-border/60 bg-card/70"
          >
            <CardContent className="space-y-4 p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-dashed border-border/70 bg-card/60">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Your first user story can start here
            </h3>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              The landing page is ready to showcase platform feedback as soon as
              new reviews arrive.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <div className="relative overflow-hidden py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent sm:w-32" />

      <div className="landing-marquee flex gap-6 whitespace-nowrap">
        {displayReviews.map((review, index) => (
          <Card
            key={`${review.id}-${index}`}
            className="inline-block min-w-[320px] max-w-[380px] whitespace-normal border-border/60 bg-card/85 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-1"
          >
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={`h-4 w-4 ${
                      starIndex < review.rating ? "fill-current" : "text-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                "{review.feedback}"
              </p>
              <div className="border-t border-border/70 pt-4">
                <p className="font-semibold text-foreground">
                  {review.userName || "Anonymous user"}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {review.userRole || "community member"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const { data: statsData } = useQuery<typeof defaultStats>({
    queryKey: ["/api/stats"],
  });

  const stats = statsData ?? defaultStats;
  const platformStats = [
    {
      label: "Open roles",
      value: stats.activeJobs,
      suffix: "+",
      icon: Briefcase,
    },
    {
      label: "Active companies",
      value: stats.topCompanies,
      suffix: "+",
      icon: Building2,
    },
    {
      label: "Job seekers",
      value: stats.jobSeekers,
      suffix: "+",
      icon: Users,
    },
    {
      label: "Successful hires",
      value: stats.successfulHires,
      suffix: "+",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <style>{`
        @keyframes landing-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -18px, 0); }
        }

        @keyframes landing-rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes landing-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .landing-grid {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), transparent 88%);
        }

        .dark .landing-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        }

        .landing-float {
          animation: landing-float 14s ease-in-out infinite;
        }

        .landing-rise {
          animation: landing-rise 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .landing-marquee {
          animation: landing-marquee 24s linear infinite;
        }

        .landing-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden">
          <div className="landing-grid absolute inset-x-0 top-0 h-[720px]" />
          <div className="absolute left-[-6rem] top-20 h-72 w-72 rounded-full bg-sky-500/15 blur-3xl landing-float" />
          <div
            className="absolute right-[-4rem] top-40 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl landing-float"
            style={{ animationDelay: "-5s" }}
          />
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]" />

          <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
            <div className="relative z-10 space-y-8 landing-rise">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-primary/20 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary backdrop-blur"
              >
                Designed for job seekers, employers, and admins
              </Badge>

              <div className="space-y-6">
                <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
                  A sharper way to hire and get hired.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  JobConnect turns a student-built job portal into a polished
                  front door for discovery, hiring, and platform oversight.
                  Candidates stay organized, employers move faster, and admins
                  keep the ecosystem healthy.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => setLocation("/register")}
                  className="h-12 rounded-full bg-primary px-7 text-sm font-semibold shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
                >
                  Create your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/login")}
                  className="h-12 rounded-full border-border/70 bg-background/80 px-7 text-sm font-semibold backdrop-blur"
                >
                  Sign in to continue
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Qualification-aware recommendations",
                  "Employer dashboards with shortlists",
                  "Admin oversight with platform metrics",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/60 bg-card/65 px-4 py-4 text-sm text-muted-foreground shadow-sm backdrop-blur"
                  >
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative z-10 landing-rise"
              style={{ animationDelay: "120ms" }}
            >
              <div className="absolute -left-8 top-10 hidden rounded-3xl border border-white/15 bg-slate-950/85 p-5 text-white shadow-2xl lg:block">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  Live platform snapshot
                </p>
                <div className="mt-4 grid gap-3">
                  {platformStats.slice(0, 2).map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">
                            <AnimatedCounter
                              target={stat.value}
                              suffix={stat.suffix}
                            />
                          </p>
                          <p className="text-xs text-white/60">{stat.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/60 bg-card/75 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur">
                <div className="rounded-[1.65rem] border border-white/10 bg-slate-950 p-6 text-white">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white/80">
                        JobConnect Experience
                      </p>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                        landing + dashboards
                      </p>
                    </div>
                    <Badge className="rounded-full bg-white/10 text-white">
                      Updated visual system
                    </Badge>
                  </div>

                  <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5">
                    <img
                      src={dashboardImage}
                      alt="JobConnect dashboard preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {platformStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <Icon className="h-4 w-4 text-white/70" />
                            <span className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-2xl font-semibold text-white">
                            <AnimatedCounter
                              target={stat.value}
                              suffix={stat.suffix}
                            />
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="relative mt-4 rounded-3xl border border-border/60 bg-background/90 p-5 shadow-xl backdrop-blur lg:absolute lg:-bottom-8 lg:right-4 lg:mt-0 lg:max-w-xs">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Candidate flow
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  From profile to shortlist in one connected system
                </h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      1
                    </span>
                    <p>Role-based onboarding keeps every user on the right path.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      2
                    </span>
                    <p>Qualifications, jobs, and applications stay connected.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-6">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {platformStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="landing-rise border-border/60 bg-card/75 shadow-sm backdrop-blur"
                  style={{ animationDelay: `${120 + index * 60}ms` }}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-semibold text-foreground">
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="roles" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <Badge
                variant="outline"
                className="rounded-full border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
              >
                Built for every role
              </Badge>
              <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                One portal, three focused experiences
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                The landing page now introduces the product through clear role
                stories instead of relying on oversized effects and repeated
                sections.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {roleCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.title}
                    className={`overflow-hidden border-border/60 bg-gradient-to-br ${card.tone} shadow-sm`}
                  >
                    <CardContent className="h-full space-y-6 p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background/85 text-foreground shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          {card.eyebrow}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {card.title}
                        </h3>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {card.bullets.map((item) => (
                          <div key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <p className="text-sm leading-6 text-foreground/85">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="workflow"
          className="border-y border-border/60 bg-muted/35 py-20 sm:py-24"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="space-y-5">
              <Badge
                variant="outline"
                className="rounded-full border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
              >
                Product flow
              </Badge>
              <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                A landing page that explains the journey in seconds
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Instead of stacking repeated feature blocks, the page now walks
                visitors through the real platform flow from onboarding to
                outcomes.
              </p>

              <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 shadow-sm">
                <img
                  src={teamImage}
                  alt="Professionals collaborating"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {workflowSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="border-border/60 bg-card/80">
                    <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-4 sm:w-44 sm:flex-col sm:items-start sm:gap-6">
                        <span className="text-3xl font-semibold text-primary">
                          {item.step}
                        </span>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {item.description}
                        </p>
                        {index < workflowSteps.length - 1 ? (
                          <div className="pt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            Next step follows inside the same portal
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="space-y-5">
              <Badge
                variant="outline"
                className="rounded-full border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
              >
                Candidate experience
              </Badge>
              <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                Clear paths for applicants, not just flashy promises
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Candidates can manage their profile, qualifications, CV, saved
                jobs, and application history through a system that feels
                connected from the first click.
              </p>
              <div className="space-y-4">
                {[
                  "Profile completeness nudges that encourage better matches",
                  "Qualification-aware recommendations and match scoring",
                  "Bookmarks, applications, and feedback history in one dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm leading-7 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-3 shadow-lg">
              <img
                src={successImage}
                alt="Celebrating a successful hiring moment"
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/35 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-3 shadow-lg lg:order-1">
              <img
                src={teamImage}
                alt="Team discussing hiring decisions"
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>
            <div className="space-y-5 lg:order-2">
              <Badge
                variant="outline"
                className="rounded-full border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
              >
                Employer experience
              </Badge>
              <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                Hiring tools that feel operational, not improvised
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Employers get a more credible first impression: company setup,
                job publishing, application review, candidate shortlists, and
                feedback visibility are now represented with a calmer, more
                professional visual language.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Company presence",
                    detail: "Profile, branding, and review-aware reputation.",
                  },
                  {
                    title: "Application review",
                    detail: "Recent applications, status control, and shortlists.",
                  },
                  {
                    title: "Hiring analytics",
                    detail: "Stats cards and review insights for decision support.",
                  },
                  {
                    title: "Faster posting flow",
                    detail: "Direct path from setup to publishing the first role.",
                  },
                ].map((item) => (
                  <Card key={item.title} className="border-border/60 bg-card/80">
                    <CardContent className="space-y-2 p-5">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {item.detail}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <Badge className="rounded-full bg-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-primary shadow-none">
                Loved by users
              </Badge>
              <h2 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
                What Our Community Says
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                Join professionals transforming their careers through
                JobConnect.
              </p>
            </div>

            <ReviewsShowcase />
          </div>
        </section>

        <section
          id="team"
          className="border-t border-border/60 bg-muted/35 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-5">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em]"
                >
                  Contact and team
                </Badge>
                <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                  A more grounded finish for the page
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  The closing section keeps the human story of the project while
                  organizing contact details and team profiles into a cleaner,
                  more credible presentation.
                </p>

                <div className="grid gap-4">
                  <Card className="border-border/60 bg-card/80">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                          Email
                        </p>
                        <a
                          href="mailto:salmankhanpubg5@gmail.com"
                          className="mt-1 block text-base font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          salmankhanpubg5@gmail.com
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/80">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                          Call
                        </p>
                        <a
                          href="tel:+923216230206"
                          className="mt-1 block text-base font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          +92 321 6230206
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 bg-card/80">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                          Based in
                        </p>
                        <p className="mt-1 text-base font-semibold text-foreground">
                          University of Wah Engineering College
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {teamMembers.map((member) => (
                  <Card
                    key={member.email}
                    className="overflow-hidden border-border/60 bg-card/80 shadow-sm"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <p className={`text-sm font-medium ${member.accent}`}>
                          {member.role}
                        </p>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {member.note}
                      </p>
                      <div className="space-y-2 border-t border-border/70 pt-4 text-sm">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.email}</span>
                        </a>
                        <a
                          href={`tel:${member.contact.replace(/\s+/g, "")}`}
                          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Phone className="h-4 w-4" />
                          <span>{member.contact}</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(135deg,rgba(2,132,199,0.12),rgba(16,185,129,0.08),rgba(255,255,255,0.2))] p-8 shadow-lg sm:p-12">
              <div className="max-w-3xl space-y-6">
                <Badge className="rounded-full bg-background/70 text-foreground backdrop-blur">
                  Front-end refresh
                </Badge>
                <h2 className="font-serif text-4xl text-foreground sm:text-5xl">
                  Ready for a stronger first impression
                </h2>
                <p className="text-lg leading-8 text-muted-foreground">
                  The main landing page now tells a clearer product story,
                  reads better on mobile, and uses motion more intentionally so
                  visitors focus on the platform instead of the effects.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => setLocation("/register")}
                    className="h-12 rounded-full px-7 text-sm font-semibold"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation("/give-feedback")}
                    className="h-12 rounded-full border-border/70 bg-background/70 px-7 text-sm font-semibold"
                  >
                    Share feedback
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">JobConnect</p>
              <p>Designed for a cleaner portal first impression.</p>
            </div>
          </div>
          <p>
            Copyright 2025 JobConnect. Crafted by Salman Khan, Safia Batool,
            Mariam Zaman, and Hanzla Shehzad.
          </p>
        </div>
      </footer>
    </div>
  );
}
