import "server-only";

export type ReceiptError = {
  type: 'STRIPE_ERROR' | 'AUTHORIZATION_ERROR' | 'NOT_FOUND_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
  message: string;
  userMessage: string;
  retryable: boolean;
};

export class ReceiptErrorHandler {
  static handleError(error: unknown): ReceiptError {
    // Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string; message: string; code?: string };
      
      switch (stripeError.type) {
        case 'StripeInvalidRequestError':
          return {
            type: 'STRIPE_ERROR',
            message: stripeError.message,
            userMessage: 'Receipt information is not available for this transaction.',
            retryable: false,
          };
        
        case 'StripeAuthenticationError':
          return {
            type: 'STRIPE_ERROR',
            message: stripeError.message,
            userMessage: 'Unable to verify receipt information. Please try again later.',
            retryable: true,
          };
        
        case 'StripeConnectionError':
        case 'StripeAPIError':
          return {
            type: 'NETWORK_ERROR',
            message: stripeError.message,
            userMessage: 'Unable to connect to payment service. Please try again later.',
            retryable: true,
          };
        
        case 'StripeRateLimitError':
          return {
            type: 'NETWORK_ERROR',
            message: stripeError.message,
            userMessage: 'Service is temporarily busy. Please try again in a moment.',
            retryable: true,
          };
      }
    }

    // Standard Error objects
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('unauthorized') || message.includes('access denied')) {
        return {
          type: 'AUTHORIZATION_ERROR',
          message: error.message,
          userMessage: 'You do not have permission to view this receipt.',
          retryable: false,
        };
      }
      
      if (message.includes('not found') || message.includes('does not exist')) {
        return {
          type: 'NOT_FOUND_ERROR',
          message: error.message,
          userMessage: 'Receipt not found for this transaction.',
          retryable: false,
        };
      }

      if (message.includes('test mode') || message.includes('test data')) {
        return {
          type: 'VALIDATION_ERROR',
          message: error.message,
          userMessage: 'Receipt not available for test transactions. Try with a live payment in production.',
          retryable: false,
        };
      }
      
      if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
        return {
          type: 'NETWORK_ERROR',
          message: error.message,
          userMessage: 'Network error occurred. Please check your connection and try again.',
          retryable: true,
        };
      }
      
      return {
        type: 'VALIDATION_ERROR',
        message: error.message,
        userMessage: 'Unable to process receipt request. Please try again.',
        retryable: true,
      };
    }

    // Fallback for unknown errors
    return {
      type: 'VALIDATION_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'An unexpected error occurred. Please try again later.',
      retryable: true,
    };
  }

  static isRetryableError(error: ReceiptError): boolean {
    return error.retryable;
  }

  static shouldShowRetryButton(error: ReceiptError): boolean {
    return error.retryable && (
      error.type === 'NETWORK_ERROR' || 
      error.type === 'STRIPE_ERROR'
    );
  }
}

// Validation utilities
export class ReceiptValidator {
  static isValidPaymentIntentId(paymentIntentId: string): boolean {
    // Stripe PaymentIntent IDs start with 'pi_'
    return /^pi_[a-zA-Z0-9_]+$/.test(paymentIntentId);
  }

  static sanitizeReceiptUrl(url: string | null): string | null {
    if (!url) return null;
    
    try {
      const parsedUrl = new URL(url);
      // Ensure it's a Stripe receipt URL
      if (parsedUrl.hostname.includes('stripe.com') || parsedUrl.hostname.includes('stripe-images.com')) {
        return url;
      }
      return null;
    } catch {
      return null;
    }
  }

  static maskSensitiveData(receiptInfo: any) {
    // Create a copy to avoid mutation
    const masked = { ...receiptInfo };
    
    // Mask billing details email
    if (masked.billingDetails?.email) {
      const email = masked.billingDetails.email;
      const [localPart, domain] = email.split('@');
      if (localPart && domain) {
        const maskedLocal = localPart.length > 2 
          ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)
          : localPart;
        masked.billingDetails.email = `${maskedLocal}@${domain}`;
      }
    }
    
    // Additional masking can be added here for other sensitive fields
    
    return masked;
  }
}

// Rate limiting for receipt requests
export class ReceiptRateLimit {
  private static requests = new Map<string, number[]>();
  private static readonly MAX_REQUESTS_PER_MINUTE = 10;
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute

  static canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove requests older than the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    this.requests.set(userId, recentRequests);
    
    return recentRequests.length < this.MAX_REQUESTS_PER_MINUTE;
  }

  static recordRequest(userId: string): void {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    userRequests.push(now);
    this.requests.set(userId, userRequests);
  }

  static getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.WINDOW_MS
    );
    
    return Math.max(0, this.MAX_REQUESTS_PER_MINUTE - recentRequests.length);
  }
} 