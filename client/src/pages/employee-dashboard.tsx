import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/stats-card";
import { JobCard } from "@/components/job-card";
import { useAuth } from "@/hooks/useAuth";
import { 
  Briefcase, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  FileText, 
  ArrowRight,
  GraduationCap,
  User,
  AlertCircle,
  Flame,
  Sparkles,
  TrendingUp,
  Building2,
} from "lucide-react";
import type { JobWithCompany, Application, Qualification, Company } from "@shared/schema";
import { GiveFeedback } from "@/components/give-feedback";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    matchingJobs: number;
  }>({
    queryKey: ["/api/employee/stats"],
  });

  const { data: qualifications, isLoading: qualLoading } = useQuery<Qualification[]>({
    queryKey: ["/api/qualifications"],
  });

  const { data: recommendedJobs, isLoading: jobsLoading } = useQuery<{ job: JobWithCompany; matchScore: number }[]>({
    queryKey: ["/api/jobs/recommended"],
  });

  const { data: recentApplications, isLoading: appsLoading } = useQuery<(Application & { job: JobWithCompany })[]>({
    queryKey: ["/api/applications", "recent"],
  });

  const { data: interactedCompanies, isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/employee/interacted-companies"],
  });

  const profileCompleteness = (() => {
    let score = 0;
    if (user?.firstName && user?.lastName) score += 20;
    if (user?.email) score += 20;
    if (user?.phone) score += 15;
    if (user?.location) score += 15;
    if (user?.bio) score += 10;
    if (qualifications && qualifications.length > 0) score += 20;
    return score;
  })();

  const hasIncompleteProfile = profileCompleteness < 80;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes glow-intense { 0%, 100% { box-shadow: 0 0 30px rgba(0,119,182,0.4), 0 0 60px rgba(0,119,182,0.2); } 50% { box-shadow: 0 0 50px rgba(0,119,182,0.6), 0 0 100px rgba(0,119,182,0.3); } }
        @keyframes pulse-scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        .animate-float { animation: float-slow 4s ease-in-out infinite; }
        .animate-glow { animation: glow-intense 3s ease-in-out infinite; }
        .animate-pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }
      `}</style>

      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          
          <div className="relative px-6 md:px-8 space-y-4">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-transparent border border-primary/30 backdrop-blur">
              <span className="text-sm font-bold text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Welcome back, {user?.firstName || "there"}!
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground max-w-2xl leading-tight">
              Your Dream Job Awaits
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Explore personalized opportunities matched with your unique qualifications and experience.
            </p>
          </div>
        </div>

        {/* Completion Alert */}
        {hasIncompleteProfile && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6 md:p-8 backdrop-blur group hover-elevate">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="font-black text-lg text-foreground">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your profile is {profileCompleteness}% complete. Complete it to unlock better job matches!
                  </p>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent" asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-1" /> Update Profile
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/qualifications">
                      <GraduationCap className="h-4 w-4 mr-1" /> Add Qualifications
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats - STUNNING CARDS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover-elevate overflow-hidden group">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Total Applications</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 hover-elevate overflow-hidden group">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.pendingApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Pending Review</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 hover-elevate overflow-hidden group">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.acceptedApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Accepted</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover-elevate overflow-hidden group">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.matchingJobs || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Matching Jobs</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Recommended Jobs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Flame className="h-6 w-6 text-primary animate-pulse" /> Recommended Jobs
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/jobs">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Skeleton className="h-14 w-14 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recommendedJobs && recommendedJobs.length > 0 ? (
                <div className="space-y-4">
                  {recommendedJobs?.slice(0, 5).map((item: any, idx) => {
                    const job = item.job || item;
                    const matchScore = item.matchScore;
                    if (!job || typeof job !== 'object' || !job.id) return null;
                    return (
                      <JobCard
                        key={job.id}
                        job={job}
                        matchScore={matchScore}
                        onView={() => window.location.href = `/jobs/${job.id}`}
                        onApply={() => window.location.href = `/jobs/${job.id}?apply=true`}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-card to-background">
                  <CardContent className="p-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-black text-lg text-foreground">No Recommendations Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Add qualifications to get personalized job recommendations.
                    </p>
                    <Button className="bg-gradient-to-r from-primary to-accent" asChild>
                      <Link href="/qualifications">Add Qualifications</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Interacted Companies */}
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" /> Companies
              </h2>
              {companiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                      <CardContent className="p-4">
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : interactedCompanies && interactedCompanies.length > 0 ? (
                <div className="space-y-3">
                  {interactedCompanies.map((company) => (
                    <Card key={company.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.industry}</p>
                          </div>
                        </div>
                        <GiveFeedback companyId={company.id} companyName={company.name} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-card to-background">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">Apply to jobs to interact with companies</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <h2 className="text-2xl font-black text-foreground">Quick Actions</h2>
            <div className="grid gap-4 space-y-3">
              <Card className="border-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover-elevate cursor-pointer overflow-hidden transition-all" onClick={() => window.location.href = '/cv'}>
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">View My CV</p>
                    <p className="text-xs text-muted-foreground">Download or preview</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover-elevate cursor-pointer overflow-hidden transition-all" onClick={() => window.location.href = '/jobs'}>
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Browse Jobs</p>
                    <p className="text-xs text-muted-foreground">Find opportunities</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 hover-elevate cursor-pointer overflow-hidden transition-all" onClick={() => window.location.href = '/applications'}>
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">My Applications</p>
                    <p className="text-xs text-muted-foreground">Track status</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
