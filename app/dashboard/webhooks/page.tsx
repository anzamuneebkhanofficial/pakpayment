"use client";

import { useState, useEffect } from 'react';
import {
  Webhook,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);

  const fetchWebhookData = () => {
    setLoading(true);
    fetch('/api/merchant/webhooks')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWebhookUrl(data.webhookUrl || '');
          setWebhookSecret(data.webhookSecret || '');
          setLogs(data.logs || []);
        }
      })
      .catch((err) => console.error('Failed to load webhook data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWebhookData();
  }, []);

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/merchant/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update webhook URL');

      toast.success('Webhook URL saved successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPing = async () => {
    if (!webhookUrl) {
      toast.error('Please configure and save a Webhook URL first.');
      return;
    }

    setTesting(true);
    try {
      const res = await fetch('/api/merchant/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_ping' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send test ping');

      if (data.result?.success) {
        toast.success(`Webhook test delivered! Received HTTP ${data.result.statusCode} in ${data.result.durationMs}ms`);
      } else {
        toast.warning(`Webhook dispatched but receiver returned: ${data.result?.error || 'HTTP ' + data.result?.statusCode}`);
      }

      fetchWebhookData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    toast.success('Webhook secret copied!');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Webhook size={13} /> Real-Time Notifications
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Webhooks & Event Sync</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Receive automated real-time HTTP POST notifications when payment claims are confirmed or rejected.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestPing}
          disabled={testing || !webhookUrl}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-black font-extrabold text-xs shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:brightness-95 transition-all disabled:opacity-50"
        >
          {testing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          Send Test Webhook
        </button>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook URL Card */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Endpoint URL</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              PakPayment will send an HMAC SHA-256 signed POST request to this URL whenever an event occurs.
            </p>
          </div>

          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourstore.com/?wc-api=pakpayment_webhook or /api/webhook"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                HTTPS endpoint recommended for security.
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Webhook URL'}
              </button>
            </div>
          </form>
        </div>

        {/* Signing Secret Card */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-primary" />
              <h3 className="text-base font-bold text-white">Signing Secret</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Verify incoming payloads using the <code>X-PakPayment-Signature</code> header.
            </p>
          </div>

          <div className="bg-black border border-neutral-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-neutral-300">
                {showSecret ? webhookSecret : '••••••••••••••••••••••••••••••••'}
              </code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="text-neutral-400 hover:text-white p-1"
                title="Copy Secret"
              >
                {copiedSecret ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-[11px] text-neutral-500 hover:text-primary transition-colors block"
            >
              {showSecret ? 'Hide Secret' : 'Reveal Secret'}
            </button>
          </div>
        </div>
      </div>

      {/* Events Reference Card */}
      <div className="bg-black/40 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
          Dispatched Events
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
            <code className="text-xs font-mono font-bold text-emerald-400">payment.confirmed</code>
            <p className="text-[11px] text-neutral-400 mt-1">
              Sent when you verify and confirm a customer claim in your claims ledger.
            </p>
          </div>
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
            <code className="text-xs font-mono font-bold text-red-400">payment.rejected</code>
            <p className="text-[11px] text-neutral-400 mt-1">
              Sent when a claim cannot be verified and is rejected by the merchant.
            </p>
          </div>
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800/80">
            <code className="text-xs font-mono font-bold text-primary">ping</code>
            <p className="text-[11px] text-neutral-400 mt-1">
              Diagnostic test payload sent when clicking &quot;Send Test Webhook&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Logs Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Webhook Deliveries</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live audit trail of the last 30 HTTP POST dispatch attempts.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchWebhookData}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            No webhook deliveries logged yet. Configure your URL above and send a test webhook!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/60 text-neutral-400 uppercase tracking-wider font-mono border-b border-neutral-800">
                <tr>
                  <th className="p-4">Status</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">HTTP Code</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-4">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 size={12} /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 font-bold text-[11px]">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">{log.event}</td>
                    <td className="p-4 font-mono">
                      <span className={log.statusCode && log.statusCode < 300 ? 'text-emerald-400' : 'text-red-400'}>
                        {log.statusCode || 'Timeout'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-neutral-400">{log.durationMs || 0}ms</td>
                    <td className="p-4 text-neutral-400">
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayload(log.payload)}
                        className="text-primary hover:underline font-mono text-xs flex items-center gap-1 ml-auto"
                      >
                        <Code size={13} /> View JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="text-sm font-bold text-white">Webhook Payload JSON</h4>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <pre className="bg-black p-4 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 overflow-x-auto max-h-80">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
