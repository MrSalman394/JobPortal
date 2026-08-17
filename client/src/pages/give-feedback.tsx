import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FeedbackForm } from "@/components/feedback-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Sparkles } from "lucide-react";

export default function GiveFeedback() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleFeedbackSubmitted = async () => {
    setSubmitted(true);
    setIsLoggingOut(true);
    // If authenticated, logout; if not, return to landing
    setTimeout(() => {
      if (user) {
        window.location.href = "/api/logout";
      } else {
        setLocation("/");
      }
    }, 2000);
  };

  const handleSkip = async () => {
    setIsLoggingOut(true);
    // If authenticated, logout; if not, return to landing
    if (user) {
      window.location.href = "/api/logout";
    } else {
      setLocation("/");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-primary/20 bg-gradient-to-br from-card to-background/50">
          <div className="p-8 text-center space-y-6">
            <div className="space-y-3">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-foreground">Thank You!</h2>
              <p className="text-muted-foreground font-medium">
                Your feedback helps us improve JobConnect. Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur">
            <span className="text-sm font-bold text-primary flex items-center gap-2 justify-center">
              <Sparkles className="h-4 w-4" /> {user ? "Before You Go!" : "Share Your Feedback"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black leading-tight">
            <span className="text-foreground">{user ? "Quick Feedback" : "We'd Love Your"}</span>{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {user ? "Please?" : "Feedback"}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {user 
              ? "Before you leave, we'd love to hear your thoughts about JobConnect! Your feedback helps us serve you better ⚡"
              : "Help us improve JobConnect! Share your experience and suggestions to shape the future of job matching. It takes just 1 minute ⚡"
            }
          </p>
        </div>

        {/* Feedback Form Container */}
        <div className="max-w-2xl mx-auto mb-8">
          <FeedbackForm 
            isAuthenticated={!!user}
            userRole={user?.role || "employee"}
            onSubmitSuccess={handleFeedbackSubmitted}
          />
        </div>

        {/* Skip Button */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground text-sm mb-4">
            {user ? "Skip feedback and logout now" : "Want to skip? Go back to home"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleSkip}
              disabled={isLoggingOut}
              variant="outline"
              className="font-bold py-5 px-8"
            >
              {isLoggingOut ? "Loading..." : (user ? "Skip and Logout" : "Back to Home")}
            </Button>
            {!user && (
              <Button
                onClick={() => setLocation("/login")}
                className="bg-gradient-to-r from-primary to-accent font-bold py-5 px-8"
              >
                Sign In to Continue
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
