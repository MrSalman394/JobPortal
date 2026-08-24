import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract token from query parameters
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, []);

  // Verify token validity on load
  const { data: tokenCheck, isLoading: isCheckingToken, isError: isTokenInvalid, error: tokenError } = useQuery({
    queryKey: ["/api/auth/verify-reset-token", token],
    queryFn: async () => {
      if (!token) throw new Error("No reset token provided in the URL.");
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || "This reset link is invalid or has expired.");
      }
      return data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = form.watch("password") || "";
  const confirmPasswordValue = form.watch("confirmPassword") || "";

  // Password strength calculation
  const hasMinLength = passwordValue.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasLowerCase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to reset password.");
      }
      return resData;
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been changed. You can now sign in.",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 2500);
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center p-4 relative">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes slide-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .animate-float { animation: float 5s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>

        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative w-full max-w-md space-y-6 animate-slide-in z-10">
          {/* Missing Token or Invalid / Expired Token */}
          {!token || (isTokenInvalid && !isSuccess) ? (
            <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center shadow-inner">
                <AlertTriangle className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Link Invalid or Expired</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {(tokenError as Error)?.message || "This password reset link is invalid, has already been used, or has expired."}
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-xl border border-border/50 text-xs text-muted-foreground text-left flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>For your security, reset links expire after 60 minutes and can only be used once.</span>
              </div>

              <Button
                onClick={() => setLocation("/forgot-password")}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent font-bold text-white shadow-md hover:shadow-xl transition-all"
              >
                Request a New Reset Link
              </Button>
            </Card>
          ) : isCheckingToken ? (
            /* Loading State */
            <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-2xl p-8 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">Verifying security token...</p>
            </Card>
          ) : isSuccess ? (
            /* Success Card */
            <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden text-center p-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-8 w-8 animate-in zoom-in-50 duration-300" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Password Reset Successfully</h2>
                <p className="text-sm text-muted-foreground">
                  Your new password is set. Redirecting you to sign in...
                </p>
              </div>

              <Button
                onClick={() => setLocation("/login")}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent font-bold text-white shadow-md"
              >
                <ArrowRight className="mr-2 h-4 w-4" /> Go to Sign In
              </Button>
            </Card>
          ) : (
            /* Active Reset Password Form */
            <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

              <CardHeader className="space-y-2 pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Create New Password
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {tokenCheck?.email ? (
                    <>
                      Resetting password for: <span className="font-semibold text-foreground">{tokenCheck.email}</span>
                    </>
                  ) : (
                    "Please choose a strong password for your account."
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => resetMutation.mutate(data))} className="space-y-4">
                    {/* New Password */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-foreground">New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Enter at least 8 characters"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="h-11 bg-background/60 border-primary/20 focus:border-primary font-medium pr-10"
                                {...field}
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

                    {/* Password Strength Indicator */}
                    {passwordValue && (
                      <div className="space-y-2 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-muted-foreground">Strength:</span>
                          <span className="font-bold">{strengthLabels[strengthScore - 1] || "Very Weak"}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 h-1.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`rounded-full transition-all duration-300 ${
                                level <= strengthScore ? strengthColors[strengthScore - 1] : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-muted-foreground">
                          <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-500 font-semibold" : ""}`}>
                            {hasMinLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            8+ Characters
                          </div>
                          <div className={`flex items-center gap-1 ${hasUpperCase ? "text-emerald-500 font-semibold" : ""}`}>
                            {hasUpperCase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Uppercase letter
                          </div>
                          <div className={`flex items-center gap-1 ${hasLowerCase ? "text-emerald-500 font-semibold" : ""}`}>
                            {hasLowerCase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Lowercase letter
                          </div>
                          <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-500 font-semibold" : ""}`}>
                            {hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Number
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirm Password */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-foreground">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Re-enter your new password"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className="h-11 bg-background/60 border-primary/20 focus:border-primary font-medium pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                          {confirmPasswordValue && passwordValue && confirmPasswordValue === passwordValue && (
                            <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold pt-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-md hover:shadow-xl transition-all mt-2"
                      disabled={resetMutation.isPending || !form.formState.isValid}
                    >
                      {resetMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
