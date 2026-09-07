import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomQR extends Document {
  userId: string;
  title: string;
  type: 'open_amount' | 'fixed_amount';
  amount?: number;
  description?: string;
  colors: {
    dark: string;
    light: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CustomQRSchema = new Schema<ICustomQR>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['open_amount', 'fixed_amount'], required: true },
    amount: { type: Number },
    description: { type: String },
    colors: {
      dark: { type: String, default: '#000000' },
      light: { type: String, default: '#ffffff' }
    }
  },
  { timestamps: true }
);

const CustomQR: Model<ICustomQR> = mongoose.models.CustomQR || mongoose.model<ICustomQR>('CustomQR', CustomQRSchema);

export default CustomQR;
