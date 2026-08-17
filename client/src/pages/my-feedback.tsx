import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Star, Shield } from "lucide-react";
import { format } from "date-fns";

export default function MyFeedback() {
  const { data: feedback = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/employee/my-feedback"],
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
        <p className="text-muted-foreground">
          View your platform feedback and responses from our admin team.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Feedback ({feedback.length})
            </CardTitle>
            <CardDescription>
              Messages you've submitted and admin replies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.length > 0 ? (
              feedback.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {renderStars(item.rating)}
                          <span className="text-xs font-bold text-muted-foreground">
                            {item.createdAt
                              ? format(new Date(item.createdAt), "MMM d, yyyy")
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground font-medium">
                          {item.feedback}
                        </p>
                      </div>
                    </div>

                    {item.adminReply ? (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-bold text-blue-700">
                            ADMIN REPLY
                          </p>
                        </div>
                        <p className="text-sm text-blue-800 italic">
                          "{item.adminReply}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg border border-dashed border-muted-foreground/20">
                        <p className="text-xs text-muted-foreground italic">
                          No admin reply yet. We'll respond soon!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  You haven't submitted any feedback yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
