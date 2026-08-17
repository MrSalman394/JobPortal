import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";

interface TwoFactorVerifyProps {
  sessionId: string;
  onSuccess: () => void;
}

export default function TwoFactorVerify({ sessionId, onSuccess }: TwoFactorVerifyProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, sessionId }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Invalid code");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "2FA verification successful!" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background overflow-hidden flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 bg-gradient-to-br from-card to-background/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Enter the code from your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="text-2xl text-center tracking-widest"
          />

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
              "Verify Code"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
