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
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              isActive
                ? 'bg-neutral-900 text-white border border-neutral-800 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
            )}
            <Icon
              size={17}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-primary' : 'text-neutral-400 group-hover:text-white'
              }`}
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
