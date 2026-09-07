import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMerchantWidgetConfig extends Document {
  userId: string;
  appId: string;
  businessName: string;
  businessLogoUrl: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  fallbackEmail: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  widgetTitle: string;
  widgetSubtitle: string;
  instructionNotice: string;
  requireReference: boolean;
  allowProofUpload: boolean;
  displayMode: 'inline' | 'modal' | 'both';
  enableWhatsAppOrderButton?: boolean;
  whatsAppOrderButtonText?: string;
  whatsAppOrderTemplate?: string;
  secretKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  draftConfig: Record<string, any>;
  publishedConfig: Record<string, any>;
  isPublished: boolean;
  version: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantWidgetConfigSchema = new Schema<IMerchantWidgetConfig>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    appId: { type: String, required: true, unique: true, index: true }, // nanoid(12)
    secretKey: { type: String, index: true },
    webhookUrl: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    businessName: { type: String, default: 'My Business Store' },
    businessLogoUrl: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    whatsappTemplate: {
      type: String,
      default: 'Hello! I have completed payment of {{AMOUNT}} for Order #{{ORDER_ID}} via {{METHOD}}. Please verify my payment.',
    },
    fallbackEmail: { type: String, default: '' },
    primaryColor: { type: String, default: '#CCFF00' },
    secondaryColor: { type: String, default: '#FF8C42' },
    backgroundColor: { type: String, default: '#000000' },
    textColor: { type: String, default: '#ffffff' },
    borderRadius: { type: String, default: '12px' },
    widgetTitle: { type: String, default: 'Select Payment Method' },
    widgetSubtitle: { type: String, default: 'Direct manual transfer to merchant' },
    instructionNotice: { type: String, default: 'Please transfer the exact amount and send proof via WhatsApp.' },
    requireReference: { type: Boolean, default: true },
    allowProofUpload: { type: Boolean, default: true },
    displayMode: { type: String, enum: ['inline', 'modal', 'both'], default: 'both' },
    enableWhatsAppOrderButton: { type: Boolean, default: true },
    whatsAppOrderButtonText: { type: String, default: 'Order through WhatsApp' },
    whatsAppOrderTemplate: {
      type: String,
      default: 'Hello! I would like to order {{PRODUCT_NAME}} (Price: {{PRICE}}).\n• Link: {{URL}}\n• SKU: {{SKU}}\n• Quantity: {{QUANTITY}}\nPlease let me know how to proceed. Thank you!',
    },
    draftConfig: { type: Object, default: {} },
    publishedConfig: { type: Object, default: {} },
    isPublished: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

const MerchantWidgetConfig: Model<IMerchantWidgetConfig> =
  mongoose.models.MerchantWidgetConfig ||
  mongoose.model<IMerchantWidgetConfig>('MerchantWidgetConfig', MerchantWidgetConfigSchema);

export default MerchantWidgetConfig;
