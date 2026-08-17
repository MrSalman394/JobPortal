import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/components/job-card";
import { Search, Filter, X, Briefcase } from "lucide-react";
import type { JobWithCompany, Application } from "@shared/schema";

type JobWithMatch = { job: JobWithCompany; matchScore: number };

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: jobsData, isLoading } = useQuery<JobWithMatch[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: bookmarks } = useQuery<{ jobId: string }[]>({
    queryKey: ["/api/bookmarks"],
  });

  const appliedJobIds = new Set(applications?.map((a) => a.jobId) || []);
  const bookmarkedJobIds = new Set(bookmarks?.map((b) => b.jobId) || []);

  const filteredJobs = jobsData?.filter(({ job }) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.location?.toLowerCase().includes(search.toLowerCase());

    const matchesType = !jobType || job.type === jobType;
    const matchesExperience = !experienceLevel || job.experienceLevel === experienceLevel;
    
    const minSal = salaryMin ? parseInt(salaryMin) : 0;
    const maxSal = salaryMax ? parseInt(salaryMax) : Infinity;
    const matchesSalary = (!salaryMin && !salaryMax) || 
      (job.salaryMin !== null && job.salaryMin >= minSal && 
       (job.salaryMax === null || job.salaryMax <= maxSal));

    return matchesSearch && matchesType && matchesExperience && matchesSalary;
  });

  const clearFilters = () => {
    setSearch("");
    setJobType("");
    setExperienceLevel("");
    setSalaryMin("");
    setSalaryMax("");
  };

  const hasActiveFilters = search || jobType || experienceLevel || salaryMin || salaryMax;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Jobs</h1>
        <p className="text-muted-foreground">
          Find opportunities that match your qualifications
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-jobs"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:w-auto"
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Job Type
                  </label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger data-testid="select-job-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Experience Level
                  </label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger data-testid="select-experience-level">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Min Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Max Salary
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="999999"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                    />
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="flex-shrink-0"
                        data-testid="button-clear-filters"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredJobs?.length || 0} jobs found
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map(({ job, matchScore }) => (
            <JobCard
              key={job.id}
              job={job}
              matchScore={matchScore}
              isApplied={appliedJobIds.has(job.id)}
              isBookmarked={bookmarkedJobIds.has(job.id)}
              onView={() => window.location.href = `/jobs/${job.id}`}
              onApply={() => window.location.href = `/jobs/${job.id}?apply=true`}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No Jobs Found</h3>
            <p className="text-muted-foreground mt-2">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "No job listings available at the moment. Check back later!"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
                data-testid="button-clear-filters-empty"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
