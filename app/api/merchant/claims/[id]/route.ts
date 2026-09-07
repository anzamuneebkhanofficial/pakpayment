import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import PaymentClaim from '@/models/PaymentClaim';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import { rateLimitMerchant } from '@/lib/rateLimit';
import { sendCustomerConfirmationEmail, sendCustomerRejectionEmail } from '@/lib/email';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { status, note } = await req.json();
    if (!['pending_review', 'confirmed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();

    const [claim, config] = await Promise.all([
      PaymentClaim.findOneAndUpdate(
        { _id: id, userId },
        { $set: { status, merchantNotes: note || '' } },
        { new: true }
      ),
      MerchantWidgetConfig.findOne({ userId }),
    ]);

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const businessName = config?.draftConfig?.businessName || config?.publishedConfig?.businessName || 'Merchant Store';
    const customerEmail = claim.customerContact && claim.customerContact.includes('@') ? claim.customerContact : '';

    // Automated Email Notifications
    if (customerEmail) {
      if (status === 'confirmed') {
        sendCustomerConfirmationEmail({
          customerEmail,
          orderId: claim.orderId,
          amount: claim.amount,
          method: claim.methodUsed,
          businessName,
          note,
        }).catch((e) => console.error('Error sending confirmation email:', e));
      } else if (status === 'rejected') {
        sendCustomerRejectionEmail({
          customerEmail,
          orderId: claim.orderId,
          amount: claim.amount,
          method: claim.methodUsed,
          businessName,
          reason: note || 'Transaction could not be verified in our bank statement.',
        }).catch((e) => console.error('Error sending rejection email:', e));
      }
    }

    // Sync PaymentOrder status if linked
    try {
      const PaymentOrder = (await import('@/models/PaymentOrder')).default;
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await PaymentOrder.updateMany(
        { $or: [{ orderId: claim.orderId, appId: claim.appId }, { claimId: String(claim._id) }] },
        {
          $set: {
            status: status === 'confirmed' ? 'confirmed' : status === 'rejected' ? 'rejected' : 'claimed',
            expiresAt: thirtyDaysFromNow,
          },
        }
      );
    } catch (poErr) {
      console.error('Error syncing PaymentOrder:', poErr);
    }

    // Automated Webhook Dispatch to Merchant Store (WooCommerce / Shopify / Custom Server)
    const { dispatchWebhook } = await import('@/lib/webhook');
    dispatchWebhook({
      userId,
      appId: claim.appId,
      event: status === 'confirmed' ? 'payment.confirmed' : 'payment.rejected',
      data: {
        claimId: claim._id,
        orderId: claim.orderId,
        amount: claim.amount,
        currency: claim.currency,
        method: claim.methodUsed,
        reference: claim.reference,
        senderName: claim.senderName,
        status,
        merchantNotes: note || '',
        confirmedAt: new Date().toISOString(),
      },
    }).catch((whErr) => console.error('Error dispatching webhook:', whErr));

    return NextResponse.json(claim);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

