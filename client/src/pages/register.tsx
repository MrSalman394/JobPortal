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
import { Loader2, Sparkles, ArrowRight, CheckCircle, Briefcase, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";

const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/;

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRegex, "Password must contain at least one special character (!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?)")
    .refine((pwd) => pwd !== undefined, "Password is required"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const pwd = form.watch("password") || "";

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        let errorMsg = "Registration failed";
        try {
          const error = await res.json();
          errorMsg = error.message || errorMsg;
        } catch {
          const text = await res.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "Account created successfully" });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center p-4 py-10">
        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
          @keyframes slide-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          .animate-float { animation: float 5s ease-in-out infinite; }
          .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>

        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        {/* Main Container */}
        <div className="relative w-full max-w-md space-y-6 animate-slide-in z-10">
          {/* Header Card */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/25 backdrop-blur">
              <span className="text-sm font-bold text-primary flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4" /> Join JobConnect
              </span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Create Your Account</h1>
            <p className="text-base text-muted-foreground font-medium">
              Start your journey to find your dream opportunity
            </p>
          </div>

          {/* Main Card */}
          <Card className="border border-border/70 bg-card/95 overflow-hidden backdrop-blur-md shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sign Up
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground text-sm">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              data-testid="input-register-firstname"
                              className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground text-sm">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              data-testid="input-register-lastname"
                              className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
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
                                data-testid="input-register-email"
                                className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm pr-10"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isValidating ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : isRegistered === true ? (
                                  <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                    <Sparkles className="h-3 w-3" />
                                    <span>EXISTS</span>
                                  </div>
                                ) : isRegistered === false ? (
                                  <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>AVAILABLE</span>
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

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-foreground text-sm">Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            {...field}
                            data-testid="input-register-phone"
                            className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-foreground text-sm">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Min 8 chars + 1 special char (!@#$...)"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              data-testid="input-register-password"
                              className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm pr-10"
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
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <div className={`flex items-center gap-2 ${pwd.length >= 8 ? "text-emerald-600 font-semibold" : "text-muted-foreground"}`}>
                            <span>{pwd.length >= 8 ? "✓" : "○"}</span> At least 8 characters
                          </div>
                          <div className={`flex items-center gap-2 ${passwordRegex.test(pwd) ? "text-emerald-600 font-semibold" : "text-muted-foreground"}`}>
                            <span>{passwordRegex.test(pwd) ? "✓" : "○"}</span> One special character (!@#$%^&...)
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-foreground text-sm">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Confirm your password"
                              type={showConfirmPassword ? "text" : "password"}
                              {...field}
                              data-testid="input-register-confirm-password"
                              className="h-10 bg-background/50 border-primary/20 focus:border-primary font-medium text-sm pr-10"
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
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent font-black text-base shadow-md hover:shadow-xl transition-all mt-2"
                    disabled={registerMutation.isPending}
                    data-testid="button-register-submit"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { icon: Briefcase, text: "Smart Matching" },
                      { icon: Sparkles, text: "Premium Features" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/40 border border-border/60 rounded-lg p-2"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </form>
              </Form>

              {/* Sign In Link */}
              <div className="mt-5 pt-4 border-t border-border/60 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  Already have an account?{" "}
                  <button
                    onClick={() => setLocation("/login")}
                    className="text-primary font-black hover:underline transition-all"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badge */}
          <div className="text-center text-xs text-muted-foreground font-bold">
            🔒 Your data is secure and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
