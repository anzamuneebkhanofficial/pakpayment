import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import { rateLimitMerchant } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await connectToDatabase();
    const config = await MerchantWidgetConfig.findOne({ userId });
    if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

    config.publishedConfig = { ...config.draftConfig };
    config.isPublished = true;
    config.version = (config.version || 0) + 1;
    config.publishedAt = new Date();
    await config.save();

    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
