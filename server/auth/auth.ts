import bcrypt from "bcryptjs";
import { storage } from "../core/storage";
import { pool } from "../core/db";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  let sessionStore: any;

  if (process.env.DATABASE_URL) {
    try {
      const PgSession = connectPgSimple(session);
      sessionStore = new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: "sessions",
        createTableIfMissing: true,
        ttl: sessionTtl / 1000,
        pruneSessionInterval: false,
      });

      if (sessionStore && typeof sessionStore.on === "function") {
        sessionStore.on("error", (err: any) => {
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for email/password
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
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

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      cb(null, user);
    } catch (error) {
      cb(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      // Check if 2FA is enabled before logging in
      storage.getTwoFactorSecret(user.id).then((twoFa) => {
        const session = req.session as any;
        // If 2FA is enabled AND not verified in this session yet
        if (twoFa?.isEnabled && !session.is2faVerified) {
          session.pending2faUserId = user.id;
          return req.session.save((err: any) => {
            if (err) console.error("Error saving session for pending 2FA:", err);
            return res.json({ 
              user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }, 
              requiresTwoFa: true 
            });
          });
        }

        // No 2FA or already verified, proceed with login
        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed" });
          }
          return res.json({ user });
        });
      }).catch(err => {
        console.error("2FA check error during login:", err);
        res.status(500).json({ message: "Login failed" });
      });
    })(req, res, next);
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        id: undefined as any,
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : undefined,
      });

      // Log user in
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

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (req.isAuthenticated()) {
    // Check if 2FA is required and verified
    try {
      const twoFa = await storage.getTwoFactorSecret(req.user.id);
      const session = req.session as any;
      if (twoFa?.isEnabled && !session.is2faVerified) {
        return res.status(401).json({ message: "2FA verification required", requiresTwoFa: true });
      }
    } catch (error) {
      console.error("IsAuthenticated 2FA check error:", error);
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
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
