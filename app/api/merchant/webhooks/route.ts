import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import WebhookLog from '@/models/WebhookLog';
import { dispatchWebhook } from '@/lib/webhook';
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

    if (!config.webhookSecret) {
      config.webhookSecret = `pp_whsec_${nanoid(32)}`;
      await config.save();
    }

    const logs = await WebhookLog.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      webhookUrl: config.webhookUrl || '',
      webhookSecret: config.webhookSecret,
      appId: config.appId,
      logs,
    });
  } catch (error: any) {
    console.error('Failed to get webhook settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, webhookUrl } = body;

    await connectToDatabase();
    const config = await MerchantWidgetConfig.findOne({ userId: session.user.id });
    if (!config) {
      return NextResponse.json({ error: 'Merchant configuration not found' }, { status: 404 });
    }

    if (action === 'test_ping') {
      if (!config.webhookUrl) {
        return NextResponse.json(
          { error: 'Please save a Webhook URL first before testing.' },
          { status: 400 }
        );
      }

      const result = await dispatchWebhook({
        userId: session.user.id,
        appId: config.appId,
        event: 'ping',
        data: {
          message: 'PakPayment test webhook ping successful!',
          timestamp: new Date().toISOString(),
          testId: nanoid(10),
        },
      });

      return NextResponse.json({ success: true, result });
    }

    // Updating webhook settings
    if (typeof webhookUrl === 'string') {
      const trimmed = webhookUrl.trim();
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return NextResponse.json(
          { error: 'Webhook URL must start with https:// or http://' },
          { status: 400 }
        );
      }
      config.webhookUrl = trimmed;
      await config.save();
      return NextResponse.json({ success: true, webhookUrl: config.webhookUrl });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Failed to update webhook settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
