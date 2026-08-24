import { useState, useEffect } from "react";
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
import { Loader2, ArrowLeft, Mail, CheckCircle2, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/navbar";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to send password reset email");
      }
      return resData;
    },
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email);
      setResendCooldown(30);
      toast({
        title: "Instructions Sent",
        description: "Check your inbox for the password reset link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResend = () => {
    if (resendCooldown > 0 || !submittedEmail) return;
    requestResetMutation.mutate({ email: submittedEmail });
  };

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

        {/* Dynamic ambient backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative w-full max-w-md space-y-6 animate-slide-in z-10">
          <button 
            type="button"
            onClick={() => setLocation("/login")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </button>

          <Card className="border-border/60 bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

            {!submittedEmail ? (
              <>
                <CardHeader className="space-y-2 pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                    <Mail className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Forgot Password?
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    No worries! Enter your registered email address and we'll send you a secure link to reset your password.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 pt-2">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => requestResetMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-foreground">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="you@example.com" 
                                  type="email" 
                                  autoComplete="email"
                                  className="h-11 bg-background/60 border-primary/20 focus:border-primary font-medium"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-md hover:shadow-xl transition-all"
                        disabled={requestResetMutation.isPending}
                      >
                        {requestResetMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending link...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>Links are cryptographically signed and expire automatically.</span>
                  </div>
                </CardContent>
              </>
            ) : (
              /* Success / Email Sent View */
              <div className="p-6 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="h-8 w-8 animate-in zoom-in-50 duration-300" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We have dispatched password reset instructions to:
                    <br />
                    <span className="font-semibold text-foreground">{submittedEmail}</span>
                  </p>
                </div>

                <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border/50 text-left text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>The link is valid for <strong>60 minutes</strong> and can only be used once.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>If you don't see it in a few minutes, check your <strong>Spam or Junk</strong> folder.</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || requestResetMutation.isPending}
                    className="w-full h-11 border-primary/30 hover:bg-primary/5 font-semibold text-sm"
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend email in ${resendCooldown}s`
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Reset Email
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSubmittedEmail("");
                      form.reset();
                    }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    Try another email address
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
