"use server";

import { createServerAction } from "zsa";
import { z } from "zod";
import { requireVerifiedEmail } from "@/utils/auth";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { getUserReceipts, getReceiptData, markReceiptEmailSent } from "@/utils/receipts";
import { sendReceiptEmail } from "@/utils/email";
import { render } from "@react-email/render";
import PaymentReceipt from "@/react-email/payment-receipt";
import { getDB } from "@/db";
import { receiptTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SITE_URL } from "@/constants";

// Schema for getting user receipts
const getUserReceiptsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(10),
});

// Schema for resending receipt email
const resendReceiptEmailSchema = z.object({
  receiptId: z.string().min(1),
});

/**
 * Get user's receipts with pagination
 */
export const getUserReceiptsAction = createServerAction()
  .input(getUserReceiptsSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail();
      if (!session) {
        throw new Error("Authentication required");
      }

      const result = await getUserReceipts(session.user.id, input.page, input.limit);
      return result;
    }, RATE_LIMITS.PURCHASE);
  });

/**
 * Resend receipt email to user
 */
export const resendReceiptEmailAction = createServerAction()
  .input(resendReceiptEmailSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail();
      if (!session) {
        throw new Error("Authentication required");
      }

      const db = getDB();

      // Verify that the receipt belongs to the authenticated user
      const receipt = await db.query.receiptTable.findFirst({
        where: and(
          eq(receiptTable.id, input.receiptId),
          eq(receiptTable.userId, session.user.id)
        ),
        with: {
          user: {
            columns: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!receipt) {
        throw new Error("Receipt not found");
      }

      if (!receipt.user.email) {
        throw new Error("User email not available");
      }

      // Get receipt data for email generation
      const receiptData = await getReceiptData(input.receiptId);
      if (!receiptData) {
        throw new Error("Unable to generate receipt data");
      }

      // Add download URL to receipt data
      const receiptDataWithDownload = {
        ...receiptData,
        downloadUrl: `${SITE_URL}/api/receipts/download?token=${receipt.downloadToken}`,
      };

      // Generate email HTML
      const emailHtml = await render(PaymentReceipt(receiptDataWithDownload));

      // Send the receipt email
      await sendReceiptEmail({
        to: receipt.user.email,
        subject: `Receipt for your purchase - ${receipt.receiptNumber}`,
        htmlContent: emailHtml,
        tags: ["resend"],
      });

      // Mark email as sent
      await markReceiptEmailSent(input.receiptId);

      return { success: true, message: "Receipt email sent successfully" };
    }, RATE_LIMITS.PURCHASE);
  });

/**
 * Get receipt download URL (for authenticated users)
 */
export const getReceiptDownloadUrlAction = createServerAction()
  .input(z.object({ receiptId: z.string().min(1) }))
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail();
      if (!session) {
        throw new Error("Authentication required");
      }

      const db = getDB();

      // Verify that the receipt belongs to the authenticated user
      const receipt = await db.query.receiptTable.findFirst({
        where: and(
          eq(receiptTable.id, input.receiptId),
          eq(receiptTable.userId, session.user.id)
        ),
        columns: {
          downloadToken: true,
          receiptNumber: true,
        },
      });

      if (!receipt) {
        throw new Error("Receipt not found");
      }

      return {
        downloadUrl: `${SITE_URL}/api/receipts/download?token=${receipt.downloadToken}`,
        receiptNumber: receipt.receiptNumber,
      };
    }, RATE_LIMITS.PURCHASE);
  }); 