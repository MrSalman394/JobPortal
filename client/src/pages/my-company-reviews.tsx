import { useQuery } from "@tanstack/react-query";
import { CompanyReview } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Building2, Reply } from "lucide-react";
import { format } from "date-fns";

export default function MyCompanyReviews() {
  const { data: reviews = [], isLoading } = useQuery<(CompanyReview & { company?: any })[]>({
    queryKey: ["/api/employee/my-company-reviews"],
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
        <h1 className="text-3xl font-bold tracking-tight">My Company Reviews</h1>
        <p className="text-muted-foreground">
          Reviews you've posted about companies and employer responses.
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Feedback ({reviews.length})
            </CardTitle>
            <CardDescription>
              Your reviews and employer replies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card
                  key={review.id}
                  className="border-l-4 border-l-orange-400/50"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {review.company?.name || "Company"}
                          </Badge>
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <span className="text-sm font-bold text-foreground">
                              {review.title}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap ml-2">
                          {review.createdAt
                            ? format(new Date(review.createdAt), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {review.comment}
                      </p>
                    </div>

                    {review.employerReply ? (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-bold text-green-700">
                            EMPLOYER RESPONSE
                          </p>
                        </div>
                        <p className="text-sm text-green-800 italic">
                          "{review.employerReply}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg border border-dashed border-muted-foreground/20">
                        <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"></span>
                          Awaiting employer response...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  You haven't posted any company reviews yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
