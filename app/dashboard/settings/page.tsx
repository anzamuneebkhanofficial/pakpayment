"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession, sendVerificationEmail, updateUser, authClient } from "@/lib/auth-client";
import { Loader2, Save, Upload, ShieldAlert, CheckCircle2, AlertTriangle, Key, Mail } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/ConfirmModal";

// --- Schemas ---
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  
  // States for verification
  const [verifying, setVerifying] = useState(false);
  const [verifiedSent, setVerifiedSent] = useState(false);

  // States for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Forms
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: session?.user?.name || "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Action states with universal confirm modal logic
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    variant: 'confirm' | 'save' | 'danger';
    title: string;
    description: string;
    yesLabel: string;
    loading: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    variant: 'save',
    title: '',
    description: '',
    yesLabel: 'Confirm',
    loading: false,
    onConfirm: () => {},
  });

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatarPreview(base64);

      // Instantly save
      setUploadingAvatar(true);
      try {
        await updateUser({ image: base64 });
        toast.success("Profile picture updated!");
      } catch (e) {
        toast.error("Failed to update profile picture.");
      }
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (data: ProfileValues) => {
    setConfirmModal({
      open: true,
      variant: 'save',
      title: 'Update Profile Name?',
      description: `Your display name will be updated to "${data.name}". This name is visible to customers in your dashboard and emails.`,
      yesLabel: '✓ Save Name',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, loading: true }));
        try {
          await updateUser({ name: data.name });
          toast.success("Profile name updated successfully!");
        } catch (e) {
          toast.error("Failed to update profile name.");
        }
        setConfirmModal(p => ({ ...p, open: false, loading: false }));
      }
    });
  };

  const handleChangePassword = async (data: PasswordValues) => {
    setConfirmModal({
      open: true,
      variant: 'danger',
      title: 'Change Password?',
      description: "You are about to change your account password. You will need to use the new password the next time you sign in.",
      yesLabel: '✓ Change Password',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(p => ({ ...p, loading: true }));
        try {
          const res = await authClient.changePassword({
            newPassword: data.newPassword,
            currentPassword: data.currentPassword,
            revokeOtherSessions: true,
          });
          
          if (res.error) {
            toast.error(res.error.message || "Failed to change password. Check your current password.");
          } else {
            toast.success("Password changed successfully!");
            passwordForm.reset();
          }
        } catch (e) {
          toast.error("An unexpected error occurred.");
        }
        setConfirmModal(p => ({ ...p, open: false, loading: false }));
      }
    });
  };

  const handleResendVerification = async () => {
    if (!session?.user?.email) return;
    setVerifying(true);
    try {
      await sendVerificationEmail({ email: session.user.email, callbackURL: window.location.origin });
      setVerifiedSent(true);
      toast.success("Verification email sent!");
    } catch (e) {
      toast.error("Failed to send verification email.");
    }
    setVerifying(false);
  };

  if (isPending) return (
    <div className="flex items-center gap-2 text-neutral-500">
      <Loader2 size={18} className="animate-spin" /> Loading settings...
    </div>
  );

  const user = session?.user;
  if (!user) return null;

  const currentAvatar = avatarPreview || user.image;
  const initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Universal Double-Check Modal */}
      <ConfirmModal
        open={confirmModal.open}
        variant={confirmModal.variant}
        title={confirmModal.title}
        description={confirmModal.description}
        yesLabel={confirmModal.yesLabel}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(p => ({ ...p, open: false }))}
      />

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Account Settings</h2>
        <p className="text-sm text-neutral-400 mt-1">
          Manage your profile, password, and security preferences
        </p>
      </div>

      <div className="grid gap-6">

        {/* 1. Profile Section */}
        <section className="bg-surface border border-neutral-800/80 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-4 border-b border-neutral-800 pb-4">Public Profile</h3>
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Avatar Upload */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full border-2 border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden text-2xl font-bold text-primary relative group">
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-neutral-400" size={24} />
                ) : currentAvatar ? (
                  <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary hover:underline font-medium"
              >
                Change Avatar
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarSelect}
              />
            </div>

            {/* Basic Info Form */}
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  {...profileForm.register("name")}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-400 text-xs mt-1.5">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl text-sm hover:brightness-95 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </section>


        {/* 2. Email Verification Banner */}
        {!user.emailVerified && (
          <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-yellow-500 shrink-0" size={32} />
              <div>
                <h3 className="font-bold text-yellow-500">Email Not Verified</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Please verify your email address to secure your account and unlock all features.
                </p>
              </div>
            </div>
            
            {verifiedSent ? (
              <span className="text-sm font-bold text-green-400 flex items-center gap-1.5 px-4 py-2 bg-green-500/10 rounded-xl">
                <CheckCircle2 size={16} /> Link Sent!
              </span>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={verifying}
                className="shrink-0 px-5 py-2.5 bg-yellow-500 text-black font-bold text-sm rounded-xl hover:brightness-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {verifying ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                Send Verification Link
              </button>
            )}
          </section>
        )}
        {user.emailVerified && (
          <section className="bg-green-500/5 border border-green-500/10 rounded-3xl p-6 flex items-center gap-3">
            <CheckCircle2 className="text-green-500" size={24} />
            <div>
              <h3 className="font-bold text-white text-sm">Email Verified</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Your account is fully activated and secured.</p>
            </div>
          </section>
        )}


        {/* 3. Change Password Section */}
        <section className="bg-surface border border-neutral-800/80 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-4">
            <Key size={18} className="text-neutral-400" />
            <h3 className="font-bold text-white text-lg">Change Password</h3>
          </div>

          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                {...passwordForm.register("currentPassword")}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-red-400 text-xs mt-1.5">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                {...passwordForm.register("newPassword")}
                placeholder="Minimum 6 characters"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-400 text-xs mt-1.5">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                {...passwordForm.register("confirmPassword")}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2 flex items-start gap-3 bg-red-500/5 p-3 border border-red-500/10 rounded-xl mb-4 text-xs text-neutral-300">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>Changing your password will sign you out of all other active sessions across your devices.</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-bold rounded-xl text-sm hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              Update Password
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
