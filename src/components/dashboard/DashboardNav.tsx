"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  Wallet,
  Palette,
  MessageCircle,
  Eye,
  Rocket,
  BarChart3,
  Code2,
  Settings,
  QrCode,
  Layers,
  Webhook
} from 'lucide-react';

export default function DashboardNav() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Payment Claims', href: '/dashboard/claims', icon: FileCheck2 },
    { name: 'Accounts', href: '/dashboard/accounts', icon: Wallet },
    { name: 'Integrations', href: '/dashboard/integrations', icon: Layers },
    { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
    { name: 'Appearance', href: '/dashboard/appearance', icon: Palette },
    { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageCircle },
    { name: 'Live Preview', href: '/dashboard/preview', icon: Eye },
    { name: 'Publish', href: '/dashboard/publish', icon: Rocket },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'QR Generator', href: '/dashboard/qrcodes', icon: QrCode },
    { name: 'Embed Code', href: '/dashboard/embed', icon: Code2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="space-y-1.5">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary text-black font-semibold shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-black' : 'text-neutral-400 group-hover:text-white'} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
