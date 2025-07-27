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
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          userId: session.user.id,
          packageId: creditPackage.id,
          credits: creditPackage.credits.toString(),
        },
      });

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error("Payment intent creation error:", error);
      throw new Error("Failed to create payment intent");
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

      // Add credits and log transaction
      await updateUserCredits(session.user.id, creditPackage.credits);
      await logTransaction({
        userId: session.user.id,
        amount: creditPackage.credits,
        description: `Purchased ${creditPackage.credits} credits`,
        type: CREDIT_TRANSACTION_TYPE.PURCHASE,
        expirationDate: new Date(Date.now() + ms(`${CREDITS_EXPIRATION_YEARS} years`)),
        paymentIntentId: paymentIntent?.id
      });

      return { success: true };
    } catch (error) {
      console.error("Purchase error:", error);
      throw new Error("Failed to process payment");
    }
  }, RATE_LIMITS.PURCHASE);
}

// New action to get receipt information
export async function getReceiptInfo(paymentIntentId: string) {
  return withRateLimit(async () => {
    const session = await requireVerifiedEmail();
    if (!session) {
      throw new Error("Unauthorized");
    }

    try {
      // Import error handling utilities
      const { ReceiptValidator, ReceiptErrorHandler, ReceiptRateLimit } = await import("@/utils/receipt-handler");

      // Validate payment intent ID format
      if (!ReceiptValidator.isValidPaymentIntentId(paymentIntentId)) {
        throw new Error("Invalid payment intent ID format");
      }

      // Check rate limiting
      if (!ReceiptRateLimit.canMakeRequest(session.user.id)) {
        throw new Error("Too many receipt requests. Please try again later.");
      }

      // Record the request
      ReceiptRateLimit.recordRequest(session.user.id);

      // Verify the transaction belongs to the current user
      const transaction = await getCreditTransactions({
        userId: session.user.id,
        page: 1,
        limit: 1000, // Get all transactions to find the matching one
      });

      const userTransaction = transaction.transactions.find(
        t => t.paymentIntentId === paymentIntentId
      );

      if (!userTransaction) {
        throw new Error("Transaction not found or unauthorized");
      }

      // Retrieve payment intent from Stripe
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges']
      });

      if (paymentIntent.status !== 'succeeded') {
        throw new Error("Payment not completed");
      }

      // Handle charge data more robustly
      let chargeData = null;
      
      // First, try to get from expanded charges
      if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
        chargeData = paymentIntent.charges.data[0];
      } 
      // Fallback to latest_charge if available
      else if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
        chargeData = paymentIntent.latest_charge;
      }
      // If latest_charge is just an ID, try to retrieve it
      else if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string') {
        try {
          chargeData = await getStripe().charges.retrieve(paymentIntent.latest_charge);
        } catch (error) {
          console.error("Failed to retrieve charge:", error);
        }
      }

      // Check if we have charge data
      if (!chargeData) {
        // In test mode, some PaymentIntents might not have full charge data
        const isTestMode = paymentIntentId.startsWith('pi_test_') || process.env.NODE_ENV === 'development';
        
        if (isTestMode) {
          throw new Error("Receipt not available in test mode. This transaction was processed with test data.");
        } else {
          throw new Error("Receipt information is not available for this transaction.");
        }
      }

      // Extract receipt information
      const rawReceiptInfo = {
        receiptUrl: ReceiptValidator.sanitizeReceiptUrl(chargeData.receipt_url),
        receiptNumber: chargeData.receipt_number || null,
        amount: chargeData.amount || paymentIntent.amount,
        currency: chargeData.currency || paymentIntent.currency,
        created: chargeData.created || Math.floor(Date.now() / 1000),
        description: chargeData.description || paymentIntent.description || userTransaction.description,
        paymentMethodDetails: {
          type: chargeData.payment_method_details?.type || 'card',
          last4: chargeData.payment_method_details?.card?.last4 || '****',
          brand: chargeData.payment_method_details?.card?.brand || 'unknown',
        },
        billingDetails: chargeData.billing_details || null,
      };

      // Apply security masking for sensitive data
      const receiptInfo = ReceiptValidator.maskSensitiveData(rawReceiptInfo);

      return { receiptInfo };
    } catch (error) {
      console.error("Receipt retrieval error:", error);
      
      // Use our error handler to provide better error messages
      const { ReceiptErrorHandler } = await import("@/utils/receipt-handler");
      const handledError = ReceiptErrorHandler.handleError(error);
      
      throw new Error(handledError.userMessage);
    }
  }, RATE_LIMITS.PURCHASE);
}
