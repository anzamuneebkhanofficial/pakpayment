"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInValues) => {
    setAuthError(null);
    try {
      const res = await signIn.email({ email: data.email, password: data.password });
      if (res.error) {
        setAuthError(res.error.message || "Invalid credentials. Please try again.");
      } else {
        setRedirecting(true);
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <>
      {/* Full-screen redirect overlay */}
      {redirecting && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-black font-extrabold text-2xl shadow-[0_0_30px_rgba(204,255,0,0.4)]">
            P
          </div>
          <div className="flex items-center gap-3 text-white">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-lg font-semibold">Signing you in...</span>
          </div>
          <p className="text-neutral-500 text-sm">Loading your dashboard</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {authError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {authError}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@company.com"
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••"
              className="w-full bg-black/70 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors focus:outline-none"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || redirecting}
          className="w-full mt-2 bg-primary text-black font-bold py-3.5 px-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting || redirecting ? (
            <><Loader2 className="animate-spin" size={18} /> Signing in...</>
          ) : (
            <>Sign In <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-extrabold text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]">
          P
        </div>
        <span className="font-bold text-2xl tracking-tight">Pak Payment</span>
      </Link>

      <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Access your payment claims and merchant dashboard
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-neutral-500">Loading sign in form...</div>}>
          <SignInForm />
        </Suspense>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-sm text-neutral-400">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary font-medium hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-neutral-500">
        <ShieldCheck size={14} className="text-primary" />
        Zero custody — We never touch or hold your money
      </div>
    </div>
  );
}
