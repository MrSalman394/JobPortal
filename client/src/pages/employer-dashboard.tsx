import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/stats-card";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Building2,
  Eye,
  AlertCircle,
  Flame,
  Sparkles,
  TrendingUp,
  Star,
  BarChart3,
} from "lucide-react";
import type { Job, Application, Company, User, CompanyReview } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

type ApplicationWithUser = Application & { user: User; job: Job };
type ReviewWithUser = CompanyReview & { user: User };

export default function EmployerDashboard() {
  const { user } = useAuth();

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ["/api/employer/company"],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<ReviewWithUser[]>({
    queryKey: company?.id ? [`/api/companies/${company.id}/reviews`] : [],
    enabled: !!company?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalViews: number;
    reviewStats?: {
      ratings: number[];
      average: number;
    }
  }>({
    queryKey: ["/api/employer/stats"],
  });

  const { data: recentJobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/employer/jobs", "recent"],
  });

  const { data: recentApplications, isLoading: appsLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/employer/applications", "recent"],
  });

  const { data: shortlistedCandidates, isLoading: shortlistLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/employer/applications/shortlisted"],
  });

  const hasCompany = !!company;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes glow-intense { 0%, 100% { box-shadow: 0 0 30px rgba(139,92,246,0.4); } 50% { box-shadow: 0 0 50px rgba(139,92,246,0.6); } }
        .animate-float { animation: float-slow 4s ease-in-out infinite; }
        .animate-glow { animation: glow-intense 3s ease-in-out infinite; }
      `}</style>

      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-background to-pink-500/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          
          <div className="relative px-6 md:px-8 space-y-4 flex items-start justify-between">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-transparent border border-purple-600/30 backdrop-blur">
                <span className="text-sm font-bold text-purple-600 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Employer Portal
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground max-w-2xl leading-tight">
                {company?.name ? `Welcome to ${company.name}` : "Build Your Dream Team"}
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-xl">
                {company?.name ? "Manage jobs and find qualified candidates" : "Post jobs and find the perfect candidates"}
              </p>
            </div>
            {company?.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-20 w-20 rounded-xl object-cover shadow-lg" />
            )}
          </div>
        </div>

        {/* Company Setup Alert */}
        {!hasCompany && !companyLoading && (
          <div className="relative overflow-hidden rounded-2xl border border-purple-600/30 bg-gradient-to-br from-purple-600/5 to-pink-500/5 p-6 md:p-8 backdrop-blur group hover-elevate">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-500/10" />
            <div className="relative flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg text-foreground">Set Up Your Company Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your company profile to unlock full hiring capabilities and attract top talent.
                </p>
                <Button className="mt-3 bg-gradient-to-r from-purple-600 to-pink-500" asChild>
                  <Link href="/employer/company">
                    <Building2 className="mr-2 h-4 w-4" />
                    Set Up Company
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats - STUNNING */}
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
              <Card className="border-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.activeJobs || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Active Jobs</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Applications</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.pendingApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Pending Review</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalViews || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Total Views</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Analytics Section */}
            <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" /> Company Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {statsLoading ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-black text-foreground">
                        {stats?.reviewStats?.average.toFixed(1) || "0.0"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.round(stats?.reviewStats?.average || 0) ? "fill-current" : ""}`} 
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">Average Employee Rating</p>
                      </div>
                    </div>
                    
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.reviewStats?.ratings.map((count, i) => ({
                            rating: `${i + 1} Star`,
                            count
                          })) || []}
                          layout="vertical"
                          margin={{ left: 10, right: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="rating" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 'bold' }}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`${value} reviews`, 'Count']}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {stats?.reviewStats?.ratings.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${280 - (index * 20)}, 70%, 60%)`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Flame className="h-6 w-6 text-purple-600 animate-pulse" /> Recent Jobs
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/employer/jobs">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {jobsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                      <CardContent className="p-6">
                        <div className="flex justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentJobs && recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobs.slice(0, 5).map((job) => (
                    <Card key={job.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <Link 
                              href={`/employer/jobs/${job.id}`}
                              className="font-bold text-foreground hover:text-primary transition-colors block truncate text-base"
                              data-testid={`link-job-${job.id}`}
                            >
                              {job.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                              <span>{job.location || 'Remote'}</span>
                              <span className="capitalize">{job.type?.replace('-', ' ')}</span>
                              {job.createdAt && (
                                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                              )}
                            </div>
                          </div>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="capitalize flex-shrink-0">
                            {job.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-card to-background">
                  <CardContent className="p-12 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-500/20 flex items-center justify-center mx-auto">
                      <Briefcase className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-black text-lg text-foreground">No Jobs Posted Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Post your first job to start receiving applications.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500" asChild disabled={!hasCompany}>
                      <Link href="/employer/jobs/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post Job
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shortlisted Candidates */}
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-600" /> Shortlisted
              </h2>
              
              {shortlistLoading ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : shortlistedCandidates && shortlistedCandidates.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {shortlistedCandidates.map((app) => (
                    <Card key={app.id} className="border-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 hover-elevate overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={app.user.profileImageUrl || undefined} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-yellow-600 to-orange-500 text-white text-xs font-bold">
                              {app.user.firstName?.[0]}{app.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground text-sm truncate">
                              {app.user.firstName} {app.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.job.title}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="mt-4 border-0 bg-gradient-to-br from-card to-background">
                  <CardContent className="p-6 text-center">
                    <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No shortlisted candidates yet</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Employee Feedback */}
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-yellow-600" /> Employee Feedback
              </h2>
              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                      <CardContent className="p-4">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="max-h-[240px] overflow-y-auto pr-2 space-y-3">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user.profileImageUrl || undefined} />
                              <AvatarFallback>{review.user.firstName?.[0]}{review.user.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm">{review.user.firstName} {review.user.lastName}</p>
                              <div className="flex text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : 'No date'}</span>
                        </div>
                        {review.title && <p className="font-bold text-xs mt-2">{review.title}</p>}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 bg-gradient-to-br from-card to-background">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No employee feedback yet</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Applications */}
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" /> Recent Applications
              </h2>
            
            {appsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentApplications && recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.slice(0, 6).map((app) => (
                  <Card key={app.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={app.user.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-white text-xs font-bold">
                            {app.user.firstName?.[0]}{app.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground text-sm truncate">
                            {app.user.firstName} {app.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                          {app.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-gradient-to-br from-card to-background">
                <CardContent className="p-8 text-center space-y-3">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-bold text-foreground">No Applications Yet</h3>
                  <p className="text-xs text-muted-foreground">Post a job to receive applications</p>
                </CardContent>
              </Card>
            )}
            
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/employer/applications">
                View All Applications <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
