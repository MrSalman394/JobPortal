import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'employer', 'employee']);
export const jobStatusEnum = pgEnum('job_status', ['active', 'draft', 'closed']);
export const applicationStatusEnum = pgEnum('application_status', ['pending', 'reviewed', 'accepted', 'rejected', 'shortlisted']);

// Session storage table (IMPORTANT: mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (IMPORTANT: mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role"),
  phone: varchar("phone"),
  location: varchar("location"),
  bio: text("bio"),
  isBlocked: boolean("is_blocked").default(false),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee qualifications
export const qualifications = pgTable("qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'education', 'experience', 'skill', 'certification'
  title: varchar("title").notNull(),
  institution: varchar("institution"),
  description: text("description"),
  startDate: varchar("start_date"),
  endDate: varchar("end_date"),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employer company profiles
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  industry: varchar("industry"),
  website: varchar("website"),
  location: varchar("location"),
  size: varchar("size"),
  logoUrl: varchar("logo_url"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  foundedYear: integer("founded_year"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job listings
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  employerId: varchar("employer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  location: varchar("location"),
  type: varchar("type").notNull(), // 'full-time', 'part-time', 'contract', 'internship'
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: varchar("salary_currency").default('USD'),
  experienceLevel: varchar("experience_level"), // 'entry', 'mid', 'senior', 'executive'
  status: jobStatusEnum("status").default('draft'),
  requiredSkills: text("required_skills").array(),
  requiredEducation: varchar("required_education"),
  requiredExperience: integer("required_experience"), // years
  applicationDeadline: timestamp("application_deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").default('pending'),
  matchScore: integer("match_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server/Platform Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  userName: varchar("user_name"),
  userRole: varchar("user_role"), // employer, employee, jobseeker, unregistered
  rating: integer("rating").notNull(), // 1-5
  feedback: text("feedback").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Two-factor authentication secrets
export const twoFactorSecrets = pgTable("two_factor_secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  secret: varchar("secret").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  backupCodes: text("backup_codes"), // JSON array of backup codes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company reviews by employees
export const companyReviews = pgTable("company_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  comment: text("comment"),
  employerReply: text("employer_reply"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookmarked jobs by employees
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Ensure one bookmark per user per job
  { uniqueConstraint: sql`unique(${table.userId}, ${table.jobId})` }
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  qualifications: many(qualifications),
  companies: many(companies),
  applications: many(applications),
  postedJobs: many(jobs),
}));

export const qualificationsRelations = relations(qualifications, ({ one }) => ({
  user: one(users, {
    fields: [qualifications.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  employer: one(users, {
    fields: [jobs.employerId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const companyReviewsRelations = relations(companyReviews, ({ one }) => ({
  company: one(companies, {
    fields: [companyReviews.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [companyReviews.userId],
    references: [users.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [bookmarks.jobId],
    references: [jobs.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQualificationSchema = createInsertSchema(qualifications).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  companyId: true,
  employerId: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10, "Review must be at least 10 characters"),
});

export const insertCompanyReviewSchema = createInsertSchema(companyReviews).omit({
  id: true,
  createdAt: true,
  userId: true,
  companyId: true,
}).extend({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters").optional(),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Qualification = typeof qualifications.$inferSelect;
export type InsertQualification = z.infer<typeof insertQualificationSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type CompanyReview = typeof companyReviews.$inferSelect;
export type InsertCompanyReview = z.infer<typeof insertCompanyReviewSchema>;

// Extended types for frontend
export type JobWithCompany = Job & { company: Company };
export type ApplicationWithJob = Application & { job: JobWithCompany; user: User };
export type UserWithQualifications = User & { qualifications: Qualification[] };
