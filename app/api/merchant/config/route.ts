import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import { rateLimitMerchant } from '@/lib/rateLimit';
import { widgetConfigSchema } from '@/lib/validation';
import { nanoid } from 'nanoid';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await connectToDatabase();

  let config = await MerchantWidgetConfig.findOne({ userId });

  if (!config) {
    let appId = nanoid(12);
    let isUnique = false;
    while (!isUnique) {
      const existing = await MerchantWidgetConfig.findOne({ appId });
      if (!existing) isUnique = true;
      else appId = nanoid(12);
    }

    const defaultDraft = {
      businessName: session.user.name || 'My Business Store',
      businessLogoUrl: '',
      whatsappNumber: '',
      whatsappTemplate: 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.',
      fallbackEmail: session.user.email || '',
      primaryColor: '#CCFF00',
      secondaryColor: '#FF8C42',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderRadius: '12px',
      widgetTitle: 'Select Payment Method',
      widgetSubtitle: 'Direct manual transfer to merchant',
      instructionNotice: 'Please transfer the exact amount and send proof via WhatsApp.',
      requireReference: true,
      allowProofUpload: true,
      displayMode: 'both' as const,
    };

    config = await MerchantWidgetConfig.create({
      userId,
      appId,
      ...defaultDraft,
      draftConfig: defaultDraft,
      publishedConfig: defaultDraft,
      isPublished: true,
      version: 1,
      publishedAt: new Date(),
    });
  }

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const rateLimitResponse = await rateLimitMerchant(userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();

    // Check if it's a publish action
    if (body.action === 'publish') {
      await connectToDatabase();
      const config = await MerchantWidgetConfig.findOne({ userId });
      if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

      config.publishedConfig = { ...config.draftConfig };
      config.isPublished = true;
      config.version += 1;
      config.publishedAt = new Date();
      await config.save();

      return NextResponse.json(config);
    }

    // Update draft config
    const parsedData = widgetConfigSchema.parse(body);

    await connectToDatabase();

    const updated = await MerchantWidgetConfig.findOneAndUpdate(
      { userId },
      {
        $set: {
          draftConfig: parsedData,
          ...parsedData,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues || error.message }, { status: 400 });
    }
    console.error('Config PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

