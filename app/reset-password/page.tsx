"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/lib/auth-client";
import { ShieldCheck, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }
    const res = await resetPassword({ newPassword: data.password, token });
    if (res.error) {
      setError(res.error.message || "Failed to reset password. The link may have expired.");
    } else {
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 3000);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Password Reset!</h1>
        <p className="text-neutral-400 text-sm">
          Your password has been updated successfully.<br />
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Choose a strong new password for your account
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {!token && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Invalid or missing reset token.{" "}
          <Link href="/forgot-password" className="underline">Request a new link</Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              {...register("password")}
              placeholder="Minimum 6 characters"
              className="w-full bg-black/70 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-white"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Repeat your new password"
              className="w-full bg-black/70 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-white"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full mt-2 bg-primary text-black font-bold py-3.5 px-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin" size={18} /> Updating password...</>
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
        <Link href="/sign-in" className="text-sm text-neutral-400 hover:text-white transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-extrabold text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]">
          P
        </div>
        <span className="font-bold text-2xl tracking-tight">Pak Payment</span>
      </Link>

      <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <Suspense fallback={<div className="text-center py-8 text-neutral-500">Loading...</div>}>
          <ResetForm />
        </Suspense>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-500">
        <ShieldCheck size={14} className="text-primary" />
        Zero custody — We never touch or hold your money
      </div>
    </div>
  );
}
