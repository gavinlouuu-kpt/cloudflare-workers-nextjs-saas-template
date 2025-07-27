import "server-only";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkGuestRateLimit, trackGuestInteraction } from "./guest-session";
import { GUEST_SESSION_COOKIE_NAME } from "./guest-session";

/**
 * Middleware to check guest session rate limits for API calls
 */
export async function withGuestRateLimit<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options: {
    trackInteraction?: boolean;
    interactionType?: 'api_call' | 'feature_access';
    interactionData?: Record<string, any>;
  } = {}
) {
  return async (...args: T): Promise<R> => {
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;

    if (guestSessionId) {
      // Check rate limit for guest sessions
      const { allowed, remaining } = await checkGuestRateLimit(guestSessionId);

      if (!allowed) {
        throw new Error("Guest session rate limit exceeded. Please sign up for unlimited access.");
      }

      // Track the interaction if requested
      if (options.trackInteraction) {
        await trackGuestInteraction(
          guestSessionId,
          options.interactionType || 'api_call',
          options.interactionData
        );
      }

      // Add rate limit headers to response (if it's a Response object)
      const result = await handler(...args);
      
      if (result instanceof NextResponse) {
        result.headers.set('X-Guest-RateLimit-Remaining', remaining.toString());
      }

      return result;
    }

    // No guest session, proceed normally
    return handler(...args);
  };
}

/**
 * Helper to create rate-limited API handlers for guest sessions
 */
export function createGuestRateLimitedHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options?: {
    interactionType?: 'api_call' | 'feature_access';
    interactionData?: Record<string, any>;
  }
) {
  return withGuestRateLimit(handler, {
    trackInteraction: true,
    ...options,
  });
} 