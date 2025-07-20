import "server-only";
import { getDB } from "@/db";
import { receiptTable, creditTransactionTable, userTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { render } from "@react-email/render";
import PaymentReceipt from "@/react-email/payment-receipt";
import { SITE_URL } from "@/constants";
import { createId } from "@paralleldrive/cuid2";
import { format } from "date-fns";

export interface ReceiptData {
  // Customer information
  customerName: string;
  customerEmail: string;
  
  // Receipt details
  receiptNumber: string;
  transactionDate: string;
  
  // Payment information
  amount: number; // in cents
  currency: string;
  taxAmount?: number;
  taxRate?: string;
  
  // Payment method
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  
  // Transaction details
  credits: number;
  description: string;
  paymentIntentId: string;
  
  // Internal IDs
  userId: string;
  transactionId: string;
}

export interface CreateReceiptOptions {
  paymentIntentId: string;
  userId: string;
  transactionId: string;
  generatePdf?: boolean;
  sendEmail?: boolean;
}

/**
 * Generate a unique receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = createId().slice(-4).toUpperCase();
  return `RCPT-${timestamp}-${random}`;
}

/**
 * Generate a secure download token for receipts
 */
export function generateDownloadToken(): string {
  return `tok_${createId()}`;
}

/**
 * Create receipt data from Stripe payment intent and user information
 */
export async function createReceiptFromPayment({
  paymentIntentId,
  userId,
  transactionId,
  generatePdf = true,
  sendEmail = true,
}: CreateReceiptOptions): Promise<string> {
  const db = getDB();

  try {
    // Get the payment intent from Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment intent is not successful');
    }

    // Get user and transaction information
    const [user, transaction] = await Promise.all([
      db.query.userTable.findFirst({
        where: eq(userTable.id, userId),
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      db.query.creditTransactionTable.findFirst({
        where: eq(creditTransactionTable.id, transactionId),
        columns: {
          amount: true,
          description: true,
        },
      }),
    ]);

    if (!user || !transaction) {
      throw new Error('User or transaction not found');
    }

    // Extract payment method details from the latest charge
    const charge = paymentIntent.latest_charge as any;
    let paymentMethod: any = null;
    
    // Get payment method separately if we have a charge with payment method ID
    if (charge?.payment_method) {
      try {
        if (typeof charge.payment_method === 'string') {
          // If payment_method is just an ID, fetch it separately
          paymentMethod = await stripe.paymentMethods.retrieve(charge.payment_method);
        } else {
          // If payment_method is already expanded
          paymentMethod = charge.payment_method;
        }
      } catch (pmError) {
        console.warn('Could not retrieve payment method details:', pmError);
        // Continue without payment method details
      }
    }
    
    const customerName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.email || 'Customer';

    const receiptData: ReceiptData = {
      customerName,
      customerEmail: user.email || '',
      receiptNumber: generateReceiptNumber(),
      transactionDate: format(new Date(paymentIntent.created * 1000), 'MMMM d, yyyy'),
      amount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      taxAmount: 0, // TODO: Extract from tax calculation if implemented
      taxRate: undefined,
      paymentMethod: paymentMethod?.type === 'card' ? 'Credit Card' : 'Payment Card',
      cardLast4: paymentMethod?.card?.last4 || undefined,
      cardBrand: paymentMethod?.card?.brand || undefined,
      credits: transaction.amount,
      description: transaction.description,
      paymentIntentId: paymentIntent.id,
      userId,
      transactionId,
    };

    // Generate download token
    const downloadToken = generateDownloadToken();

    // Generate HTML content
    const htmlContent = await render(PaymentReceipt(receiptData));

    // Create receipt record in database
    const [receipt] = await db.insert(receiptTable).values({
      userId,
      transactionId,
      paymentIntentId: paymentIntent.id,
      stripeChargeId: charge?.id,
      receiptNumber: receiptData.receiptNumber,
      amount: receiptData.amount,
      currency: receiptData.currency,
      taxAmount: receiptData.taxAmount || 0,
      taxRate: receiptData.taxRate,
      paymentMethod: receiptData.paymentMethod,
      cardLast4: receiptData.cardLast4,
      cardBrand: receiptData.cardBrand,
      htmlContent,
      downloadToken,
    }).returning({ id: receiptTable.id });

    if (!receipt) {
      throw new Error('Failed to create receipt record');
    }

    // Update the credit transaction with receipt information
    await db.update(creditTransactionTable)
      .set({
        receiptId: receipt.id,
        receiptUrl: `${SITE_URL}/api/receipts/download?token=${downloadToken}`,
      })
      .where(eq(creditTransactionTable.id, transactionId));

    // Send receipt email if requested
    if (sendEmail && user.email) {
      try {
        const receiptDataWithDownload = {
          ...receiptData,
          downloadUrl: `${SITE_URL}/api/receipts/download?token=${downloadToken}`,
        };

        const emailHtml = await render(PaymentReceipt(receiptDataWithDownload));

        // Import the email sending function
        const { sendReceiptEmail } = await import("@/utils/email");
        
        await sendReceiptEmail({
          to: user.email,
          subject: `Receipt for your purchase - ${receiptData.receiptNumber}`,
          htmlContent: emailHtml,
          tags: ["automated"],
        });

        // Mark email as sent
        await markReceiptEmailSent(receipt.id);

        console.log(`Receipt email sent to ${user.email} for receipt ${receipt.id}`);
      } catch (emailError) {
        console.error("Failed to send receipt email:", emailError);
        // Don't fail receipt generation if email fails
      }
    }

    return receipt.id;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw new Error('Failed to create receipt');
  }
}

/**
 * Get receipt by download token (for secure downloads)
 */
export async function getReceiptByToken(token: string) {
  const db = getDB();

  const receipt = await db.query.receiptTable.findFirst({
    where: eq(receiptTable.downloadToken, token),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      transaction: {
        columns: {
          description: true,
          amount: true,
        },
      },
    },
  });

  return receipt;
}

/**
 * Get user's receipts with pagination
 */
export async function getUserReceipts(userId: string, page = 1, limit = 10) {
  const db = getDB();
  const offset = (page - 1) * limit;

  const receipts = await db.query.receiptTable.findMany({
    where: eq(receiptTable.userId, userId),
    orderBy: (receiptTable, { desc }) => [desc(receiptTable.createdAt)],
    limit,
    offset,
    with: {
      transaction: {
        columns: {
          description: true,
          amount: true,
        },
      },
    },
  });

  // Get total count
  const totalResult = await db
    .select({ count: receiptTable.id })
    .from(receiptTable)
    .where(eq(receiptTable.userId, userId));

  const total = totalResult.length;

  return {
    receipts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
      limit,
    },
  };
}

