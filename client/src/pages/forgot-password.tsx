import { useState } from "react";
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
import { Loader2, ArrowRight, Mail, Copy, Check } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resetCode, setResetCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate reset code");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResetCode(data.resetCode);
      toast({ title: "Reset code generated! Use it below to reset your password." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyCode = () => {
    navigator.clipboard.writeText(resetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetPassword = () => {
    if (resetCode) {
      // Store code in sessionStorage to pass to reset-password page
      sessionStorage.setItem("resetCode", resetCode);
      setLocation("/reset-password");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        <button 
          onClick={() => setLocation("/login")}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to Login
        </button>

        <Card className="border-0 bg-gradient-to-br from-card to-background/50 overflow-hidden backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-2 relative z-10">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Reset Password
            </CardTitle>
            <CardDescription>
              {resetCode 
                ? "Your reset code is ready! Copy it and use it to reset your password."
                : "Enter your email to get a reset code"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            {!resetCode ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => resetMutation.mutate(data))} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent"
                    disabled={resetMutation.isPending}
                  >
                    {resetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      "Get Reset Code"
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">✓ Reset code generated successfully!</p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-primary rounded-lg p-3">
                      <p className="text-2xl font-bold text-center tracking-widest text-primary">{resetCode}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyCode}
                      className="h-12 w-12 p-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  This code expires in 15 minutes. Copy it and click below to reset your password.
                </p>

                <Button
                  onClick={handleResetPassword}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  Continue to Reset Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
