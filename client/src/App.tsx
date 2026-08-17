import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import TwoFactorSetup from "@/pages/two-factor-setup";
import RoleSelection from "@/pages/role-selection";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import Jobs from "@/pages/jobs";
import JobDetails from "@/pages/job-details";
import Profile from "@/pages/profile";
import Qualifications from "@/pages/qualifications";
import CV from "@/pages/cv";
import Applications from "@/pages/applications";
import Bookmarks from "@/pages/bookmarks";
import EmployerJobs from "@/pages/employer-jobs";
import EmployerJobForm from "@/pages/employer-job-form";
import EmployerCompany from "@/pages/employer-company";
import EmployerApplications from "@/pages/employer-applications";
import AdminUsers from "@/pages/admin-users";
import AdminJobs from "@/pages/admin-jobs";
import AdminCompanies from "@/pages/admin-companies";
import AdminFeedback from "@/pages/admin-feedback";
import AdminApplications from "@/pages/admin-applications";
import Settings from "@/pages/settings";
import GiveFeedback from "@/pages/give-feedback";
import Help from "@/pages/help";
import MyFeedback from "@/pages/my-feedback";
import MyCompanyReviews from "@/pages/my-company-reviews";
import CookieCheck from "@/pages/cookie-check";
import { IdleTimer } from "@/components/idle-timer";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

function DashboardByRole() {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "employer":
      return <EmployerDashboard />;
    case "employee":
    default:
      return <EmployeeDashboard />;
  }
}

function AuthenticatedRoutes() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Show role selection if no role OR if role is null (user hasn't selected yet)
  if (!user || !user.role) {
    return <RoleSelection />;
  }

  // Show feedback page without sidebar
  if (location === "/give-feedback") {
    return <GiveFeedback />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 p-3 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Switch>
              <Route path="/" component={DashboardByRole} />
              
              {(user?.role === "employee" || !user?.role) && (
                <>
                  <Route path="/jobs" component={Jobs} />
                  <Route path="/jobs/:id" component={JobDetails} />
                  <Route path="/qualifications" component={Qualifications} />
                  <Route path="/cv" component={CV} />
                  <Route path="/applications" component={Applications} />
                  <Route path="/bookmarks" component={Bookmarks} />
                  <Route path="/my-feedback" component={MyFeedback} />
                  <Route path="/my-company-reviews" component={MyCompanyReviews} />
                </>
              )}
              
              {user?.role === "employer" && (
                <>
                  <Route path="/employer/jobs" component={EmployerJobs} />
                  <Route path="/employer/jobs/new" component={EmployerJobForm} />
                  <Route path="/employer/jobs/:id/edit" component={EmployerJobForm} />
                  <Route path="/employer/applications" component={EmployerApplications} />
                  <Route path="/employer/company" component={EmployerCompany} />
                </>
              )}
              
              {user?.role === "admin" && (
                <>
                  <Route path="/admin/users" component={AdminUsers} />
                  <Route path="/admin/jobs" component={AdminJobs} />
                  <Route path="/admin/applications" component={AdminApplications} />
                  <Route path="/admin/companies" component={AdminCompanies} />
                  <Route path="/admin/feedback" component={AdminFeedback} />
                </>
              )}
              
              {/* Routes available to all authenticated users */}
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/settings/2fa" component={TwoFactorSetup} />
              <Route path="/cookies" component={CookieCheck} />
              <Route path="/help" component={Help} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/2fa-setup" component={TwoFactorSetup} />
        <Route path="/give-feedback" component={GiveFeedback} />
        <Route path="/cookies" component={CookieCheck} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <IdleTimer />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
