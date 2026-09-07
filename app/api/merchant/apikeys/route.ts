import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let config = await MerchantWidgetConfig.findOne({ userId: session.user.id });

    if (!config) {
      return NextResponse.json({ error: 'Merchant configuration not found' }, { status: 404 });
    }

    let modified = false;

    // Ensure secretKey exists
    if (!config.secretKey) {
      config.secretKey = `pp_sk_live_${nanoid(32)}`;
      modified = true;
    }

    // Ensure webhookSecret exists
    if (!config.webhookSecret) {
      config.webhookSecret = `pp_whsec_${nanoid(32)}`;
      modified = true;
    }

    if (modified) {
      await config.save();
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      appId: config.appId,
      publicKey: config.appId,
      secretKey: config.secretKey,
      webhookSecret: config.webhookSecret,
      webhookUrl: config.webhookUrl || '',
      apiEndpoint: `${appUrl}/api/v1/orders`,
      hostedCheckoutBaseUrl: `${appUrl}/pay/${config.appId}`,
    });
  } catch (error: any) {
    console.error('Failed to get API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    await connectToDatabase();
    const config = await MerchantWidgetConfig.findOne({ userId: session.user.id });
    if (!config) {
      return NextResponse.json({ error: 'Merchant configuration not found' }, { status: 404 });
    }

    if (action === 'rotate_secret_key') {
      config.secretKey = `pp_sk_live_${nanoid(32)}`;
      await config.save();
      return NextResponse.json({ success: true, secretKey: config.secretKey });
    }

    if (action === 'rotate_webhook_secret') {
      config.webhookSecret = `pp_whsec_${nanoid(32)}`;
      await config.save();
      return NextResponse.json({ success: true, webhookSecret: config.webhookSecret });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to rotate API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
