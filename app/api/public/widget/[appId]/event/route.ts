import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WidgetEvent from '@/models/WidgetEvent';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest, props: { params: Promise<{ appId: string }> }) {
  const params = await props.params;
  const { appId } = params;

  try {
    const body = await req.json().catch(() => ({}));
    const { type, method, product } = body;

    const allowedTypes = ['view', 'method_selected', 'confirmation_sent', 'whatsapp_order_click'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400, headers: CORS_HEADERS });
    }

    await connectToDatabase();

    await WidgetEvent.create({
      appId,
      type,
      method: method || product || '',
    });

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (e) {
    console.error('Widget event error:', e);
    // Analytics beacons fail silently
    return NextResponse.json({ success: false }, { headers: CORS_HEADERS });
  }
}
