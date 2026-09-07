import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (Number(process.env.SMTP_PORT) || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!to) {
    console.warn('⚠️ Recipient email is missing. Skipping email send.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Pak Payment Rails" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error);
  }
}

// 1. Email to Merchant when a new claim is submitted
export async function notifyMerchantNewClaim({
  merchantEmail,
  orderId,
  amount,
  currency = 'PKR',
  method,
  reference,
  senderName,
  customerContact,
  channel,
}: {
  merchantEmail: string;
  orderId: string;
  amount: number | null;
  currency?: string;
  method: string;
  reference: string;
  senderName?: string;
  customerContact?: string;
  channel: string;
}) {
  const html = `
    <div style="background-color: #000000; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; border-radius: 20px; max-width: 520px; margin: 0 auto; border: 1px solid #262626;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 900; font-size: 20px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; text-align: center;">P</div>
        <h2 style="color: #FFFFFF; margin-top: 16px; margin-bottom: 4px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">New Payment Claim Received!</h2>
        <p style="color: #9CA3AF; font-size: 13px; margin: 0;">A buyer has submitted a direct payment transfer claim.</p>
      </div>

      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Order Reference:</td>
            <td style="color: #FFFFFF; font-weight: 800; text-align: right; border-bottom: 1px solid #262626; font-family: monospace;">${orderId || 'Direct Payment'}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Amount Paid:</td>
            <td style="color: #CCFF00; font-weight: 900; text-align: right; font-size: 17px; font-family: monospace; border-bottom: 1px solid #262626;">${currency} ${amount ? amount.toLocaleString() : 'Unspecified'}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Payment Method:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626;">${method}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Transaction TRX ID:</td>
            <td style="color: #FFFFFF; font-family: monospace; font-weight: 800; text-align: right; border-bottom: 1px solid #262626;">${reference || 'N/A'}</td>
          </tr>
          ${senderName ? `
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Sender Account Title:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626;">${senderName}</td>
          </tr>
          ` : ''}
          ${customerContact ? `
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Customer Contact:</td>
            <td style="color: #38bdf8; font-weight: bold; text-align: right; border-bottom: 1px solid #262626;">${customerContact}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0;">Submission Channel:</td>
            <td style="color: #FF8C42; font-weight: 800; text-align: right; text-transform: uppercase;">${channel}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center;">
        <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 16px;">Please check your banking app statement for deposit verification.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/claims" style="display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 800; padding: 13px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; box-shadow: 0 0 15px rgba(204,255,0,0.25);">Open Claims Dashboard →</a>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #262626; margin-top: 24px; padding-top: 16px; font-size: 11px; color: #525252;">
        Direct payment notification processed via Pak Payment Rails
      </div>
    </div>
  `;

  return sendEmail({
    to: merchantEmail,
    subject: `🔔 New Payment Claim: PKR ${amount ? amount.toLocaleString() : ''} (${method}) - Order #${orderId || 'Direct'}`,
    html,
  });
}

