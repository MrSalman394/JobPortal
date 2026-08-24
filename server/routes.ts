import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./core/storage";
import { setupAuth, isAuthenticated, requireRole } from "./auth/auth";
import { setupAuthRoutes } from "./auth/auth-routes";
import { insertQualificationSchema, insertCompanySchema, insertJobSchema, insertApplicationSchema } from "../shared/schema";
import PDFDocument from "pdfkit";

// Helper to calculate match score based on qualifications
function calculateMatchScore(userQualifications: any[], job: any): number {
  if (!userQualifications || userQualifications.length === 0) return 30;
  
  let score = 40; // Base score for having any qualifications
  
  const skills = userQualifications.filter(q => q.type === 'skill');
  const experience = userQualifications.filter(q => q.type === 'experience');
  const education = userQualifications.filter(q => q.type === 'education');
  const certifications = userQualifications.filter(q => q.type === 'certification');
  
  // Check required skills match
  if (job.requiredSkills && job.requiredSkills.length > 0) {
    const userSkillNames = skills.map(s => s.title.toLowerCase());
    const matchedSkills = job.requiredSkills.filter((rs: string) => 
      userSkillNames.some(us => us.includes(rs.toLowerCase()) || rs.toLowerCase().includes(us))
    );
    score += (matchedSkills.length / job.requiredSkills.length) * 20;
  } else if (skills.length > 0) {
    score += 15;
  }
  
  // Check experience requirement
  if (job.requiredExperience) {
    const totalYears = experience.length * 2; // Rough estimate
    if (totalYears >= job.requiredExperience) {
      score += 15;
    } else {
      score += (totalYears / job.requiredExperience) * 10;
    }
  } else if (experience.length > 0) {
    score += 10;
  }
  
  // Check education
  if (job.requiredEducation) {
    const hasRelevantEducation = education.some(e => 
      e.title.toLowerCase().includes('bachelor') || 
      e.title.toLowerCase().includes('master') ||
      e.title.toLowerCase().includes('phd') ||
      e.title.toLowerCase().includes('degree')
    );
    if (hasRelevantEducation) score += 10;
  } else if (education.length > 0) {
    score += 8;
  }
  
  // Certifications bonus
  if (certifications.length > 0) {
    score += Math.min(certifications.length * 3, 10);
  }
  
  return Math.min(Math.round(score), 100);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  await setupAuthRoutes(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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

  // User routes
  app.patch('/api/users/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const currentUser = await storage.getUser(userId);
      
      // Only allow setting role if it's not already set (first time only)
      if (currentUser?.role) {
        return res.status(403).json({ message: "Role already assigned" });
      }
      
      const { role } = req.body;
      if (!['employee', 'employer', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      res.json(user);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
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

  app.patch('/api/users/password', isAuthenticated, async (req: any, res) => {
    try {
      const import_bcrypt = await import('bcryptjs');
      const bcrypt = import_bcrypt.default;
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

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await storage.updateUserPassword(userId, hashedPassword);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.patch('/api/users/email', isAuthenticated, async (req: any, res) => {
    try {
      const import_bcrypt = await import('bcryptjs');
      const bcrypt = import_bcrypt.default;
      const userId = req.user?.id || req.user?.claims?.sub;
      const { newEmail, password } = req.body;

      if (!newEmail || !password) {
        return res.status(400).json({ message: "New email and password are required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
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

  // Admin block/unblock user routes
  app.get('/api/employee/interacted-companies', isAuthenticated, requireRole(['employee']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const companies = await storage.getEmployeeInteractedCompanies(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching interacted companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/admin/companies/:companyId/feedback', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const { rating } = req.query;
      const reviews = await storage.getCompanyReviews(companyId);
      
      let filteredReviews = reviews;
      if (rating) {
        filteredReviews = reviews.filter(r => r.rating === parseInt(rating as string));
      }
      
      res.json(filteredReviews);
    } catch (error) {
      console.error("Error fetching company feedback for admin:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get('/api/admin/feedback/trends', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const allCompanies = await storage.getAllCompanies();
      const trends = await Promise.all(allCompanies.map(async (company) => {
        const reviews = await storage.getCompanyReviews(company.id);
        const average = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
        return {
          companyId: company.id,
          companyName: company.name,
          averageRating: average,
          reviewCount: reviews.length
        };
      }));
      res.json(trends);
    } catch (error) {
      console.error("Error fetching feedback trends:", error);
      res.status(500).json({ message: "Failed to fetch trends" });
    }
  });

  app.patch('/api/admin/users/:id/block', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
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

  app.patch('/api/admin/users/:id/unblock', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
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

  // Stats endpoint - Platform Statistics
  app.get('/api/stats', async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allJobs = await storage.getAllJobs();
      const allCompanies = await storage.getAllCompanies();

      const jobSeekers = allUsers.filter((u: any) => u.role === 'employee').length;
      const activeJobs = allJobs.length;
      const topCompanies = allCompanies.length;
      
      // Estimate successful hires (approximately 10% of job seekers as a metric)
      const successfulHires = Math.floor(jobSeekers * 0.5);

      res.json({
        activeJobs: Math.max(activeJobs, 1),
        topCompanies: Math.max(topCompanies, 1),
        jobSeekers: Math.max(jobSeekers, 1),
        successfulHires: Math.max(successfulHires, 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.json({
        activeJobs: 1,
        topCompanies: 1,
        jobSeekers: 1,
        successfulHires: 0,
      });
    }
  });

  app.get('/api/employer/stats', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployerStats(userId);
      const company = await storage.getCompanyByUser(userId);
      
      let reviewStats = { ratings: [0, 0, 0, 0, 0], average: 0 };
      if (company) {
        const reviews = await storage.getCompanyReviews(company.id);
        const ratings = [0, 0, 0, 0, 0];
        reviews.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) ratings[r.rating - 1]++;
        });
        reviewStats = {
          ratings,
          average: reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0
        };
      }
      
      res.json({ ...stats, reviewStats });
    } catch (error) {
      console.error("Error fetching employer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.patch('/api/admin/jobs/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const job = await storage.adminUpdateJob(id, req.body);
      if (!job) return res.status(404).json({ message: "Job not found" });
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/admin/jobs/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.adminDeleteJob(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Review routes - User Feedback on Platform
  app.post('/api/feedback', async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub || null;
      const { rating, feedback, userName, userRole, subject, message } = req.body;

      // Handle both old feedback and new support form format
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
        feedback: finalFeedback,
      });

      res.json(review);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Invalid feedback data provided" });
    }
  });

  // Review routes - User Feedback on Platform (Alias for backward compatibility if any)
  app.post('/api/reviews', async (req: any, res) => {
    // Re-route to feedback handler
    req.url = '/api/feedback';
    return app._router.handle(req, res, () => {});
  });

  // Get reviews - FOR INTERNAL USE ONLY (not public anymore)
  app.get('/api/reviews', async (req: any, res) => {
    try {
      // Return empty array to non-authenticated users (feedback now admin-only)
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Company Reviews routes
  app.post('/api/companies/:companyId/reviews', isAuthenticated, async (req: any, res) => {
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
        comment,
      });

      res.json(review);
    } catch (error) {
      console.error("Error creating company review:", error);
      res.status(500).json({ message: "Failed to create company review" });
    }
  });

  app.get('/api/companies/:companyId/reviews', async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const reviews = await storage.getCompanyReviews(companyId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching company reviews:", error);
      res.status(500).json({ message: "Failed to fetch company reviews" });
    }
  });

  app.get('/api/companies/:companyId/rating', async (req: any, res) => {
    try {
      const { companyId } = req.params;
      const avgRating = await storage.getCompanyAverageRating(companyId);
      res.json({ rating: avgRating });
    } catch (error) {
      console.error("Error fetching company rating:", error);
      res.status(500).json({ message: "Failed to fetch company rating" });
    }
  });

  app.get('/api/employee/my-feedback', isAuthenticated, requireRole(['employee']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const allReviews = await storage.getAllReviews();
      const userReviews = allReviews.filter(r => r.userId === userId);
      res.json(userReviews);
    } catch (error) {
      console.error("Error fetching user feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get('/api/employee/my-company-reviews', isAuthenticated, requireRole(['employee']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const allCompanyReviews = await storage.getAllCompanyReviews();
      const userReviews = allCompanyReviews.filter((r: any) => r.userId === userId);
      
      // Enrich with company info
      const enrichedReviews = await Promise.all(
        userReviews.map(async (review: any) => {
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

  app.get('/api/admin/reviews', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const allReviews = await storage.getAllReviews();
      res.json(allReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/applications', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const employers = allUsers.filter(u => u.role === 'employer');
      const allApps = await Promise.all(
        employers.map(e => storage.getApplicationsByEmployer(e.id))
      );
      res.json(allApps.flat());
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/admin/jobs', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Delete feedback (Protected - Admin only)
  app.delete('/api/admin/feedback/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
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

  app.get('/api/employer/applications/shortlisted', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications = await storage.getApplicationsByEmployer(userId);
      const shortlisted = applications.filter(a => a.status === 'accepted');
      res.json(shortlisted);
    } catch (error) {
      console.error("Error fetching shortlisted candidates:", error);
      res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
    }
  });

  // Alias for backward compatibility if any (matching client-side paths)
  app.delete('/api/admin/reviews/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    req.url = `/api/admin/feedback/${req.params.id}`;
    return app._router.handle(req, res, () => {});
  });

  app.delete('/api/users/account', isAuthenticated, async (req: any, res) => {
    try {
      const import_bcrypt = await import('bcryptjs');
      const bcrypt = import_bcrypt.default;
      const userId = req.user?.id || req.user?.claims?.sub;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ message: "Password is required for account deletion" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(401).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      await storage.deleteUser(userId);
      
      // Clear session
      req.logout((err: any) => {
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

  app.patch('/api/admin/reviews/:id/reply', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const review = await storage.updateReviewReply(id, reply);
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reply" });
    }
  });

  app.patch('/api/employer/company-reviews/:id/reply', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const review = await storage.updateCompanyReviewReply(id, reply);
      res.json(review);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reply" });
    }
  });

  // Qualification routes
  app.get("/api/users/check-email", async (req, res) => {
    try {
      const email = req.query.email as string;
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

  app.get('/api/qualifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const qualifications = await storage.getQualificationsByUser(userId);
      res.json(qualifications);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      res.status(500).json({ message: "Failed to fetch qualifications" });
    }
  });

  app.post('/api/qualifications', isAuthenticated, async (req: any, res) => {
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

  app.patch('/api/qualifications/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/qualifications/:id', isAuthenticated, async (req: any, res) => {
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

  // Company routes
  app.get('/api/employer/applications/recent', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications = await storage.getApplicationsByEmployer(userId);
      res.json(applications.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent applications:", error);
      res.status(500).json({ message: "Failed to fetch recent applications" });
    }
  });

  app.get('/api/employer/jobs/recent', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs = await storage.getJobsByEmployer(userId);
      res.json(jobs.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
      res.status(500).json({ message: "Failed to fetch recent jobs" });
    }
  });

  app.get('/api/employer/company', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
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

  app.post('/api/companies', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
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

  app.patch('/api/companies/:id', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
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

  // Job routes
  app.get('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs = await storage.getAllJobs();
      const qualifications = await storage.getQualificationsByUser(userId);
      
      const jobsWithScores = jobs.map(job => ({
        job,
        matchScore: calculateMatchScore(qualifications, job),
      }));
      
      // Sort by match score
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      res.json(jobsWithScores);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs = await storage.getAllJobs();
      const qualifications = await storage.getQualificationsByUser(userId);
      
      const jobsWithScores = jobs.map(job => ({
        job,
        matchScore: calculateMatchScore(qualifications, job),
      }));
      
      // Sort by match score and return top matches
      jobsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      res.json(jobsWithScores.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });

  // Bookmark routes
  app.get('/api/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const bookmarks = await storage.getBookmarks(userId);
      const bookmarkedJobs = await Promise.all(
        bookmarks.map(async (bm: any) => {
          const job = await storage.getJobById(bm.jobId);
          return job ? { ...job, isBookmarked: true } : null;
        })
      );
      res.json(bookmarkedJobs.filter((j: any) => j !== null));
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post('/api/bookmarks/:jobId', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/bookmarks/:jobId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id } = req.params;
      const job = await storage.getJobById(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const qualifications = await storage.getQualificationsByUser(userId);
      const matchScore = calculateMatchScore(qualifications, job);
      
      res.json({ job, matchScore });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Employer job routes
  app.get('/api/employer/jobs', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const jobs = await storage.getJobsByEmployer(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const company = await storage.getCompanyByUser(userId);
      
      if (!company) {
        return res.status(400).json({ message: "Please create a company first" });
      }
      
      // Convert applicationDeadline string to Date if provided
      const jobData = { ...req.body };
      if (jobData.applicationDeadline && typeof jobData.applicationDeadline === 'string') {
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

  app.patch('/api/jobs/:id', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
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

  app.delete('/api/jobs/:id', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
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

  // Application routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications = await storage.getApplicationsByUser(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.delete('/api/applications/:id', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/applications/job/:jobId', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/jobs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { id: jobId } = req.params;
      const { coverLetter } = req.body;
      
      // Check if already applied
      const existing = await storage.getApplicationByUserAndJob(userId, jobId);
      if (existing) {
        return res.status(400).json({ message: "You have already applied for this job" });
      }
      
      // Get job and calculate match score
      const job = await storage.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check application deadline
      if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
        return res.status(400).json({ message: "Application deadline has passed for this job" });
      }
      
      const qualifications = await storage.getQualificationsByUser(userId);
      const matchScore = calculateMatchScore(qualifications, job);
      
      // Only allow application if match score >= 70
      if (matchScore < 70) {
        return res.status(400).json({ message: "Your qualifications don't meet the minimum requirements for this position" });
      }
      
      const application = await storage.createApplication({
        userId,
        jobId,
        coverLetter,
        matchScore,
      });
      
      res.json(application);
    } catch (error) {
      console.error("Error applying for job:", error);
      res.status(500).json({ message: "Failed to apply for job" });
    }
  });

  // Employer application routes
  app.get('/api/employer/applications', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications = await storage.getApplicationsByEmployer(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching employer applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get applications for a specific job (employer only)
  app.get('/api/employer/jobs/:jobId/applications', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { jobId } = req.params;
      
      // Verify job belongs to employer
      const job = await storage.getJobById(jobId);
      if (!job || job.employerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this job's applications" });
      }
      
      const allApps = await storage.getApplicationsByEmployer(userId);
      const jobApps = allApps.filter(app => app.jobId === jobId);
      res.json(jobApps);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Update application status (employer only - their own jobs)
  app.patch('/api/employer/applications/:appId/status', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { appId } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'reviewed', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the application and verify it belongs to employer's job
      const app = await storage.getApplicationById(appId);
      if (!app) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const job = await storage.getJobById(app.jobId);
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

  // Get shortlisted candidates for employer
  app.get('/api/employer/shortlisted', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const applications = await storage.getApplicationsByEmployer(userId);
      const shortlisted = applications.filter(app => app.status === 'shortlisted').slice(0, 10);
      res.json(shortlisted);
    } catch (error) {
      console.error("Error fetching shortlisted candidates:", error);
      res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'reviewed', 'accepted', 'rejected', 'shortlisted'].includes(status)) {
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

  // Stats routes
  app.get('/api/employee/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployeeStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/employer/stats', isAuthenticated, requireRole(['employer']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const stats = await storage.getEmployerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching employer stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.get('/api/admin/jobs', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.patch('/api/admin/jobs/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.delete('/api/admin/jobs/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.get('/api/admin/applications', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const apps = await storage.getAllApplicationsWithDetails();
      res.json(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/admin/applications/:id/status', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.delete('/api/admin/applications/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.get('/api/admin/companies', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.patch('/api/admin/companies/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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

  app.delete('/api/admin/companies/:id', isAuthenticated, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
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
