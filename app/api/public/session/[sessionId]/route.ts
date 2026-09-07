import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import MerchantPaymentMethod from '@/models/MerchantPaymentMethod';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await props.params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400, headers: CORS_HEADERS });
    }

    await connectToDatabase();
    const order = await PaymentOrder.findOne({ sessionId });

    if (!order) {
      return NextResponse.json({ error: 'Invalid or expired payment session' }, { status: 404, headers: CORS_HEADERS });
    }

    // Check expiry
    if (new Date() > new Date(order.expiresAt)) {
      return NextResponse.json({ error: 'This payment session has expired' }, { status: 410, headers: CORS_HEADERS });
    }

    const config = await MerchantWidgetConfig.findOne({ appId: order.appId });
    if (!config) {
      return NextResponse.json({ error: 'Merchant configuration not found' }, { status: 404, headers: CORS_HEADERS });
    }

    const methods = await MerchantPaymentMethod.find({
      userId: config.userId,
      isActive: true,
    }).select('-userId -createdAt -updatedAt -__v');

    const published = {
      ...(config.draftConfig || {}),
      ...(config.publishedConfig || {}),
    };

    return NextResponse.json(
      {
        success: true,
        order: {
          sessionId: order.sessionId,
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: order.items,
          redirectUrl: order.redirectUrl,
          status: order.status,
        },
        config: published,
        methods,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Failed to get public session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}

