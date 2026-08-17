import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Home,
  Users,
  Building2,
  FileText,
  Search,
  Settings,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  User,
  GraduationCap,
  PlusCircle,
  Sparkles,
  Zap,
  Shield,
  Bookmark,
  HelpCircle,
} from "lucide-react";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const getRoleGradient = () => {
    switch (user?.role) {
      case "admin":
        return "from-green-600 to-emerald-500";
      case "employer":
        return "from-purple-600 to-pink-500";
      case "employee":
      default:
        return "from-blue-600 to-cyan-500";
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return Shield;
      case "employer":
        return Building2;
      case "employee":
      default:
        return Zap;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "admin":
        return "Platform Admin";
      case "employer":
        return "Employer Portal";
      case "employee":
      default:
        return "Job Seeker";
    }
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          { title: "Dashboard", url: "/", icon: LayoutDashboard },
          { title: "Users", url: "/admin/users", icon: Users },
          { title: "Jobs", url: "/admin/jobs", icon: Briefcase },
          { title: "Applications", url: "/admin/applications", icon: ClipboardList },
          { title: "Companies", url: "/admin/companies", icon: Building2 },
          { title: "Feedback", url: "/admin/feedback", icon: FileText },
          { title: "My Profile", url: "/profile", icon: User },
          { title: "Settings", url: "/settings", icon: Settings },
          { title: "Help", url: "/help", icon: HelpCircle },
        ];
      case "employer":
        return [
          { title: "Dashboard", url: "/", icon: LayoutDashboard },
          { title: "My Jobs", url: "/employer/jobs", icon: Briefcase },
          { title: "Post Job", url: "/employer/jobs/new", icon: PlusCircle },
          { title: "Applications", url: "/employer/applications", icon: ClipboardList },
          { title: "Company Profile", url: "/employer/company", icon: Building2 },
          { title: "My Profile", url: "/profile", icon: User },
          { title: "Settings", url: "/settings", icon: Settings },
          { title: "Help", url: "/help", icon: HelpCircle },
        ];
      case "employee":
      default:
        return [
          { title: "Dashboard", url: "/", icon: Home },
          { title: "Browse Jobs", url: "/jobs", icon: Search },
          { title: "My Applications", url: "/applications", icon: ClipboardList },
          { title: "Saved Jobs", url: "/bookmarks", icon: Bookmark },
          { title: "My Company Reviews", url: "/my-company-reviews", icon: Building2 },
          { title: "My Feedback", url: "/my-feedback", icon: FileText },
          { title: "My Profile", url: "/profile", icon: User },
          { title: "Qualifications", url: "/qualifications", icon: GraduationCap },
          { title: "My CV", url: "/cv", icon: FileText },
          { title: "Settings", url: "/settings", icon: Settings },
          { title: "Help", url: "/help", icon: HelpCircle },
        ];
    }
  };

  const menuItems = getMenuItems();
  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const RoleIcon = getRoleIcon();
  const roleGradient = getRoleGradient();

  return (
    <Sidebar>
      <style>{`
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(0,119,182,0.3); } 50% { box-shadow: 0 0 40px rgba(0,119,182,0.5); } }
        @keyframes slide-in { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float-subtle { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-slide-in { animation: slide-in 0.4s ease-out; }
        .animate-float-subtle { animation: float-subtle 3s ease-in-out infinite; }
      `}</style>

      {/* Header - Premium Gradient */}
      <SidebarHeader className="border-b border-primary/20 p-4 bg-gradient-to-br from-card/50 to-background/50 backdrop-blur">
        <Link href="/" className="flex items-center gap-3 group animate-slide-in">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${roleGradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">JobConnect</p>
            <p className="text-sm font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{getRoleLabel()}</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="space-y-0">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2 py-3 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {menuItems.map((item, idx) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem 
                    key={item.title}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    className="animate-slide-in"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`relative transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-r ${roleGradient} text-white shadow-lg` 
                          : 'hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <Link 
                        href={item.url} 
                        data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                        className={`group relative px-3 py-2.5 rounded-lg font-bold ${
                          isActive ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${roleGradient} rounded-lg opacity-0 blur-md animate-glow-pulse`} />
                        )}
                        <div className="relative flex items-center gap-3 z-10">
                          <div className={`h-5 w-5 flex items-center justify-center rounded transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-primary'
                          }`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="truncate font-bold text-sm">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Premium User Card */}
      <SidebarFooter className="border-t border-primary/20 p-4 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur">
        <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-br from-card/80 to-background/80 border border-primary/20 shadow-lg hover:shadow-xl transition-all group hover-elevate">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
          <div className="relative flex items-center gap-3 z-10">
            <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-lg">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={`${user?.firstName} ${user?.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className={`bg-gradient-to-br ${roleGradient} text-white font-black`}>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <RoleIcon className="h-3 w-3 text-primary" />
                <p className="text-xs font-bold text-muted-foreground capitalize truncate">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
