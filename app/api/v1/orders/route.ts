import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import PaymentOrder from '@/models/PaymentOrder';
import { nanoid } from 'nanoid';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Helper to authenticate request using Secret Key
async function authenticateMerchant(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const apiKeyHeader = req.headers.get('x-api-key') || '';
  let secretKey = '';

  if (authHeader.startsWith('Bearer ')) {
    secretKey = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    secretKey = apiKeyHeader.trim();
  }

  if (!secretKey) {
    try {
      const clonedReq = req.clone();
      const body = await clonedReq.json().catch(() => ({}));
      secretKey = body.secretKey || '';
    } catch (_) {}
  }

  if (!secretKey) return null;

  await connectToDatabase();
  const config = await MerchantWidgetConfig.findOne({ secretKey });
  return config;
}

export async function POST(req: NextRequest) {
  try {
    const config = await authenticateMerchant(req);
    if (!config) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or missing secret API key. Pass "Authorization: Bearer <secretKey>" or "x-api-key" header.',
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const {
      orderId,
      amount,
      currency = 'PKR',
      customerName = '',
      customerEmail = '',
      customerPhone = '',
      items = [],
      metadata = {},
      redirectUrl = '',
      expiresInHours = 24,
    } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid orderId' }, { status: 400, headers: CORS_HEADERS });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Missing or invalid amount (must be positive number)' }, { status: 400, headers: CORS_HEADERS });
    }

    const sessionId = `cs_live_${nanoid(24)}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const order = await PaymentOrder.create({
      sessionId,
      orderId: String(orderId).trim(),
      appId: config.appId,
      userId: config.userId,
      amount: parsedAmount,
      currency: (currency || 'PKR').toUpperCase(),
      customerName: String(customerName || '').trim(),
      customerEmail: String(customerEmail || '').trim(),
      customerPhone: String(customerPhone || '').trim(),
      items: Array.isArray(items) ? items : [],
      metadata: typeof metadata === 'object' ? metadata : {},
      redirectUrl: String(redirectUrl || '').trim(),
      status: 'pending',
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutUrl = `${appUrl}/pay/${config.appId}?session=${sessionId}`;

    return NextResponse.json(
      {
        success: true,
        sessionId: order.sessionId,
        orderId: order.orderId,
        appId: order.appId,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        checkoutUrl,
        expiresAt: order.expiresAt,
        embedSnippet: `<div id="pakpayment-widget" data-session="${sessionId}"></div>\n<script src="${appUrl}/widget.js?appId=${config.appId}"></script>`,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Failed to create payment order:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET(req: NextRequest) {
  try {
    const config = await authenticateMerchant(req);
    if (!config) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const status = searchParams.get('status');

    const query: any = { userId: config.userId };
    if (status && ['pending', 'claimed', 'confirmed', 'rejected', 'expired'].includes(status)) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      PaymentOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PaymentOrder.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Failed to list payment orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}
