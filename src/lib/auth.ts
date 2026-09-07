import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { sendEmail } from "./email";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/pakpayment";
const client = new MongoClient(uri);
const db = client.db();

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "🔑 Reset Your Pak Payment Password",
        html: `
          <div style="font-family:Arial,sans-serif;background:#000;color:#fff;padding:32px;border-radius:16px;max-width:480px;margin:0 auto;border:1px solid #262626;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#CCFF00;border-radius:12px;font-weight:900;font-size:24px;color:#000;">P</div>
              <h2 style="margin:12px 0 0;color:#fff;font-size:20px;">Pak Payment</h2>
            </div>
            <h3 style="color:#CCFF00;margin:0 0 8px;">Reset Your Password</h3>
            <p style="color:#a3a3a3;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Hello <strong style="color:#fff;">${user.name || user.email}</strong>,<br/>
              We received a request to reset your password. Click the button below to set a new one. This link expires in <strong style="color:#fff;">1 hour</strong>.
            </p>
            <a href="${url}" style="display:block;text-align:center;background:#CCFF00;color:#000;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;margin-bottom:20px;">
              🔑 Reset My Password
            </a>
            <p style="color:#525252;font-size:12px;text-align:center;">
              If you didn't request this, you can safely ignore this email.<br/>
              Link: <a href="${url}" style="color:#CCFF00;">${url}</a>
            </p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "✅ Verify Your Pak Payment Account",
        html: `
          <div style="font-family:Arial,sans-serif;background:#000;color:#fff;padding:32px;border-radius:16px;max-width:480px;margin:0 auto;border:1px solid #262626;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#CCFF00;border-radius:12px;font-weight:900;font-size:24px;color:#000;">P</div>
              <h2 style="margin:12px 0 0;color:#fff;font-size:20px;">Pak Payment</h2>
            </div>
            <h3 style="color:#CCFF00;margin:0 0 8px;">Verify Your Email Address</h3>
            <p style="color:#a3a3a3;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Hello <strong style="color:#fff;">${user.name || user.email}</strong>,<br/>
              Thank you for signing up! Click the button below to verify your email address and activate your merchant dashboard.
            </p>
            <a href="${url}" style="display:block;text-align:center;background:#CCFF00;color:#000;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;margin-bottom:20px;">
              ✅ Verify My Email
            </a>
            <p style="color:#525252;font-size:12px;text-align:center;">
              If you didn't create an account, you can safely ignore this email.<br/>
              Link: <a href="${url}" style="color:#CCFF00;">${url}</a>
            </p>
          </div>
        `,
      });
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "pak_payment_secure_secret_key_32_chars_min_length_12345",
  baseURL: process.env.BETTER_AUTH_URL || appUrl,
});

export type Session = typeof auth.$Infer.Session;
