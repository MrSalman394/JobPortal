import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, Briefcase, CheckCircle, XCircle, Bookmark } from "lucide-react";
import type { JobWithCompany } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JobCardProps {
  job: JobWithCompany;
  matchScore?: number;
  onApply?: () => void;
  onView?: () => void;
  showApplyButton?: boolean;
  isApplied?: boolean;
  isBookmarked?: boolean;
}

export function JobCard({ 
  job, 
  matchScore, 
  onApply, 
  onView, 
  showApplyButton = true,
  isApplied = false,
  isBookmarked = false,
}: JobCardProps) {
  const { toast } = useToast();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        isBookmarked ? "DELETE" : "POST",
        `/api/bookmarks/${job.id}`
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Removed from Bookmarks" : "Saved to Bookmarks",
      });
    },
  });

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
  const isQualified = matchScore !== undefined && matchScore >= 70;
  const companyInitials = job.company?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';

  const getJobTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'full-time': return 'default';
      case 'part-time': return 'secondary';
      case 'contract': return 'outline';
      case 'internship': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="overflow-visible hover-elevate group" data-testid={`job-card-${job.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 rounded-lg flex-shrink-0">
            <AvatarImage 
              src={job.company?.logoUrl || undefined} 
              alt={job.company?.name}
              className="object-cover rounded-lg"
            />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-lg font-semibold">
              {companyInitials}
            </AvatarFallback>
          </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <h3 
                      className="text-lg font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={onView}
                      data-testid={`job-title-${job.id}`}
                    >
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground">{job.company?.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${isBookmarked ? "text-primary" : "text-muted-foreground"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        bookmarkMutation.mutate();
                      }}
                      disabled={bookmarkMutation.isPending}
                    >
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
                    </Button>
                    {matchScore !== undefined && (
                      <Badge 
                        variant={isQualified ? "default" : "secondary"}
                        className={`flex-shrink-0 ${isQualified ? "bg-success text-success-foreground" : ""}`}
                        data-testid={`match-score-${job.id}`}
                      >
                        {isQualified ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {matchScore}% Match
                      </Badge>
                    )}
                  </div>
                </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.type && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span className="capitalize">{job.type.replace('-', ' ')}</span>
                </div>
              )}
              {salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span>{salary}</span>
                </div>
              )}
              {job.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.requiredSkills.slice(0, 4).map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.requiredSkills.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {showApplyButton && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onView}
                  data-testid={`button-view-${job.id}`}
                >
                  View Details
                </Button>
                {isApplied ? (
                  <Badge variant="secondary">Applied</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={onApply}
                    disabled={matchScore !== undefined && !isQualified}
                    data-testid={`button-apply-${job.id}`}
                  >
                    {matchScore !== undefined && !isQualified ? "Not Qualified" : "Apply Now"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
