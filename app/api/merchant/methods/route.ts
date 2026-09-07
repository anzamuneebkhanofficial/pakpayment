import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantPaymentMethod from '@/models/MerchantPaymentMethod';
import { rateLimitMerchant } from '@/lib/rateLimit';
import { paymentMethodSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await connectToDatabase();
  const methods = await MerchantPaymentMethod.find({ userId }).sort({ createdAt: -1 });

  return NextResponse.json(methods);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsedData = paymentMethodSchema.parse(body);

    await connectToDatabase();
    const method = await MerchantPaymentMethod.create({
      ...parsedData,
      userId,
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues || error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

