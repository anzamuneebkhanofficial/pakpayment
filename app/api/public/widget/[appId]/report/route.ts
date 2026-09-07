import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';

export async function POST(req: NextRequest, props: { params: Promise<{ appId: string }> }) {
  const params = await props.params;
  const { appId } = params;

  try {
    const body = await req.json();
    const { reason, details, contact } = body;

    await connectToDatabase();
    const config = await MerchantWidgetConfig.findOne({ appId });
    if (!config) return NextResponse.json({ error: 'Widget not found' }, { status: 404 });

    console.warn(`[ABUSE REPORT] Widget ${appId}: Reason: ${reason} | Details: ${details} | Contact: ${contact}`);

    return NextResponse.json({ success: true, message: 'Report received and queued for review.' });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