/**
 * Generate receipt PDF using puppeteer or similar (placeholder for now)
 * This would typically use a service like Puppeteer or a PDF generation API
 */
export async function generateReceiptPDF(receiptId: string): Promise<string | null> {
  // TODO: Implement PDF generation
  // This would typically:
  // 1. Get the receipt HTML content
  // 2. Use Puppeteer or similar to generate PDF
  // 3. Upload to R2 or similar storage
  // 4. Return the URL
  
  console.warn('PDF generation not yet implemented');
  return null;
}

/**
 * Update receipt download statistics
 */
export async function updateReceiptDownloadStats(receiptId: string) {
  const db = getDB();

  await db.update(receiptTable)
    .set({
      downloadCount: sql`${receiptTable.downloadCount} + 1`,
      lastDownloaded: new Date(),
    })
    .where(eq(receiptTable.id, receiptId));
}

/**
 * Mark receipt email as sent
 */
export async function markReceiptEmailSent(receiptId: string) {
  const db = getDB();

  await db.update(receiptTable)
    .set({
      emailSent: new Date(),
    })
    .where(eq(receiptTable.id, receiptId));
}

/**
 * Mark receipt email as delivered (webhook from email provider)
 */
export async function markReceiptEmailDelivered(receiptId: string) {
  const db = getDB();

  await db.update(receiptTable)
    .set({
      emailDelivered: new Date(),
    })
    .where(eq(receiptTable.id, receiptId));
}

/**
 * Get receipt data for email/PDF generation
 */
export async function getReceiptData(receiptId: string): Promise<ReceiptData | null> {
  const db = getDB();

  const receipt = await db.query.receiptTable.findFirst({
    where: eq(receiptTable.id, receiptId),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      transaction: {
        columns: {
          description: true,
          amount: true,
        },
      },
    },
  });

  if (!receipt) {
    return null;
  }

  const customerName = receipt.user.firstName && receipt.user.lastName 
    ? `${receipt.user.firstName} ${receipt.user.lastName}` 
    : receipt.user.email || 'Customer';

  return {
    customerName,
    customerEmail: receipt.user.email || '',
    receiptNumber: receipt.receiptNumber,
    transactionDate: format(receipt.createdAt, 'MMMM d, yyyy'),
    amount: receipt.amount,
    currency: receipt.currency,
    taxAmount: receipt.taxAmount || 0,
    taxRate: receipt.taxRate || undefined,
    paymentMethod: receipt.paymentMethod,
    cardLast4: receipt.cardLast4 || undefined,
    cardBrand: receipt.cardBrand || undefined,
    credits: receipt.transaction.amount,
    description: receipt.transaction.description,
    paymentIntentId: receipt.paymentIntentId,
    userId: receipt.userId,
    transactionId: receipt.transactionId,
  };
} 