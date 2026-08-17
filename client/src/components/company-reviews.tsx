import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, Reply, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { CompanyReview, User as UserType } from "@shared/schema";

type ReviewWithUser = CompanyReview & { user: UserType };

interface CompanyReviewsProps {
  companyId: string;
}

export function CompanyReviews({ companyId }: CompanyReviewsProps) {
  const { data: reviews = [], isLoading } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/companies/${companyId}/reviews`],
    enabled: !!companyId,
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Employee Reviews
        </CardTitle>
        <CardDescription>See what others are saying about this company</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="border bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {review.title && <span className="text-xs font-black">{review.title}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  
                  {review.employerReply && (
                    <div className="mt-3 p-2 bg-blue-50/50 rounded border border-blue-100 border-dashed">
                      <p className="text-[10px] font-black text-blue-600 flex items-center gap-1 mb-1">
                        <Reply className="h-3 w-3" /> EMPLOYER RESPONSE
                      </p>
                      <p className="text-xs text-blue-700 italic">{review.employerReply}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No reviews yet for this company.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}