"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-black font-bold rounded-2xl hover:brightness-95 active:scale-95 transition-all text-sm shrink-0"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
