"use client";

import { useEffect, useState } from 'react';
import { Rocket, CheckCircle2, ArrowRight, Loader2, Info, Pencil, Eye, Globe } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function PublishPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchConfig = () => {
    setLoading(true);
    fetch('/api/merchant/config')
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    setPublishSuccess(false);
    setConfirmOpen(false);
    const res = await fetch('/api/merchant/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const updated = await res.json();
      setConfig(updated);
      setPublishSuccess(true);
    }
    setPublishing(false);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-neutral-500">
      <Loader2 size={18} className="animate-spin" /> Loading publish state...
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        variant="publish"
        title="Publish Configuration to Live?"
        description="This will snapshot your current draft settings and deploy them live. All customers visiting your payment page will immediately see the updated checkout. Are you sure?"
        details={[
          { label: 'Current Live Version', value: `v${config.version || 1}` },
          { label: 'New Version', value: `v${(config.version || 1) + 1}` },
          { label: 'App ID', value: config.appId },
        ]}
        loading={publishing}
        onConfirm={handlePublish}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Publish Changes</h2>
        <p className="text-sm text-neutral-400 mt-1">
          When you're ready, hit <span className="text-white font-medium">Publish to Live</span> — your updated checkout will instantly go live for all customers.
        </p>
      </div>

      {publishSuccess && (
        <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-white">Live Snapshot Updated!</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Version {config.version} is now active across all embeds and hosted links.
              </p>
            </div>
          </div>
          <Link
            href={`/pay/${config.appId}`}
            target="_blank"
            className="text-xs font-bold bg-primary text-black px-4 py-2 rounded-xl hover:brightness-95"
          >
            View Live Page →
          </Link>
        </div>
      )}

      {/* Snapshot Card */}
      <div className="bg-surface p-8 rounded-3xl border border-neutral-800/80 shadow-2xl space-y-6">
        {/* How it works - simple steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300">How this works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-3 p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">1</div>
              <div>
                <p className="text-sm font-semibold text-white">Make changes</p>
                <p className="text-xs text-neutral-400 mt-0.5">Edit colors, text, and settings in <span className="text-neutral-300">Appearance</span> or <span className="text-neutral-300">WhatsApp</span>. Click <span className="text-neutral-300">Save Draft</span> to save them.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800">
              <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">2</div>
              <div>
                <p className="text-sm font-semibold text-white">Preview first</p>
                <p className="text-xs text-neutral-400 mt-0.5">Check how everything looks before going live. Your customers won't see anything yet — it's still a draft.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">3</div>
              <div>
                <p className="text-sm font-semibold text-white">Publish to go live</p>
                <p className="text-xs text-neutral-400 mt-0.5">Click <span className="text-primary font-medium">Publish to Live</span> below. Your updated checkout instantly goes live for every customer who visits your payment link.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-800">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Live Version</span>
            <p className="text-2xl font-black text-white mt-1">v{config.version || 1}</p>
            <span className="text-[11px] text-neutral-500">
              Published: {config.publishedAt ? new Date(config.publishedAt).toLocaleDateString() : 'Never'}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Target App ID</span>
            <p className="text-xl font-mono text-primary font-bold mt-1">{config.appId}</p>
            <span className="text-[11px] text-green-400">● Live & Serving</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard/preview"
            className="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1"
          >
            Preview draft changes first <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setConfirmOpen(true)}
            disabled={publishing}
            className="flex items-center gap-2 bg-primary text-black px-6 py-3.5 rounded-2xl font-extrabold hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(204,255,0,0.25)] text-sm"
          >
            {publishing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Deploying...
              </>
            ) : (
              <>
                <Rocket size={18} /> Publish to Live
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
