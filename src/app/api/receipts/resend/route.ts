import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/utils/auth";
import { getDB } from "@/db";
import { receiptTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getReceiptData, markReceiptEmailSent } from "@/utils/receipts";
import { sendReceiptEmail } from "@/utils/email";
import { render } from "@react-email/render";
import PaymentReceipt from "@/react-email/payment-receipt";
import { SITE_URL } from "@/constants";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";

export async function POST(request: NextRequest) {
  return withRateLimit(async () => {
    try {
      // Verify user session
      const session = await getSessionFromCookie();
      if (!session) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const body = await request.json() as { receiptId?: string };
      const { receiptId } = body;

      if (!receiptId) {
        return NextResponse.json(
          { error: "Receipt ID is required" },
          { status: 400 }
        );
      }

      const db = getDB();

      // Verify that the receipt belongs to the authenticated user
      const receipt = await db.query.receiptTable.findFirst({
        where: and(
          eq(receiptTable.id, receiptId),
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
        return NextResponse.json(
          { error: "Receipt not found" },
          { status: 404 }
        );
      }

      if (!receipt.user.email) {
        return NextResponse.json(
          { error: "User email not available" },
          { status: 400 }
        );
      }

      // Get receipt data for email generation
      const receiptData = await getReceiptData(receiptId);
      if (!receiptData) {
        return NextResponse.json(
          { error: "Unable to generate receipt data" },
          { status: 500 }
        );
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
      await markReceiptEmailSent(receiptId);

      return NextResponse.json(
        { message: "Receipt email sent successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Receipt resend error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }, RATE_LIMITS.PURCHASE); // Reuse existing rate limit
} 