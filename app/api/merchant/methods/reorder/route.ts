import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantPaymentMethod from '@/models/MerchantPaymentMethod';
import { rateLimitMerchant } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 });
    }

    await connectToDatabase();
    // Return acknowledged
    return NextResponse.json({ success: true, orderedIds });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
