import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import PaymentClaim from '@/models/PaymentClaim';
import { rateLimitMerchant } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  await connectToDatabase();

  const query: any = { userId };
  if (status && ['pending_review', 'confirmed', 'rejected'].includes(status)) {
    query.status = status;
  }

  const claims = await PaymentClaim.find(query).sort({ createdAt: -1 }).limit(100);

  return NextResponse.json(claims);
}
