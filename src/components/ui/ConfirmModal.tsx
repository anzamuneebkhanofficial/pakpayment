"use client";

import { Loader2, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

type ConfirmModalVariant = 'confirm' | 'reject' | 'danger' | 'reopen' | 'publish' | 'save';

const VARIANT_CONFIG: Record<
  ConfirmModalVariant,
  { icon: React.ReactNode; title: string; yesLabel: string; yesClass: string }
> = {
  confirm: {
    icon: <CheckCircle size={22} className="text-primary" />,
    title: 'Confirm Action',
    yesLabel: 'Yes, Confirm',
    yesClass: 'bg-primary text-black hover:brightness-95 shadow-[0_0_15px_rgba(204,255,0,0.2)]',
  },
  reject: {
    icon: <XCircle size={22} className="text-red-400" />,
    title: 'Reject / Decline',
    yesLabel: 'Yes, Reject',
    yesClass: 'bg-red-500 text-white hover:bg-red-600',
  },
  danger: {
    icon: <AlertTriangle size={22} className="text-orange-400" />,
    title: 'This action cannot be undone',
    yesLabel: 'Yes, Delete',
    yesClass: 'bg-red-600 text-white hover:bg-red-700',
  },
  reopen: {
    icon: <RotateCcw size={22} className="text-neutral-300" />,
    title: 'Reopen for Review',
    yesLabel: 'Yes, Reopen',
    yesClass: 'bg-neutral-700 text-white hover:bg-neutral-600 border border-neutral-600',
  },
  publish: {
    icon: <CheckCircle size={22} className="text-primary" />,
    title: 'Publish to Live',
    yesLabel: 'Yes, Publish',
    yesClass: 'bg-primary text-black hover:brightness-95 shadow-[0_0_15px_rgba(204,255,0,0.2)]',
  },
  save: {
    icon: <CheckCircle size={22} className="text-primary" />,
    title: 'Save Changes',
    yesLabel: 'Yes, Save',
    yesClass: 'bg-primary text-black hover:brightness-95',
  },
};

type ConfirmModalProps = {
  open: boolean;
  variant?: ConfirmModalVariant;
  title?: string;
  description: string;
  details?: { label: string; value: string }[];
  yesLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  variant = 'confirm',
  title,
  description,
  details,
  yesLabel,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const cfg = VARIANT_CONFIG[variant];

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-[#111] border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          {cfg.icon}
          <h3 className="font-extrabold text-base text-white">{title || cfg.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-300 leading-relaxed">{description}</p>

        {/* Detail rows (optional) */}
        {details && details.length > 0 && (
          <div className="bg-black/60 border border-neutral-800 rounded-2xl p-4 space-y-2">
            {details.map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 text-xs">
                <span className="text-neutral-500 shrink-0">{label}</span>
                <span className="font-mono font-bold text-white text-right">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-60 flex items-center gap-2 ${cfg.yesClass}`}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing...
              </>
            ) : (
              yesLabel || cfg.yesLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
