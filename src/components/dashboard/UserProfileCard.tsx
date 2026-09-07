"use client";

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function UserProfileCard({ user }: { user: any }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    setConfirmLogout(false);
    await signOut();
    router.push('/sign-in');
    router.refresh();
  };

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        open={confirmLogout}
        variant="danger"
        title="Sign Out?"
        description={`You are about to sign out of your Pak Payment merchant dashboard. You will need to sign in again to access your claims and settings.`}
        yesLabel="Yes, Sign Out"
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmLogout(false)}
      />

      <div className="flex items-center justify-between gap-2">
        {/* Avatar + Name */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 min-w-0 group flex-1"
          title="Profile Settings"
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-neutral-700 bg-neutral-800 text-primary group-hover:border-primary transition-colors">
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight group-hover:text-primary transition-colors">
              {user.name || 'Merchant'}
            </p>
            <p className="text-[11px] text-neutral-400 truncate leading-tight">
              {user.email}
            </p>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="text-neutral-500 hover:text-primary p-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <Settings size={15} />
          </Link>
          <button
            onClick={() => setConfirmLogout(true)}
            disabled={signingOut}
            title="Sign Out"
            className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            {signingOut ? (
              <Loader2 size={15} className="animate-spin text-red-400" />
            ) : (
              <LogOut size={15} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
