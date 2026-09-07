import { z } from "zod";

// Shared schemas
export const methodProviderSchema = z.enum(['jazzcash', 'easypaisa', 'bank_transfer', 'crypto', 'international']);
export const displayModeSchema = z.enum(['inline', 'modal', 'both']);
export const contactChannelSchema = z.enum(['whatsapp', 'email']);

// Merchant schemas
export const paymentMethodSchema = z.object({
  provider: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  additionalDetails: z.string().optional(),
  qrCodeUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const widgetConfigSchema = z.object({
  businessName: z.string().min(1),
  businessLogoUrl: z.string().url().optional().or(z.literal('')),
  whatsappNumber: z.string().optional(),
  whatsappTemplate: z.string().min(1),
  fallbackEmail: z.string().email().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i),
  secondaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i),
  backgroundColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i),
  textColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i),
  borderRadius: z.string(),
  widgetTitle: z.string().min(1),
  widgetSubtitle: z.string().optional(),
  instructionNotice: z.string().optional(),
  requireReference: z.boolean(),
  allowProofUpload: z.boolean(),
  displayMode: displayModeSchema,
});

// Public API Schemas
export const claimSubmissionSchema = z.object({
  sessionId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
  amount: z.number().optional().nullable(),
  currency: z.string().min(1).default('PKR'),
  methodUsed: z.string().min(1),
  reference: z.string().optional().nullable(),
  senderName: z.string().optional().nullable(),
  customerWhatsApp: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  proofScreenshotUrl: z.string().optional().nullable().or(z.literal('')),
  contactChannel: z.enum(['whatsapp', 'email', 'clipboard']).optional().default('whatsapp'),
  customerContact: z.string().optional().nullable(),
});


