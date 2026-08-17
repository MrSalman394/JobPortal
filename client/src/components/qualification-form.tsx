import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Qualification } from "@shared/schema";

const qualificationSchema = z.object({
  type: z.enum(["education", "experience", "skill", "certification"]),
  title: z.string().min(1, "Title is required"),
  institution: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
});

type QualificationFormValues = z.infer<typeof qualificationSchema>;

interface QualificationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QualificationFormValues) => void;
  isLoading?: boolean;
  qualification?: Qualification | null;
}

export function QualificationForm({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  qualification,
}: QualificationFormProps) {
  const form = useForm<QualificationFormValues>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      type: qualification?.type as any || "education",
      title: qualification?.title || "",
      institution: qualification?.institution || "",
      description: qualification?.description || "",
      startDate: qualification?.startDate || "",
      endDate: qualification?.endDate || "",
      isCurrent: qualification?.isCurrent || false,
    },
  });

  const watchType = form.watch("type");
  const watchIsCurrent = form.watch("isCurrent");

  const handleSubmit = (data: QualificationFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const getTypeLabel = () => {
    switch (watchType) {
      case "education": return "Degree / Certificate";
      case "experience": return "Job Title";
      case "skill": return "Skill Name";
      case "certification": return "Certification Name";
      default: return "Title";
    }
  };

  const getInstitutionLabel = () => {
    switch (watchType) {
      case "education": return "School / University";
      case "experience": return "Company";
      case "skill": return "Proficiency Level";
      case "certification": return "Issuing Organization";
      default: return "Institution";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{qualification ? "Edit" : "Add"} Qualification</DialogTitle>
          <DialogDescription>
            Add your qualifications to help match you with the right jobs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-qualification-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="experience">Work Experience</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getTypeLabel()}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`Enter ${getTypeLabel().toLowerCase()}`} 
                      {...field} 
                      data-testid="input-qualification-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getInstitutionLabel()}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`Enter ${getInstitutionLabel().toLowerCase()}`} 
                      {...field} 
                      data-testid="input-qualification-institution"
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add details about this qualification"
                      className="resize-none"
                      rows={3}
                      {...field} 
                      data-testid="textarea-qualification-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType !== "skill" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field} 
                            data-testid="input-qualification-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field}
                            disabled={watchIsCurrent}
                            data-testid="input-qualification-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isCurrent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-is-current"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {watchType === "education" ? "Currently studying here" : "Currently working here"}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-qualification">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-save-qualification">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
