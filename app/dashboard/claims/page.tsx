"use client";

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MessageCircle,
  Mail,
  User,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

type Claim = {
  _id: string;
  orderId: string;
  amount: number | null;
  currency: string;
  methodUsed: string;
  reference: string;
  senderName?: string;
  customerWhatsApp?: string;
  customerEmail?: string;
  contactChannel: 'whatsapp' | 'email';
  customerContact?: string;
  status: 'pending_review' | 'confirmed' | 'rejected';
  createdAt: string;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Claim action modal (note entry — only for confirm/reject)
  const [actionClaim, setActionClaim] = useState<{ claim: Claim; action: 'confirm' | 'reject' } | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Universal confirm double-check modal
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    variant: 'confirm' | 'reject' | 'reopen';
    title: string;
    description: string;
    details: { label: string; value: string }[];
    loading: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    variant: 'confirm',
    title: '',
    description: '',
    details: [],
    loading: false,
    onConfirm: () => {},
  });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/merchant/claims' : `/api/merchant/claims?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) setClaims(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, [filter]);

  // Build WhatsApp pre-filled URL
  const buildWhatsAppUrl = (claim: Claim, type: 'confirm' | 'reject') => {
    const rawWa = claim.customerWhatsApp || (
      claim.customerContact && !claim.customerContact.includes('@') ? claim.customerContact : ''
    );
    if (!rawWa) return null;

    let clean = rawWa.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '92' + clean.substring(1);
    else if (clean.startsWith('0092')) clean = clean.substring(2);
    if (clean.length < 10) return null;

    let msg = '';
    if (type === 'confirm') {
      msg = `✅ *Order Confirmed!*\n\nHello ${claim.senderName || 'there'}!\n\nYour payment has been verified and your order is confirmed.\n\n📦 *Order Details:*\n• Order #: ${claim.orderId || 'Direct Payment'}\n• Amount: PKR ${claim.amount?.toLocaleString() || 'N/A'}\n• Method: ${claim.methodUsed}\n• TRX ID: ${claim.reference || 'N/A'}\n\nThank you for your order! We will process and dispatch it shortly. Feel free to chat here anytime for updates. 🙏`;
    } else {
      msg = `⚠️ *Payment Verification Update*\n\nHello ${claim.senderName || 'there'},\n\nRegarding your payment for Order #${claim.orderId || 'Direct'}:\nWe could not verify the deposit in our banking statement.\n\n• Amount: PKR ${claim.amount?.toLocaleString() || 'N/A'}\n• Method: ${claim.methodUsed}\n• TRX ID: ${claim.reference || 'N/A'}\n\nPlease share your transfer receipt screenshot here and we will resolve this quickly. Thank you.`;
    }

    return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(msg)}`;
  };

  const handleUpdateStatus = async (id: string, newStatus: string, customNote?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/merchant/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: customNote || '' }),
      });
      if (res.ok) {
        toast.success(
          newStatus === 'confirmed'
            ? '✓ Confirmed! Email sent to customer.'
            : newStatus === 'rejected'
            ? '✕ Rejected! Notification email sent.'
            : '↩ Claim reopened for review.'
        );
        setActionClaim(null);
        setNote('');
        setConfirmModal((p) => ({ ...p, open: false, loading: false }));
        fetchClaims();
      } else {
        toast.error('Failed to update. Please try again.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred.');
    }
    setSubmitting(false);
  };

  // Reopen: go through universal confirm modal
  const handleReopen = (c: Claim) => {
    setConfirmModal({
      open: true,
      variant: 'reopen',
      title: 'Reopen Claim for Review?',
      description: 'This will reset the status back to Pending Review. You will then be able to confirm or reject it again.',
      details: [
        { label: 'Order', value: c.orderId || 'Direct Payment' },
        { label: 'Amount', value: `PKR ${c.amount?.toLocaleString() || 'N/A'}` },
        { label: 'Sender', value: c.senderName || '—' },
        { label: 'Current Status', value: c.status === 'confirmed' ? 'Confirmed' : 'Rejected' },
      ],
      loading: false,
      onConfirm: async () => {
        setConfirmModal((p) => ({ ...p, loading: true }));
        await handleUpdateStatus(c._id, 'pending_review');
      },
    });
  };

  const filteredClaims = claims.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.orderId && c.orderId.toLowerCase().includes(term)) ||
      (c.reference && c.reference.toLowerCase().includes(term)) ||
      (c.senderName && c.senderName.toLowerCase().includes(term)) ||
      (c.customerWhatsApp && c.customerWhatsApp.toLowerCase().includes(term)) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(term)) ||
      c.methodUsed.toLowerCase().includes(term) ||
      (c.customerContact && c.customerContact.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Universal double-check confirm modal */}
      <ConfirmModal
        open={confirmModal.open}
        variant={confirmModal.variant === 'reopen' ? 'reopen' : confirmModal.variant}
        title={confirmModal.title}
        description={confirmModal.description}
        details={confirmModal.details}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((p) => ({ ...p, open: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Payment Claims</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Auditable receipt log of all customer payment submissions with automated notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search name, ref, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
          <select
            className="bg-surface border border-neutral-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Claims</option>
            <option value="pending_review">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-surface border border-neutral-800/80 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center flex items-center justify-center gap-2 text-neutral-500">
            <Loader2 size={18} className="animate-spin" /> Loading claims ledger...
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-white font-semibold">No payment claims found</p>
            <p className="text-neutral-500 text-sm">
              Claims submitted through your hosted checkout or social links will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Order / TRX Ref</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Sender & Customer</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm">
                {filteredClaims.map((c) => {
                  const waUrl = buildWhatsAppUrl(c, c.status === 'confirmed' ? 'confirm' : 'reject');
                  const emailMailto = c.customerEmail
                    ? `mailto:${c.customerEmail}?subject=${encodeURIComponent(`Order #${c.orderId || 'Direct'} — Update`)}&body=${encodeURIComponent(`Hello, regarding your order #${c.orderId} — please feel free to reply for any questions.`)}`
                    : null;

                  return (
                    <tr key={c._id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-neutral-400">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm">{c.orderId || 'Direct Payment'}</div>
                        <div className="text-xs font-mono text-neutral-400 mt-0.5">TRX: {c.reference || '—'}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-neutral-900 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-200">
                          {c.methodUsed}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-primary whitespace-nowrap text-sm">
                        {c.amount ? `${c.currency} ${c.amount.toLocaleString()}` : 'N/A'}
                      </td>

                      {/* Sender & Customer — all 3 fields */}
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="space-y-1.5">
                          {c.senderName ? (
                            <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                              <User size={12} className="text-neutral-400 shrink-0" />
                              {c.senderName}
                            </div>
                          ) : (
                            <div className="text-xs text-neutral-600 italic">No sender name</div>
                          )}
                          {c.customerWhatsApp ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
                              <MessageCircle size={12} className="shrink-0" />
                              {c.customerWhatsApp}
                            </div>
                          ) : (
                            <div className="text-xs text-neutral-600 italic">No WhatsApp</div>
                          )}
                          {c.customerEmail ? (
                            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                              <Mail size={12} className="shrink-0" />
                              {c.customerEmail}
                            </div>
                          ) : (
                            <div className="text-xs text-neutral-600 italic">No Email</div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-300 px-2.5 py-1 bg-neutral-900/80 rounded-lg border border-neutral-800">
                          {c.contactChannel === 'whatsapp' ? (
                            <><MessageCircle size={12} className="text-green-400" /> WhatsApp</>
                          ) : (
                            <><Mail size={12} className="text-blue-400" /> Email</>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            c.status === 'confirmed'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : c.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {c.status === 'confirmed' && <CheckCircle size={12} />}
                          {c.status === 'rejected' && <XCircle size={12} />}
                          {c.status === 'pending_review' && <Clock size={12} />}
                          {c.status === 'pending_review' ? 'Pending Review' : c.status.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {c.status === 'pending_review' ? (
                          /* PENDING: Confirm + Reject */
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActionClaim({ claim: c, action: 'confirm' })}
                              className="px-3.5 py-1.5 bg-primary text-black font-bold rounded-xl text-xs hover:brightness-95 transition-all shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setActionClaim({ claim: c, action: 'reject' })}
                              className="px-3.5 py-1.5 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl text-xs transition-colors border border-neutral-800"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          /* CONFIRMED / REJECTED: Chat on WhatsApp + Email + Reopen */
                          <div className="flex flex-col items-end gap-1.5">
                            {waUrl ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 hover:bg-green-500/20 transition-colors"
                              >
                                <MessageCircle size={13} /> Chat on WhatsApp
                              </a>
                            ) : (
                              <span className="text-[11px] text-neutral-600 italic">No WhatsApp number</span>
                            )}

                            {emailMailto && (
                              <a
                                href={emailMailto}
                                className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 hover:bg-blue-500/20 transition-colors"
                              >
                                <Mail size={12} /> Email Customer
                              </a>
                            )}

                            {/* Reopen — always visible, goes through confirm modal */}
                            <button
                              onClick={() => handleReopen(c)}
                              className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw size={11} /> Reopen
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── STEP 1: Note entry modal (Confirm / Reject) ── */}
      {actionClaim && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-white">
              {actionClaim.action === 'confirm'
                ? '✓ Confirm Payment & Send Notifications'
                : '✕ Reject Payment Claim'}
            </h3>

            {/* Claim summary */}
            <div className="p-4 bg-black/60 rounded-2xl border border-neutral-800 text-xs space-y-2">
              {[
                { label: 'Order', value: actionClaim.claim.orderId || 'Direct Payment' },
                { label: 'Amount', value: `PKR ${actionClaim.claim.amount?.toLocaleString() || 'N/A'} via ${actionClaim.claim.methodUsed}` },
                { label: 'TRX ID', value: actionClaim.claim.reference || '—' },
                { label: 'Sender Account', value: actionClaim.claim.senderName || '—' },
                { label: 'Customer WhatsApp', value: actionClaim.claim.customerWhatsApp || '—' },
                { label: 'Customer Email', value: actionClaim.claim.customerEmail || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-neutral-400 shrink-0">{label}:</span>
                  <span className="font-mono font-bold text-white text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Info notice */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
              <span className="text-primary text-base">ℹ</span>
              <span>
                An automated <strong className="text-white">email</strong> will be sent to the customer.
                After confirming, use <strong className="text-green-400">Chat on WhatsApp</strong> to also notify via WhatsApp.
              </span>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {actionClaim.action === 'confirm'
                  ? 'Optional Note (Dispatch info, tracking #, etc.)'
                  : 'Reason for Rejection'}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  actionClaim.action === 'confirm'
                    ? 'e.g. Verified! Dispatching via TCS tomorrow.'
                    : 'e.g. TRX ID not found in our JazzCash statement.'
                }
                className="w-full bg-black/80 border border-neutral-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setActionClaim(null); setNote(''); }}
                className="px-4 py-2 text-neutral-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              {/* ── STEP 2: this opens the universal double-check modal ── */}
              <button
                type="button"
                onClick={() => {
                  const { claim, action } = actionClaim;
                  setConfirmModal({
                    open: true,
                    variant: action,
                    title: action === 'confirm' ? 'Confirm this payment?' : 'Reject this claim?',
                    description: action === 'confirm'
                      ? `You are about to mark this payment as confirmed. An email will be sent to ${claim.customerEmail || 'the customer'}. This cannot be undone (but you can Reopen if needed).`
                      : `You are about to reject this claim. A rejection email will be sent to ${claim.customerEmail || 'the customer'}.`,
                    details: [
                      { label: 'Order', value: claim.orderId || 'Direct' },
                      { label: 'Amount', value: `PKR ${claim.amount?.toLocaleString() || 'N/A'}` },
                      { label: 'Email', value: claim.customerEmail || '—' },
                    ],
                    loading: false,
                    onConfirm: async () => {
                      setConfirmModal((p) => ({ ...p, loading: true }));
                      await handleUpdateStatus(claim._id, action === 'confirm' ? 'confirmed' : 'rejected', note);
                    },
                  });
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  actionClaim.action === 'confirm'
                    ? 'bg-primary text-black hover:brightness-95 shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {actionClaim.action === 'confirm' ? '✓ Proceed to Confirm' : '✕ Proceed to Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
