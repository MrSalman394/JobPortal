import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";

export default function TwoFactorSetup() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSetupData();
  }, []);

  const fetchSetupData = async () => {
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch 2FA setup");
      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate 2FA setup", variant: "destructive" });
      setLocation("/");
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid code");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      toast({ title: "2FA enabled successfully!" });
      // Clear query cache to force re-fetch of user status
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      
      // Force a full page reload to settings to clear any stale state
      window.location.href = "/settings";
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>Scan this QR code with your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded-lg" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Or enter this key manually:</label>
            <div className="flex gap-2">
              <Input value={secret} readOnly className="font-mono" />
              <Button
                size="sm"
                variant="outline"
                onClick={copySecret}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium">
              Enter the 6-digit code from your authenticator app:
            </label>
            <Input
              id="code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-2xl text-center tracking-widest"
            />
          </div>

          <Button
            onClick={() => verifyMutation.mutate()}
            className="w-full bg-gradient-to-r from-primary to-accent"
            disabled={code.length !== 6 || verifyMutation.isPending}
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Enable 2FA"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Keep your authenticator app safe. You'll need it to log in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
