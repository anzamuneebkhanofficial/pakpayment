import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentClaim extends Document {
  appId: string;
  userId: string;
  orderId: string;
  amount: number | null;
  currency: string;
  methodUsed: string;
  reference: string;
  senderName: string;
  customerWhatsApp: string;
  customerEmail: string;
  proofScreenshotUrl: string;
  contactChannel: 'whatsapp' | 'email';
  customerContact: string;
  merchantNotes: string;
  status: 'pending_review' | 'confirmed' | 'rejected';
  ipHash: string;
  createdAt: Date;
}

const PaymentClaimSchema = new Schema<IPaymentClaim>({
  appId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  orderId: { type: String, default: '' },
  amount: { type: Number, default: null },
  currency: { type: String, default: 'PKR' },
  methodUsed: { type: String, required: true },
  reference: { type: String, default: '' },
  senderName: { type: String, default: '' },
  customerWhatsApp: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  proofScreenshotUrl: { type: String, default: '' },
  contactChannel: { type: String, enum: ['whatsapp', 'email'], default: 'whatsapp' },
  customerContact: { type: String, default: '' },
  merchantNotes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending_review', 'confirmed', 'rejected'],
    default: 'pending_review',
  },
  ipHash: { type: String, default: '' },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000, // 30 days TTL auto-purge (30 * 24 * 60 * 60 seconds)
  },
});

delete (mongoose.models as any).PaymentClaim;

const PaymentClaim: Model<IPaymentClaim> =
  mongoose.models.PaymentClaim || mongoose.model<IPaymentClaim>('PaymentClaim', PaymentClaimSchema);

export default PaymentClaim;