// 2. Email to Customer when payment is Confirmed by Merchant
export async function sendCustomerConfirmationEmail({
  customerEmail,
  orderId,
  amount,
  method,
  businessName,
  note,
}: {
  customerEmail: string;
  orderId: string;
  amount: number | null;
  method: string;
  businessName: string;
  note?: string;
}) {
  const html = `
    <div style="background-color: #000000; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; border-radius: 20px; max-width: 520px; margin: 0 auto; border: 1px solid #262626;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #22c55e; color: #000000; font-weight: 900; font-size: 20px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; text-align: center;">✓</div>
        <h1 style="color: #CCFF00; font-size: 24px; font-weight: 800; margin-top: 16px; margin-bottom: 4px;">Payment Confirmed!</h1>
        <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Your payment to <strong>${businessName}</strong> has been verified.</p>
      </div>

      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 22px; margin-bottom: 20px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Order Reference:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626; font-family: monospace;">${orderId || 'Direct Payment'}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Amount Paid:</td>
            <td style="color: #CCFF00; font-weight: 900; text-align: right; font-size: 16px; font-family: monospace; border-bottom: 1px solid #262626;">PKR ${amount ? amount.toLocaleString() : ''}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Payment Method:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626;">${method}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0;">Status:</td>
            <td style="color: #22c55e; font-weight: 900; text-align: right; letter-spacing: 0.5px;">VERIFIED & CONFIRMED</td>
          </tr>
        </table>
      </div>

      ${note ? `
      <div style="background-color: #0f172a; border-left: 4px solid #CCFF00; padding: 14px 16px; border-radius: 10px; margin-bottom: 20px;">
        <p style="color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Note from Merchant:</p>
        <p style="color: #FFFFFF; font-size: 13px; margin: 0; line-height: 1.5;">${note}</p>
      </div>
      ` : `
      <p style="color: #9CA3AF; font-size: 13px; text-align: center; margin-bottom: 20px; line-height: 1.5;">
        Your order is now confirmed and will be dispatched in 2–3 business days. Thank you for your business!
      </p>
      `}

      <div style="text-align: center; border-top: 1px solid #262626; padding-top: 16px; font-size: 11px; color: #525252;">
        Direct payment processed via ${businessName} • Pak Payment Rails
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `✅ Order & Payment Confirmed: Order #${orderId || 'Direct'} (${businessName})`,
    html,
  });
}

// 3. Email to Customer when payment is Rejected by Merchant
export async function sendCustomerRejectionEmail({
  customerEmail,
  orderId,
  amount,
  method,
  businessName,
  reason,
}: {
  customerEmail: string;
  orderId: string;
  amount: number | null;
  method: string;
  businessName: string;
  reason: string;
}) {
  const html = `
    <div style="background-color: #000000; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px; border-radius: 20px; max-width: 520px; margin: 0 auto; border: 1px solid #262626;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #ef4444; color: #FFFFFF; font-weight: 900; font-size: 20px; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; text-align: center;">✕</div>
        <h1 style="color: #ef4444; font-size: 22px; font-weight: 800; margin-top: 16px; margin-bottom: 4px;">Payment Verification Notice</h1>
        <p style="color: #9CA3AF; font-size: 14px; margin: 0;">Regarding your payment claim to <strong>${businessName}</strong></p>
      </div>

      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 16px; padding: 22px; margin-bottom: 20px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Order Reference:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626; font-family: monospace;">${orderId || 'Direct Payment'}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0; border-bottom: 1px solid #262626;">Amount Claimed:</td>
            <td style="color: #FFFFFF; font-weight: bold; text-align: right; border-bottom: 1px solid #262626;">PKR ${amount ? amount.toLocaleString() : 'N/A'}</td>
          </tr>
          <tr>
            <td style="color: #9CA3AF; padding: 8px 0;">Verification Status:</td>
            <td style="color: #ef4444; font-weight: 900; text-align: right;">NOT VERIFIED</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #450a0a; border: 1px solid #7f1d1d; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #fca5a5; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">Reason from Merchant:</p>
        <p style="color: #FFFFFF; font-size: 13px; margin: 0; line-height: 1.5;">${reason || 'Transaction could not be verified in our banking records. Please contact support with your receipt.'}</p>
      </div>

      <p style="color: #9CA3AF; font-size: 13px; text-align: center; margin-bottom: 20px; line-height: 1.5;">
        If you have already sent the payment, please contact ${businessName} directly on WhatsApp with your transfer receipt screenshot.
      </p>

      <div style="text-align: center; border-top: 1px solid #262626; padding-top: 16px; font-size: 11px; color: #525252;">
        Direct payment rails powered by Pak Payment
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `⚠️ Payment Update: Order #${orderId || 'Direct'} (${businessName})`,
    html,
  });
}
