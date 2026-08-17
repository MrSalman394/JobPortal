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
import { Loader2, Sparkles, ArrowRight, Flame, Zap, CheckCircle2 } from "lucide-react";
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            jobs: data.activeJobs > 999 ? `${Math.round(data.activeJobs / 1000)}K` : data.activeJobs.toString(),
            companies: data.topCompanies > 999 ? `${Math.round(data.topCompanies / 1000)}K` : data.topCompanies.toString(),
            users: data.jobSeekers > 999 ? `${Math.round(data.jobSeekers / 1000)}K` : data.jobSeekers.toString(),
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
      // Check if user has 2FA enabled based on login response
      if (response.requiresTwoFa) {
        setLoginUser(response.user);
        setRequiresTwoFa(true);
        setTwoFaCode("");
        return;
      }

      // No 2FA required, proceed with login
      if (response.user?.isEmailVerified) {
        setShowVerifiedBadge(true);
        setTimeout(async () => {
          toast({ title: "Logged in successfully" });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          setLocation("/");
        }, 2000);
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
      const verifyData = await res.json();
      
      // Now perform the actual login after successful 2FA verification
      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: form.getValues("email"), 
          password: form.getValues("password") 
        }),
        credentials: "include",
      });
      
      if (!loginRes.ok) {
        throw new Error("Login failed after 2FA verification");
      }
      
      return loginRes.json();
    },
    onSuccess: async (response) => {
      setRequiresTwoFa(false);
      const user = response.user;
      if (user?.isEmailVerified) {
        setShowVerifiedBadge(true);
        setTimeout(async () => {
          toast({ title: "Logged in successfully" });
          await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
          setLocation("/");
        }, 2000);
      } else {
        toast({ title: "Logged in successfully" });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/");
      }
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
    if (twoFaCode.length === 6) {
      verifyTwoFaMutation.mutate(twoFaCode);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center p-4">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
          @keyframes glow-intense { 0%, 100% { box-shadow: 0 0 30px rgba(0,119,182,0.4), 0 0 60px rgba(0,119,182,0.2); } 50% { box-shadow: 0 0 50px rgba(0,119,182,0.6), 0 0 100px rgba(0,119,182,0.3); } }
          @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .animate-glow { animation: glow-intense 3s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in 0.6s ease-out; }
        `}</style>

        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* 2FA Verification Screen */}
        {requiresTwoFa && loginUser ? (
          <div className="relative w-full max-w-md space-y-6 animate-slide-in">
            <div className="text-center space-y-3 mb-8">
              <h1 className="text-3xl font-black text-foreground">Two-Factor Authentication</h1>
              <p className="text-lg text-muted-foreground font-medium">Enter the code from your authenticator app</p>
            </div>

            <Card className="border-0 bg-gradient-to-br from-card to-background/50 overflow-hidden backdrop-blur-sm shadow-2xl">
              <CardContent className="pt-8">
                <div className="space-y-4">
                  <Input
                    placeholder="000000"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="text-3xl text-center tracking-widest font-bold"
                    disabled={verifyTwoFaMutation.isPending}
                  />
                  <Button
                    onClick={handleVerifyTwoFa}
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent font-black text-base shadow-lg hover:shadow-2xl transition-all"
                    disabled={twoFaCode.length !== 6 || verifyTwoFaMutation.isPending}
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
                  <Button
                    onClick={() => {
                      setRequiresTwoFa(false);
                      setTwoFaCode("");
                      setLoginUser(null);
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
          <div className="relative w-full max-w-md space-y-6 animate-slide-in">
          {/* Header Card */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur">
              <span className="text-sm font-bold text-primary flex items-center gap-2 justify-center">
                <Flame className="h-4 w-4 animate-pulse" /> Welcome Back
              </span>
            </div>
          <h1 className="text-4xl font-black text-foreground">Sign In to JobConnect</h1>
          <p className="text-lg text-muted-foreground font-medium">Access your personalized job opportunities</p>
          
          {showVerifiedBadge && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-full border border-green-200 animate-bounce">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-bold">✔ Verified email</span>
            </div>
          )}
        </div>

          {/* Main Card */}
          <Card className="border-0 bg-gradient-to-br from-card to-background/50 overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
            
            <CardHeader className="space-y-2 relative z-10">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sign In</CardTitle>
              <CardDescription className="text-base font-medium">Enter your credentials to continue</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                              const res = await fetch(`/api/users/check-email?email=${encodeURIComponent(field.value)}`);
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
                        const timer = setTimeout(checkEmail, 500);
                        return () => clearTimeout(timer);
                      }, [field.value]);

                      return (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground">Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="you@example.com"
                                type="email"
                                {...field}
                                data-testid="input-login-email"
                                className="h-11 bg-card border-primary/20 focus:border-primary focus:ring-primary/20 font-medium text-base pr-10"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValidating ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : isRegistered === true ? (
                                  <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 animate-in fade-in zoom-in">
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
                          <FormLabel className="font-bold text-foreground">Password</FormLabel>
                          <button
                            type="button"
                            onClick={() => setLocation("/forgot-password")}
                            className="text-xs font-bold text-primary hover:text-accent transition-colors"
                          >
                            Forgot?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
                            type="password"
                            {...field}
                            data-testid="input-login-password"
                            className="h-11 bg-card border-primary/20 focus:border-primary focus:ring-primary/20 font-medium text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent font-black text-base shadow-lg hover:shadow-2xl transition-all mt-6"
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
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    {[
                      { num: stats.jobs, text: "Jobs" },
                      { num: stats.companies, text: "Companies" },
                      { num: stats.users, text: "Users" },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-2 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                        <p className="text-sm font-black text-primary">{stat.num}</p>
                        <p className="text-xs text-muted-foreground font-bold">{stat.text}</p>
                      </div>
                    ))}
                  </div>
                </form>
              </Form>

              {/* Sign Up Link */}
              <div className="mt-6 pt-6 border-t border-primary/10 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setLocation("/register")}
                    className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-black hover:opacity-80 transition-opacity"
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
              { icon: Sparkles, text: "AI Matching", color: "from-primary" },
              { icon: Flame, text: "Instant Opportunities", color: "from-accent" },
            ].map((item, i) => (
              <div key={i} className={`rounded-lg bg-gradient-to-br ${item.color} to-transparent/10 border border-white/10 p-3 text-center`}>
                <item.icon className="h-5 w-5 text-white mx-auto mb-1" />
                <p className="text-xs font-bold text-white">{item.text}</p>
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
