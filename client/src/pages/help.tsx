import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Search,
  Zap,
  Building2,
  Shield,
} from "lucide-react";

const faqs = {
  all: [
    {
      question: "How do I reset my password?",
      answer:
        "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Go to 'My Profile' from the sidebar menu. Edit your information and click 'Save Changes'. All changes are saved immediately.",
    },
    {
      question: "How do I change my account settings?",
      answer:
        "Navigate to 'Settings' from the sidebar. Here you can manage your notification preferences, privacy settings, and other account options.",
    },
    {
      question: "Is my personal data secure?",
      answer:
        "Yes, we use industry-standard encryption and security protocols to protect your data. Your information is never shared with third parties without your consent.",
    },
  ],
  employee: [
    {
      question: "How do I apply for a job?",
      answer:
        "Browse jobs from the 'Browse Jobs' section. Click on a job to view details, then click the 'Apply' button. You'll be able to submit your CV and any additional information.",
    },
    {
      question: "How do I upload my CV?",
      answer:
        "Go to 'My CV' from the sidebar. Click 'Upload CV' and select a PDF or DOC file from your computer. You can update your CV anytime.",
    },
    {
      question: "How do I track my applications?",
      answer:
        "Click on 'My Applications' to see all your submitted applications. You can filter by status to see which are pending, reviewed, shortlisted, accepted, or rejected.",
    },
    {
      question: "What are job recommendations?",
      answer:
        "JobConnect analyzes your profile and skills to suggest matching jobs. Check your recommendations for personalized job matches.",
    },
    {
      question: "How do I save jobs for later?",
      answer:
        "Click the bookmark icon on any job listing or job details page. Your saved jobs appear in 'Saved Jobs' section for quick access.",
    },
    {
      question: "Can I withdraw an application?",
      answer:
        "Yes, in the 'My Applications' section, find the application and click the withdraw option. You can re-apply later if needed.",
    },
  ],
  employer: [
    {
      question: "How do I post a new job?",
      answer:
        "Go to 'Post Job' from the sidebar. Fill in the job details including title, description, location, salary, and required skills. Click 'Publish' to make it live.",
    },
    {
      question: "How do I manage my company profile?",
      answer:
        "Click on 'Company Profile' to create or edit your company information. Add your company logo, description, website, and industry details to attract better candidates.",
    },
    {
      question: "How do I view applications to my jobs?",
      answer:
        "Go to 'Applications' to see all applications across your jobs. You can filter by job, status, and search for specific candidates.",
    },
    {
      question: "How do I shortlist or reject candidates?",
      answer:
        "In the Applications section, click the menu for each application. You can mark as reviewed, shortlist, accept, or reject candidates.",
    },
    {
      question: "Can I edit a job after posting?",
      answer:
        "Yes, go to 'My Jobs', find the job, and click edit. You can update all details except the job ID. Changes take effect immediately.",
    },
    {
      question: "How do I close a job posting?",
      answer:
        "In 'My Jobs', click the menu next to a job and select 'Close'. This stops accepting new applications but keeps the job visible.",
    },
    {
      question: "How do I see who is shortlisted?",
      answer:
        "In the Applications section, filter by 'Shortlisted' status. You can also view shortlisted candidates per job from the job details.",
    },
  ],
  admin: [
    {
      question: "How do I manage users on the platform?",
      answer:
        "Go to 'Users' to see all platform users. You can search, filter by role, change user roles, block/unblock users, or delete accounts.",
    },
    {
      question: "How do I manage all jobs on the platform?",
      answer:
        "Navigate to 'Jobs' to view all job postings. You can edit job details, close jobs to stop applications, or delete jobs completely.",
    },
    {
      question: "How do I view all applications?",
      answer:
        "Go to 'Applications' to see every application submitted on the platform. Filter by status, search by applicant, or view applications per job.",
    },
    {
      question: "How do I update application statuses?",
      answer:
        "In Applications, use the dropdown menu for each application to mark as reviewed, shortlist, accept, or reject applicants.",
    },
    {
      question: "How do I manage companies?",
      answer:
        "Click on 'Companies' to view all company profiles. You can edit company information or delete companies if needed.",
    },
    {
      question: "How do I manage platform feedback?",
      answer:
        "Go to 'Feedback' to view all user submissions. You can filter by role and rating, and delete feedback as needed.",
    },
    {
      question: "How do I view platform statistics?",
      answer:
        "The 'Dashboard' shows platform overview with total users, jobs, applications, and companies. Use this for platform insights.",
    },
    {
      question: "Can I change a user's role?",
      answer:
        "Yes, in the Users section, use the role dropdown to change any user to admin, employer, or employee. Changes take effect immediately.",
    },
  ],
};

export default function Help() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return Shield;
      case "employer":
        return Building2;
      case "employee":
      default:
        return Zap;
    }
  };

  const getFaqsByRole = () => {
    const roleSpecific = faqs[user?.role as keyof typeof faqs] || faqs.employee;
    return [...faqs.all, ...roleSpecific];
  };

  const allFaqs = getFaqsByRole();
  const filteredFaqs = allFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/feedback", {
        userName: contactForm.name,
        userEmail: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
        userRole: user?.role || "employee",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Your message has been sent. We'll get back to you soon!",
        });
        setContactForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions and get in touch with our support team.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - FAQs */}
        <div className="md:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <span className="text-left font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No FAQs found matching your search.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact & Info */}
        <div className="space-y-6">
          {/* Your Role */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RoleIcon className="h-5 w-5" />
                Your Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="capitalize text-base py-1 px-3">
                {user?.role || "User"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                FAQs above are tailored to your role.
              </p>
            </CardContent>
          </Card>

          {/* Contact Support - Accessible to all users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, subject: e.target.value })
                    }
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    placeholder="Describe your issue..."
                    rows={4}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Links - Restricted to Admin */}
          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@jobconnect.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone Support</p>
                    <p className="text-xs text-muted-foreground">1-800-JOBCONNECT</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Time - Restricted to Admin */}
          {user?.role === "admin" && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <span className="font-semibold text-green-700 dark:text-green-400">💚 Expected Response Time:</span>
                  <br />
                  <span className="text-green-600 dark:text-green-300">24 hours</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
