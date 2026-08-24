import type { Express } from "express";
import { storage } from "../core/storage";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { isAuthenticated } from "./auth";
import { sendPasswordResetEmail } from "../core/email";
import { z } from "zod";

// In-memory rate limiting map for forgot-password requests (cooldown: 30 seconds per email)
const requestCooldowns = new Map<string, number>();

export async function setupAuthRoutes(app: Express) {
  // Logout route
  app.get("/api/logout", (req: any, res) => {
    // Clear 2FA verification on logout
    if (req.session) {
      delete req.session.is2faVerified;
    }
    req.logOut((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  // Forgot password route - generates secure token & sends email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const emailSchema = z.object({
        email: z.string().email("Please provide a valid email address"),
      });

      const parsed = emailSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid email" });
      }

      const email = parsed.data.email.trim().toLowerCase();

      // Rate limit / cooldown per email to prevent spam (30s)
      const now = Date.now();
      const lastRequest = requestCooldowns.get(email);
      if (lastRequest && now - lastRequest < 30000) {
        const remainingSeconds = Math.ceil((30000 - (now - lastRequest)) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting another reset email.`,
        });
      }
      requestCooldowns.set(email, now);

      const user = await storage.getUserByEmail(email);

      if (user && !user.isBlocked) {
        // Generate a 64-character cryptographically secure token
        const token = randomBytes(32).toString("hex");
        const expiresInMinutes = 60;
        const expiresAt = new Date(Date.now() + 1000 * 60 * expiresInMinutes);

        // Store token in PostgreSQL database
        await storage.createPasswordResetToken(user.id, token, expiresAt);

        // Determine base URL
        const origin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        const resetUrl = `${origin}/reset-password?token=${token}`;

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
        await sendPasswordResetEmail({
          to: user.email,
          name: fullName || undefined,
          resetUrl,
          expiresInMinutes,
        });
      }

      // Always return anti-enumeration response to protect user privacy
      return res.status(200).json({
        message: "If an account with that email exists, password reset instructions have been sent to it.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
  });

  // Verify reset token route (used on reset-password page load)
  app.get("/api/auth/verify-reset-token", async (req, res) => {
    try {
      const token = (req.query.token as string)?.trim();
      if (!token) {
        return res.status(400).json({ valid: false, message: "Reset token is required" });
      }

      const resetTokenRecord = await storage.getPasswordResetToken(token);
      if (!resetTokenRecord) {
        return res.status(400).json({
          valid: false,
          message: "This password reset link is invalid or has already been used.",
        });
      }

      if (new Date(resetTokenRecord.expiresAt) < new Date()) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({
          valid: false,
          message: "This password reset link has expired. Please request a new one.",
        });
      }

      const user = await storage.getUser(resetTokenRecord.userId);
      if (!user) {
        return res.status(400).json({ valid: false, message: "User not found." });
      }

      return res.json({
        valid: true,
        email: user.email,
      });
    } catch (error) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ valid: false, message: "Failed to verify reset token." });
    }
  });

  // Reset password route - updates user password with token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const resetSchema = z.object({
        token: z.string().min(1, "Reset token is required"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters long")
          .max(100, "Password is too long"),
      });

      const parsed = resetSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const { token, password } = parsed.data;

      // Verify token in PostgreSQL
      const resetTokenRecord = await storage.getPasswordResetToken(token);
      if (!resetTokenRecord) {
        return res.status(400).json({
          message: "This password reset link is invalid or has already been used. Please request a new one.",
        });
      }

      if (new Date(resetTokenRecord.expiresAt) < new Date()) {
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({
          message: "This password reset link has expired. Please request a new one.",
        });
      }

      // Hash the new password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password in database
      await storage.updateUserPassword(resetTokenRecord.userId, hashedPassword);

      // Invalidate the token so it cannot be reused
      await storage.deletePasswordResetToken(token);

      return res.json({
        message: "Your password has been successfully reset. You can now sign in with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again." });
    }
  });

  // Get 2FA setup
  app.get("/api/auth/2fa/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      const secret = speakeasy.generateSecret({
        name: `JobConnect (${user?.email || "User"})`,
        issuer: "JobConnect",
        length: 32,
      });

      // Generate 8 single-use emergency recovery backup codes
      const backupCodes = Array.from({ length: 8 }, () => randomBytes(4).toString("hex").toUpperCase());

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret and backup codes in session pending confirmation
      req.session.pending2fa = {
        secret: secret.base32,
        backupCodes,
      };
      req.session.twoFactorSecret = secret.base32;

      await new Promise<void>((resolve) => req.session.save(() => resolve()));

      res.json({
        secret: secret.base32,
        qrCode,
        backupCodes,
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });

  // Enable 2FA
  app.post("/api/auth/2fa/enable", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { code } = req.body;

      const pending = req.session?.pending2fa;
      const sessionSecret = pending?.secret || req.session?.twoFactorSecret;
      if (!sessionSecret) {
        return res.status(400).json({ message: "2FA setup session expired. Please refresh and try again." });
      }

      const cleanCode = (code || "").toString().trim().replace(/\s+/g, "");

      // Verify the code is valid (window: 2 allows ±60s clock drift)
      const isValid = speakeasy.totp.verify({
        secret: sessionSecret,
        encoding: "base32",
        token: cleanCode,
        window: 2,
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid 6-digit code. Please verify your authenticator app time." });
      }

      const backupCodes = pending?.backupCodes || [];
      await storage.enableTwoFactor(userId, sessionSecret, backupCodes);
      
      // Clean up temporary session storage
      delete req.session.pending2fa;
      delete req.session.twoFactorSecret;
      req.session.is2faVerified = true;
      
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
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

  // Disable 2FA
  app.post("/api/auth/2fa/disable", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const { code, password } = req.body;

      // Verify password for security
      const user = await storage.getUser(userId);
      if (!user?.password) {
        return res.status(400).json({ message: "Invalid user account" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // If code was provided, verify it too
      const twoFa = await storage.getTwoFactorSecret(userId);
      if (code && twoFa?.secret) {
        const cleanCode = (code || "").toString().trim().replace(/\s+/g, "");
        const isCodeValid = speakeasy.totp.verify({
          secret: twoFa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 2,
        });

        if (!isCodeValid && !(await storage.consumeBackupCode(userId, cleanCode))) {
          return res.status(400).json({ message: "Invalid 2FA code" });
        }
      }

      await storage.disableTwoFactor(userId);
      
      if (req.session) {
        req.session.is2faVerified = false;
        await new Promise<void>((resolve) => req.session.save(() => resolve()));
      }
      
      res.json({ message: "2FA disabled successfully" });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // Check 2FA status
  app.get("/api/auth/2fa/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const twoFa = await storage.getTwoFactorSecret(userId);
      
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.json({ 
        isEnabled: Boolean(twoFa?.isEnabled),
        isVerifiedInSession: Boolean(req.session?.is2faVerified)
      });
    } catch (error) {
      console.error("2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });

  // Verify 2FA during login (supports both 6-digit TOTP app codes and 8-char backup codes)
  app.post("/api/auth/2fa/verify", async (req: any, res) => {
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

      // 1. Try 6-digit TOTP code
      if (/^\d{6}$/.test(cleanCode)) {
        isValid = speakeasy.totp.verify({
          secret: twoFa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 2, // ±60s clock drift
        });
      }

      // 2. Try single-use emergency backup code
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

      // Mark verified in session and establish login
      req.session.is2faVerified = true;
      delete req.session.pending2faUserId;

      req.logIn(user, (err: any) => {
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
