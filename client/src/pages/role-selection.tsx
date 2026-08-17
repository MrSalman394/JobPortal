import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Users, Building2, Shield, ArrowRight, Loader2 } from "lucide-react";

type Role = "employee" | "employer" | "admin";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const updateRoleMutation = useMutation({
    mutationFn: async (role: Role) => {
      const res = await apiRequest("PATCH", "/api/users/role", { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (selectedRole) {
      updateRoleMutation.mutate(selectedRole);
    }
  };

  const roles = [
    {
      id: "employer" as Role,
      icon: Building2,
      title: "Company Owner / Employer",
      description: "Do you have a company? Hire the best talent. Post jobs, set requirements, and find candidates that match your needs.",
      features: ["Post job listings", "Set qualification requirements", "Review applications", "Find matched candidates"],
    },
    {
      id: "employee" as Role,
      icon: Users,
      title: "Job Seeker / Employee",
      description: "Looking for your next opportunity? Browse jobs, build your profile, and apply with one click.",
      features: ["Browse and apply to jobs", "Build your professional profile", "Auto-generate CV", "Track your applications"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">JobConnect</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Welcome to JobConnect!
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            What brings you here?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all overflow-visible hover-elevate ${
                selectedRole === role.id
                  ? "ring-2 ring-primary border-primary"
                  : ""
              }`}
              onClick={() => setSelectedRole(role.id)}
              data-testid={`card-role-${role.id}`}
            >
              <CardHeader className="pb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-3 ${
                  selectedRole === role.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`h-1.5 w-1.5 rounded-full ${selectedRole === role.id ? "bg-primary" : "bg-muted-foreground"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole || updateRoleMutation.isPending}
            className="px-8"
            data-testid="button-continue"
          >
            {updateRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
