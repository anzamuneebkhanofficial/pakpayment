"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageCircle, Mail, Save, CheckCircle2, RotateCcw, FileText, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

const whatsappSchema = z.object({
  whatsappNumber: z.string().optional(),
  whatsappTemplate: z.string().min(1, 'Template cannot be empty'),
  fallbackEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  enableWhatsAppOrderButton: z.boolean().optional(),
  whatsAppOrderButtonText: z.string().optional(),
  whatsAppOrderTemplate: z.string().optional(),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;

const DEFAULT_TEMPLATE = `Hello! I have completed payment of PKR {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}.
• Transaction Reference (TRX ID): {{REF}}
• Sender Account Title / Name: {{SENDER}}
• Customer WhatsApp: {{WHATSAPP}}
• Customer Email: {{EMAIL}}

I have attached my transfer receipt screenshot below. Please verify and confirm my order. Thank you!`;

const DEFAULT_ORDER_TEMPLATE = `Hello! I would like to order {{PRODUCT_NAME}} for PKR {{PRICE}}.
• Product Link: {{URL}}
• SKU: {{SKU}}
• Quantity: {{QUANTITY}}

Please confirm availability and how to proceed with the order. Thank you!`;

export default function WhatsAppPage() {
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingData, setPendingData] = useState<WhatsAppFormValues | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      enableWhatsAppOrderButton: true,
      whatsAppOrderButtonText: 'Order through WhatsApp',
      whatsAppOrderTemplate: DEFAULT_ORDER_TEMPLATE,
    },
  });

  const orderButtonEnabled = watch('enableWhatsAppOrderButton') ?? true;
  const orderButtonText = watch('whatsAppOrderButtonText') || 'Order through WhatsApp';

  useEffect(() => {
    fetch('/api/merchant/config')
      .then((res) => res.json())
      .then((data) => {
        const d = data.draftConfig || {};
        let tpl = d.whatsappTemplate || DEFAULT_TEMPLATE;
        if (tpl.trim() === 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.') {
          tpl = DEFAULT_TEMPLATE;
        }
        reset({
          whatsappNumber: d.whatsappNumber || '',
          fallbackEmail: d.fallbackEmail || '',
          whatsappTemplate: tpl,
          enableWhatsAppOrderButton: d.enableWhatsAppOrderButton ?? true,
          whatsAppOrderButtonText: d.whatsAppOrderButtonText || 'Order through WhatsApp',
          whatsAppOrderTemplate: d.whatsAppOrderTemplate || DEFAULT_ORDER_TEMPLATE,
        });
        setLoading(false);
      });
  }, [reset]);

  const insertTag = (tag: string) => {
    const current = getValues('whatsappTemplate') || '';
    setValue('whatsappTemplate', `${current} ${tag}`, { shouldDirty: true });
  };

  const handleResetTemplate = () => {
    setConfirmReset(true);
  };

  const doResetTemplate = () => {
    setValue('whatsappTemplate', DEFAULT_TEMPLATE, { shouldDirty: true });
    toast.info('Template reset to recommended layout.');
    setConfirmReset(false);
  };

  const onSubmit = async (data: WhatsAppFormValues) => {
    // Show confirm modal first
    setPendingData(data);
    setConfirmSave(true);
  };

  const doSave = async () => {
    if (!pendingData) return;
    setSaving(true);
    setSavedSuccess(false);
    setConfirmSave(false);

    // Fetch existing draft to merge
    const currentRes = await fetch('/api/merchant/config');
    const currentData = await currentRes.json();
    const currentDraft = currentData.draftConfig || {};

    const updatedDraft = { ...currentDraft, ...pendingData };

    const res = await fetch('/api/merchant/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDraft),
    });

    if (res.ok) {
      await fetch('/api/merchant/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });
      setSavedSuccess(true);
      toast.success('WhatsApp and Email configuration published live successfully!');
      setTimeout(() => setSavedSuccess(false), 4000);
    } else {
      toast.error('Failed to save settings. Please try again.');
    }
    setSaving(false);
    setPendingData(null);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-neutral-500">
      <Loader2 size={18} className="animate-spin" /> Loading contact settings...
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Confirm Save Modal */}
      <ConfirmModal
        open={confirmSave}
        variant="save"
        title="Save & Publish WhatsApp Config?"
        description="This will immediately publish your WhatsApp number, fallback email, and receipt template to the live checkout. Are you sure?"
        loading={saving}
        onConfirm={doSave}
        onCancel={() => setConfirmSave(false)}
      />

      {/* Confirm Reset Template Modal */}
      <ConfirmModal
        open={confirmReset}
        variant="danger"
        title="Reset WhatsApp Template?"
        description="This will replace your current custom template with the recommended default template. Your current content will be lost."
        yesLabel="Yes, Reset Template"
        loading={false}
        onConfirm={doResetTemplate}
        onCancel={() => setConfirmReset(false)}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">WhatsApp & Fallback Email</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Configure your direct WhatsApp order confirmation channel and receipt notification templates
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-xl hover:brightness-95 transition-all text-sm shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save &amp; Publish Live</>
            )}
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-3 text-sm">
            <CheckCircle2 size={18} />
            <span>
              <strong>Settings Published!</strong> All customer claims and WhatsApp confirmations are now using this live configuration.
            </span>
          </div>
        )}

        {/* Merchant WhatsApp Number */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageCircle size={15} className="text-green-400" /> Merchant WhatsApp Phone Number
          </label>
          <input
            type="text"
            {...register('whatsappNumber')}
            placeholder="03334098558 or +923334098558"
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary"
          />
          {errors.whatsappNumber && <p className="text-red-400 text-xs mt-1">{errors.whatsappNumber.message}</p>}
          <p className="text-xs text-neutral-500 mt-2">
            When buyers click "Confirm via WhatsApp", a direct chat will open with this number containing the complete receipt template and a reminder to attach their transfer screenshot.
          </p>
        </div>

        {/* Fallback Email */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Mail size={15} className="text-blue-400" /> Fallback Email Address (For Non-WhatsApp / Desktop Buyers)
          </label>
          <input
            type="email"
            {...register('fallbackEmail')}
            placeholder="anzamuneebkhan13@gmail.com"
            className="w-full bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
          />
          {errors.fallbackEmail && <p className="text-red-400 text-xs mt-1">{errors.fallbackEmail.message}</p>}
          
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs rounded-xl mt-2 flex items-start gap-2">
            <Info size={15} className="shrink-0 mt-0.5" />
            <p>
              <strong>Where is Fallback Email used?</strong> Buyers who don't have WhatsApp on their computer can click <em>"Send Confirmation via Email"</em>. Their receipt claim and TRX reference will be emailed directly to this address.
            </p>
          </div>
        </div>

        {/* WhatsApp Receipt Template */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <FileText size={15} className="text-primary" /> WhatsApp Receipt Template
            </label>
            <button
              type="button"
              onClick={handleResetTemplate}
              className="text-xs text-neutral-400 hover:text-primary flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset to Recommended
            </button>
          </div>
          <textarea
            rows={7}
            {...register('whatsappTemplate')}
            className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-primary leading-relaxed"
          />
          {errors.whatsappTemplate && <p className="text-red-400 text-xs mt-1">{errors.whatsappTemplate.message}</p>}
          
          <div className="mt-3">
            <span className="text-xs text-neutral-400 block mb-1.5 font-medium">Click to insert variables:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: '{{AMOUNT}}', label: 'Amount (PKR)' },
                { tag: '{{ORDER_ID}}', label: 'Order Reference' },
                { tag: '{{METHOD}}', label: 'Bank / Wallet Method' },
                { tag: '{{REF}}', label: 'Transaction TRX ID' },
                { tag: '{{SENDER}}', label: 'Sender Account Title' },
                { tag: '{{WHATSAPP}}', label: 'Customer WhatsApp' },
                { tag: '{{EMAIL}}', label: 'Customer Email' },
                { tag: '{{CONTACT}}', label: 'Full Contact Info' },
              ].map((item) => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => insertTag(item.tag)}
                  className="text-[11px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded-lg text-primary font-mono transition-colors"
                >
                  {item.tag} <span className="text-neutral-500 font-sans text-[10px]">({item.label})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Direct WhatsApp Product Order Button (New Feature) ── */}
        <div className="pt-8 border-t border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-green-500/15 text-green-400 border border-green-500/30">
                  New Feature
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageCircle size={18} className="text-green-400" /> Direct "Order through WhatsApp" Button
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Enable a 1-click WhatsApp Order button for individual product/landing pages. Auto-detects product name, price, and link.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('enableWhatsAppOrderButton')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              <span className="ml-3 text-xs font-semibold text-neutral-300">
                {orderButtonEnabled ? 'Enabled on Products' : 'Disabled'}
              </span>
            </label>
          </div>

          {orderButtonEnabled && (
            <div className="space-y-6 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
              {/* Button Text */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Button Text / Label
                </label>
                <input
                  type="text"
                  {...register('whatsAppOrderButtonText')}
                  placeholder="Order through WhatsApp"
                  className="w-full max-w-md bg-black/70 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400"
                />
                <p className="text-xs text-neutral-500 mt-1.5">
                  Examples: <em>"Order through WhatsApp"</em>, <em>"Buy via WhatsApp"</em>, <em>"Order Now on WhatsApp"</em>
                </p>
              </div>

              {/* Order Message Template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={15} className="text-green-400" /> WhatsApp Product Order Message Template
                  </label>
                  <button
                    type="button"
                    onClick={() => setValue('whatsAppOrderTemplate', DEFAULT_ORDER_TEMPLATE, { shouldDirty: true })}
                    className="text-xs text-neutral-400 hover:text-green-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={12} /> Reset to Default
                  </button>
                </div>
                <textarea
                  rows={5}
                  {...register('whatsAppOrderTemplate')}
                  className="w-full bg-black/70 border border-neutral-800 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-green-400 leading-relaxed"
                />
                
                <div className="mt-3">
                  <span className="text-xs text-neutral-400 block mb-1.5 font-medium">Click to insert product variables:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: '{{PRODUCT_NAME}}', label: 'Product / Course Title' },
                      { tag: '{{PRICE}}', label: 'Price (PKR)' },
                      { tag: '{{DESCRIPTION}}', label: 'Item Description' },
                      { tag: '{{URL}}', label: 'Page Link' },
                      { tag: '{{SKU}}', label: 'Product SKU' },
                      { tag: '{{QUANTITY}}', label: 'Selected Quantity' },
                    ].map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => {
                          const curr = getValues('whatsAppOrderTemplate') || '';
                          setValue('whatsAppOrderTemplate', `${curr} ${item.tag}`, { shouldDirty: true });
                        }}
                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 rounded-lg text-green-400 font-mono transition-colors"
                      >
                        {item.tag} <span className="text-neutral-500 font-sans text-[10px]">({item.label})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-4 border-t border-neutral-800">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Live Product Page Preview:
                </p>
                <div className="bg-black/80 border border-neutral-800 rounded-2xl p-5 max-w-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-xl">
                      ⌚
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Guess Matrix Quartz Watch</h4>
                      <p className="text-xs text-green-400 font-semibold font-mono mt-0.5">PKR 40,500 <span className="text-neutral-500 line-through font-normal text-[11px]">Rs. 54,000</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="py-2.5 text-center bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-semibold rounded-xl opacity-60">
                        Add To Cart
                      </div>
                      <div className="py-2.5 text-center bg-white text-black text-xs font-bold rounded-xl opacity-80">
                        Buy It Now
                      </div>
                    </div>
                    
                    {/* The Direct WhatsApp Order Button */}
                    <button
                      type="button"
                      className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.25)] transition-all cursor-default"
                    >
                      <MessageCircle size={17} /> {orderButtonText}
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 text-center mt-3">
                    Clicking opens WhatsApp in a new tab with product title, price &amp; link pre-filled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
