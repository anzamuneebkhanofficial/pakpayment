"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgetPassword } from "@/lib/auth-client";
import { ShieldCheck, ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    await forgetPassword({
      email: data.email,
      redirectTo: `${appUrl}/reset-password`,
    });
    setSentTo(data.email);
    setSent(true);
  };

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

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              We sent a password reset link to{" "}
              <strong className="text-white">{sentTo}</strong>.<br />
              Click the link in the email to set a new password. It expires in <strong className="text-white">1 hour</strong>.
            </p>
            <p className="text-neutral-500 text-xs">
              Didn't receive it? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-primary underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mt-4 transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Forgot Password?</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className="w-full bg-black/70 border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary text-black font-bold py-3.5 px-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={18} /> Sending reset link...</>
                ) : (
                  <>Send Reset Link <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-800/80 text-center">
              <Link href="/sign-in" className="text-sm text-neutral-400 hover:text-white transition-colors">
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-500">
        <ShieldCheck size={14} className="text-primary" />
        Zero custody — We never touch or hold your money
      </div>
    </div>
  );
}
