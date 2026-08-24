import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Building2, Upload, Star, Reply, User } from "lucide-react";
import type { Company, CompanyReview } from "@shared/schema";
import { format } from "date-fns";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  size: z.string().optional(),
  logoUrl: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function EmployerCompany() {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ["/api/employer/company"],
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<(CompanyReview & { user: any })[]>({
    queryKey: [`/api/companies/${company?.id}/reviews`],
    enabled: !!company?.id,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const res = await apiRequest("PATCH", `/api/employer/company-reviews/${id}/reply`, { reply });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${company?.id}/reviews`] });
      setReplyingTo(null);
      setReplyText("");
      toast({ title: "Reply sent successfully" });
    },
  });

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      website: "",
      location: "",
      size: "",
      logoUrl: "",
      contactEmail: "",
      contactPhone: "",
      foundedYear: undefined,
    },
  });

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        website: company.website || "",
        location: company.location || "",
        size: company.size || "",
        logoUrl: company.logoUrl || "",
        contactEmail: company.contactEmail || "",
        contactPhone: company.contactPhone || "",
        foundedYear: company.foundedYear || undefined,
      });
      setLogoPreview(company.logoUrl || null);
    }
  }, [company, form]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoPreview(base64);
      form.setValue("logoUrl", base64);
    };
    reader.readAsDataURL(file);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: CompanyFormValues) => {
      if (company) {
        const res = await apiRequest("PATCH", `/api/companies/${company.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/companies", data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: company ? "Company Updated" : "Company Created",
        description: "Your company profile has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employer/company"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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

  if (isLoadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Management</h1>
        <p className="text-muted-foreground">
          {company ? "Manage your company profile and review feedback" : "Set up your company profile to start posting jobs"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 rounded-lg">
                    <AvatarImage 
                      src={logoPreview || form.watch("logoUrl") || undefined} 
                      alt={form.watch("name")}
                      className="object-cover rounded-lg"
                    />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-2xl">
                      {form.watch("name")?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || <Building2 className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <CardTitle>{form.watch("name") || "Your Company"}</CardTitle>
                  <CardDescription>{form.watch("industry") || "Industry"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>



















              
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))} 
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter company name" 
                        {...field} 
                        data-testid="input-company-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo upload is handled via the header button */}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Technology, Healthcare" 
                          {...field} 
                          data-testid="input-industry"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-size">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headquarters Location</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="City, Country" 
                        {...field} 
                        data-testid="input-company-location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://yourcompany.com" 
                        {...field} 
                        data-testid="input-website"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="recruiter@company.com" 
                        {...field} 
                        data-testid="input-contact-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+1 (555) 000-0000" 
                        {...field} 
                        data-testid="input-contact-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="foundedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="2020"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        data-testid="input-founded-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About the Company</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell candidates about your company, culture, and what makes you unique..."
                        className="resize-none"
                        rows={5}
                        {...field} 
                        data-testid="textarea-company-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-company"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    company ? "Save Changes" : "Create Company"
                  )}
                </Button>
              </div>
            </form>
          </Form>
            </CardContent>
          </Card>
        </div>





        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                Employee Feedback
              </CardTitle>
              <CardDescription>What candidates say about your company</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">

                {isLoadingReviews ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id} className="border bg-muted/30">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-bold">{review.user?.firstName || "Anonymous"}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-xs font-black">{review.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                        
                        {review.employerReply ? (
                          <div className="mt-3 p-2 bg-blue-50/50 rounded border border-blue-100 border-dashed">
                            <p className="text-[10px] font-black text-blue-600 flex items-center gap-1 mb-1">
                              <Reply className="h-3 w-3" /> YOUR REPLY
                            </p>
                            <p className="text-xs text-blue-700 italic">{review.employerReply}</p>
                          </div>
                        ) : (
                          <Dialog open={replyingTo === review.id} onOpenChange={(open) => {
                            if (open) {
                              setReplyingTo(review.id);
                              setReplyText("");
                            } else {
                              setReplyingTo(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary font-bold">
                                <Reply className="h-3 w-3 mr-1" /> Reply to feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reply to {review.user?.firstName || "Anonymous"}</DialogTitle>
                                <DialogDescription>Your response will be visible to candidates on your company profile.</DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                <div className="p-3 bg-muted rounded text-sm italic">"{review.comment}"</div>
                                <Textarea 
                                  placeholder="Type your response..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                <Button 
                                  onClick={() => replyMutation.mutate({ id: review.id, reply: replyText })}
                                  disabled={replyMutation.isPending || !replyText.trim()}
                                >
                                  {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Reply className="h-4 w-4 mr-2" />}
                                  Post Reply
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No reviews yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>















      </div>
    </div>
  );
}
