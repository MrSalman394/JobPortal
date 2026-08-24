import {
  users,
  qualifications,
  companies,
  jobs,
  applications,
  reviews,
  companyReviews,
  bookmarks,
  passwordResetTokens,
  twoFactorSecrets,
  type User,
  type UpsertUser,
  type Qualification,
  type InsertQualification,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Review,
  type CompanyReview,
} from "../../shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, ilike, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User> & { email: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  updateUserEmail(id: string, email: string): Promise<User | undefined>;
  updateUserEmailVerified(id: string, isVerified: boolean): Promise<User | undefined>;
  blockUser(id: string): Promise<User | undefined>;
  unblockUser(id: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  createReview(data: any): Promise<any>;
  getAllReviews(): Promise<any[]>;

  // Qualification operations
  getQualificationsByUser(userId: string): Promise<Qualification[]>;
  createQualification(data: InsertQualification & { userId: string }): Promise<Qualification>;
  updateQualification(id: string, userId: string, data: Partial<Qualification>): Promise<Qualification | undefined>;
  deleteQualification(id: string, userId: string): Promise<boolean>;

  // Company operations
  getCompanyByUser(userId: string): Promise<Company | undefined>;
  getCompanyById(id: string): Promise<Company | undefined>;
  createCompany(data: InsertCompany & { userId: string }): Promise<Company>;
  updateCompany(id: string, userId: string, data: Partial<Company>): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;

  // Job operations
  getAllJobs(): Promise<(Job & { company: Company | null })[]>;
  getJobById(id: string): Promise<(Job & { company: Company | null }) | undefined>;
  getJobsByEmployer(employerId: string): Promise<Job[]>;
  createJob(data: InsertJob & { employerId: string; companyId: string }): Promise<Job>;
  updateJob(id: string, employerId: string, data: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string, employerId: string): Promise<boolean>;
  adminUpdateJob(id: string, data: Partial<Job>): Promise<Job | undefined>;
  adminDeleteJob(id: string): Promise<boolean>;

  // Application operations
  getApplicationsByUser(userId: string): Promise<(Application & { job: Job & { company: Company | null } })[]>;
  getApplicationsByEmployer(employerId: string): Promise<(Application & { user: User & { qualifications?: Qualification[] }; job: Job })[]>;
  getApplicationByUserAndJob(userId: string, jobId: string): Promise<Application | undefined>;
  createApplication(data: InsertApplication & { userId: string; jobId: string }): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  deleteApplication(id: string, userId?: string): Promise<boolean>;

  // Company reviews
  createCompanyReview(data: any): Promise<any>;
  getCompanyReviews(companyId: string): Promise<any[]>;
  getCompanyAverageRating(companyId: string): Promise<number>;
  getAllCompanyReviews(): Promise<CompanyReview[]>;

  // Bookmark operations
  createBookmark(userId: string, jobId: string): Promise<any>;
  deleteBookmark(userId: string, jobId: string): Promise<boolean>;
  getBookmarks(userId: string): Promise<any[]>;
  isBookmarked(userId: string, jobId: string): Promise<boolean>;
  getRecommendedJobs(userId: string, limit?: number): Promise<any[]>;

  // Stats
  getEmployeeStats(userId: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    matchingJobs: number;
  }>;
  getEmployerStats(userId: string): Promise<{
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalViews: number;
  }>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalEmployers: number;
    totalEmployees: number;
    totalJobs: number;
    activeJobs: number;
    totalCompanies: number;
    totalApplications: number;
  }>;

  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any>;
  getPasswordResetToken(token: string): Promise<any>;
  deletePasswordResetToken(token: string): Promise<boolean>;

  // Two-factor operations
  createOrUpdateTwoFactor(userId: string, secret: string): Promise<any>;
  enableTwoFactor(userId: string, secret: string): Promise<any>;
  getTwoFactorSecret(userId: string): Promise<any>;
  disableTwoFactor(userId: string): Promise<boolean>;

  // New Employee helper
  getEmployeeInteractedCompanies(userId: string): Promise<Company[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(ilike(users.email, email.trim()));
    return user;
  }

  async createUser(userData: Partial<User> & { email: string }): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserEmail(id: string, email: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ email, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserEmailVerified(id: string, isVerified: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isEmailVerified: isVerified, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async blockUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isBlocked: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async unblockUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isBlocked: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createReview(data: any): Promise<any> {
    const [review] = await db.insert(reviews).values(data).returning();
    return review;
  }

  async getAllReviews(): Promise<any[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async deleteReview(id: string): Promise<boolean> {
    await db.delete(reviews).where(eq(reviews.id, id));
    return true;
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async getAllApplicationsWithDetails(): Promise<any[]> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.createdAt));
    
    return result.map((r: any) => ({
      ...r.applications,
      user: r.users,
      job: r.jobs,
    }));
  }

  async deleteApplication(id: string, userId?: string): Promise<boolean> {
    await db
      .delete(applications)
      .where(userId ? and(eq(applications.id, id), eq(applications.userId, userId)) : eq(applications.id, id));
    return true;
  }

  async adminUpdateCompany(id: string, data: Partial<Company>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async adminDeleteCompany(id: string): Promise<boolean> {
    await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // Qualification operations
  async getQualificationsByUser(userId: string): Promise<Qualification[]> {
    return db.select().from(qualifications).where(eq(qualifications.userId, userId)).orderBy(desc(qualifications.createdAt));
  }

  async createQualification(data: InsertQualification & { userId: string }): Promise<Qualification> {
    const [qual] = await db.insert(qualifications).values(data).returning();
    return qual;
  }

  async updateQualification(id: string, userId: string, data: Partial<Qualification>): Promise<Qualification | undefined> {
    const [qual] = await db
      .update(qualifications)
      .set(data)
      .where(and(eq(qualifications.id, id), eq(qualifications.userId, userId)))
      .returning();
    return qual;
  }

  async deleteQualification(id: string, userId: string): Promise<boolean> {
    await db
      .delete(qualifications)
      .where(and(eq(qualifications.id, id), eq(qualifications.userId, userId)));
    return true;
  }

  // Company operations
  async getCompanyByUser(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(data: InsertCompany & { userId: string }): Promise<Company> {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  }

  async updateCompany(id: string, userId: string, data: Partial<Company>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(companies.id, id), eq(companies.userId, userId)))
      .returning();
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  // Job operations
  async getAllJobs(): Promise<(Job & { company: Company | null })[]> {
    const result = await db
      .select()
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.status, 'active'))
      .orderBy(desc(jobs.createdAt));
    
    return result.map((r: any) => ({
      ...r.jobs,
      company: r.companies,
    }));
  }

  async getJobById(id: string): Promise<(Job & { company: Company | null }) | undefined> {
    const [result] = await db
      .select()
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(jobs.id, id));
    
    if (!result) return undefined;
    return { ...result.jobs, company: result.companies };
  }

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    return db.select().from(jobs).where(eq(jobs.employerId, employerId)).orderBy(desc(jobs.createdAt));
  }

  async createJob(data: InsertJob & { employerId: string; companyId: string }): Promise<Job> {
    const [job] = await db.insert(jobs).values(data).returning();
    return job;
  }

  async updateJob(id: string, employerId: string, data: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(jobs.id, id), eq(jobs.employerId, employerId)))
      .returning();
    return job;
  }

  async deleteJob(id: string, employerId: string): Promise<boolean> {
    await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.employerId, employerId)));
    return true;
  }

  async adminUpdateJob(id: string, data: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async adminDeleteJob(id: string): Promise<boolean> {
    await db.delete(jobs).where(eq(jobs.id, id));
    return true;
  }

  // Application operations
  async getApplicationsByUser(userId: string): Promise<(Application & { job: Job & { company: Company | null } })[]> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
    
    return result.map((r: any) => ({
      ...r.applications,
      job: { ...r.jobs, company: r.companies },
    }));
  }

  async getApplicationsByEmployer(employerId: string): Promise<(Application & { user: User & { qualifications?: Qualification[] }; job: Job })[]> {
    const result = await db
      .select()
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(jobs.employerId, employerId))
      .orderBy(desc(applications.createdAt));
    
    const appsWithQuals = await Promise.all(
      result.map(async (r: any) => {
        const quals = await this.getQualificationsByUser(r.users.id);
        return {
          ...r.applications,
          user: { ...r.users, qualifications: quals },
          job: r.jobs,
        };
      })
    );
    
    return appsWithQuals;
  }

  async getApplicationByUserAndJob(userId: string, jobId: string): Promise<Application | undefined> {
    const [app] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.userId, userId), eq(applications.jobId, jobId)));
    return app;
  }

  async createApplication(data: InsertApplication & { userId: string; jobId: string }): Promise<Application> {
    const [app] = await db.insert(applications).values(data).returning();
    return app;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [app] = await db
      .update(applications)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return app;
  }

  // Stats
  async getEmployeeStats(userId: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    matchingJobs: number;
  }> {
    const apps = await this.getApplicationsByUser(userId);
    const allJobs = await this.getAllJobs();
    
    return {
      totalApplications: apps.length,
      pendingApplications: apps.filter(a => a.status === 'pending').length,
      acceptedApplications: apps.filter(a => a.status === 'accepted').length,
      rejectedApplications: apps.filter(a => a.status === 'rejected').length,
      matchingJobs: allJobs.length,
    };
  }

  async getEmployerStats(userId: string): Promise<{
    activeJobs: number;
    totalApplications: number;
    pendingApplications: number;
    totalViews: number;
  }> {
    const userJobs = await this.getJobsByEmployer(userId);
    const apps = await this.getApplicationsByEmployer(userId);
    
    return {
      activeJobs: userJobs.filter((j: any) => j.status === 'active').length,
      totalApplications: apps.length,
      pendingApplications: apps.filter((a: any) => a.status === 'pending').length,
      totalViews: 0,
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalEmployers: number;
    totalEmployees: number;
    totalJobs: number;
    activeJobs: number;
    totalCompanies: number;
    totalApplications: number;
  }> {
    const allUsers = await this.getAllUsers();
    const allJobsRaw = await db.select().from(jobs);
    const allCompanies = await this.getAllCompanies();
    const allApps = await db.select().from(applications);
    
    return {
      totalUsers: allUsers.length,
      totalEmployers: allUsers.filter((u: any) => u.role === 'employer').length,
      totalEmployees: allUsers.filter((u: any) => u.role === 'employee').length,
      totalJobs: allJobsRaw.length,
      activeJobs: allJobsRaw.filter((j: any) => j.status === 'active').length,
      totalCompanies: allCompanies.length,
      totalApplications: allApps.length,
    };
  }

  async getEmployeeInteractedCompanies(userId: string): Promise<Company[]> {
    const apps = await db.select({ companyId: jobs.companyId })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.userId, userId));
    
    const companyIds = Array.from(new Set(apps.map((a: any) => a.companyId)));
    if (companyIds.length === 0) return [];

    return db.select().from(companies).where(inArray(companies.id, companyIds as string[]));
  }

  async getAllCompanyReviews(): Promise<CompanyReview[]> {
    return db.select().from(companyReviews);
  }

  // Password reset token operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<any> {
    // Invalidate any existing tokens for this user first
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    const [resetToken] = await db.insert(passwordResetTokens).values({ userId, token, expiresAt }).returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<any> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async deletePasswordResetToken(token: string): Promise<boolean> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return true;
  }

  async createOrUpdateTwoFactor(userId: string, secret: string): Promise<any> {
    const existing = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    if (existing.length > 0) {
      const [updated] = await db.update(twoFactorSecrets).set({ secret, updatedAt: new Date() }).where(eq(twoFactorSecrets.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(twoFactorSecrets).values({ userId, secret, isEnabled: false }).returning();
    return created;
  }

  async enableTwoFactor(userId: string, secret: string, backupCodes?: string[]): Promise<any> {
    const existing = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    const backupCodesJson = backupCodes ? JSON.stringify(backupCodes) : null;

    if (existing.length > 0) {
      const [updated] = await db
        .update(twoFactorSecrets)
        .set({
          isEnabled: true,
          secret,
          backupCodes: backupCodesJson,
          updatedAt: new Date(),
        })
        .where(eq(twoFactorSecrets.userId, userId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(twoFactorSecrets)
      .values({
        userId,
        secret,
        isEnabled: true,
        backupCodes: backupCodesJson,
      })
      .returning();
    return created;
  }

  async getTwoFactorSecret(userId: string): Promise<any> {
    const [twoFa] = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
    return twoFa;
  }

  async disableTwoFactor(userId: string): Promise<boolean> {
    await db
      .update(twoFactorSecrets)
      .set({ isEnabled: false, backupCodes: null, updatedAt: new Date() })
      .where(eq(twoFactorSecrets.userId, userId));
    return true;
  }

  async consumeBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFa = await this.getTwoFactorSecret(userId);
    if (!twoFa || !twoFa.backupCodes) return false;

    try {
      const codes: string[] = JSON.parse(twoFa.backupCodes);
      const normalizedCode = code.trim().toLowerCase();
      const index = codes.findIndex((c: string) => c.toLowerCase() === normalizedCode);
      if (index === -1) return false;

      // Remove the consumed single-use backup code
      codes.splice(index, 1);
      await db
        .update(twoFactorSecrets)
        .set({ backupCodes: JSON.stringify(codes), updatedAt: new Date() })
        .where(eq(twoFactorSecrets.userId, userId));
      return true;
    } catch {
      return false;
    }
  }

  async createCompanyReview(data: any): Promise<CompanyReview> {
    const [review] = await db.insert(companyReviews).values(data).returning();
    return review;
  }

  async getCompanyReviews(companyId: string): Promise<any[]> {
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
    })
    .from(companyReviews)
    .leftJoin(users, eq(companyReviews.userId, users.id))
    .where(eq(companyReviews.companyId, companyId))
    .orderBy(desc(companyReviews.createdAt));
  }

  async getCompanyAverageRating(companyId: string): Promise<number> {
    const result = await db.select({ avg: sql<number>`AVG(${companyReviews.rating})` }).from(companyReviews).where(eq(companyReviews.companyId, companyId));
    return result[0]?.avg || 0;
  }

  async createBookmark(userId: string, jobId: string): Promise<any> {
    const [bookmark] = await db.insert(bookmarks).values({ userId, jobId }).returning();
    return bookmark;
  }

  async deleteBookmark(userId: string, jobId: string): Promise<boolean> {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.jobId, jobId)));
    return true;
  }

  async getBookmarks(userId: string): Promise<any[]> {
    return db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
  }

  async isBookmarked(userId: string, jobId: string): Promise<boolean> {
    const result = await db.select().from(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.jobId, jobId)));
    return result.length > 0;
  }

  async getRecommendedJobs(userId: string, limit = 5): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user || user.role !== 'employee') return [];

    const userQuals = await this.getQualificationsByUser(userId);
    const userSkills = userQuals.filter((q: any) => q.type === 'skill').map((q: any) => q.title.toLowerCase());
    const userApps = await this.getApplicationsByUser(userId);
    const appliedJobIds = userApps.map((a: any) => a.jobId);

    const allJobs = await this.getAllJobs();
    const jobsScored = allJobs
      .filter((job: any) => !appliedJobIds.includes(job.id))
      .map((job: any) => {
        let score = 0;
        const jobSkills = (job.requiredSkills || []).map((s: string) => s.toLowerCase());
        score += userSkills.filter(s => jobSkills.includes(s)).length * 20;
        if (user.location && job.location && user.location.toLowerCase() === job.location.toLowerCase()) score += 15;
        if (user.bio) score += 5;
        return { ...job, score };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);

    return jobsScored;
  }
  async updateReviewReply(id: string, reply: string): Promise<any> {
    const [review] = await db.update(reviews).set({ adminReply: reply }).where(eq(reviews.id, id)).returning();
    return review;
  }

  async updateCompanyReviewReply(id: string, reply: string): Promise<any> {
    const [review] = await db.update(companyReviews).set({ employerReply: reply }).where(eq(companyReviews.id, id)).returning();
    return review;
  }
}

export const storage = new DatabaseStorage();
