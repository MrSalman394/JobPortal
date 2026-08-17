import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp,
  ArrowRight,
  Shield,
  Flame,
  Sparkles,
  BarChart3,
  Star,
} from "lucide-react";
import type { User, Job, Company } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalEmployers: number;
    totalEmployees: number;
    totalJobs: number;
    activeJobs: number;
    totalCompanies: number;
    totalApplications: number;
    ratingDistribution?: number[];
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: trends, isLoading: trendsLoading } = useQuery<{
    companyId: string;
    companyName: string;
    averageRating: number;
    reviewCount: number;
  }[]>({
    queryKey: ["/api/admin/feedback/trends"],
  });

  const { data: recentUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", "recent"],
  });

  const { data: recentJobs, isLoading: jobsLoading } = useQuery<(Job & { company?: Company })[]>({
    queryKey: ["/api/admin/jobs", "recent"],
  });

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style>{`
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes glow-intense { 0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 50px rgba(16,185,129,0.6); } }
        .animate-float { animation: float-slow 4s ease-in-out infinite; }
        .animate-glow { animation: glow-intense 3s ease-in-out infinite; }
      `}</style>

      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl py-12 md:py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-background to-emerald-500/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          
          <div className="relative px-6 md:px-8 space-y-4">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-600/20 to-transparent border border-green-600/30 backdrop-blur">
              <span className="text-sm font-bold text-green-600 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Platform Control
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground max-w-2xl leading-tight">
              Platform Overview
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Complete control and insights into your job portal ecosystem.
            </p>
          </div>
        </div>

        {/* Primary Stats - SHOCKING */}
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
              <Card className="border-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalUsers || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Total Users</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.activeJobs || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Active Jobs</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-500 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalCompanies || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Companies</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 hover-elevate">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-foreground">{stats?.totalApplications || 0}</div>
                  <div className="text-sm font-bold text-muted-foreground">Applications</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Role Breakdown */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600/30 to-cyan-500/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">JOB SEEKERS</p>
                  <p className="text-2xl font-black text-foreground">{stats?.totalEmployees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600/30 to-pink-500/30 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">EMPLOYERS</p>
                  <p className="text-2xl font-black text-foreground">{stats?.totalEmployers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-600/30 to-emerald-500/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold">TOTAL JOBS</p>
                  <p className="text-2xl font-black text-foreground">{stats?.totalJobs || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Star className="h-3 w-3 text-yellow-500" /> GLOBAL RATINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.ratingDistribution?.map((count, i) => ({
                        name: `${i + 1} Star`,
                        value: count
                      })) || []}
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats?.ratingDistribution?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${45 + (index * 40)}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends Section */}
        <Card className="border-0 bg-gradient-to-br from-card to-background hover-elevate">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" /> Company Feedback Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {trendsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="companyName" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="averageRating" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Flame className="h-6 w-6 text-blue-600 animate-pulse" /> Recent Users
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-3">
                {recentUsers.slice(0, 6).map((u) => (
                  <Card key={u.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={u.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-bold">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                          {u.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-gradient-to-br from-card to-background">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">No users yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Flame className="h-6 w-6 text-purple-600 animate-pulse" /> Recent Jobs
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/jobs">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {jobsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-0 bg-gradient-to-br from-card to-background">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentJobs && recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.slice(0, 6).map((job) => (
                  <Card key={job.id} className="border-0 bg-gradient-to-br from-card to-background hover-elevate overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-foreground text-sm truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.company?.name} • {formatDistanceToNow(new Date(job.createdAt!), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge
                          variant={job.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize text-xs flex-shrink-0"
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-gradient-to-br from-card to-background">
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">No jobs posted</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
