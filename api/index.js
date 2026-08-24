var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/app.ts
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  applicationStatusEnum: () => applicationStatusEnum,
  applications: () => applications,
  applicationsRelations: () => applicationsRelations,
  bookmarks: () => bookmarks,
  bookmarksRelations: () => bookmarksRelations,
  companies: () => companies,
  companiesRelations: () => companiesRelations,
  companyReviews: () => companyReviews,
  companyReviewsRelations: () => companyReviewsRelations,
  insertApplicationSchema: () => insertApplicationSchema,
  insertCompanyReviewSchema: () => insertCompanyReviewSchema,
  insertCompanySchema: () => insertCompanySchema,
  insertJobSchema: () => insertJobSchema,
  insertQualificationSchema: () => insertQualificationSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserSchema: () => insertUserSchema,
  jobStatusEnum: () => jobStatusEnum,
  jobs: () => jobs,
  jobsRelations: () => jobsRelations,
  passwordResetTokens: () => passwordResetTokens,
  qualifications: () => qualifications,
  qualificationsRelations: () => qualificationsRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  sessions: () => sessions,
  twoFactorSecrets: () => twoFactorSecrets,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum = pgEnum("user_role", ["admin", "employer", "employee"]);
var jobStatusEnum = pgEnum("job_status", ["active", "draft", "closed"]);
var applicationStatusEnum = pgEnum("application_status", ["pending", "reviewed", "accepted", "rejected", "shortlisted"]);
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var qualifications = pgTable("qualifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  // 'education', 'experience', 'skill', 'certification'
  title: varchar("title").notNull(),
  institution: varchar("institution"),
  description: text("description"),
  startDate: varchar("start_date"),
  endDate: varchar("end_date"),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  employerId: varchar("employer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  location: varchar("location"),
  type: varchar("type").notNull(),
  // 'full-time', 'part-time', 'contract', 'internship'
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: varchar("salary_currency").default("USD"),
  experienceLevel: varchar("experience_level"),
  // 'entry', 'mid', 'senior', 'executive'
  status: jobStatusEnum("status").default("draft"),
  requiredSkills: text("required_skills").array(),
  requiredEducation: varchar("required_education"),
  requiredExperience: integer("required_experience"),
  // years
  applicationDeadline: timestamp("application_deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  coverLetter: text("cover_letter"),
  status: applicationStatusEnum("status").default("pending"),
  matchScore: integer("match_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name"),
  userRole: varchar("user_role"),
  // employer, employee, jobseeker, unregistered
  rating: integer("rating").notNull(),
  // 1-5
  feedback: text("feedback").notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow()
});
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var twoFactorSecrets = pgTable("two_factor_secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  secret: varchar("secret").notNull(),
  isEnabled: boolean("is_enabled").default(false),
  backupCodes: text("backup_codes"),
  // JSON array of backup codes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var companyReviews = pgTable("company_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  // 1-5
  title: varchar("title"),
  comment: text("comment"),
  employerReply: text("employer_reply"),
  createdAt: timestamp("created_at").defaultNow()
});
var bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Ensure one bookmark per user per job
  { uniqueConstraint: sql`unique(${table.userId}, ${table.jobId})` }
]);
var usersRelations = relations(users, ({ many, one }) => ({
  qualifications: many(qualifications),
  companies: many(companies),
  applications: many(applications),
  postedJobs: many(jobs)
}));
var qualificationsRelations = relations(qualifications, ({ one }) => ({
  user: one(users, {
    fields: [qualifications.userId],
    references: [users.id]
  })
}));
var companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id]
  }),
  jobs: many(jobs)
}));
var jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id]
  }),
  employer: one(users, {
    fields: [jobs.employerId],
    references: [users.id]
  }),
  applications: many(applications)
}));
var applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id]
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));
var companyReviewsRelations = relations(companyReviews, ({ one }) => ({
  company: one(companies, {
    fields: [companyReviews.companyId],
    references: [companies.id]
  }),
  user: one(users, {
    fields: [companyReviews.userId],
    references: [users.id]
  })
}));
var bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id]
  }),
  job: one(jobs, {
    fields: [bookmarks.jobId],
    references: [jobs.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQualificationSchema = createInsertSchema(qualifications).omit({
  id: true,
  createdAt: true,
  userId: true
});
var insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true
});
var insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  companyId: true,
  employerId: true
});
var insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
}).extend({
  rating: z.number().min(1).max(5),
  feedback: z.string().min(10, "Review must be at least 10 characters")
});
var insertCompanyReviewSchema = createInsertSchema(companyReviews).omit({
  id: true,
  createdAt: true,
  userId: true,
  companyId: true
}).extend({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Comment must be at least 5 characters").optional()
});

// server/core/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var db;
var pool;
if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: schema_exports });
} else {
  console.log("\u26A0\uFE0F  DATABASE_URL not set. Running in development mode without database.");
  db = null;
  pool = null;
}

