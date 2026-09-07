import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookLog extends Document {
  userId: string;
  appId: string;
  event: string;              // 'payment.confirmed' | 'payment.rejected' | 'order.claimed' | 'ping'
  url: string;
  payload: Record<string, any>;
  statusCode?: number;
  responseBody?: string;
  status: 'success' | 'failed';
  durationMs: number;
  error?: string;
  createdAt: Date;
}

const WebhookLogSchema = new Schema<IWebhookLog>(
  {
    userId: { type: String, required: true, index: true },
    appId: { type: String, required: true, index: true },
    event: { type: String, required: true, index: true },
    url: { type: String, required: true },
    payload: { type: Object, required: true },
    statusCode: { type: Number },
    responseBody: { type: String },
    status: { type: String, enum: ['success', 'failed'], required: true },
    durationMs: { type: Number, default: 0 },
    error: { type: String },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 1209600, // 14 days TTL auto-purge (14 * 24 * 60 * 60 seconds)
    },
  },
  { timestamps: false }
);

delete (mongoose.models as any).WebhookLog;

const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);

export default WebhookLog;
