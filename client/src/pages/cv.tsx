import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  Award,
  Wrench,
  Eye,
} from "lucide-react";
import type { Qualification } from "@shared/schema";

export default function CV() {
  const { user } = useAuth();
  const { toast } = useToast();
  const cvRef = useRef<HTMLDivElement>(null);

  const { data: qualifications, isLoading } = useQuery<Qualification[]>({
    queryKey: ["/api/qualifications"],
  });

  const handleDownload = async () => {
    try {
      const response = await fetch("/api/cv/download", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${user?.firstName || 'My'}_${user?.lastName || 'CV'}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "CV Downloaded",
        description: "Your CV has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const groupedQualifications = qualifications?.reduce((acc, qual) => {
    const type = qual.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(qual);
    return acc;
  }, {} as Record<string, Qualification[]>);

  const education = groupedQualifications?.education || [];
  const experience = groupedQualifications?.experience || [];
  const skills = groupedQualifications?.skill || [];
  const certifications = groupedQualifications?.certification || [];

  const hasContent = education.length > 0 || experience.length > 0 || skills.length > 0 || certifications.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My CV</h1>
          <p className="text-muted-foreground">
            Auto-generated from your profile and qualifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} disabled={!hasContent} data-testid="button-download-cv">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : !hasContent ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg">No CV Content Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Add qualifications to auto-generate your professional CV. Include your education, work experience, skills, and certifications.
            </p>
            <Button className="mt-6" asChild>
              <a href="/qualifications" data-testid="link-add-qualifications-cv">
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Qualifications
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div ref={cvRef} className="bg-white text-gray-900 min-h-[800px]">
              <div className="bg-primary px-8 py-10 text-white">
                <h1 className="text-3xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-primary-foreground/90">
                  {user?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-8 space-y-8">
                {user?.bio && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </section>
                )}

                {experience.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Work Experience
                    </h2>
                    <div className="space-y-4">
                      {experience.map((exp) => (
                        <div key={exp.id} className="border-l-2 border-gray-200 pl-4">
                          <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                          {exp.institution && (
                            <p className="text-primary font-medium">{exp.institution}</p>
                          )}
                          {(exp.startDate || exp.endDate) && (
                            <p className="text-sm text-gray-500">
                              {exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}
                            </p>
                          )}
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {education.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </h2>
                    <div className="space-y-4">
                      {education.map((edu) => (
                        <div key={edu.id} className="border-l-2 border-gray-200 pl-4">
                          <h3 className="font-semibold text-gray-900">{edu.title}</h3>
                          {edu.institution && (
                            <p className="text-primary font-medium">{edu.institution}</p>
                          )}
                          {(edu.startDate || edu.endDate) && (
                            <p className="text-sm text-gray-500">
                              {edu.startDate} — {edu.isCurrent ? "Present" : edu.endDate}
                            </p>
                          )}
                          {edu.description && (
                            <p className="text-gray-700 mt-2">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {skills.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {skill.title}
                          {skill.institution && ` (${skill.institution})`}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {certifications.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Certifications
                    </h2>
                    <div className="space-y-3">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                            {cert.institution && (
                              <p className="text-sm text-gray-600">{cert.institution}</p>
                            )}
                            {cert.startDate && (
                              <p className="text-sm text-gray-500">{cert.startDate}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
