import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import PaymentClaim from '@/models/PaymentClaim';
import WidgetEvent from '@/models/WidgetEvent';
import { claimSubmissionSchema } from '@/lib/validation';
import { rateLimitPublicClaim } from '@/lib/rateLimit';
import { notifyMerchantNewClaim } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest, props: { params: Promise<{ appId: string }> }) {
  const params = await props.params;
  const { appId } = params;

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

  const rateLimitResponse = await rateLimitPublicClaim(ipHash);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsedData = claimSubmissionSchema.parse(body);

    await connectToDatabase();

    const config = await MerchantWidgetConfig.findOne({ appId });
    if (!config) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    const claim = await PaymentClaim.create({
      appId,
      userId: config.userId,
      orderId: parsedData.orderId || 'Direct Payment',
      amount: parsedData.amount ?? null,
      currency: parsedData.currency || 'PKR',
      methodUsed: parsedData.methodUsed,
      reference: parsedData.reference || '',
      senderName: parsedData.senderName || '',
      customerWhatsApp: parsedData.customerWhatsApp || '',
      customerEmail: parsedData.customerEmail || '',
      proofScreenshotUrl: parsedData.proofScreenshotUrl || '',
      contactChannel: parsedData.contactChannel === 'email' ? 'email' : 'whatsapp',
      customerContact: parsedData.customerEmail || parsedData.customerWhatsApp || parsedData.customerContact || '',
      ipHash,
    });

    // Also log confirmation_sent event
    await WidgetEvent.create({
      appId,
      type: 'confirmation_sent',
      method: parsedData.methodUsed,
    }).catch(() => {});

    // Send email notification to merchant via Nodemailer
    const merchantEmail = config.fallbackEmail || config.draftConfig?.fallbackEmail || process.env.SMTP_USER || '';
    if (merchantEmail) {
      const formattedContact = [
        parsedData.customerWhatsApp ? `WhatsApp: ${parsedData.customerWhatsApp}` : '',
        parsedData.customerEmail ? `Email: ${parsedData.customerEmail}` : '',
      ].filter(Boolean).join(' • ') || parsedData.customerContact || undefined;

      notifyMerchantNewClaim({
        merchantEmail,
        orderId: parsedData.orderId || 'Direct Payment',
        amount: parsedData.amount ?? null,
        currency: parsedData.currency || 'PKR',
        method: parsedData.methodUsed,
        reference: parsedData.reference || 'N/A',
        senderName: parsedData.senderName || undefined,
        customerContact: formattedContact,
        channel: parsedData.contactChannel || 'whatsapp',
      }).catch((e) => console.error('Error sending merchant notification email:', e));
    }


    // Link to PaymentOrder if sessionId is present
    let linkedOrder = null;
    if (parsedData.sessionId) {
      try {
        const PaymentOrder = (await import('@/models/PaymentOrder')).default;
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        linkedOrder = await PaymentOrder.findOneAndUpdate(
          { sessionId: parsedData.sessionId, appId },
          { $set: { status: 'claimed', claimId: String(claim._id), expiresAt: thirtyDaysFromNow } },
          { new: true }
        );
      } catch (e) {
        console.error('Error linking PaymentOrder:', e);
      }
    }

    // Dispatch webhook for new payment claim
    try {
      const { dispatchWebhook } = await import('@/lib/webhook');
      dispatchWebhook({
        userId: config.userId,
        appId,
        event: 'payment.claimed',
        data: {
          claimId: claim._id,
          sessionId: parsedData.sessionId || undefined,
          orderId: claim.orderId,
          amount: claim.amount,
          currency: claim.currency,
          method: claim.methodUsed,
          reference: claim.reference,
          senderName: claim.senderName,
          status: 'pending_review',
          customerContact: claim.customerContact,
          proofScreenshotUrl: claim.proofScreenshotUrl,
          createdAt: claim.createdAt,
        },
      }).catch((whErr) => console.error('Error dispatching claim webhook:', whErr));
    } catch (e) {}

    return NextResponse.json(
      {
        success: true,
        claimId: claim._id,
        redirectUrl: linkedOrder?.redirectUrl || undefined,
      },
      { status: 201, headers: CORS_HEADERS }
    );


  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues || error.message }, { status: 400, headers: CORS_HEADERS });
    }
    console.error('Claim submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: CORS_HEADERS });
  }
}

