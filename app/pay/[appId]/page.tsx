import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import MerchantPaymentMethod from '@/models/MerchantPaymentMethod';
import WidgetEvent from '@/models/WidgetEvent';
import HostedCheckoutClient from '@/components/checkout/HostedCheckoutClient';

export default async function HostedPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ appId: string }>;
  searchParams: Promise<{
    amount?: string;
    order?: string;
    orderId?: string;
    currency?: string;
    session?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    redirectUrl?: string;
    merchantWa?: string;
    ep?: string;
    ep_title?: string;
    jc?: string;
    jc_title?: string;
    bank?: string;
    bank_name?: string;
    bank_title?: string;
  }>;
}) {
  const { appId } = await params;
  const sp = await searchParams;

  await connectToDatabase();
  const config = await MerchantWidgetConfig.findOne({ appId });

  if (!config || !config.isPublished) {
    return notFound();
  }

  // If a session ID is provided, fetch the server-locked order
  let lockedAmount = sp.amount ? Number(sp.amount) : null;
  let lockedOrderId = sp.orderId || sp.order || '';
  let currency = (sp.currency || 'PKR').toUpperCase();
  let isLocked = false;
  let items: Array<{ name: string; quantity: number; price: number }> = [];
  let redirectUrl = sp.redirectUrl ? decodeURIComponent(sp.redirectUrl) : '';
  let customerName = sp.customerName ? decodeURIComponent(sp.customerName) : '';
  let customerEmail = sp.customerEmail ? decodeURIComponent(sp.customerEmail) : '';
  let customerPhone = sp.customerPhone ? decodeURIComponent(sp.customerPhone) : '';

  if (sp.session) {
    try {
      const PaymentOrder = (await import('@/models/PaymentOrder')).default;
      const orderDoc = await PaymentOrder.findOne({ sessionId: sp.session, appId });
      if (orderDoc) {
        lockedAmount = orderDoc.amount;
        lockedOrderId = orderDoc.orderId;
        currency = (orderDoc.currency || currency || 'PKR').toUpperCase();
        isLocked = true;
        items = orderDoc.items || [];
        redirectUrl = orderDoc.redirectUrl || redirectUrl;
        customerName = orderDoc.customerName || customerName;
        customerEmail = orderDoc.customerEmail || customerEmail;
        customerPhone = orderDoc.customerPhone || customerPhone;
      }
    } catch (e) {
      console.error('Error loading PaymentOrder for session:', e);
    }
  }

  // Record view beacon
  await WidgetEvent.create({
    appId,
    type: 'view',
  }).catch(() => {});

  const methods = await MerchantPaymentMethod.find({
    userId: config.userId,
    isActive: true,
  }).select('-userId -createdAt -updatedAt -__v');

  let activeMethods: any[] = JSON.parse(JSON.stringify(methods));

  // If DB methods are empty, allow fallback accounts from WooCommerce manual settings
  if (activeMethods.length === 0) {
    if (sp.ep) {
      activeMethods.push({
        _id: 'fallback_ep',
        provider: 'EasyPaisa',
        accountName: sp.ep_title || 'Merchant EasyPaisa',
        accountNumber: sp.ep,
      });
    }
    if (sp.jc) {
      activeMethods.push({
        _id: 'fallback_jc',
        provider: 'JazzCash',
        accountName: sp.jc_title || 'Merchant JazzCash',
        accountNumber: sp.jc,
      });
    }
    if (sp.bank) {
      activeMethods.push({
        _id: 'fallback_bank',
        provider: sp.bank_name || 'Bank Transfer',
        accountName: sp.bank_title || 'Merchant Account',
        accountNumber: sp.bank,
      });
    }
  }

  const draft = config.draftConfig || {};
  const published = {
    ...draft,
    ...(config.publishedConfig || {}),
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{
        backgroundColor: published.backgroundColor || '#000000',
        color: published.textColor || '#ffffff',
      }}
    >
      <HostedCheckoutClient
        appId={appId}
        config={published}
        methods={activeMethods}
        initialAmount={lockedAmount}
        initialOrder={lockedOrderId}
        initialCurrency={currency}
        sessionId={sp.session || ''}
        isLocked={isLocked}
        items={items}
        redirectUrl={redirectUrl}
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        merchantWa={sp.merchantWa || ''}
      />
    </div>
  );
}
