import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Moon, Sun, User, Shield, Bell, Trash2, Loader2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaPassword, setTwoFaPassword] = useState("");
  const [twoFaDialogOpen, setTwoFaDialogOpen] = useState(false);
  const [twoFaMode, setTwoFaMode] = useState<"enable" | "disable">("enable");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTwoFaStatus();
  }, []);

  const checkTwoFaStatus = async () => {
    try {
      // Force no-cache to get the latest status
      const res = await fetch("/api/auth/2fa/status?t=" + Date.now(), {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTwoFaEnabled(data.isEnabled);
      }
    } catch (error) {
      console.error("Failed to check 2FA status:", error);
    }
  };

  const handleToggleTwoFa = async () => {
    if (twoFaEnabled) {
      setTwoFaMode("disable");
      setTwoFaDialogOpen(true);
    } else {
      // Use window.location.href to ensure a clean state and full reload
      window.location.href = "/settings/2fa";
    }
  };

  const handleDisableTwoFa = async () => {
    if (!twoFaCode || !twoFaPassword) {
      toast({
        title: "Error",
        description: "Please enter both your password and 2FA code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaCode, password: twoFaPassword }),
        credentials: "include",
      });

      if (res.ok) {
        toast({ title: "2FA disabled successfully" });
        setTwoFaEnabled(false);
        setTwoFaCode("");
        setTwoFaPassword("");
        setTwoFaDialogOpen(false);
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to disable 2FA");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      checkTwoFaStatus();
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await apiRequest("DELETE", "/api/users/account", { password });
      if (res.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully removed.",
        });
        window.location.href = "/login";
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete account");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role || 'Employee'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Secure your account with 2FA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {twoFaEnabled ? "✅ Enabled" : "⚠️ Not enabled"}
              </p>
            </div>
            <Button
              onClick={handleToggleTwoFa}
              variant={twoFaEnabled ? "destructive" : "default"}
            >
              {twoFaEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={twoFaDialogOpen} onOpenChange={setTwoFaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              To disable 2FA, please enter your password and current 2FA code for security verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={twoFaPassword}
                onChange={(e) => setTwoFaPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">2FA Code</label>
              <Input
                placeholder="000000"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-2xl text-center tracking-widest"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTwoFaDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableTwoFa}
              disabled={isLoading || !twoFaCode || !twoFaPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Permanent actions for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm font-medium mb-2">Please enter your password to confirm:</p>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Deletion"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
