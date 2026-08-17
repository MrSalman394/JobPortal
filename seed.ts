import "dotenv/config";
import { db, pool } from "./server/core/db";
import { users, companies, jobs } from "./shared/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

async function seed() {
  if (!db || !pool) {
    console.error("❌ Database not available. Please set DATABASE_URL.");
    process.exit(1);
  }

  try {
    console.log("🌱 Starting database seed...");

    // Hash passwords
    const adminPass = await bcryptjs.hash("pass1234@", 10);
    const employeePass = await bcryptjs.hash("pass1234@", 10);
    const employerPass = await bcryptjs.hash("pass1234@", 10);

    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@gmail.com"));
    
    let usersResult = [];
    if (existingAdmin.length === 0) {
      // Insert users
      usersResult = await db
        .insert(users)
        .values([
          {
            email: "admin@gmail.com",
            password: adminPass,
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          },
          {
            email: "employee@gmail.com",
            password: employeePass,
            role: "employee",
            firstName: "Employee",
            lastName: "User",
          },
          {
            email: "employer@gmail.com",
            password: employerPass,
            role: "employer",
            firstName: "Employer",
            lastName: "User",
          },
        ])
        .returning();
      console.log(`✅ Seeded ${usersResult.length} users`);
    } else {
      console.log("ℹ️ Users already seeded");
      usersResult = await db.select().from(users);
    }

    // Insert one company for the employer
    const employer = usersResult.find(u => u.email === "employer@gmail.com");
    const employee = usersResult.find(u => u.email === "employee@gmail.com");
    
    if (employer && employee) {
      const existingCompany = await db.select().from(companies).where(eq(companies.userId, employer.id));
      let company;
      if (existingCompany.length === 0) {
        const companyResult = await db
          .insert(companies)
          .values([
            {
              userId: employer.id,
              name: "Tech Corp",
              description: "A leading tech company",
              industry: "Technology",
              location: "San Francisco",
            }
          ])
          .returning();
        company = companyResult[0];
        console.log(`✅ Seeded ${companyResult.length} company`);
      } else {
        console.log("ℹ️ Company already seeded");
        company = existingCompany[0];
      }

      // Seed one job for this company
      if (company) {
        const existingJob = await db.select().from(jobs).where(eq(jobs.companyId, company.id));
        let job;
        if (existingJob.length === 0) {
          const jobResult = await db.insert(jobs).values({
            companyId: company.id,
            employerId: employer.id,
            title: "Software Engineer",
            description: "We are looking for a skilled Software Engineer to join our team.",
            requirements: "Proficiency in React and Node.js",
            type: "full-time",
            location: "Remote",
            salaryMin: 80000,
            salaryMax: 120000,
            status: "active",
          }).returning();
          job = jobResult[0];
          console.log("✅ Seeded 1 job");
        } else {
          console.log("ℹ️ Job already seeded");
          job = existingJob[0];
        }

        // Seed one application from the employee to this job
        if (job) {
          const { applications } = await import("./shared/schema");
          const existingApplication = await db.select().from(applications).where(eq(applications.jobId, job.id));
          if (existingApplication.length === 0) {
            await db.insert(applications).values({
              jobId: job.id,
              userId: employee.id, // Corrected column name from 'employeeId' to 'userId'
              status: "pending",
              coverLetter: "I am very interested in this Software Engineer position at Tech Corp.",
            });
            console.log("✅ Seeded 1 application");
          } else {
            console.log("ℹ️ Application already seeded");
          }
        }

        // Seed 3 company reviews from the employee
        if (company && employee) {
          const { companyReviews } = await import("./shared/schema");
          const existingCompanyReviews = await db.select().from(companyReviews).where(eq(companyReviews.companyId, company.id));
          if (existingCompanyReviews.length === 0) {
            await db.insert(companyReviews).values([
              {
                companyId: company.id,
                userId: employee.id,
                rating: 5,
                title: "Excellent Company Culture",
                comment: "Tech Corp has an amazing company culture. The team is very supportive and collaborative. Great benefits and work-life balance!",
              },
              {
                companyId: company.id,
                userId: employee.id,
                rating: 5,
                title: "Outstanding Work Environment",
                comment: "The workplace is modern and well-equipped. Remote work flexibility is great. Management is very understanding.",
              },
              {
                companyId: company.id,
                userId: employee.id,
                rating: 5,
                title: "Professional Development Opportunities",
                comment: "Plenty of opportunities to learn and grow. They invest in employee training and skill development.",
              },
              
            ]);
            console.log("✅ Seeded 3 company reviews");
          } else {
            console.log("ℹ️ Company reviews already seeded");
          }
        }
      }
    }

    // Seed 3 platform feedback from landing page
    const { reviews } = await import("./shared/schema");
    const existingPlatformReviews = await db.select().from(reviews).limit(1);
    if (existingPlatformReviews.length === 0) {
      await db.insert(reviews).values([
        {
          userName: "John Smith",
          userRole: "employee",
          rating: 5,
          feedback: "This job portal has revolutionized my job search! Found my dream job in just two weeks. Highly recommended!",
        },
        {
          userName: "Sarah Johnson",
          userRole: "employer",
          rating: 5,
          feedback: "Outstanding platform for recruiting talent. The matching algorithm is incredibly accurate. We found our best developers here!",
        },
        {
          userName: "Michael Chen",
          userRole: "employee",
          rating: 5,
          feedback: "User-friendly interface and great job listings. The mobile app makes it easy to apply on the go.",
        },

      ]);
      console.log("✅ Seeded 3 platform feedbacks");
    } else {
      console.log("ℹ️ Platform feedbacks already seeded");
    }

    // Seed 3 overall system feedbacks
    const existingSystemReviews = await db.select().from(reviews).limit(11);
    if (existingSystemReviews.length <= 5) {
      await db.insert(reviews).values([
        {
          userName: "Alex Rodriguez",
          userRole: "employee",
          rating: 5,
          feedback: "The platform is intuitive and helps me discover career opportunities I wouldn't have found elsewhere. Excellent system!",
        },
        {
          userName: "Jessica Martinez",
          userRole: "employer",
          rating: 5,
          feedback: "Streamlined our entire recruitment process. The quality of candidates is superior to other platforms.",
        },
        {
          userName: "Robert Taylor",
          userRole: "employee",
          rating: 5,
          feedback: "Love the personalized job recommendations. The AI matching is spot-on!",
        },

      ]);
      console.log("✅ Seeded 3 overall system feedbacks");
    } else {
      console.log("ℹ️ System feedbacks already seeded");
    }

    console.log("📝 Created users:");
    console.log("  - Admin: admin@gmail.com / pass1234@");
    console.log("  - Employee: employee@gmail.com / pass1234@");
    console.log("  - Employer: employer@gmail.com / pass1234@");

    await pool.end();
    console.log("✨ Seed complete!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
