import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Building2,
  Users,
  Globe,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { CompanyReviews } from "@/components/company-reviews";
import type { JobWithCompany, Application, Qualification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const shouldShowApply = urlParams.get("apply") === "true";

  const { data: jobData, isLoading } = useQuery<{ job: JobWithCompany; matchScore: number }>({
    queryKey: [`/api/jobs/${id}`],
  });

  const { data: qualifications } = useQuery<Qualification[]>({
    queryKey: ["/api/qualifications"],
  });

  const { data: existingApplication } = useQuery<Application | null>({
    queryKey: [`/api/applications/job/${id}`],
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
  }, [qualifications, id]);

  const applyMutation = useMutation({
    mutationFn: async (data: { coverLetter?: string }) => {
      const res = await apiRequest("POST", `/api/jobs/${id}/apply`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the employer.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/applications/job/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      setShowApplyDialog(false);
      setCoverLetter("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!jobData?.job) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Job Not Found</h2>
        <p className="text-muted-foreground mt-2">This job listing may have been removed.</p>
        <Button className="mt-4" onClick={() => setLocation("/jobs")}>
          Browse Other Jobs
        </Button>
      </div>
    );
  }

  const { job, matchScore } = jobData;
  const isQualified = matchScore >= 70;
  const hasApplied = !!existingApplication;

  const formatSalary = (min?: number | null, max?: number | null, currency = 'USD') => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency, 
      maximumFractionDigits: 0 
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return min ? `From ${formatter.format(min)}` : `Up to ${formatter.format(max!)}`;
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'USD');
  const companyInitials = job.company?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => setLocation("/jobs")}
        className="mb-2"
        data-testid="button-back-to-jobs"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-20 w-20 rounded-lg flex-shrink-0">
              <AvatarImage 
                src={job.company?.logoUrl || undefined} 
                alt={job.company?.name}
                className="object-cover rounded-lg"
              />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-2xl font-semibold">
                {companyInitials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground" data-testid="job-title">
                    {job.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">{job.company?.name}</p>
                </div>
                <Badge 
                  variant={isQualified ? "default" : "secondary"}
                  className={`text-sm ${isQualified ? "bg-success text-success-foreground" : ""}`}
                  data-testid="match-badge"
                >
                  {isQualified ? (
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                  )}
                  {matchScore}% Match
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-muted-foreground">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.type && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.type.replace('-', ' ')}</span>
                  </div>
                )}
                {salary && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    <span>{salary}</span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {hasApplied ? (
                  <Badge variant="secondary" className="px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Applied
                  </Badge>
                ) : (
                  <Button
                    onClick={() => setShowApplyDialog(true)}
                    disabled={!isQualified}
                    data-testid="button-apply"
                  >
                    {isQualified ? "Apply Now" : "Not Qualified"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {job.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap">{job.responsibilities}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Qualification Match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Match Score</span>
                <span className={`font-semibold ${isQualified ? 'text-success' : 'text-muted-foreground'}`}>
                  {matchScore}%
                </span>
              </div>
              <Progress value={matchScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {isQualified 
                  ? "Great match! Your qualifications align well with this position."
                  : "Add more qualifications to improve your match score for this role."}
              </p>
              {!isQualified && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="/qualifications" data-testid="link-add-qualifications">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Add Qualifications
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">About {job.company?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.company?.industry && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company.industry}</span>
                </div>
              )}
              {job.company?.size && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{job.company.size} employees</span>
                </div>
              )}
              {job.company?.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              {job.company?.description && (
                <p className="text-sm text-muted-foreground pt-2">
                  {job.company.description}
                </p>
              )}
            </CardContent>
          </Card>

          {job.company?.id && (
            <CompanyReviews companyId={job.company.id} />
          )}
        </div>
      </div>

      <Dialog open={showApplyDialog || (shouldShowApply && !hasApplied && isQualified)} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your application to {job.company?.name}. Your profile and qualifications will be shared with the employer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Cover Letter (Optional)
              </label>
              <Textarea
                placeholder="Tell the employer why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="mt-2"
                rows={6}
                data-testid="textarea-cover-letter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => applyMutation.mutate({ coverLetter })}
              disabled={applyMutation.isPending}
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
