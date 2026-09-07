"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

const accountSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  accountName: z.string().min(1, 'Account title is required'),
  accountNumber: z.string().min(1, 'Account number / IBAN is required'),
  additionalDetails: z.string().optional(),
  isActive: z.boolean().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

type Method = {
  _id: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  additionalDetails?: string;
  isActive: boolean;
};

const POPULAR_PROVIDERS = [
  'JazzCash',
  'EasyPaisa',
  'Meezan Bank',
  'HBL (Habib Bank)',
  'Nayapay',
  'Sadapay',
  'Bank Alfalah',
  'USDT (TRC20)',
  'Wise / Payoneer',
];

export default function AccountsPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    variant: 'danger' | 'confirm';
    title: string;
    description: string;
    details?: { label: string; value: string }[];
    loading: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    variant: 'danger',
    title: '',
    description: '',
    loading: false,
    onConfirm: () => {},
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      provider: 'JazzCash',
      accountName: '',
      accountNumber: '',
      additionalDetails: '',
      isActive: true,
    },
  });

  const fetchMethods = async () => {
    setLoading(true);
    const res = await fetch('/api/merchant/methods');
    if (res.ok) setMethods(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const onSubmit = async (data: AccountFormValues) => {
    const res = await fetch('/api/merchant/methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, isActive: data.isActive ?? true }),
    });
    if (res.ok) {
      toast.success('Payment account saved successfully!');
      reset();
      setShowForm(false);
      fetchMethods();
    } else {
      toast.error('Failed to save account. Please try again.');
    }
  };

  const toggleActive = (m: Method) => {
    const nextState = !m.isActive;
    setConfirmModal({
      open: true,
      variant: 'confirm',
      title: nextState ? 'Enable Account' : 'Disable Account',
      description: nextState
        ? `Are you sure you want to enable "${m.provider}" account? It will become visible to customers.`
        : `Are you sure you want to disable "${m.provider}" account? Customers will no longer see this payment option.`,
      details: [
        { label: 'Account', value: m.accountName },
        { label: 'Provider', value: m.provider },
      ],
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        await fetch(`/api/merchant/methods/${m._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: nextState }),
        });
        toast.success(nextState ? 'Account enabled.' : 'Account disabled.');
        setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        fetchMethods();
      },
    });
  };

  const deleteMethod = (m: Method) => {
    setConfirmModal({
      open: true,
      variant: 'danger',
      title: 'Delete Payment Account',
      description: `This will permanently remove this payment account. Customers will no longer be able to use this payment method.`,
      details: [
        { label: 'Provider', value: m.provider },
        { label: 'Account', value: m.accountName },
        { label: 'Number', value: m.accountNumber },
      ],
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        await fetch(`/api/merchant/methods/${m._id}`, { method: 'DELETE' });
        toast.success('Account deleted successfully.');
        setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        fetchMethods();
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Universal Confirm Modal */}
      <ConfirmModal
        open={confirmModal.open}
        variant={confirmModal.variant}
        title={confirmModal.title}
        description={confirmModal.description}
        details={confirmModal.details}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Payment Accounts</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Accounts displayed to customers during checkout for direct manual transfers
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-3 rounded-2xl hover:brightness-95 transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] text-sm shrink-0"
        >
          <Plus size={18} /> Add Payment Method
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-8 rounded-3xl border border-neutral-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">New Direct Payment Account</h3>
            <p className="text-xs text-neutral-400 mt-1">Customers will copy these details to transfer money directly to you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Provider / Bank
              </label>
              <input
                type="text"
                list="provider-suggestions"
                {...register('provider')}
                placeholder="e.g. JazzCash, Meezan Bank, Sadapay"
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
              <datalist id="provider-suggestions">
                {POPULAR_PROVIDERS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              {errors.provider && <p className="text-red-400 text-xs mt-1">{errors.provider.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Account Title / Beneficiary Name
              </label>
              <input
                type="text"
                {...register('accountName')}
                placeholder="e.g. Muhammad Ali"
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
              {errors.accountName && <p className="text-red-400 text-xs mt-1">{errors.accountName.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Account Number / IBAN / Wallet Number
              </label>
              <input
                type="text"
                {...register('accountNumber')}
                placeholder="03001234567 or PK36MEZN000..."
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-primary"
              />
              {errors.accountNumber && <p className="text-red-400 text-xs mt-1">{errors.accountNumber.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Optional Instructions / Branch Code / Notes
              </label>
              <input
                type="text"
                {...register('additionalDetails')}
                placeholder="e.g. Branch code 0123, or send receipt screenshot after transfer"
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-neutral-400 hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-black font-bold text-sm rounded-xl hover:brightness-95 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Account'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center gap-2 text-neutral-500">
            <Loader2 size={18} className="animate-spin" /> Loading accounts...
          </div>
        ) : methods.length === 0 ? (
          <div className="col-span-full bg-surface border border-neutral-800/80 rounded-3xl p-12 text-center space-y-3">
            <ShieldCheck size={40} className="mx-auto text-primary" />
            <h3 className="font-bold text-lg text-white">No payment accounts configured</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Add your JazzCash, EasyPaisa, or Bank IBAN details so customers can transfer money directly to you.
            </p>
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m._id}
              className={`bg-surface border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                m.isActive ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-800/40 opacity-50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                    {m.provider}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(m)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        m.isActive
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {m.isActive ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => deleteMethod(m)}
                      className="text-neutral-600 hover:text-red-400 p-1 rounded-lg transition-colors"
                      title="Delete account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-lg text-white">{m.accountName}</h4>
                <p className="font-mono text-sm text-neutral-300 mt-2 bg-black/60 px-3 py-2 rounded-xl border border-neutral-800/60 select-all">
                  {m.accountNumber}
                </p>

                {m.additionalDetails && (
                  <p className="text-xs text-neutral-400 mt-3">{m.additionalDetails}</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                <span>Zero custody route</span>
                <span className="flex items-center gap-1 text-primary">
                  <CheckCircle2 size={12} /> Direct deposit
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
