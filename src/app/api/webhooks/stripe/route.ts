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

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event;

    try {
        event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
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
                await logTransaction({
                    userId: userId,
                    amount: creditPackage.credits,
                    description: `Purchased ${creditPackage.credits} credits (webhook)`,
                    type: CREDIT_TRANSACTION_TYPE.PURCHASE,
                    expirationDate: new Date(Date.now() + ms(`${CREDITS_EXPIRATION_YEARS} years`)),
                    paymentIntentId: paymentIntent.id
                });

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