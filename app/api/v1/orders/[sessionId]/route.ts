import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PaymentOrder from '@/models/PaymentOrder';
import PaymentClaim from '@/models/PaymentClaim';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await props.params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    await connectToDatabase();
    const order = await PaymentOrder.findOne({ sessionId });

    if (!order) {
      return NextResponse.json({ error: 'Order session not found' }, { status: 404 });
    }

    let claim = null;
    if (order.claimId) {
      claim = await PaymentClaim.findById(order.claimId).select('methodUsed reference status createdAt');
    }

    return NextResponse.json({
      success: true,
      sessionId: order.sessionId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      redirectUrl: order.redirectUrl,
      claim,
      createdAt: order.createdAt,
      expiresAt: order.expiresAt,
    });
  } catch (error: any) {
    console.error('Failed to get order session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
