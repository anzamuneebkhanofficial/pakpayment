"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/auth-client";
import { ShieldCheck, ArrowRight, Loader2, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  tosAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service to continue",
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      tosAccepted: false,
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setAuthError(null);
    try {
      const res = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        setAuthError(res.error.message || "Failed to create account. Please try again.");
      } else {
        setSignedUpEmail(data.email);
        setSignedUp(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || "An unexpected error occurred.");
    }
  };

  if (signedUp) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Check Your Email</h1>
            <p className="text-neutral-400 mt-2 text-sm leading-relaxed">
              We've sent a verification link to <strong className="text-white">{signedUpEmail}</strong>.<br />
              Please check your inbox and click the link to activate your account.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-800/80">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:brightness-110 transition-colors"
            >
              Go to Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-12">
      {/* Top Brand */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-extrabold text-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]">
          P
        </div>
        <span className="font-bold text-2xl tracking-tight">Pak Payment</span>
      </Link>

      <div className="w-full max-w-lg bg-surface border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Start Collecting Payments</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Free forever, for everyone. Direct to your accounts.
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Full Name or Business Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Ali Khan"
              className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="ali@example.com"
              className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Minimum 6 characters"
                className="w-full bg-black/70 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>


          <div className="pt-2">
            <div className="flex items-start gap-3">
              <input
                id="tosAccepted"
                type="checkbox"
                {...register("tosAccepted")}
                className="mt-1 w-4 h-4 rounded border-neutral-700 bg-black text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <label htmlFor="tosAccepted" className="text-xs text-neutral-400 leading-relaxed cursor-pointer">
                I agree to the <span className="text-white font-medium">Terms of Service</span> and confirm I will only display legitimate payment details.
              </label>
            </div>
            {errors.tosAccepted && (
              <p className="text-red-400 text-xs mt-1.5">{errors.tosAccepted.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-primary text-black font-bold py-3.5 px-4 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={18} /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
          <p className="text-sm text-neutral-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-medium hover:underline">
              Sign In
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