// server/core/storage.ts
import { eq, and, desc, sql as sql2, ilike, inArray } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(ilike(users.email, email.trim()));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUserRole(id, role) {
    const [user] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserProfile(id, data) {
    const [user] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserPassword(id, hashedPassword) {
    const [user] = await db.update(users).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserEmail(id, email) {
    const [user] = await db.update(users).set({ email, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserEmailVerified(id, isVerified) {
    const [user] = await db.update(users).set({ isEmailVerified: isVerified, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async blockUser(id) {
    const [user] = await db.update(users).set({ isBlocked: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async unblockUser(id) {
    const [user] = await db.update(users).set({ isBlocked: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }
  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  async createReview(data) {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }
  async getAllReviews() {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }
  async deleteReview(id) {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }
  async getApplicationById(id) {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }
  async getAllApplicationsWithDetails() {
    const result = await db.select().from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).innerJoin(users, eq(applications.userId, users.id)).orderBy(desc(applications.createdAt));
    return result.map((r) => ({
      ...r.applications,
      user: r.users,
      job: r.jobs
    }));
  }
  async deleteApplication(id, userId) {
    await db.delete(applications).where(userId ? and(eq(applications.id, id), eq(applications.userId, userId)) : eq(applications.id, id));
    return true;
  }
  async adminUpdateCompany(id, data) {
    const [company] = await db.update(companies).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(companies.id, id)).returning();
    return company;
  }
  async adminDeleteCompany(id) {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }
  // Qualification operations
  async getQualificationsByUser(userId) {
    return db.select().from(qualifications).where(eq(qualifications.userId, userId)).orderBy(desc(qualifications.createdAt));
  }
  async createQualification(data) {
    const [qual] = await db.insert(qualifications).values(data).returning();
    return qual;
  }
  async updateQualification(id, userId, data) {
    const [qual] = await db.update(qualifications).set(data).where(and(eq(qualifications.id, id), eq(qualifications.userId, userId))).returning();
    return qual;
  }
  async deleteQualification(id, userId) {
    await db.delete(qualifications).where(and(eq(qualifications.id, id), eq(qualifications.userId, userId)));
    return true;
  }
  // Company operations
  async getCompanyByUser(userId) {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }
  async getCompanyById(id) {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  async createCompany(data) {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  }
  async updateCompany(id, userId, data) {
    const [company] = await db.update(companies).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(companies.id, id), eq(companies.userId, userId))).returning();
    return company;
  }
  async getAllCompanies() {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }
  // Job operations
  async getAllJobs() {
    const result = await db.select().from(jobs).leftJoin(companies, eq(jobs.companyId, companies.id)).where(eq(jobs.status, "active")).orderBy(desc(jobs.createdAt));
    return result.map((r) => ({
      ...r.jobs,
      company: r.companies
    }));
  }
  async getJobById(id) {
    const [result] = await db.select().from(jobs).leftJoin(companies, eq(jobs.companyId, companies.id)).where(eq(jobs.id, id));
    if (!result) return void 0;
    return { ...result.jobs, company: result.companies };
  }
  async getJobsByEmployer(employerId) {
    return db.select().from(jobs).where(eq(jobs.employerId, employerId)).orderBy(desc(jobs.createdAt));
  }
  async createJob(data) {
    const [job] = await db.insert(jobs).values(data).returning();
    return job;
  }
  async updateJob(id, employerId, data) {
    const [job] = await db.update(jobs).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(jobs.id, id), eq(jobs.employerId, employerId))).returning();
    return job;
  }
  async deleteJob(id, employerId) {
    await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.employerId, employerId)));
    return true;
  }
  async adminUpdateJob(id, data) {
    const [job] = await db.update(jobs).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(jobs.id, id)).returning();
    return job;
  }
  async adminDeleteJob(id) {
    await db.delete(jobs).where(eq(jobs.id, id));
    return true;
  }
  // Application operations
  async getApplicationsByUser(userId) {
    const result = await db.select().from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).leftJoin(companies, eq(jobs.companyId, companies.id)).where(eq(applications.userId, userId)).orderBy(desc(applications.createdAt));
    return result.map((r) => ({
      ...r.applications,
      job: { ...r.jobs, company: r.companies }
    }));
  }
  async getApplicationsByEmployer(employerId) {
    const result = await db.select().from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).innerJoin(users, eq(applications.userId, users.id)).where(eq(jobs.employerId, employerId)).orderBy(desc(applications.createdAt));
    const appsWithQuals = await Promise.all(
      result.map(async (r) => {
        const quals = await this.getQualificationsByUser(r.users.id);
        return {
          ...r.applications,
          user: { ...r.users, qualifications: quals },
          job: r.jobs
        };
      })
    );
    return appsWithQuals;
  }
  async getApplicationByUserAndJob(userId, jobId) {
    const [app] = await db.select().from(applications).where(and(eq(applications.userId, userId), eq(applications.jobId, jobId)));
    return app;
  }
  async createApplication(data) {
    const [app] = await db.insert(applications).values(data).returning();
    return app;
  }
  async updateApplicationStatus(id, status) {
    const [app] = await db.update(applications).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(applications.id, id)).returning();
    return app;
  }
  // Stats
  async getEmployeeStats(userId) {
    const apps = await this.getApplicationsByUser(userId);
    const allJobs = await this.getAllJobs();
    return {
      totalApplications: apps.length,
      pendingApplications: apps.filter((a) => a.status === "pending").length,
      acceptedApplications: apps.filter((a) => a.status === "accepted").length,
      rejectedApplications: apps.filter((a) => a.status === "rejected").length,
      matchingJobs: allJobs.length
    };
  }
  async getEmployerStats(userId) {
    const userJobs = await this.getJobsByEmployer(userId);
    const apps = await this.getApplicationsByEmployer(userId);
    return {
      activeJobs: userJobs.filter((j) => j.status === "active").length,
      totalApplications: apps.length,
      pendingApplications: apps.filter((a) => a.status === "pending").length,
      totalViews: 0
    };
  }
  async getAdminStats() {
    const allUsers = await this.getAllUsers();
    const allJobsRaw = await db.select().from(jobs);
    const allCompanies = await this.getAllCompanies();
    const allApps = await db.select().from(applications);
    return {
      totalUsers: allUsers.length,
      totalEmployers: allUsers.filter((u) => u.role === "employer").length,
      totalEmployees: allUsers.filter((u) => u.role === "employee").length,
      totalJobs: allJobsRaw.length,
      activeJobs: allJobsRaw.filter((j) => j.status === "active").length,
      totalCompanies: allCompanies.length,
      totalApplications: allApps.length
    };
  }
  async getEmployeeInteractedCompanies(userId) {
    const apps = await db.select({ companyId: jobs.companyId }).from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id)).where(eq(applications.userId, userId));
    const companyIds = Array.from(new Set(apps.map((a) => a.companyId)));
    if (companyIds.length === 0) return [];
    return db.select().from(companies).where(inArray(companies.id, companyIds));
  }
  async getAllCompanyReviews() {
    return db.select().from(companyReviews);
  }
  // Password reset token operations
  async createPasswordResetToken(userId, token, expiresAt) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    const [resetToken] = await db.insert(passwordResetTokens).values({ userId, token, expiresAt }).returning();
    return resetToken;
  }
  async getPasswordResetToken(token) {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }
  async deletePasswordResetToken(token) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return true;
  }
  async createOrUpdateTwoFactor(userId, secret) {
    const existing = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    if (existing.length > 0) {
      const [updated] = await db.update(twoFactorSecrets).set({ secret, updatedAt: /* @__PURE__ */ new Date() }).where(eq(twoFactorSecrets.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(twoFactorSecrets).values({ userId, secret, isEnabled: false }).returning();
    return created;
  }
  async enableTwoFactor(userId, secret, backupCodes) {
    const existing = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    const backupCodesJson = backupCodes ? JSON.stringify(backupCodes) : null;
    if (existing.length > 0) {
      const [updated] = await db.update(twoFactorSecrets).set({
        isEnabled: true,
        secret,
        backupCodes: backupCodesJson,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(twoFactorSecrets.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(twoFactorSecrets).values({
      userId,
      secret,
      isEnabled: true,
      backupCodes: backupCodesJson
    }).returning();
    return created;
  }
  async getTwoFactorSecret(userId) {
    const [twoFa] = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    return twoFa;
  }
  async disableTwoFactor(userId) {
    await db.update(twoFactorSecrets).set({ isEnabled: false, backupCodes: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq(twoFactorSecrets.userId, userId));
    return true;
  }
  async consumeBackupCode(userId, code) {
    const twoFa = await this.getTwoFactorSecret(userId);
    if (!twoFa || !twoFa.backupCodes) return false;
    try {
      const codes = JSON.parse(twoFa.backupCodes);
      const normalizedCode = code.trim().toLowerCase();
      const index2 = codes.findIndex((c) => c.toLowerCase() === normalizedCode);
      if (index2 === -1) return false;
      codes.splice(index2, 1);
      await db.update(twoFactorSecrets).set({ backupCodes: JSON.stringify(codes), updatedAt: /* @__PURE__ */ new Date() }).where(eq(twoFactorSecrets.userId, userId));
      return true;
    } catch {
      return false;
    }
  }
  async createCompanyReview(data) {
    const [review] = await db.insert(companyReviews).values(data).returning();
    return review;
  }
  async getCompanyReviews(companyId) {
    return await db.select({
      id: companyReviews.id,
      companyId: companyReviews.companyId,
      userId: companyReviews.userId,
      rating: companyReviews.rating,
      title: companyReviews.title,
      comment: companyReviews.comment,
      employerReply: companyReviews.employerReply,
      createdAt: companyReviews.createdAt,
      user: users
    }).from(companyReviews).leftJoin(users, eq(companyReviews.userId, users.id)).where(eq(companyReviews.companyId, companyId)).orderBy(desc(companyReviews.createdAt));
  }
  async getCompanyAverageRating(companyId) {
    const result = await db.select({ avg: sql2`AVG(${companyReviews.rating})` }).from(companyReviews).where(eq(companyReviews.companyId, companyId));
    return result[0]?.avg || 0;
  }
  async createBookmark(userId, jobId) {
    const [bookmark] = await db.insert(bookmarks).values({ userId, jobId }).returning();
    return bookmark;
  }
  async deleteBookmark(userId, jobId) {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.jobId, jobId)));
    return true;
  }
  async getBookmarks(userId) {
    return db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
  }
  async isBookmarked(userId, jobId) {
    const result = await db.select().from(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.jobId, jobId)));
    return result.length > 0;
  }
  async getRecommendedJobs(userId, limit = 5) {
    const user = await this.getUser(userId);
    if (!user || user.role !== "employee") return [];
    const userQuals = await this.getQualificationsByUser(userId);
    const userSkills = userQuals.filter((q) => q.type === "skill").map((q) => q.title.toLowerCase());
    const userApps = await this.getApplicationsByUser(userId);
    const appliedJobIds = userApps.map((a) => a.jobId);
    const allJobs = await this.getAllJobs();
    const jobsScored = allJobs.filter((job) => !appliedJobIds.includes(job.id)).map((job) => {
      let score = 0;
      const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
      score += userSkills.filter((s) => jobSkills.includes(s)).length * 20;
      if (user.location && job.location && user.location.toLowerCase() === job.location.toLowerCase()) score += 15;
      if (user.bio) score += 5;
      return { ...job, score };
    }).sort((a, b) => b.score - a.score).slice(0, limit);
    return jobsScored;
  }
  async updateReviewReply(id, reply) {
    const [review] = await db.update(reviews).set({ adminReply: reply }).where(eq(reviews.id, id)).returning();
    return review;
  }
  async updateCompanyReviewReply(id, reply) {
    const [review] = await db.update(companyReviews).set({ employerReply: reply }).where(eq(companyReviews.id, id)).returning();
    return review;
  }
};
var storage = new DatabaseStorage();

// server/auth/auth.ts
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  let sessionStore;
  if (process.env.DATABASE_URL) {
    try {
      const PgSession = connectPgSimple(session);
      sessionStore = new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: "sessions",
        createTableIfMissing: true,
        ttl: sessionTtl / 1e3,
        pruneSessionInterval: false
      });
      if (sessionStore && typeof sessionStore.on === "function") {
        sessionStore.on("error", (err) => {
          console.error("Session store error (handled):", err);
        });
      }
    } catch (err) {
      console.error("Failed to initialize PgSession, falling back to MemoryStore:", err);
      const MemoryStoreSession = MemoryStore(session);
      sessionStore = new MemoryStoreSession({ checkPeriod: sessionTtl });
    }
  } else {
    const MemoryStoreSession = MemoryStore(session);
    sessionStore = new MemoryStoreSession({ checkPeriod: sessionTtl });
  }
  const secret = process.env.SESSION_SECRET || "dev-secret-key-for-development";
  if (!secret) {
    throw new Error("SESSION_SECRET must be set");
  }
  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: sessionTtl
    }
  });
}
async function setupAuth(app) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password) {
            return done(null, false, { message: "Invalid credentials" });
          }
          if (user.isBlocked) {
            return done(null, false, { message: "Your account has been blocked by administrator" });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      storage.getTwoFactorSecret(user.id).then((twoFa) => {
        const session2 = req.session;
        if (twoFa?.isEnabled && !session2.is2faVerified) {
          session2.pending2faUserId = user.id;
          return req.session.save((err2) => {
            if (err2) console.error("Error saving session for pending 2FA:", err2);
            return res.json({
              user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
              requiresTwoFa: true
            });
          });
        }
        req.logIn(user, (err2) => {
          if (err2) {
            return res.status(500).json({ message: "Login failed" });
          }
          return res.json({ user });
        });
      }).catch((err2) => {
        console.error("2FA check error during login:", err2);
        res.status(500).json({ message: "Login failed" });
      });
    })(req, res, next);
  });
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        id: void 0,
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : void 0
      });
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration failed" });
        }
        return res.json({ user });
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app.get("/api/logout", (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const twoFa = await storage.getTwoFactorSecret(req.user.id);
      const session2 = req.session;
      if (twoFa?.isEnabled && !session2.is2faVerified) {
        return res.status(401).json({ message: "2FA verification required", requiresTwoFa: true });
      }
    } catch (error) {
      console.error("IsAuthenticated 2FA check error:", error);
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

// server/auth/auth-routes.ts
import bcrypt2 from "bcryptjs";
import { randomBytes } from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// server/core/email.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";
var transporter = null;
function getEmailTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : void 0;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  if (user && pass && (host?.includes("gmail") || !host && user.includes("@gmail.com"))) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: pass.replace(/\s+/g, "")
        // strip any spaces in app password
      }
    });
    return transporter;
  }
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure,
      auth: {
        user,
        pass
      }
    });
    return transporter;
  }
  return null;
}
async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes = 60
}) {
  const mailTransporter = getEmailTransporter();
  const greeting = name ? `Hello ${name},` : "Hello,";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || "no-reply@jobconnect.com";
  const fromHeader = `"JobConnect Support" <${fromEmail}>`;
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f8;
      color: #1e293b;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0077b6 0%, #0096c7 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0f172a;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #0077b6 0%, #0096c7 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 16px;
      font-weight: 700;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0, 119, 182, 0.35);
      transition: all 0.2s ease;
    }
    .note-box {
      background-color: #f8fafc;
      border-left: 4px solid #0077b6;
      padding: 14px 16px;
      border-radius: 4px;
      margin: 24px 0;
      font-size: 14px;
      color: #475569;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 24px;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>JobConnect</h1>
    </div>
    <div class="content">
      <p class="greeting">${greeting}</p>
      <p>We received a request to reset the password for your JobConnect account associated with <strong>${to}</strong>.</p>
      <p>Click the button below to choose a new, secure password:</p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
      </div>

      <div class="note-box">
        <strong>Important:</strong> This password reset link will expire in <strong>${expiresInMinutes} minutes</strong>. For your security, the link can only be used once.
      </div>

      <p style="font-size: 14px; color: #64748b;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <div class="link-fallback">
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}" style="color: #0077b6;">${resetUrl}</a></p>
      </div>
    </div>
    <div class="footer">
      <p>\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} JobConnect Inc. All rights reserved.</p>
      <p>Security & Privacy Protection System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  const textContent = `
${greeting}

We received a request to reset the password for your JobConnect account associated with ${to}.

Please reset your password by opening the following link in your browser:
${resetUrl}

This link is valid for ${expiresInMinutes} minutes and can only be used once.

If you did not request this password reset, please disregard this email. Your password will remain unchanged.

\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} JobConnect Inc.
  `.trim();
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev";
      const { data, error } = await resend.emails.send({
        from: `JobConnect <${resendFrom}>`,
        to: [to],
        subject: "Reset your JobConnect password",
        html: htmlContent,
        text: textContent
      });
      if (error) {
        console.error(`[RESEND ERROR] Failed to send email via Resend:`, error);
      } else {
        console.log(`[EMAIL] Password reset email delivered via Resend to ${to} (id: ${data?.id})`);
        return { success: true };
      }
    } catch (err) {
      console.error(`[RESEND ERROR]`, err);
    }
  }
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: fromHeader,
        to,
        subject: "Reset your JobConnect password",
        text: textContent,
        html: htmlContent
      });
      console.log(`[EMAIL] \u2705 Password reset email delivered successfully via SMTP to: ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`[EMAIL ERROR] \u274C Failed to deliver email via SMTP:`, error);
    }
  }
  console.log("\n==================== [PASSWORD RESET EMAIL] ====================");
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: Reset your JobConnect password`);
  console.log(`RESET URL: ${resetUrl}`);
  console.log(`EXPIRATION: ${expiresInMinutes} minutes`);
  console.log("=================================================================\n");
  return { success: true };
}

