import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMerchantPaymentMethod extends Document {
  userId: string;
  provider: string; // e.g., 'jazzcash', 'easypaisa', 'bank_transfer', 'crypto'
  accountName: string;
  accountNumber: string;
  additionalDetails?: string;
  qrCodeUrl?: string; // Cloudinary/R2 URL, NOT base64
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantPaymentMethodSchema = new Schema<IMerchantPaymentMethod>(
  {
    userId: { type: String, required: true, index: true },
    provider: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    additionalDetails: { type: String },
    qrCodeUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MerchantPaymentMethod: Model<IMerchantPaymentMethod> =
  mongoose.models.MerchantPaymentMethod ||
  mongoose.model<IMerchantPaymentMethod>('MerchantPaymentMethod', MerchantPaymentMethodSchema);

export default MerchantPaymentMethod;
