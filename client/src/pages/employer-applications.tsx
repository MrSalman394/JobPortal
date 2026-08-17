import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  FileText,
  GraduationCap,
  Briefcase,
  Star,
} from "lucide-react";
import type { Application, User, Job, Qualification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type ApplicationWithDetails = Application & { 
  user: User & { qualifications?: Qualification[] }; 
  job: Job;
};

export default function EmployerApplications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);

  const { data: applications, isLoading } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/employer/applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Application Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/applications"] });
      setSelectedApp(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredApps = applications?.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-success/10 text-success";
      case "shortlisted": return "bg-blue-100 text-blue-700";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "reviewed": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage applications for your jobs
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredApps && filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const userInitials = `${app.user?.firstName?.[0] || ''}${app.user?.lastName?.[0] || ''}`.toUpperCase();
            
            return (
              <Card 
                key={app.id} 
                className="overflow-visible hover-elevate cursor-pointer"
                onClick={() => setSelectedApp(app)}
                data-testid={`application-${app.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={app.user?.profileImageUrl || undefined} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {app.user?.firstName} {app.user?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Applied for <span className="font-medium">{app.job?.title}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.matchScore && (
                            <Badge variant="secondary">
                              {app.matchScore}% Match
                            </Badge>
                          )}
                          <Badge className={`capitalize ${getStatusColor(app.status || 'pending')}`}>
                            {app.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        {app.user?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {app.user.email}
                          </span>
                        )}
                        {app.user?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {app.user.location}
                          </span>
                        )}
                        {app.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                          </span>
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
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No Applications</h3>
            <p className="text-muted-foreground mt-2">
              {statusFilter === "all" 
                ? "No applications received yet. Post jobs to start receiving applications."
                : `No ${statusFilter} applications found.`}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review this candidate's application and qualifications
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={selectedApp.user?.profileImageUrl || undefined} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedApp.user?.firstName?.[0]}{selectedApp.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedApp.user?.firstName} {selectedApp.user?.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {selectedApp.user?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {selectedApp.user.email}
                        </span>
                      )}
                      {selectedApp.user?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {selectedApp.user.phone}
                        </span>
                      )}
                      {selectedApp.user?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {selectedApp.user.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm">
                    Applied for: {selectedApp.job?.title}
                  </Badge>
                  {selectedApp.matchScore && (
                    <Badge variant={selectedApp.matchScore >= 70 ? "default" : "secondary"}>
                      {selectedApp.matchScore}% Match
                    </Badge>
                  )}
                </div>

                {selectedApp.user?.bio && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedApp.user.bio}</p>
                  </div>
                )}

                {selectedApp.coverLetter && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Cover Letter
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedApp.coverLetter}
                    </p>
                  </div>
                )}

                {selectedApp.user?.qualifications && selectedApp.user.qualifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Qualifications</h4>
                    <div className="space-y-3">
                      {selectedApp.user.qualifications.map((qual) => (
                        <div key={qual.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          {qual.type === 'education' && <GraduationCap className="h-5 w-5 text-primary mt-0.5" />}
                          {qual.type === 'experience' && <Briefcase className="h-5 w-5 text-primary mt-0.5" />}
                          <div>
                            <p className="font-medium text-sm">{qual.title}</p>
                            {qual.institution && (
                              <p className="text-sm text-muted-foreground">{qual.institution}</p>
                            )}
                            {(qual.startDate || qual.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {qual.startDate} — {qual.isCurrent ? "Present" : qual.endDate}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  {selectedApp.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'reviewed' })}
                        data-testid="button-mark-reviewed"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                    </>
                  )}
                  {(selectedApp.status === 'pending' || selectedApp.status === 'reviewed' || selectedApp.status === 'shortlisted') && (
                    <>
                      {selectedApp.status !== 'shortlisted' && (
                        <Button 
                          onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'shortlisted' })}
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="button-shortlist"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Shortlist
                        </Button>
                      )}
                      <Button 
                        onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'accepted' })}
                        className="bg-success hover:bg-success/90"
                        data-testid="button-accept"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'rejected' })}
                        data-testid="button-reject"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
