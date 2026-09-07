import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
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

export async function GET(req: NextRequest, props: { params: Promise<{ appId: string }> }) {
  const params = await props.params;
  const { appId } = params;

  await connectToDatabase();

  const config = await MerchantWidgetConfig.findOne({ appId });

  if (!config || !config.isPublished) {
    return NextResponse.json({ error: 'Widget not found or not published' }, { status: 404 });
  }

  // Active methods for the merchant
  const methods = await MerchantPaymentMethod.find({
    userId: config.userId,
    isActive: true,
  }).select('-userId -createdAt -updatedAt -__v');

  const response = NextResponse.json({
    config: config.publishedConfig,
    methods,
  });

  // CORS: Allow embedding on any external website
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  // PRD §9: Search engines must never index payment accounts
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  return response;
}
