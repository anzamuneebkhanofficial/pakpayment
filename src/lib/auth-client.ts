import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Better auth client doesn't infer these without explicitly passing the plugin config
export const forgetPassword = (authClient as any).requestPasswordReset;
export const resetPassword = (authClient as any).resetPassword;
export const sendVerificationEmail = (authClient as any).sendVerificationEmail;
export const updateUser = (authClient as any).updateUser;
