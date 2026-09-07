"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Save, Trash2, QrCode, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SavedQR {
  _id: string;
  title: string;
  type: 'open_amount' | 'fixed_amount';
  amount?: number;
  description?: string;
  colors: { dark: string; light: string };
  createdAt: string;
}

export default function QRCodeBuilder({ appId }: { appId: string }) {
  const [title, setTitle] = useState('Counter Display');
  const [type, setType] = useState<'open_amount' | 'fixed_amount'>('open_amount');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [darkColor, setDarkColor] = useState('#CCFF00');
  const [lightColor, setLightColor] = useState('#171717');
  
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [savedQRs, setSavedQRs] = useState<SavedQR[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedQRs();
  }, []);

  useEffect(() => {
    generateQR();
  }, [type, amount, description, darkColor, lightColor]);

  const fetchSavedQRs = async () => {
    try {
      const res = await fetch('/api/qrcodes');
      if (res.ok) {
        const data = await res.json();
        setSavedQRs(data.qrCodes);
      }
    } catch (error) {
      console.error('Failed to fetch QR codes', error);
    }
  };

  const generateQR = async () => {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      let link = `${appUrl}/pay/${appId}`;
      
      if (type === 'fixed_amount') {
        const params = new URLSearchParams();
        if (amount) params.append('amount', amount);
        if (description) params.append('order', description);
        const queryStr = params.toString();
        if (queryStr) {
          link += `?${queryStr}`;
        }
      }
      
      setPaymentLink(link);

      const url = await QRCode.toDataURL(link, {
        color: { dark: darkColor, light: lightColor },
        margin: 2,
        width: 300,
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Error generating QR', err);
    }
  };

  const handleSave = async () => {
    if (!title) return toast.error('Please enter a title');
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          amount,
          description,
          colors: { dark: darkColor, light: lightColor }
        })
      });

      if (res.ok) {
        toast.success('QR Code saved successfully');
        fetchSavedQRs();
      } else {
        toast.error('Failed to save QR code');
      }
    } catch (error) {
      toast.error('Error saving QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      const res = await fetch(`/api/qrcodes/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('QR Code deleted');
        fetchSavedQRs();
      } else {
        toast.error('Failed to delete QR code');
      }
    } catch (error) {
      toast.error('Error deleting QR code');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Builder Form */}
        <div className="bg-surface p-8 rounded-3xl border border-neutral-800/80 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="text-primary" /> Configuration
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Counter Display"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">QR Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('open_amount')}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    type === 'open_amount'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Open Amount
                  <span className="block text-xs font-normal text-neutral-500 mt-1">Customer enters amount</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('fixed_amount')}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    type === 'fixed_amount'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Fixed Amount
                  <span className="block text-xs font-normal text-neutral-500 mt-1">Amount is pre-filled</span>
                </button>
              </div>
            </div>

            {type === 'fixed_amount' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Shoes Order"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">QR Color</label>
                <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-sm font-mono text-neutral-300">{darkColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Background Color</label>
                <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-sm font-mono text-neutral-300">{lightColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-surface p-8 rounded-3xl border border-neutral-800/80 flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <h3 className="text-xl font-bold text-white relative z-10">Live Preview</h3>
          
          <div className="p-4 bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl relative z-10">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code Preview" className="w-64 h-64 rounded-2xl" />
            ) : (
              <div className="w-64 h-64 bg-neutral-800 rounded-2xl animate-pulse" />
            )}
          </div>

          <div className="w-full max-w-sm space-y-3 relative z-10">
            <a
              href={qrDataUrl}
              download={`${title.replace(/\s+/g, '-')}-QR.png`}
              className="w-full inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl border border-neutral-700 transition-colors"
            >
              <Download size={18} /> Download PNG
            </a>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 px-4 rounded-xl hover:brightness-95 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {isLoading ? 'Saving...' : 'Save QR Code'}
            </button>
          </div>
          
          <div className="text-xs text-neutral-500 flex items-center justify-center gap-1.5 w-full truncate max-w-xs relative z-10">
            <LinkIcon size={12} />
            <span className="truncate">{paymentLink}</span>
          </div>
        </div>
      </div>

      {/* Saved QR Codes */}
      <div className="bg-surface p-8 rounded-3xl border border-neutral-800/80">
        <h3 className="text-xl font-bold text-white mb-6">Saved QR Codes</h3>
        
        {savedQRs.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
            No QR codes saved yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedQRs.map((qr) => (
              <div key={qr._id} className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-4 flex flex-col items-center text-center group transition-all hover:border-neutral-700">
                <div className="w-full flex justify-end mb-2">
                  <button 
                    onClick={() => handleDelete(qr._id)}
                    className="text-neutral-500 hover:text-red-500 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <QrCodePreview link={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/pay/${appId}${qr.type === 'fixed_amount' ? `?amount=${qr.amount || ''}${qr.description ? `&order=${encodeURIComponent(qr.description)}` : ''}` : ''}`} dark={qr.colors.dark} light={qr.colors.light} />
                <h4 className="font-bold text-white mt-4 text-sm">{qr.title}</h4>
                <span className="text-xs text-neutral-400 mt-1 px-2 py-0.5 bg-neutral-800 rounded-full">
                  {qr.type === 'fixed_amount' ? `Fixed: ${qr.amount} PKR` : 'Open Amount'}
                </span>
                
                <button
                  onClick={async () => {
                     const link = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/pay/${appId}${qr.type === 'fixed_amount' ? `?amount=${qr.amount || ''}${qr.description ? `&order=${encodeURIComponent(qr.description)}` : ''}` : ''}`;
                     const url = await QRCode.toDataURL(link, { color: { dark: qr.colors.dark, light: qr.colors.light }, margin: 2, width: 300 });
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `${qr.title.replace(/\s+/g, '-')}-QR.png`;
                     a.click();
                  }}
                  className="mt-4 w-full text-xs font-semibold py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Small component to render the preview for saved QRs
function QrCodePreview({ link, dark, light }: { link: string, dark: string, light: string }) {
  const [url, setUrl] = useState('');
  
  useEffect(() => {
    QRCode.toDataURL(link, { color: { dark, light }, margin: 2, width: 150 }).then(setUrl);
  }, [link, dark, light]);

  return url ? <img src={url} alt="QR" className="w-32 h-32 rounded-xl" /> : <div className="w-32 h-32 bg-neutral-800 animate-pulse rounded-xl" />;
}
