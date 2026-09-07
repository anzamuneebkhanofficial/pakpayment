import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentOrder extends Document {
  sessionId: string;          // Unique checkout session (e.g. cs_live_...)
  orderId: string;            // Merchant's order reference (e.g. ORD-10024)
  appId: string;              // Merchant's public App ID
  userId: string;             // Merchant's user ID
  amount: number;             // Locked payment amount in currency
  currency: string;           // PKR, USD, etc. (default: PKR)
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  metadata?: Record<string, any>;
  redirectUrl?: string;       // Where to return customer after payment claim
  status: 'pending' | 'claimed' | 'confirmed' | 'rejected' | 'expired';
  claimId?: string;           // Linked PaymentClaim document ID
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentOrderSchema = new Schema<IPaymentOrder>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    appId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'PKR' },
    customerName: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
    metadata: { type: Object, default: {} },
    redirectUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'claimed', 'confirmed', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    claimId: { type: String, default: '' },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default expiry
      expires: 0, // Purges document when expiresAt date is reached
    },
  },
  { timestamps: true }
);

delete (mongoose.models as any).PaymentOrder;

const PaymentOrder: Model<IPaymentOrder> =
  mongoose.models.PaymentOrder || mongoose.model<IPaymentOrder>('PaymentOrder', PaymentOrderSchema);

export default PaymentOrder;
