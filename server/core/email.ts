import nodemailer from "nodemailer";
import { Resend } from "resend";

interface SendPasswordResetEmailParams {
  to: string;
  name?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

let transporter: nodemailer.Transporter | null = null;

function getEmailTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  // Gmail special shortcut
  if (user && pass && (host?.includes("gmail") || (!host && user.includes("@gmail.com")))) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: pass.replace(/\s+/g, ""), // strip any spaces in app password
      },
    });
    return transporter;
  }

  // Standard SMTP
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: port || 587,
      secure,
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  }

  return null;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresInMinutes = 60,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; previewUrl?: string }> {
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
      <p>© ${new Date().getFullYear()} JobConnect Inc. All rights reserved.</p>
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

© ${new Date().getFullYear()} JobConnect Inc.
  `.trim();

  // 1. Try Resend if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resendFrom = process.env.RESEND_FROM || "onboarding@resend.dev";
      const { data, error } = await resend.emails.send({
        from: `JobConnect <${resendFrom}>`,
        to: [to],
        subject: "Reset your JobConnect password",
        html: htmlContent,
        text: textContent,
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

  // 2. Try Nodemailer / SMTP / Gmail
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: fromHeader,
        to,
        subject: "Reset your JobConnect password",
        text: textContent,
        html: htmlContent,
      });
      console.log(`[EMAIL] ✅ Password reset email delivered successfully via SMTP to: ${to}`);
      return { success: true };
    } catch (error) {
      console.error(`[EMAIL ERROR] ❌ Failed to deliver email via SMTP:`, error);
    }
  }

  // 3. Fallback preview in console
  console.log("\n==================== [PASSWORD RESET EMAIL] ====================");
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: Reset your JobConnect password`);
  console.log(`RESET URL: ${resetUrl}`);
  console.log(`EXPIRATION: ${expiresInMinutes} minutes`);
  console.log("=================================================================\n");

  return { success: true };
}