// server/auth/auth-routes.ts
import { z as z2 } from "zod";
var requestCooldowns = /* @__PURE__ */ new Map();
async function setupAuthRoutes(app) {
  app.get("/api/logout", (req, res) => {
    if (req.session) {
      delete req.session.is2faVerified;
    }
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const emailSchema = z2.object({
        email: z2.string().email("Please provide a valid email address")
      });
      const parsed = emailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid email" });
      }
      const email = parsed.data.email.trim().toLowerCase();
      const now = Date.now();
      const lastRequest = requestCooldowns.get(email);
      if (lastRequest && now - lastRequest < 3e4) {
        const remainingSeconds = Math.ceil((3e4 - (now - lastRequest)) / 1e3);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another reset email.`
        });
      }
      requestCooldowns.set(email, now);
      const user = await storage.getUserByEmail(email);
      if (user && !user.isBlocked) {
        const token = randomBytes(32).toString("hex");
        const expiresInMinutes = 60;
        const expiresAt = new Date(Date.now() + 1e3 * 60 * expiresInMinutes);
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        const resetUrl = `${origin}/reset-password?token=${token}`;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
        await sendPasswordResetEmail({
          to: user.email,
          name: fullName || void 0,
          resetUrl,
          expiresInMinutes
        });
      }
      return res.status(200).json({
        message: "If an account with that email exists, password reset instructions have been sent to it."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
  });
  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const token = req.query.token?.trim();
      if (!token) {
        return res.status(400).json({ valid: false, message: "Reset token is required" });
      }
      const resetTokenRecord = await storage.getPasswordResetToken(token);
      if (!resetTokenRecord) {
        return res.status(400).json({
          valid: false,
          message: "This password reset link is invalid or has already been used."
        });
      }
      if (new Date(resetTokenRecord.expiresAt) < /* @__PURE__ */ new Date()) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({
          valid: false,
          message: "This password reset link has expired. Please request a new one."
        });
      }
      const user = await storage.getUser(resetTokenRecord.userId);
      if (!user) {
        return res.status(400).json({ valid: false, message: "User not found." });
      }
      return res.json({
        valid: true,
        email: user.email
      });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify reset token." });
    }
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetSchema = z2.object({
        token: z2.string().min(1, "Reset token is required"),
        password: z2.string().min(8, "Password must be at least 8 characters long").max(100, "Password is too long")
      });
      const parsed = resetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { token, password } = parsed.data;
      const resetTokenRecord = await storage.getPasswordResetToken(token);
      if (!resetTokenRecord) {
        return res.status(400).json({
          message: "This password reset link is invalid or has already been used. Please request a new one."
        });
      }
      if (new Date(resetTokenRecord.expiresAt) < /* @__PURE__ */ new Date()) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({
          message: "This password reset link has expired. Please request a new one."
        });
      }
      const hashedPassword = await bcrypt2.hash(password, 10);
      await storage.updateUserPassword(resetTokenRecord.userId, hashedPassword);
      await storage.deletePasswordResetToken(token);
      return res.json({
        message: "Your password has been successfully reset. You can now sign in with your new password."
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again." });
    }
  });
  app.get("/api/auth/2fa/setup", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const secret = speakeasy.generateSecret({
        name: `JobConnect (${user?.email || "User"})`,
        issuer: "JobConnect",
        length: 32
      });
      const backupCodes = Array.from({ length: 8 }, () => randomBytes(4).toString("hex").toUpperCase());
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);
      req.session.pending2fa = {
        secret: secret.base32,
        backupCodes
      };
      req.session.twoFactorSecret = secret.base32;
      await new Promise((resolve) => req.session.save(() => resolve()));
      res.json({
        secret: secret.base32,
        qrCode,
        backupCodes
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });
  app.post("/api/auth/2fa/enable", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { code } = req.body;
      const pending = req.session?.pending2fa;
      const sessionSecret = pending?.secret || req.session?.twoFactorSecret;
      if (!sessionSecret) {
        return res.status(400).json({ message: "2FA setup session expired. Please refresh and try again." });
      }
      const cleanCode = (code || "").toString().trim().replace(/\s+/g, "");
      const isValid = speakeasy.totp.verify({
        secret: sessionSecret,
        encoding: "base32",
        token: cleanCode,
        window: 2
      });
      if (!isValid) {
        return res.status(400).json({ message: "Invalid 6-digit code. Please verify your authenticator app time." });
      }
      const backupCodes = pending?.backupCodes || [];
      await storage.enableTwoFactor(userId, sessionSecret, backupCodes);
      delete req.session.pending2fa;
      delete req.session.twoFactorSecret;
      req.session.is2faVerified = true;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      const user = await storage.getUser(userId);
      res.json({
        message: "2FA enabled successfully",
        user,
        backupCodes
      });
    } catch (error) {
      console.error("Enable 2FA error:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });
  app.post("/api/auth/2fa/disable", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { code, password } = req.body;
      const user = await storage.getUser(userId);
      if (!user?.password) {
        return res.status(400).json({ message: "Invalid user account" });
      }
      const isPasswordValid = await bcrypt2.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      const twoFa = await storage.getTwoFactorSecret(userId);
      if (code && twoFa?.secret) {
        const cleanCode = (code || "").toString().trim().replace(/\s+/g, "");
        const isCodeValid = speakeasy.totp.verify({
          secret: twoFa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 2
        });
        if (!isCodeValid && !await storage.consumeBackupCode(userId, cleanCode)) {
          return res.status(400).json({ message: "Invalid 2FA code" });
        }
      }
      await storage.disableTwoFactor(userId);
      if (req.session) {
        req.session.is2faVerified = false;
        await new Promise((resolve) => req.session.save(() => resolve()));
      }
      res.json({ message: "2FA disabled successfully" });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
  app.get("/api/auth/2fa/status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const twoFa = await storage.getTwoFactorSecret(userId);
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.json({
        isEnabled: Boolean(twoFa?.isEnabled),
        isVerifiedInSession: Boolean(req.session?.is2faVerified)
      });
    } catch (error) {
      console.error("2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });
  app.post("/api/auth/2fa/verify", async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.body.userId || req.session?.pending2faUserId;
      if (!userId || !code) {
        return res.status(400).json({ message: "Verification code and User ID are required" });
      }
      const twoFa = await storage.getTwoFactorSecret(userId);
      if (!twoFa?.isEnabled || !twoFa?.secret) {
        return res.status(400).json({ message: "2FA is not active on this account" });
      }
      const cleanCode = (code || "").toString().trim().replace(/\s+/g, "");
      let isValid = false;
      if (/^\d{6}$/.test(cleanCode)) {
        isValid = speakeasy.totp.verify({
          secret: twoFa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 2
          // ±60s clock drift
        });
      }
      if (!isValid) {
        isValid = await storage.consumeBackupCode(userId, cleanCode);
      }
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired 2FA code. Please check your authenticator app." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User account not found" });
      }
      req.session.is2faVerified = true;
      delete req.session.pending2faUserId;
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error establishing login session in 2FA:", err);
          return res.status(500).json({ message: "Failed to log in" });
        }
        req.session.save(() => {
          res.json({
            message: "2FA verified successfully",
            user
          });
        });
      });
    } catch (error) {
      console.error("2FA verify error:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });
}

// server/routes.ts
function calculateMatchScore(userQualifications, job) {
  if (!userQualifications || userQualifications.length === 0) return 30;
  let score = 40;
  const skills = userQualifications.filter((q) => q.type === "skill");
  const experience = userQualifications.filter((q) => q.type === "experience");
  const education = userQualifications.filter((q) => q.type === "education");
  const certifications = userQualifications.filter((q) => q.type === "certification");
  if (job.requiredSkills && job.requiredSkills.length > 0) {
    const userSkillNames = skills.map((s) => s.title.toLowerCase());
    const matchedSkills = job.requiredSkills.filter(
      (rs) => userSkillNames.some((us) => us.includes(rs.toLowerCase()) || rs.toLowerCase().includes(us))
    );
    score += matchedSkills.length / job.requiredSkills.length * 20;
  } else if (skills.length > 0) {
    score += 15;
  }
  if (job.requiredExperience) {
    const totalYears = experience.length * 2;
    if (totalYears >= job.requiredExperience) {
      score += 15;
    } else {
      score += totalYears / job.requiredExperience * 10;
    }
  } else if (experience.length > 0) {
    score += 10;
  }
  if (job.requiredEducation) {
    const hasRelevantEducation = education.some(
      (e) => e.title.toLowerCase().includes("bachelor") || e.title.toLowerCase().includes("master") || e.title.toLowerCase().includes("phd") || e.title.toLowerCase().includes("degree")
    );
    if (hasRelevantEducation) score += 10;
  } else if (education.length > 0) {
    score += 8;
  }
  if (certifications.length > 0) {
    score += Math.min(certifications.length * 3, 10);
  }
  return Math.min(Math.round(score), 100);
}
async function registerRoutes(httpServer, app) {
  await setupAuth(app);
  await setupAuthRoutes(app);
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app.patch("/api/users/role", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      if (currentUser?.role) {
        return res.status(403).json({ message: "Role already assigned" });
      }
      const { role } = req.body;
      if (!["employee", "employer", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  app.patch("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { firstName, lastName, phone, location, bio, profileImageUrl } = req.body;
      const user = await storage.updateUserProfile(userId, { firstName, lastName, phone, location, bio, profileImageUrl });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app.patch("/api/users/password", isAuthenticated, async (req, res) => {
    try {
      const import_bcrypt = await import("bcryptjs");
      const bcrypt3 = import_bcrypt.default;
      const userId = req.user?.id || req.user?.claims?.sub;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "User not found" });
      }
      const isMatch = await bcrypt3.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt3.hash(newPassword, 10);
      const updatedUser = await storage.updateUserPassword(userId, hashedPassword);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  app.patch("/api/users/email", isAuthenticated, async (req, res) => {
    try {
      const import_bcrypt = await import("bcryptjs");
      const bcrypt3 = import_bcrypt.default;
      const userId = req.user?.id || req.user?.claims?.sub;
      const { newEmail, password } = req.body;
      if (!newEmail || !password) {
        return res.status(400).json({ message: "New email and password are required" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "User not found" });
      }
      const isMatch = await bcrypt3.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Password is incorrect" });
      }
      const existingUser = await storage.getUserByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const updatedUser = await storage.updateUserEmail(userId, newEmail);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(500).json({ message: "Failed to update email" });
    }
  });
  app.get("/api/employee/interacted-companies", isAuthenticated, requireRole(["employee"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const companies2 = await storage.getEmployeeInteractedCompanies(userId);
      res.json(companies2);
    } catch (error) {
      console.error("Error fetching interacted companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  app.get("/api/admin/companies/:companyId/feedback", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { companyId } = req.params;
      const { rating } = req.query;
      const reviews2 = await storage.getCompanyReviews(companyId);
      let filteredReviews = reviews2;
      if (rating) {
        filteredReviews = reviews2.filter((r) => r.rating === parseInt(rating));
      }
      res.json(filteredReviews);
    } catch (error) {
      console.error("Error fetching company feedback for admin:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });
  app.get("/api/admin/feedback/trends", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const allCompanies = await storage.getAllCompanies();
      const trends = await Promise.all(allCompanies.map(async (company) => {
        const reviews2 = await storage.getCompanyReviews(company.id);
        const average = reviews2.length > 0 ? reviews2.reduce((acc, r) => acc + r.rating, 0) / reviews2.length : 0;
        return {
          companyId: company.id,
          companyName: company.name,
          averageRating: average,
          reviewCount: reviews2.length
        };
      }));
      res.json(trends);
    } catch (error) {
      console.error("Error fetching feedback trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });
  app.patch("/api/admin/users/:id/block", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.blockUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });
  app.patch("/api/admin/users/:id/unblock", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.unblockUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });
  app.get("/api/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allJobs = await storage.getAllJobs();
      const allCompanies = await storage.getAllCompanies();
      const jobSeekers = allUsers.filter((u) => u.role === "employee").length;
      const activeJobs = allJobs.length;
      const topCompanies = allCompanies.length;
      const successfulHires = Math.floor(jobSeekers * 0.5);
      res.json({
        activeJobs: Math.max(activeJobs, 1),
        topCompanies: Math.max(topCompanies, 1),
        jobSeekers: Math.max(jobSeekers, 1),
        successfulHires: Math.max(successfulHires, 0)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.json({
        activeJobs: 1,
        topCompanies: 1,
        jobSeekers: 1,
        successfulHires: 0
      });
    }
  });
  app.get("/api/employer/stats", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployerStats(userId);
      const company = await storage.getCompanyByUser(userId);
      let reviewStats = { ratings: [0, 0, 0, 0, 0], average: 0 };
      if (company) {
        const reviews2 = await storage.getCompanyReviews(company.id);
        const ratings = [0, 0, 0, 0, 0];
        reviews2.forEach((r) => {
          if (r.rating >= 1 && r.rating <= 5) ratings[r.rating - 1]++;
        });
        reviewStats = {
          ratings,
          average: reviews2.length > 0 ? reviews2.reduce((acc, r) => acc + r.rating, 0) / reviews2.length : 0
        };
      }
      res.json({ ...stats, reviewStats });
    } catch (error) {
      console.error("Error fetching employer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app.patch("/api/admin/jobs/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.adminUpdateJob(id, req.body);
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  app.delete("/api/admin/jobs/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.adminDeleteJob(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  app.post("/api/feedback", async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub || null;
      const { rating, feedback, userName, userRole, subject, message } = req.body;
      const finalFeedback = message ? `${subject ? subject + "\n\n" : ""}${message}` : feedback;
      const finalRating = rating || 5;
      if (!finalFeedback || finalFeedback.length < 5) {
        return res.status(400).json({ message: "Feedback or message is too short" });
      }
      const review = await storage.createReview({
        userId,
        userName: userName || req.user?.firstName || "Anonymous",
        userRole: userRole || req.user?.role || "employee",
        rating: finalRating,
        feedback: finalFeedback
      });
      res.json(review);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Invalid feedback data provided" });
    }
  });
  app.post("/api/reviews", async (req, res) => {
    req.url = "/api/feedback";
    return app._router.handle(req, res, () => {
    });
  });
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getAllReviews();
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app.post("/api/companies/:companyId/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { companyId } = req.params;
      const { rating, title, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating" });
      }
      const review = await storage.createCompanyReview({
        companyId,
        userId,
        rating,
        title,
        comment
      });
      res.json(review);
    } catch (error) {
      console.error("Error creating company review:", error);
      res.status(500).json({ message: "Failed to create company review" });
    }
  });
  app.get("/api/companies/:companyId/reviews", async (req, res) => {
    try {
      const { companyId } = req.params;
      const reviews2 = await storage.getCompanyReviews(companyId);
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching company reviews:", error);
      res.status(500).json({ message: "Failed to fetch company reviews" });
    }
  });
  app.get("/api/companies/:companyId/rating", async (req, res) => {
    try {
      const { companyId } = req.params;
      const avgRating = await storage.getCompanyAverageRating(companyId);
      res.json({ rating: avgRating });
    } catch (error) {
      console.error("Error fetching company rating:", error);
      res.status(500).json({ message: "Failed to fetch company rating" });
    }
  });
  app.get("/api/employee/my-feedback", isAuthenticated, requireRole(["employee"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const allReviews = await storage.getAllReviews();
      const userReviews = allReviews.filter((r) => r.userId === userId);
      res.json(userReviews);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });
  app.get("/api/employee/my-company-reviews", isAuthenticated, requireRole(["employee"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const allCompanyReviews = await storage.getAllCompanyReviews();
      const userReviews = allCompanyReviews.filter((r) => r.userId === userId);
      const enrichedReviews = await Promise.all(
        userReviews.map(async (review) => {
          const company = await storage.getCompanyById(review.companyId);
          return { ...review, company };
        })
      );
      res.json(enrichedReviews);
    } catch (error) {
      console.error("Error fetching company reviews:", error);
      res.status(500).json({ message: "Failed to fetch company reviews" });
    }
  });
  app.get("/api/admin/reviews", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const allReviews = await storage.getAllReviews();
      res.json(allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app.get("/api/admin/users", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app.get("/api/admin/applications", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const employers = allUsers.filter((u) => u.role === "employer");
      const allApps = await Promise.all(
        employers.map((e) => storage.getApplicationsByEmployer(e.id))
      );
      res.json(allApps.flat());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app.get("/api/admin/jobs", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const jobs2 = await storage.getAllJobs();
      res.json(jobs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  app.delete("/api/admin/feedback/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteReview(id);
      if (!success) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      res.status(500).json({ message: "Failed to delete feedback" });
    }
  });
  app.get("/api/employer/applications/shortlisted", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications2 = await storage.getApplicationsByEmployer(userId);
      const shortlisted = applications2.filter((a) => a.status === "accepted");
      res.json(shortlisted);
    } catch (error) {
      console.error("Error fetching shortlisted candidates:", error);
      res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
    }
  });
  app.delete("/api/admin/reviews/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    req.url = `/api/admin/feedback/${req.params.id}`;
    return app._router.handle(req, res, () => {
    });
  });
  app.delete("/api/users/account", isAuthenticated, async (req, res) => {
    try {
      const import_bcrypt = await import("bcryptjs");
      const bcrypt3 = import_bcrypt.default;
      const userId = req.user?.id || req.user?.claims?.sub;
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required for account deletion" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "User not found" });
      }
      const isMatch = await bcrypt3.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      await storage.deleteUser(userId);
      req.logout((err) => {
        if (err) {
          console.error("Logout error during account deletion:", err);
        }
        res.json({ success: true, message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
  app.patch("/api/admin/reviews/:id/reply", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const review = await storage.updateReviewReply(id, reply);
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reply" });
    }
  });
  app.patch("/api/employer/company-reviews/:id/reply", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const review = await storage.updateCompanyReviewReply(id, reply);
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reply" });
    }
  });
  app.get("/api/users/check-email", async (req, res) => {
    try {
      const email = req.query.email;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      res.json({ exists: !!user });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.get("/api/qualifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const qualifications2 = await storage.getQualificationsByUser(userId);
      res.json(qualifications2);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      res.status(500).json({ message: "Failed to fetch qualifications" });
    }
  });
  app.post("/api/qualifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const data = insertQualificationSchema.parse(req.body);
      const qualification = await storage.createQualification({ ...data, userId });
      res.json(qualification);
    } catch (error) {
      console.error("Error creating qualification:", error);
      res.status(500).json({ message: "Failed to create qualification" });
    }
  });
  app.patch("/api/qualifications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      const qualification = await storage.updateQualification(id, userId, req.body);
      if (!qualification) {
        return res.status(404).json({ message: "Qualification not found" });
      }
      res.json(qualification);
    } catch (error) {
      console.error("Error updating qualification:", error);
      res.status(500).json({ message: "Failed to update qualification" });
    }
  });
  app.delete("/api/qualifications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      await storage.deleteQualification(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting qualification:", error);
      res.status(500).json({ message: "Failed to delete qualification" });
    }
  });
  app.get("/api/employer/applications/recent", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications2 = await storage.getApplicationsByEmployer(userId);
      res.json(applications2.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent applications:", error);
      res.status(500).json({ message: "Failed to fetch recent applications" });
    }
  });
  app.get("/api/employer/jobs/recent", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs2 = await storage.getJobsByEmployer(userId);
      res.json(jobs2.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
      res.status(500).json({ message: "Failed to fetch recent jobs" });
    }
  });
  app.get("/api/employer/company", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const company = await storage.getCompanyByUser(userId);
      if (!company) {
        return res.status(404).json({ message: "No company found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching employer company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });
  app.post("/api/companies", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany({ ...data, userId });
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });
  app.patch("/api/companies/:id", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      const company = await storage.updateCompany(id, userId, req.body);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs2 = await storage.getAllJobs();
      const qualifications2 = await storage.getQualificationsByUser(userId);
      const jobsWithScores = jobs2.map((job) => ({
        job,
        matchScore: calculateMatchScore(qualifications2, job)
      }));
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      res.json(jobsWithScores);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  app.get("/api/jobs/recommended", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs2 = await storage.getAllJobs();
      const qualifications2 = await storage.getQualificationsByUser(userId);
      const jobsWithScores = jobs2.map((job) => ({
        job,
        matchScore: calculateMatchScore(qualifications2, job)
      }));
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      res.json(jobsWithScores.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });
  app.get("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const bookmarks2 = await storage.getBookmarks(userId);
      const bookmarkedJobs = await Promise.all(
        bookmarks2.map(async (bm) => {
          const job = await storage.getJobById(bm.jobId);
          return job ? { ...job, isBookmarked: true } : null;
        })
      );
      res.json(bookmarkedJobs.filter((j) => j !== null));
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });
  app.post("/api/bookmarks/:jobId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { jobId } = req.params;
      const bookmark = await storage.createBookmark(userId, jobId);
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });
  app.delete("/api/bookmarks/:jobId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { jobId } = req.params;
      await storage.deleteBookmark(userId, jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });
  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      const job = await storage.getJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      const qualifications2 = await storage.getQualificationsByUser(userId);
      const matchScore = calculateMatchScore(qualifications2, job);
      res.json({ job, matchScore });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });
  app.get("/api/employer/jobs", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs2 = await storage.getJobsByEmployer(userId);
      res.json(jobs2);
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  app.post("/api/jobs", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const company = await storage.getCompanyByUser(userId);
      if (!company) {
        return res.status(400).json({ message: "Please create a company first" });
      }
      const jobData = { ...req.body };
      if (jobData.applicationDeadline && typeof jobData.applicationDeadline === "string") {
        jobData.applicationDeadline = new Date(jobData.applicationDeadline);
      }
      const data = insertJobSchema.parse(jobData);
      const job = await storage.createJob({ ...data, employerId: userId, companyId: company.id });
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });
  app.patch("/api/jobs/:id", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      const job = await storage.updateJob(id, userId, req.body);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  app.delete("/api/jobs/:id", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      await storage.deleteJob(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  app.get("/api/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications2 = await storage.getApplicationsByUser(userId);
      res.json(applications2);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app.delete("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      await storage.deleteApplication(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      res.status(500).json({ message: "Failed to withdraw application" });
    }
  });
  app.get("/api/applications/job/:jobId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { jobId } = req.params;
      const application = await storage.getApplicationByUserAndJob(userId, jobId);
      res.json(application || null);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });
  app.post("/api/jobs/:id/apply", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id: jobId } = req.params;
      const { coverLetter } = req.body;
      const existing = await storage.getApplicationByUserAndJob(userId, jobId);
      if (existing) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (job.applicationDeadline && /* @__PURE__ */ new Date() > new Date(job.applicationDeadline)) {
        return res.status(400).json({ message: "Application deadline has passed for this job" });
      }
      const qualifications2 = await storage.getQualificationsByUser(userId);
      const matchScore = calculateMatchScore(qualifications2, job);
      if (matchScore < 70) {
        return res.status(400).json({ message: "Your qualifications don't meet the minimum requirements for this position" });
      }
      const application = await storage.createApplication({
        userId,
        jobId,
        coverLetter,
        matchScore
      });
      res.json(application);
    } catch (error) {
      console.error("Error applying for job:", error);
      res.status(500).json({ message: "Failed to apply for job" });
    }
  });
  app.get("/api/employer/applications", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications2 = await storage.getApplicationsByEmployer(userId);
      res.json(applications2);
    } catch (error) {
      console.error("Error fetching employer applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app.get("/api/employer/jobs/:jobId/applications", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { jobId } = req.params;
      const job = await storage.getJobById(jobId);
      if (!job || job.employerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this job's applications" });
      }
      const allApps = await storage.getApplicationsByEmployer(userId);
      const jobApps = allApps.filter((app2) => app2.jobId === jobId);
      res.json(jobApps);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app.patch("/api/employer/applications/:appId/status", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { appId } = req.params;
      const { status } = req.body;
      if (!["pending", "reviewed", "accepted", "rejected", "shortlisted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const app2 = await storage.getApplicationById(appId);
      if (!app2) {
        return res.status(404).json({ message: "Application not found" });
      }
      const job = await storage.getJobById(app2.jobId);
      if (!job || job.employerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      const updated = await storage.updateApplicationStatus(appId, status);
      res.json({ message: "Application status updated", application: updated });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });
  app.get("/api/employer/shortlisted", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications2 = await storage.getApplicationsByEmployer(userId);
      const shortlisted = applications2.filter((app2) => app2.status === "shortlisted").slice(0, 10);
      res.json(shortlisted);
    } catch (error) {
      console.error("Error fetching shortlisted candidates:", error);
      res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
    }
  });
  app.patch("/api/applications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["pending", "reviewed", "accepted", "rejected", "shortlisted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const application = await storage.updateApplicationStatus(id, status);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });
  app.get("/api/employee/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployeeStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app.get("/api/employer/stats", isAuthenticated, requireRole(["employer"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching employer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app.get("/api/admin/stats", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app.get("/api/admin/users", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app.patch("/api/admin/users/:id/role", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      const { role } = req.body;
      const updatedUser = await storage.updateUserRole(id, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app.get("/api/admin/jobs", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const jobs2 = await storage.getAllJobs();
      res.json(jobs2);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  app.patch("/api/admin/jobs/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      const updatedJob = await storage.adminUpdateJob(id, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  app.delete("/api/admin/jobs/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      await storage.adminDeleteJob(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });
  app.get("/api/admin/applications", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const apps = await storage.getAllApplicationsWithDetails();
      res.json(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app.patch("/api/admin/applications/:id/status", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      const { status } = req.body;
      const updated = await storage.updateApplicationStatus(id, status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });
  app.delete("/api/admin/applications/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      await storage.deleteApplication(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });
  app.get("/api/admin/companies", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const companies2 = await storage.getAllCompanies();
      res.json(companies2);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  app.patch("/api/admin/companies/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      const updated = await storage.adminUpdateCompany(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });
  app.delete("/api/admin/companies/:id", isAuthenticated, requireRole(["admin"]), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { id } = req.params;
      await storage.adminDeleteCompany(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });
  return httpServer;
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function createApp() {
  const app = express();
  app.use(cookieParser());
  const httpServer = createServer(app);
  app.use(
    express.json({
      limit: "50mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: false, limit: "50mb" }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });
    next();
  });
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error(err);
  });
  return { app, httpServer };
}

// server/vercel.ts
var appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}
async function handler(req, res) {
  try {
    const { app } = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: error?.message || "Internal Server Error" }));
  }
}
export {
  handler as default
};
