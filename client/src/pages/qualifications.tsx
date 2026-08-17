import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { QualificationForm } from "@/components/qualification-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Wrench,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Qualification } from "@shared/schema";

export default function Qualifications() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: qualifications, isLoading } = useQuery<Qualification[]>({
    queryKey: ["/api/qualifications"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/qualifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Qualification Added" });
      queryClient.invalidateQueries({ queryKey: ["/api/qualifications"] });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/qualifications/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Qualification Updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/qualifications"] });
      setEditingQualification(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/qualifications/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Qualification Removed" });
      queryClient.invalidateQueries({ queryKey: ["/api/qualifications"] });
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

  const getIcon = (type: string) => {
    switch (type) {
      case "education": return GraduationCap;
      case "experience": return Briefcase;
      case "certification": return Award;
      case "skill": return Wrench;
      default: return GraduationCap;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "education": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "experience": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "certification": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "skill": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "";
    }
  };

  const groupedQualifications = qualifications?.reduce((acc, qual) => {
    const type = qual.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(qual);
    return acc;
  }, {} as Record<string, Qualification[]>);

  const typeLabels: Record<string, string> = {
    education: "Education",
    experience: "Work Experience",
    skill: "Skills",
    certification: "Certifications",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Qualifications</h1>
          <p className="text-muted-foreground">
            Add your education, experience, skills, and certifications
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-qualification">
          <Plus className="h-4 w-4 mr-2" />
          Add Qualification
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : qualifications && qualifications.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedQualifications || {}).map(([type, quals]) => (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {(() => {
                    const Icon = getIcon(type);
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  {typeLabels[type] || type}
                  <Badge variant="secondary" className="ml-2">{quals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quals.map((qual) => (
                  <div 
                    key={qual.id} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 group"
                    data-testid={`qualification-${qual.id}`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeBadgeColor(qual.type)}`}>
                      {(() => {
                        const Icon = getIcon(qual.type);
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-foreground">{qual.title}</h4>
                          {qual.institution && (
                            <p className="text-sm text-muted-foreground">{qual.institution}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setEditingQualification(qual)}
                            data-testid={`button-edit-${qual.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteId(qual.id)}
                            data-testid={`button-delete-${qual.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {qual.description && (
                        <p className="text-sm text-muted-foreground mt-2">{qual.description}</p>
                      )}
                      {(qual.startDate || qual.endDate) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {qual.startDate} {qual.startDate && qual.endDate && "—"} {qual.isCurrent ? "Present" : qual.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No Qualifications Added</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Add your education, work experience, skills, and certifications to help employers understand your background and match you with relevant jobs.
            </p>
            <Button className="mt-6" onClick={() => setIsFormOpen(true)} data-testid="button-add-first-qualification">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Qualification
            </Button>
          </CardContent>
        </Card>
      )}

      <QualificationForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      <QualificationForm
        open={!!editingQualification}
        onClose={() => setEditingQualification(null)}
        onSubmit={(data) => editingQualification && updateMutation.mutate({ id: editingQualification.id, data })}
        isLoading={updateMutation.isPending}
        qualification={editingQualification}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Qualification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this qualification? This action cannot be undone.
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
