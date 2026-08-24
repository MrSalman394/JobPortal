import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, ShieldCheck, ArrowLeft, KeyRound, Download, ArrowRight, Smartphone } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function TwoFactorSetup() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<"scan" | "backup">("scan");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);

  useEffect(() => {
    fetchSetupData();
  }, []);

  const fetchSetupData = async () => {
    try {
      setIsLoadingSetup(true);
      const res = await fetch("/api/auth/2fa/setup", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to initialize 2FA setup");
      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes || []);
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      });
      setLocation("/settings");
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const enableMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid 6-digit verification code");
      }
      return data;
    },
    onSuccess: async (data) => {
      toast({ title: "2FA Verified & Enabled! 🎉" });
      if (data.backupCodes && data.backupCodes.length > 0) {
        setBackupCodes(data.backupCodes);
      }
      setStep("backup");
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    toast({ title: "Backup codes copied to clipboard" });
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([`JobConnect Emergency Recovery Backup Codes:\n\n${backupCodes.join("\n")}\n\nKeep these codes in a safe place. Each code can only be used once.`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = "jobconnect-2fa-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative w-full max-w-lg space-y-6 animate-slide-in z-10">
          <button 
            type="button"
            onClick={() => setLocation("/settings")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Settings
          </button>

          <Card className="border-border/60 bg-card/90 backdrop-blur-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

            {isLoadingSetup ? (
              <div className="p-12 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">Generating secure authentication key...</p>
              </div>
            ) : step === "scan" ? (
              <>
                <CardHeader className="space-y-2 pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-inner">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                    Set Up Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Scan the QR code below with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  {/* QR Code Container */}
                  {qrCode && (
                    <div className="flex justify-center p-4 bg-white dark:bg-slate-950 border border-border rounded-xl shadow-inner max-w-xs mx-auto">
                      <img src={qrCode} alt="2FA QR Code" className="w-52 h-52 object-contain" />
                    </div>
                  )}

                  {/* Manual Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Or Enter Key Manually
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-sm tracking-widest bg-muted/50 border-primary/20"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copySecret}
                        className="h-10 px-3 shrink-0"
                      >
                        {copiedSecret ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Verification Code Input */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <label htmlFor="code" className="text-sm font-semibold text-foreground">
                      Enter the 6-Digit Code from your App:
                    </label>
                    <Input
                      id="code"
                      placeholder="000 000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      autoComplete="one-time-code"
                      className="text-3xl text-center tracking-[0.3em] font-bold h-14 bg-background/60 border-primary/30 focus:border-primary"
                    />
                  </div>

                  <Button
                    onClick={() => enableMutation.mutate()}
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-md hover:shadow-xl transition-all"
                    disabled={code.length !== 6 || enableMutation.isPending}
                  >
                    {enableMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      "Verify & Activate 2FA"
                    )}
                  </Button>
                </CardContent>
              </>
            ) : (
              /* Step 2: Emergency Backup Codes */
              <div className="p-6 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-inner">
                  <ShieldCheck className="h-8 w-8 animate-in zoom-in-50 duration-300" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Save Your Backup Codes</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If you ever lose access to your phone or authenticator app, you can use these single-use recovery codes to sign in.
                  </p>
                </div>

                {/* 2-Column Backup Codes Grid */}
                <div className="grid grid-cols-2 gap-2 p-4 bg-muted/60 border border-border/60 rounded-xl font-mono text-sm font-bold tracking-widest text-foreground text-center">
                  {backupCodes.map((codeItem, index) => (
                    <div key={index} className="p-2 rounded bg-background/80 border border-border/40">
                      {codeItem}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={copyBackupCodes}
                    className="flex-1 text-xs font-semibold"
                  >
                    {copiedCodes ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" /> : <Copy className="mr-1.5 h-4 w-4" />}
                    Copy Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadBackupCodes}
                    className="flex-1 text-xs font-semibold"
                  >
                    <Download className="mr-1.5 h-4 w-4" /> Download .TXT
                  </Button>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      toast({ title: "2FA Setup Complete! 🔒" });
                      window.location.href = "/settings";
                    }}
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-bold shadow-md"
                  >
                    I Have Saved My Backup Codes <ArrowRight className="ml-2 h-4 w-4" />
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
