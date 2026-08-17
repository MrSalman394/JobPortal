import type { Express } from "express";
import { storage } from "../core/storage";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { isAuthenticated } from "./auth";

// Store reset codes in memory with expiration (in production, use database)
const resetCodes = new Map<string, { userId: string; expiresAt: Date }>();

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

  // Forgot password route - generates a reset code
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(200).json({ message: "If email exists, reset code has been sent" });
      }

      // Generate a 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
      
      // Store the reset code
      resetCodes.set(resetCode, { userId: user.id, expiresAt });
      
      // Log the code to console for testing
      console.log(`[PASSWORD RESET] Code: ${resetCode} for ${email}`);
      
      // For production, you can also create a token in database
      const token = randomBytes(32).toString("hex");
      await storage.createPasswordResetToken(user.id, token, expiresAt);
      
      res.json({ 
        message: "Reset code generated",
        resetCode: resetCode, // Return code to display on frontend
        expiresIn: 15 * 60 // 15 minutes in seconds
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Reset password route
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { resetCode, password } = req.body;
      
      // Check if reset code exists and is valid
      const resetData = resetCodes.get(resetCode);
      if (!resetData || resetData.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(resetData.userId, hashedPassword);
      
      // Clean up the reset code
      resetCodes.delete(resetCode);

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Get 2FA setup
  app.get("/api/auth/2fa/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      const secret = speakeasy.generateSecret({
        name: `JobConnect (${user?.email})`,
        issuer: "JobConnect",
        length: 32,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret in session for verification
      req.session.twoFactorSecret = secret.base32;

      res.json({
        secret: secret.base32,
        qrCode,
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

      const sessionSecret = req.session?.twoFactorSecret;
      if (!sessionSecret) {
        return res.status(400).json({ message: "2FA setup not initiated" });
      }

      // Verify the code is valid
      const isValid = speakeasy.totp.verify({
        secret: sessionSecret,
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid 2FA code" });
      }

      await storage.enableTwoFactor(userId, sessionSecret);
      
      // Clean up session
      delete req.session.twoFactorSecret;
      // Also mark as verified for the current session
      req.session.is2faVerified = true;
      
      // EXPLICITLY save session and wait for it
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully after 2FA enable");
            resolve();
          }
        });
      });

      // Update the user in the session
      const user = await storage.getUser(userId);
      req.login(user, (err: any) => {
        if (err) console.error("Error updating user session after 2FA enable:", err);
        // Force a re-fetch of the user data in the frontend
        res.json({ message: "2FA enabled successfully", user });
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
        return res.status(400).json({ message: "Invalid user" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Verify the 2FA code
      const twoFa = await storage.getTwoFactorSecret(userId);
      if (!twoFa?.isEnabled || !twoFa?.secret) {
        return res.status(400).json({ message: "2FA not enabled" });
      }

      const isCodeValid = speakeasy.totp.verify({
        secret: twoFa.secret,
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!isCodeValid) {
        return res.status(400).json({ message: "Invalid 2FA code" });
      }

      await storage.disableTwoFactor(userId);
      // Also clear verified status in session
      if (req.session) {
        req.session.is2faVerified = false;
        await new Promise<void>((resolve, reject) => {
          req.session.save((err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
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
      
      // Prevent browser caching of this status
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');

      res.json({ 
        isEnabled: !!twoFa?.isEnabled,
        isVerifiedInSession: !!req.session.is2faVerified 
      });
    } catch (error) {
      console.error("2FA status error:", error);
      res.status(500).json({ message: "Failed to get 2FA status" });
    }
  });

  // Verify 2FA during login
  app.post("/api/auth/2fa/verify", async (req: any, res) => {
    try {
      const { code, userId } = req.body;

      if (!userId || !code) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get user's 2FA secret
      const twoFa = await storage.getTwoFactorSecret(userId);
      if (!twoFa?.isEnabled || !twoFa?.secret) {
        return res.status(400).json({ message: "2FA not enabled for this user" });
      }

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: twoFa.secret,
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid 2FA code" });
      }

      // Mark as verified in session
      req.session.is2faVerified = true;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Also fetch the user to return in the response
      const user = await storage.getUser(userId);

      res.json({ 
        message: "2FA verified successfully",
        user
      });
    } catch (error) {
      console.error("2FA verify error:", error);
      res.status(500).json({ message: "Failed to verify 2FA" });
    }
  });
}
