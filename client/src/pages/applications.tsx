import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  MapPin,
  Briefcase,
  Trash2,
} from "lucide-react";
import type { Application, JobWithCompany } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ApplicationWithJob = Application & { job: JobWithCompany };

export default function Applications() {
  const { toast } = useToast();
  const { data: applications, isLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applications"],
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Application Withdrawn" });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      case "reviewed": return <Eye className="h-4 w-4 text-primary" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-success/10 text-success";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "reviewed": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const companyInitials = app.job?.company?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';
            
            return (
              <Card key={app.id} className="overflow-visible hover-elevate" data-testid={`application-${app.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 rounded-lg flex-shrink-0">
                      <AvatarImage 
                        src={app.job?.company?.logoUrl || undefined} 
                        alt={app.job?.company?.name}
                        className="object-cover rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-lg font-semibold">
                        {companyInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0">
                          <Link 
                            href={`/jobs/${app.jobId}`}
                            className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                            data-testid={`link-job-${app.jobId}`}
                          >
                            {app.job?.title}
                          </Link>
                          <p className="text-muted-foreground">{app.job?.company?.name}</p>
                        </div>
                        <Badge className={`capitalize flex-shrink-0 ${getStatusColor(app.status || 'pending')}`}>
                          {getStatusIcon(app.status || 'pending')}
                          <span className="ml-1">{app.status}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                        {app.job?.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{app.job.location}</span>
                          </div>
                        )}
                        {app.job?.type && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span className="capitalize">{app.job.type.replace('-', ' ')}</span>
                          </div>
                        )}
                        {app.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                          </div>
                        )}
                        {app.matchScore && (
                          <Badge variant="secondary" className="text-xs">
                            {app.matchScore}% Match
                          </Badge>
                        )}
                      </div>

                      {app.coverLetter && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {app.coverLetter}
                        </p>
                      )}

                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/jobs/${app.jobId}`} data-testid={`button-view-job-${app.jobId}`}>
                            View Job
                          </Link>
                        </Button>

                        {app.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Withdraw
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to withdraw your application for {app.job?.title}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => withdrawMutation.mutate(app.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Withdraw
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No Applications Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              You haven't applied to any jobs yet. Browse available positions and start applying!
            </p>
            <Button className="mt-6" asChild>
              <Link href="/jobs" data-testid="link-browse-jobs">
                Browse Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
