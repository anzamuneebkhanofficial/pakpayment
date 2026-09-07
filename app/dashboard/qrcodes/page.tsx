import { getServerSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import QRCodeBuilder from '@/components/dashboard/QRCodeBuilder';

export default async function QRCodesPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  await connectToDatabase();
  const config = await MerchantWidgetConfig.findOne({ userId: session.user.id });

  if (!config) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">QR Generator</h2>
        <p className="text-neutral-400 text-sm mt-1">
          Create, customize, and save payment QR codes to share anywhere.
        </p>
      </div>

      <QRCodeBuilder appId={config.appId} />
    </div>
  );
}
