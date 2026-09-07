import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantPaymentMethod from '@/models/MerchantPaymentMethod';
import { rateLimitMerchant } from '@/lib/rateLimit';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    await connectToDatabase();

    const method = await MerchantPaymentMethod.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true }
    );

    if (!method) return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    return NextResponse.json(method);
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await connectToDatabase();
    const result = await MerchantPaymentMethod.findOneAndDelete({ _id: id, userId });
    if (!result) return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
