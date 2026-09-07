import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWidgetEvent extends Document {
  appId: string;
  type: 'view' | 'method_selected' | 'confirmation_sent' | 'whatsapp_order_click';
  method?: string;
  createdAt: Date;
}

const WidgetEventSchema = new Schema<IWidgetEvent>(
  {
    appId: { type: String, required: true, index: true },
    type: { 
      type: String, 
      required: true 
    },
    method: { type: String, default: '' },
    createdAt: { 
      type: Date, 
      default: Date.now, 
      expires: 2592000 // 30 days TTL auto-purge (30 * 24 * 60 * 60 seconds)
    },
  }
);

delete (mongoose.models as any).WidgetEvent;

const WidgetEvent: Model<IWidgetEvent> =
  mongoose.models.WidgetEvent || mongoose.model<IWidgetEvent>('WidgetEvent', WidgetEventSchema);

export default WidgetEvent;
