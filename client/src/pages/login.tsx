import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Sparkles, ArrowRight, Flame, Zap, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState({ jobs: "10K", companies: "5K", users: "50K" });
  const [showVerifiedBadge, setShowVerifiedBadge] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            jobs: data.activeJobs > 999 ? `${Math.round(data.activeJobs / 1000)}K` : (data.activeJobs || 12).toString(),
            companies: data.topCompanies > 999 ? `${Math.round(data.topCompanies / 1000)}K` : (data.topCompanies || 8).toString(),
            users: data.jobSeekers > 999 ? `${Math.round(data.jobSeekers / 1000)}K` : (data.jobSeekers || 45).toString(),
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [requiresTwoFa, setRequiresTwoFa] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [loginUser, setLoginUser] = useState<any>(null);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async (response) => {
      if (response.requiresTwoFa) {
        setLoginUser(response.user);
        setRequiresTwoFa(true);
        setTwoFaCode("");
        return;
      }

      if (response.user?.isEmailVerified) {
        setShowVerifiedBadge(true);
        setTimeout(async () => {
          toast({ title: "Logged in successfully" });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          setLocation("/");
        }, 1500);
      } else {
        toast({ title: "Logged in successfully" });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyTwoFaMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, userId: loginUser.id }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid 2FA code");
      }
      return res.json();
    },
    onSuccess: async () => {
      setRequiresTwoFa(false);
      toast({ title: "Logged in successfully" });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const handleVerifyTwoFa = () => {
    if (twoFaCode.trim()) {
      verifyTwoFaMutation.mutate(twoFaCode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center p-4">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes slide-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .animate-float { animation: float 5s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>

        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* 2FA Verification Screen */}
        {requiresTwoFa && loginUser ? (
          <div className="relative w-full max-w-md space-y-6 animate-slide-in z-10">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black text-foreground">Two-Factor Authentication</h1>
              <p className="text-sm text-muted-foreground font-medium">
                {isUsingBackupCode
                  ? "Enter one of your emergency recovery backup codes"
                  : `Enter the code from your authenticator app for ${loginUser.email}`}
              </p>
            </div>

            <Card className="border border-border/60 bg-card/90 overflow-hidden backdrop-blur-md shadow-2xl">
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder={isUsingBackupCode ? "ABC12345" : "000 000"}
                  value={twoFaCode}
                  onChange={(e) =>
                    setTwoFaCode(
                      isUsingBackupCode
                        ? e.target.value.toUpperCase()
                        : e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  maxLength={isUsingBackupCode ? 12 : 6}
                  autoFocus
                  autoComplete="one-time-code"
                  className="text-3xl text-center tracking-widest font-bold h-13"
                  disabled={verifyTwoFaMutation.isPending}
                />
                <Button
                  onClick={handleVerifyTwoFa}
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent font-black text-base shadow-lg hover:shadow-2xl transition-all"
                  disabled={!twoFaCode.trim() || verifyTwoFaMutation.isPending}
                >
                  {verifyTwoFaMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
                <div className="flex flex-col gap-2 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUsingBackupCode(!isUsingBackupCode);
                      setTwoFaCode("");
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {isUsingBackupCode
                      ? "Use Authenticator App 6-digit code"
                      : "Use emergency recovery backup code"}
                  </button>
                  <Button
                    onClick={() => {
                      setRequiresTwoFa(false);
                      setTwoFaCode("");
                      setLoginUser(null);
                      setIsUsingBackupCode(false);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Main Container */
          <div className="relative w-full max-w-md space-y-6 animate-slide-in z-10">
            {/* Header Card */}
            <div className="text-center space-y-3 mb-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/25 backdrop-blur">
                <span className="text-sm font-bold text-primary flex items-center gap-2 justify-center">
                  <Flame className="h-4 w-4 text-primary animate-pulse" /> Welcome Back
                </span>
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">Sign In to JobConnect</h1>
              <p className="text-base text-muted-foreground font-medium">
                Access your personalized job opportunities
              </p>

              {showVerifiedBadge && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-500/10 py-2 px-4 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-bold text-sm">✔ Verified email</span>
                </div>
              )}
            </div>

            {/* Main Card */}
            <Card className="border border-border/70 bg-card/95 overflow-hidden backdrop-blur-md shadow-2xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Sign In
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => {
                        const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
                        const [isValidating, setIsValidating] = useState(false);

                        useEffect(() => {
                          const checkEmail = async () => {
                            if (field.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                              setIsValidating(true);
                              try {
                                const res = await fetch(
                                  `/api/users/check-email?email=${encodeURIComponent(field.value)}`
                                );
                                if (res.ok) {
                                  const data = await res.json();
                                  setIsRegistered(data.exists);
                                }
                              } catch (e) {
                                console.error(e);
                              } finally {
                                setIsValidating(false);
                              }
                            } else {
                              setIsRegistered(null);
                            }
                          };
                          const timer = setTimeout(checkEmail, 400);
                          return () => clearTimeout(timer);
                        }, [field.value]);

                        return (
                          <FormItem>
                            <FormLabel className="font-bold text-foreground text-sm">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="you@example.com"
                                  type="email"
                                  {...field}
                                  data-testid="input-login-email"
                                  className="h-11 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm pr-10"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  {isValidating ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  ) : isRegistered === true ? (
                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>REGISTERED</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="font-bold text-foreground text-sm">Password</FormLabel>
                            <button
                              type="button"
                              onClick={() => setLocation("/forgot-password")}
                              className="text-xs font-bold text-primary hover:underline transition-colors"
                            >
                              Forgot?
                            </button>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                {...field}
                                data-testid="input-login-password"
                                className="h-11 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent font-black text-base shadow-md hover:shadow-xl transition-all mt-4"
                      disabled={loginMutation.isPending}
                      data-testid="button-login-submit"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Sign In
                        </>
                      )}
                    </Button>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3">
                      {[
                        { num: stats.jobs, text: "Jobs" },
                        { num: stats.companies, text: "Companies" },
                        { num: stats.users, text: "Users" },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="text-center p-2 rounded-lg bg-muted/40 border border-border/60"
                        >
                          <p className="text-sm font-black text-primary">{stat.num}</p>
                          <p className="text-[11px] text-muted-foreground font-bold">{stat.text}</p>
                        </div>
                      ))}
                    </div>
                  </form>
                </Form>

                {/* Sign Up Link */}
                <div className="mt-5 pt-4 border-t border-border/60 text-center">
                  <p className="text-sm text-muted-foreground font-medium">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setLocation("/register")}
                      className="text-primary font-black hover:underline transition-all"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features Banner */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, text: "AI Matching" },
                { icon: Flame, text: "Instant Opportunities" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-card/80 border border-border/60 p-3 text-center flex items-center justify-center gap-2 shadow-sm"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="text-center text-xs text-muted-foreground font-bold">
              🔒 Enterprise-grade security • 100% encrypted
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
