import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/job-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Briefcase } from "lucide-react";
import type { JobWithCompany } from "@shared/schema";

export default function Bookmarks() {
  const { data: bookmarkedJobs, isLoading, refetch } = useQuery<(JobWithCompany & { isBookmarked: boolean })[]>({
    queryKey: ["/api/bookmarks"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-primary" /> Saved Jobs
        </h1>
        <p className="text-muted-foreground">
          Jobs you've saved for later
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarkedJobs && bookmarkedJobs.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isBookmarked={true}
              onView={() => window.location.href = `/jobs/${job.id}`}
              onApply={() => window.location.href = `/jobs/${job.id}?apply=true`}
              showApplyButton={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No Saved Jobs</h3>
            <p className="text-muted-foreground mt-2">
              You haven't saved any job listings yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
