import nodemailer from 'nodemailer';
import { formatCurrency } from '@/lib/format';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface PaymentReminderData {
  tenantName: string;
  propertyName: string;
  amountSen: number;
  dueDate: Date;
  daysUntilDue: number;
}

interface LeaseExpiryData {
  tenantName: string;
  propertyName: string;
  endDate: Date;
  daysUntilExpiry: number;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment.');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || 'Sublet <noreply@sublet.com>';

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
    });
  }

  async sendPaymentReminder(data: PaymentReminderData, userEmail: string): Promise<void> {
    const subject = `Payment Reminder: ${formatCurrency(data.amountSen)} due in ${data.daysUntilDue} days`;
    const html = this.renderPaymentReminderEmail(data);

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendLeaseExpiryNotice(data: LeaseExpiryData, userEmail: string): Promise<void> {
    const subject = `Lease Expiry Notice: ${data.propertyName} - ${data.daysUntilExpiry} days remaining`;
    const html = this.renderLeaseExpiryEmail(data);

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private renderPaymentReminderEmail(data: PaymentReminderData): string {
    const formattedAmount = formatCurrency(data.amountSen);
    const dueDate = data.dueDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
    .highlight { background: #fef3c7; padding: 12px; border-radius: 6px; margin: 16px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Reminder</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>This is a friendly reminder that a payment is due soon.</p>
      
      <div class="highlight">
        <p><strong>Amount Due:</strong> <span class="amount">${formattedAmount}</span></p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p><strong>Days Remaining:</strong> ${data.daysUntilDue} days</p>
      </div>
      
      <p><strong>Property:</strong> ${data.propertyName}</p>
      <p><strong>Tenant:</strong> ${data.tenantName}</p>
      
      <p>Please ensure the payment is made on time.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Sublet Property Management.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private renderLeaseExpiryEmail(data: LeaseExpiryData): string {
    const endDate = data.endDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .highlight { background: #fef2f2; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #dc2626; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lease Expiry Notice</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Please be aware that a lease agreement is expiring soon.</p>
      
      <div class="highlight">
        <p><strong>Lease End Date:</strong> ${endDate}</p>
        <p><strong>Days Remaining:</strong> ${data.daysUntilExpiry} days</p>
      </div>
      
      <p><strong>Property:</strong> ${data.propertyName}</p>
      <p><strong>Tenant:</strong> ${data.tenantName}</p>
      
      <p>Please take the necessary steps to either renew the lease or prepare for the tenant's departure.</p>
    </div>
    <div class="footer">
      <p>This is an automated message from Sublet Property Management.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService();
