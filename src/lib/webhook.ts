import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import MerchantWidgetConfig from '@/models/MerchantWidgetConfig';
import WebhookLog from '@/models/WebhookLog';
import { nanoid } from 'nanoid';

export interface WebhookDispatchParams {
  userId: string;
  appId?: string;
  event: 'payment.confirmed' | 'payment.rejected' | 'payment.claimed' | 'order.created' | 'ping';
  data: Record<string, any>;
}

export async function dispatchWebhook({ userId, appId, event, data }: WebhookDispatchParams) {
  try {
    await connectToDatabase();
    const config = await MerchantWidgetConfig.findOne({ userId });

    if (!config || !config.webhookUrl) {
      return { skipped: true, reason: 'No webhook URL configured' };
    }

    const resolvedAppId = appId || config.appId;
    const webhookUrl = config.webhookUrl.trim();
    const webhookSecret = config.webhookSecret || '';

    const payload = {
      id: `evt_${nanoid(16)}`,
      event,
      appId: resolvedAppId,
      createdAt: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000);

    // Compute HMAC SHA-256 signature if secret is available
    let signatureHeader = `t=${timestamp}`;
    if (webhookSecret) {
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(`${timestamp}.${payloadString}`);
      const digest = hmac.digest('hex');
      signatureHeader += `,v1=${digest}`;
    }

    const startTime = Date.now();
    let statusCode: number | undefined;
    let responseBody = '';
    let status: 'success' | 'failed' = 'failed';
    let errorMessage: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PakPayment-Webhook/2.0',
          'X-PakPayment-Event': event,
          'X-PakPayment-Signature': signatureHeader,
        },
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      statusCode = response.status;
      const text = await response.text().catch(() => '');
      responseBody = text.slice(0, 1000); // Limit response size

      if (response.ok) {
        status = 'success';
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (err: any) {
      errorMessage = err.name === 'AbortError' ? 'Webhook delivery timed out (10s)' : err.message;
    }

    const durationMs = Date.now() - startTime;

    // Log the webhook attempt
    await WebhookLog.create({
      userId,
      appId: resolvedAppId,
      event,
      url: webhookUrl,
      payload,
      statusCode,
      responseBody,
      status,
      durationMs,
      error: errorMessage,
      createdAt: new Date(),
    }).catch((e) => console.error('Error recording webhook log:', e));

    return {
      success: status === 'success',
      statusCode,
      durationMs,
      error: errorMessage,
    };
  } catch (error: any) {
    console.error('Webhook dispatch fatal error:', error);
    return { success: false, error: error.message };
  }
}
