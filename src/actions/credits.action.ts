'use server';

import { requireVerifiedEmail } from "@/utils/auth";
import {
  getCreditTransactions,
  updateUserCredits,
  logTransaction,
  getCreditPackage,
} from "@/utils/credits";
import { CREDIT_TRANSACTION_TYPE } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { MAX_TRANSACTIONS_PER_PAGE, CREDITS_EXPIRATION_YEARS } from "@/constants";
import ms from "ms";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";

// Action types
type GetTransactionsInput = {
  page: number;
  limit?: number;
};

type CreatePaymentIntentInput = {
  packageId: string;
};

type PurchaseCreditsInput = {
  packageId: string;
  paymentIntentId: string;
};

export async function getTransactions({ page, limit = MAX_TRANSACTIONS_PER_PAGE }: GetTransactionsInput) {
  return withRateLimit(async () => {
    if (page < 1 || limit < 1) {
      throw new Error("Invalid page or limit");
    }

    if (limit > MAX_TRANSACTIONS_PER_PAGE) {
      throw new Error(`Limit cannot be greater than ${MAX_TRANSACTIONS_PER_PAGE}`);
    }

    if (!limit) {
      limit = MAX_TRANSACTIONS_PER_PAGE;
    }

    const session = await requireVerifiedEmail();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const result = await getCreditTransactions({
      userId: session.user.id,
      page,
      limit,
    });

    return {
      transactions: result.transactions,
      pagination: {
        total: result.pagination.total,
        pages: result.pagination.pages,
        current: result.pagination.current,
      }
    };
  }, RATE_LIMITS.PURCHASE);
}

export async function createPaymentIntent({ packageId }: CreatePaymentIntentInput) {
  return withRateLimit(async () => {
    const session = await requireVerifiedEmail();
    if (!session) {
      throw new Error("Unauthorized");
    }

    try {
      const creditPackage = getCreditPackage(packageId);
      if (!creditPackage) {
        throw new Error("Invalid package");
      }

      const paymentIntent = await getStripe().paymentIntents.create({
        amount: creditPackage.price * 100,
        currency: 'usd',
        description: `${creditPackage.credits} Credits - TickNow Credit Package`, // This shows on receipts
        statement_descriptor_suffix: 'CREDITS', // Shows on credit card statements as "TICKNOW *CREDITS"
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        receipt_email: session.user.email || undefined, // Enable automatic Stripe receipts
        metadata: {
          userId: session.user.id,
          packageId: creditPackage.id,
          credits: creditPackage.credits.toString(),
          product_description: `${creditPackage.credits} Credits for TickNow Platform`,
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Payment intent creation error:", error);
      
      // Provide more specific error messages for better UX
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error("Too many payment attempts. Please wait a moment and try again.");
        }
        if (error.message.includes('card')) {
          throw new Error("There was an issue with the payment method. Please try a different card.");
        }
        if (error.message.includes('insufficient')) {
          throw new Error("Payment failed due to insufficient funds. Please check your account balance.");
        }
      }
      
      throw new Error("Unable to process payment at this time. Please try again or contact support.");
    }
  }, RATE_LIMITS.PURCHASE);
}

export async function confirmPayment({ packageId, paymentIntentId }: PurchaseCreditsInput) {
  return withRateLimit(async () => {
    const session = await requireVerifiedEmail();
    if (!session) {
      throw new Error("Unauthorized");
    }

    try {
      const creditPackage = getCreditPackage(packageId);
      if (!creditPackage) {
        throw new Error("Invalid package");
      }

      // Verify the payment intent
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error("Payment not completed");
      }

      // Verify the payment intent metadata matches
      if (
        paymentIntent.metadata.userId !== session.user.id ||
        paymentIntent.metadata.packageId !== packageId ||
        parseInt(paymentIntent.metadata.credits) !== creditPackage.credits
      ) {
        throw new Error("Invalid payment intent");
      }

      // Note: Credits and transaction logging are handled by the webhook
      // This ensures no duplicate transactions and proper receipt generation
      return { success: true };
    } catch (error) {
      console.error("Purchase error:", error);
      
      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not completed') || error.message.includes('not successful')) {
          throw new Error("Payment was not completed successfully. Please try again.");
        }
        if (error.message.includes('Invalid payment intent')) {
          throw new Error("Payment verification failed. Please contact support if this persists.");
        }
        if (error.message.includes('already processed')) {
          throw new Error("This payment has already been processed.");
        }
      }
      
      throw new Error("Unable to confirm payment. Please contact support for assistance.");
    }
  }, RATE_LIMITS.PURCHASE);
}
