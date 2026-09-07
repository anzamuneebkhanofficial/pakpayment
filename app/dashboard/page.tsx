import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import PaymentClaim from '@/models/PaymentClaim';
import WidgetEvent from '@/models/WidgetEvent';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Copy, 
  Download, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  ShieldCheck,
  Code2,
  QrCode
} from 'lucide-react';
import CopyButton from '@/components/dashboard/CopyButton';

export default async function DashboardOverview() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  const userId = session.user.id;

  await connectToDatabase();
  let config = await MerchantWidgetConfig.findOne({ userId });

  if (!config) {
    return (
      <div className="p-8 bg-surface rounded-2xl border border-neutral-800 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to Pak Payment!</h2>
        <p className="text-neutral-400 mb-6">Let's configure your payment accounts to start collecting payments directly.</p>
        <Link 
          href="/dashboard/accounts" 
          className="inline-flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:brightness-95 transition-all"
        >
          Add Payment Method
        </Link>
      </div>
    );
  }

  const [pendingClaimsCount, totalConfirmedClaims, viewsCount] = await Promise.all([
    PaymentClaim.countDocuments({ userId, status: 'pending_review' }),
    PaymentClaim.find({ userId, status: 'confirmed' }),
    WidgetEvent.countDocuments({ appId: config.appId, type: 'view' })
  ]);

  const totalConfirmedAmount = totalConfirmedClaims.reduce((acc, c) => acc + (c.amount || 0), 0);

  // Hosted payment link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const paymentLink = `${appUrl}/pay/${config.appId}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Overview</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Logged-in as <span className="text-white font-medium">{session.user.name || session.user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/pay/${config.appId}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            Open Live Checkout <ExternalLink size={15} />
          </Link>
          <Link
            href="/dashboard/publish"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl text-sm font-bold hover:brightness-95 transition-all"
          >
            Publish Changes <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Claims Badge Card */}
        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} className="text-secondary" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Pending Claims</span>
              {pendingClaimsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary/15 text-secondary border border-secondary/30 animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-5xl font-black mt-4 text-secondary">{pendingClaimsCount}</p>
          </div>
          <Link
            href="/dashboard/claims"
            className="text-sm text-neutral-400 hover:text-white mt-6 inline-flex items-center gap-1 font-medium transition-colors"
          >
            Review all claims →
          </Link>
        </div>

        {/* Total Confirmed Revenue */}
        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={80} className="text-primary" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verified Direct Volume</span>
            <p className="text-4xl font-black mt-4 text-primary">
              PKR {totalConfirmedAmount.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-neutral-500 mt-6">
            100% direct bank/wallet deposits verified by you.
          </p>
        </div>

        {/* Widget Views & Conversion */}
        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Widget Views</span>
            <p className="text-4xl font-black mt-4 text-white">{viewsCount}</p>
          </div>
          <Link
            href="/dashboard/analytics"
            className="text-sm text-neutral-400 hover:text-white mt-6 inline-flex items-center gap-1 font-medium transition-colors"
          >
            View conversion analytics →
          </Link>
        </div>
      </div>

      {/* Hosted Payment Link & Counter QR Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hosted Link Card */}
        <div className="lg:col-span-2 bg-surface p-8 rounded-3xl border border-neutral-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
              <h3 className="text-lg font-bold text-white">Hosted Payment Link</h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
              Paste this link directly into your Instagram Bio, WhatsApp status, or share with clients over chat. No website required.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <code className="bg-black border border-neutral-800 px-4 py-3.5 rounded-2xl text-primary font-mono text-sm flex-1 overflow-x-auto select-all">
                {paymentLink}
              </code>
              <CopyButton text={paymentLink} label="Copy Link" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              App ID: <span className="font-mono text-neutral-300">{config.appId}</span> (Live v{config.version || 1})
            </span>
            <Link href="/dashboard/embed" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <Code2 size={14} /> Get Embed Snippet
            </Link>
          </div>
        </div>

        {/* Custom QR Generator Banner */}
        <div className="bg-surface p-6 rounded-3xl border border-neutral-800/80 flex flex-col justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <QrCode size={20} />
              <h3 className="text-md font-bold text-white">Payment QR Generator</h3>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Create professional, customized QR codes for your checkout page. Generate open amount QRs for your counter, or fixed amount QRs for specific invoices.
            </p>
          </div>
          
          <Link
            href="/dashboard/qrcodes"
            className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl border border-neutral-700 transition-colors"
          >
            Create Custom QR Code
          </Link>
        </div>
      </div>
    </div>
  );
}
