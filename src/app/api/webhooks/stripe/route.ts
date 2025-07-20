import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { updateUserCredits, logTransaction, getCreditPackage } from "@/utils/credits";

import { CREDIT_TRANSACTION_TYPE } from "@/db/schema";
import { CREDITS_EXPIRATION_YEARS } from "@/constants";
import ms from "ms";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let body: string;
    let signature: string | null;

    try {
        body = await req.text();
        signature = req.headers.get("stripe-signature");

        if (!signature) {
            console.error("Missing stripe-signature header");
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        if (!body) {
            console.error("Empty request body");
            return NextResponse.json({ error: "Empty body" }, { status: 400 });
        }
    } catch (err) {
        console.error("Error reading request:", err);
        return NextResponse.json({ error: "Error reading request" }, { status: 400 });
    }

    let event;

    try {
        event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
        console.log(`Webhook received: ${event.type}`);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;

                // Extract metadata
                const { userId, packageId, credits } = paymentIntent.metadata;

                if (!userId || !packageId || !credits) {
                    console.error("Missing metadata in payment intent:", paymentIntent.id);
                    break;
                }

                // Verify the package still exists and matches
                const creditPackage = getCreditPackage(packageId);
                if (!creditPackage || creditPackage.credits !== parseInt(credits)) {
                    console.error("Invalid package or credits mismatch:", packageId, credits);
                    break;
                }

                // Add credits and log transaction
                await updateUserCredits(userId, creditPackage.credits);
                const transaction = await logTransaction({
                    userId: userId,
                    amount: creditPackage.credits,
                    description: `Purchased ${creditPackage.credits} credits`,
                    type: CREDIT_TRANSACTION_TYPE.PURCHASE,
                    expirationDate: new Date(Date.now() + ms(`${CREDITS_EXPIRATION_YEARS} years`)),
                    paymentIntentId: paymentIntent.id
                });

                // Get Stripe receipt URL
                try {
                    // Get the charge to access the receipt URL
                    const stripe = getStripe();
                    const charges = await stripe.charges.list({
                        payment_intent: paymentIntent.id,
                        limit: 1,
                    });

                    if (charges.data.length > 0) {
                        const charge = charges.data[0];
                        const receiptUrl = charge.receipt_url;

                        if (receiptUrl) {
                            // Update transaction with Stripe receipt URL
                            const { getDB } = await import("@/db");
                            const { creditTransactionTable } = await import("@/db/schema");
                            const { eq } = await import("drizzle-orm");
                            
                            const db = getDB();
                            await db.update(creditTransactionTable)
                                .set({
                                    receiptUrl: receiptUrl,
                                    receiptEmailSent: new Date(), // Stripe automatically sends receipt
                                })
                                .where(eq(creditTransactionTable.id, transaction.id));

                            console.log(`Stripe receipt URL stored: ${receiptUrl}`);
                        }
                    }
                } catch (receiptError) {
                    console.error("Failed to get Stripe receipt URL:", receiptError);
                    // Don't fail the entire webhook if receipt URL retrieval fails
                }

                console.log(`Successfully processed payment for user ${userId}: ${credits} credits`);
                break;
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                console.log("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error?.message);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}