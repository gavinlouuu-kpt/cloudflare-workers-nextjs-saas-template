import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getReceiptByToken, updateReceiptDownloadStats } from "@/utils/receipts";
import { render } from "@react-email/render";
import PaymentReceipt from "@/react-email/payment-receipt";
import { getReceiptData } from "@/utils/receipts";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const format = searchParams.get("format") || "html"; // html or pdf (future)

    if (!token) {
      return NextResponse.json(
        { error: "Download token is required" },
        { status: 400 }
      );
    }

    // Get receipt by secure token
    const receipt = await getReceiptByToken(token);

    if (!receipt) {
      return NextResponse.json(
        { error: "Receipt not found or invalid token" },
        { status: 404 }
      );
    }

    // Update download statistics
    await updateReceiptDownloadStats(receipt.id);

    if (format === "html") {
      // Return HTML receipt
      let htmlContent = receipt.htmlContent;

      // If HTML content is not stored, regenerate it
      if (!htmlContent) {
        const receiptData = await getReceiptData(receipt.id);
        if (receiptData) {
          htmlContent = await render(PaymentReceipt(receiptData));
        }
      }

      if (!htmlContent) {
        return NextResponse.json(
          { error: "Unable to generate receipt content" },
          { status: 500 }
        );
      }

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `inline; filename="receipt-${receipt.receiptNumber}.html"`,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    // TODO: Implement PDF download when PDF generation is ready
    if (format === "pdf") {
      return NextResponse.json(
        { error: "PDF generation not yet implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: "Unsupported format. Use 'html' or 'pdf'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Receipt download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 