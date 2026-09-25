import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import DashboardNav from '@/components/dashboard/DashboardNav';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import { ArrowLeft } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-neutral-800/80 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-neutral-800/80">
          {/* Back to Landing Page */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#CCFF00] transition-colors font-semibold mb-4 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Logo + brand name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-black font-extrabold text-lg shadow-[0_0_15px_rgba(204,255,0,0.25)]">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">Pak Payment</h1>
              <span className="text-[10px] text-primary font-mono tracking-wider uppercase">Direct Rails</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav />
        </div>

        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/40">
          <UserProfileCard user={session.user} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-black">
        <main className="p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
