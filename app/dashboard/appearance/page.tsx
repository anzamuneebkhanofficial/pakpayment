"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, Loader2, Check, RotateCcw, Info } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

const appearanceSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessLogoUrl: z.string().optional(),
  widgetTitle: z.string().min(1, 'Widget title is required'),
  widgetSubtitle: z.string().optional(),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  backgroundColor: z.string().min(1),
  textColor: z.string().min(1),
  borderRadius: z.string(),
  instructionNotice: z.string().optional(),
  displayMode: z.enum(['inline', 'modal', 'both']),
  whatsappNumber: z.string().optional(),
  whatsappTemplate: z.string().optional(),
  fallbackEmail: z.string().optional(),
  requireReference: z.boolean().optional(),
  allowProofUpload: z.boolean().optional(),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

export default function AppearancePage() {
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);

  const DEFAULT_VALUES: AppearanceFormValues = {
    businessName: 'My Business Store',
    businessLogoUrl: '',
    widgetTitle: 'Select Payment Method',
    widgetSubtitle: 'Direct manual transfer to merchant',
    primaryColor: '#CCFF00',
    secondaryColor: '#FF8C42',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    borderRadius: '12px',
    instructionNotice: 'Please transfer the exact amount and send proof via WhatsApp.',
    displayMode: 'both',
    whatsappNumber: '',
    whatsappTemplate: 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.',
    fallbackEmail: '',
    requireReference: true,
    allowProofUpload: true,
  };

  const resetToDefault = () => {
    reset(DEFAULT_VALUES);
    toast?.success?.('Form reset to default values. Click Save to apply.');
  };
  const [pendingData, setPendingData] = useState<AppearanceFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      businessName: 'My Business Store',
      businessLogoUrl: '',
      widgetTitle: 'Select Payment Method',
      widgetSubtitle: 'Direct manual transfer to merchant',
      primaryColor: '#CCFF00',
      secondaryColor: '#FF8C42',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderRadius: '12px',
      instructionNotice: 'Please transfer the exact amount and send proof via WhatsApp.',
      displayMode: 'both',
      whatsappNumber: '',
      whatsappTemplate: 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.',
      fallbackEmail: '',
      requireReference: true,
      allowProofUpload: true,
    },
  });

  const primaryColor = watch('primaryColor') || '#CCFF00';
  const secondaryColor = watch('secondaryColor') || '#FF8C42';
  const backgroundColor = watch('backgroundColor') || '#000000';
  const textColor = watch('textColor') || '#ffffff';

  useEffect(() => {
    fetch('/api/merchant/config')
      .then((res) => res.json())
      .then((data) => {
        const d = data.draftConfig || {};
        reset({
          businessName: d.businessName || 'My Business Store',
          businessLogoUrl: d.businessLogoUrl || '',
          widgetTitle: d.widgetTitle || 'Select Payment Method',
          widgetSubtitle: d.widgetSubtitle || 'Direct manual transfer to merchant',
          primaryColor: d.primaryColor || '#CCFF00',
          secondaryColor: d.secondaryColor || '#FF8C42',
          backgroundColor: d.backgroundColor || '#000000',
          textColor: d.textColor || '#ffffff',
          borderRadius: d.borderRadius || '12px',
          instructionNotice: d.instructionNotice || 'Please transfer the exact amount and send proof via WhatsApp.',
          displayMode: d.displayMode || 'both',
          whatsappNumber: d.whatsappNumber || '',
          whatsappTemplate: d.whatsappTemplate || 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.',
          fallbackEmail: d.fallbackEmail || '',
          requireReference: d.requireReference ?? true,
          allowProofUpload: d.allowProofUpload ?? true,
        });
        setLoading(false);
      });
  }, [reset]);

  const onSubmit = async (data: AppearanceFormValues) => {
    // Open confirm modal first
    setPendingData(data);
    setConfirmSave(true);
  };

  const doSave = async () => {
    if (!pendingData) return;
    setSaving(true);
    setSavedSuccess(false);
    setConfirmSave(false);
    const res = await fetch('/api/merchant/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingData),
    });
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
    setSaving(false);
    setPendingData(null);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-neutral-500">
      <Loader2 size={18} className="animate-spin" /> Loading appearance settings...
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Confirm Save Modal */}
      <ConfirmModal
        open={confirmSave}
        variant="save"
        title="Save Appearance Draft?"
        description="This will save your current design settings as a draft. Go to the Publish tab to deploy them live to customers."
        loading={saving}
        onConfirm={doSave}
        onCancel={() => setConfirmSave(false)}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Appearance & Branding</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Customize how your checkout page looks. Changes are saved as a draft — go to <span className="text-white font-medium">Publish</span> when you're ready to apply them live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/preview"
            className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Eye size={16} /> Live Preview
          </Link>
          <button
            type="button"
            onClick={resetToDefault}
            title="Reset all colors and settings back to factory defaults"
            className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <RotateCcw size={15} /> Reset to Default
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isSubmitting || saving}
            className="flex items-center gap-2 bg-primary text-black font-bold px-6 py-2.5 rounded-xl text-sm hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Draft</>
            )}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
        <Info size={16} className="text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          <span className="text-white font-semibold">How it works:</span> All changes you make here are saved as a <span className="text-white font-medium">draft</span> — they won't affect your live checkout yet. Once you're happy with the design, go to the <span className="text-white font-medium">Publish</span> page to apply them live for your customers. If you want to start fresh, click <span className="text-white font-medium">Reset to Default</span> to restore the original settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-2xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check size={16} /> Draft changes saved! Go to the Publish tab to deploy live.
          </span>
          <Link href="/dashboard/publish" className="font-bold underline">Go to Publish →</Link>
        </div>
      )}

      {/* Form (React Hook Form) */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-8 rounded-3xl border border-neutral-800/80 shadow-2xl space-y-6">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Store / Business Name
          </label>
          <input
            type="text"
            {...register('businessName')}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
          />
          {errors.businessName && <p className="text-red-400 text-xs mt-1">{errors.businessName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Widget Checkout Title
          </label>
          <input
            type="text"
            {...register('widgetTitle')}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
          />
          {errors.widgetTitle && <p className="text-red-400 text-xs mt-1">{errors.widgetTitle.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Subtitle / Description
          </label>
          <input
            type="text"
            {...register('widgetSubtitle')}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Color Palette Tokens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Primary Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-12 rounded-xl bg-transparent border border-neutral-800 cursor-pointer p-0.5"
                value={primaryColor}
                onChange={(e) => setValue('primaryColor', e.target.value)}
              />
              <input
                type="text"
                {...register('primaryColor')}
                className="flex-1 bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Secondary / Warning Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-12 rounded-xl bg-transparent border border-neutral-800 cursor-pointer p-0.5"
                value={secondaryColor}
                onChange={(e) => setValue('secondaryColor', e.target.value)}
              />
              <input
                type="text"
                {...register('secondaryColor')}
                className="flex-1 bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-12 rounded-xl bg-transparent border border-neutral-800 cursor-pointer p-0.5"
                value={backgroundColor}
                onChange={(e) => setValue('backgroundColor', e.target.value)}
              />
              <input
                type="text"
                {...register('backgroundColor')}
                className="flex-1 bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="w-12 h-12 rounded-xl bg-transparent border border-neutral-800 cursor-pointer p-0.5"
                value={textColor}
                onChange={(e) => setValue('textColor', e.target.value)}
              />
              <input
                type="text"
                {...register('textColor')}
                className="flex-1 bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Notices & Radii */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Instruction Notice (Displayed inside checkout)
            </label>
            <textarea
              rows={3}
              {...register('instructionNotice')}
              className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Border Radius
              </label>
              <select
                {...register('borderRadius')}
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
              >
                <option value="6px">Subtle (6px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="20px">Pill / Modern (20px)</option>
                <option value="0px">Sharp (0px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Display Mode
              </label>
              <select
                {...register('displayMode')}
                className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
              >
                <option value="both">Both (Inline & Modal)</option>
                <option value="inline">Inline Only</option>
                <option value="modal">Modal Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Action Buttons (Bottom) */}
        <div className="pt-6 mt-4 border-t border-neutral-800 flex flex-col sm:flex-row justify-end items-center gap-4">
          <button
            type="button"
            onClick={resetToDefault}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 font-medium hover:text-white transition-colors flex justify-center items-center gap-2 text-sm"
          >
            <RotateCcw size={16} /> Reset to Default
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || saving}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-black font-bold hover:brightness-95 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50 shadow-[0_0_15px_rgba(204,255,0,0.15)]"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Draft</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
