import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Send, LogIn } from "lucide-react";

const feedbackSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be between 1 and 5"),
  feedback: z.string().min(10, "Feedback must be at least 10 characters").max(500, "Feedback must be less than 500 characters"),
  userName: z.string().optional().or(z.literal("")),
  userRole: z.enum(["employee", "employer", "jobseeker", "unregistered"]),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  isAuthenticated: boolean;
  userRole?: string;
  onSubmitSuccess?: () => void;
}

export function FeedbackForm({ isAuthenticated, userRole = "employee", onSubmitSuccess }: FeedbackFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
      userName: "",
      userRole: (userRole === "employee" || userRole === "employer") ? (userRole as "employee" | "employer") : "jobseeker",
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormValues) => {
      try {
        const res = await apiRequest("POST", "/api/reviews", data);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Failed to submit feedback");
        }
        return res.json();
      } catch (error) {
        throw error instanceof Error ? error : new Error("Network error. Please try again.");
      }
    },
    onSuccess: () => {
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      // Call the optional callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error: Error) => {
      console.error("Feedback submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FeedbackFormValues) {
    submitFeedbackMutation.mutate(data);
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-background/50 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>
          Help us improve JobConnect by sharing your honest feedback. Your opinion matters!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Stars */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-bold">How would you rate JobConnect?</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-125"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= (hoveredRating || field.value)
                                ? "fill-accent text-accent"
                                : "text-muted-foreground"
                            } transition-all`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Name */}
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (Optional)</FormLabel>
                  <FormControl>
                    <div className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <input
                        type="text"
                        placeholder="How should we credit you?"
                        {...field}
                        className="w-full bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* User Role */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3 py-2 border-2 border-primary/30 bg-background text-foreground rounded-md text-sm font-medium hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="employee" className="text-foreground">Job Seeker</option>
                      <option value="employer" className="text-foreground">Employer</option>
                      <option value="jobseeker" className="text-foreground">Job Seeker (Unregistered)</option>
                      <option value="unregistered" className="text-foreground">Unregistered User</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Feedback Text */}
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what you think about JobConnect... What did you love? What can we improve?"
                      className="min-h-[120px] font-medium placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    {field.value.length}/500 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitFeedbackMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all py-5 text-base font-bold"
            >
              <Send className="h-5 w-5 mr-2" />
              {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
