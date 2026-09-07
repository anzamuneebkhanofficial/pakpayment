import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import EmbedCodeClient from '@/components/dashboard/EmbedCodeClient';

export default async function EmbedCodePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/sign-in');

  await connectToDatabase();
  const config = await MerchantWidgetConfig.findOne({ userId: session.user.id });

  if (!config) redirect('/dashboard');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appId = config.appId;
  const version = config.version || 1;
  const isLocalhost = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');
  const isOrderButtonEnabled = config.draftConfig?.enableWhatsAppOrderButton ?? config.enableWhatsAppOrderButton ?? true;

  return (
    <EmbedCodeClient
      appUrl={appUrl}
      appId={appId}
      version={version}
      isLocalhost={isLocalhost}
      isOrderButtonEnabled={isOrderButtonEnabled}
    />
  );
}

