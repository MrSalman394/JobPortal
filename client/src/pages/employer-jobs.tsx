import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  PlusCircle, 
  Briefcase, 
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Users,
} from "lucide-react";
import type { Job } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function EmployerJobs() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/employer/jobs"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Job Deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/jobs/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Job Status Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/jobs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeJobs = jobs?.filter(j => j.status === 'active') || [];
  const draftJobs = jobs?.filter(j => j.status === 'draft') || [];
  const closedJobs = jobs?.filter(j => j.status === 'closed') || [];

  const renderJobList = (jobList: Job[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (jobList.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {jobList.map((job) => (
          <Card key={job.id} className="overflow-visible hover-elevate" data-testid={`job-${job.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link 
                    href={`/employer/jobs/${job.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                    data-testid={`link-job-${job.id}`}
                  >
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    )}
                    <span className="capitalize">{job.type?.replace('-', ' ')}</span>
                    {job.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {job.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-actions-${job.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/employer/jobs/${job.id}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {job.status === 'draft' && (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'active' })}>
                          <Eye className="h-4 w-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {job.status === 'active' && (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'closed' })}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Close
                        </DropdownMenuItem>
                      )}
                      {job.status === 'closed' && (
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: job.id, status: 'active' })}>
                          <Eye className="h-4 w-4 mr-2" />
                          Reopen
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteId(job.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job listings
          </p>
        </div>
        <Button asChild>
          <Link href="/employer/jobs/new" data-testid="button-post-new-job">
            <PlusCircle className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft">
            Drafts ({draftJobs.length})
          </TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed">
            Closed ({closedJobs.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {renderJobList(activeJobs, "No active jobs. Post a new job to start receiving applications.")}
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          {renderJobList(draftJobs, "No draft jobs. Start creating a new job posting.")}
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          {renderJobList(closedJobs, "No closed jobs.")}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This will also remove all applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
