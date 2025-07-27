import "server-only";

import { getDB } from "@/db";
import { guestSessionTable, guestInteractionTable } from "@/db/schema";
import { eq, lt, and, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { init } from "@paralleldrive/cuid2";
import { getIP } from "./get-IP";
import type { GuestSession, GuestFeatureAccess, DEFAULT_GUEST_FEATURES } from "@/types";
import ms from "ms";

const createId = init({ length: 32 });

export const GUEST_SESSION_COOKIE_NAME = "guest-session";
export const GUEST_SESSION_DURATION = ms("2h"); // 2 hours
export const GUEST_API_RATE_LIMIT = 50; // API calls per session
export const GUEST_API_RATE_WINDOW = ms("1h"); // Rate limit window

/**
 * Creates a new guest session
 */
export async function createGuestSession(): Promise<GuestSession> {
  const db = getDB();
  const { cf } = getCloudflareContext();
  const headersList = await headers();
  const ip = await getIP();
  
  const sessionId = createId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GUEST_SESSION_DURATION);

  const guestSession = {
    sessionId,
    ipAddress: ip,
    userAgent: headersList.get('user-agent'),
    country: cf?.country,
    city: cf?.city,
    tempData: JSON.stringify({}),
    lastActivityAt: now,
    expiresAt,
    apiCallCount: 0,
    lastApiCallAt: null,
  };

  const [result] = await db.insert(guestSessionTable).values(guestSession).returning();

  return {
    id: result.id,
    sessionId: result.sessionId,
    ipAddress: result.ipAddress || undefined,
    userAgent: result.userAgent || undefined,
    country: result.country || undefined,
    city: result.city || undefined,
    tempData: {},
    lastActivityAt: result.lastActivityAt.getTime(),
    expiresAt: result.expiresAt.getTime(),
    apiCallCount: result.apiCallCount,
    lastApiCallAt: result.lastApiCallAt?.getTime(),
    createdAt: result.createdAt.getTime(),
    updatedAt: result.updatedAt.getTime(),
  };
}

/**
 * Validates and retrieves a guest session
 */
export async function validateGuestSession(sessionId: string): Promise<GuestSession | null> {
  const db = getDB();
  
  const session = await db.query.guestSessionTable.findFirst({
    where: eq(guestSessionTable.sessionId, sessionId),
  });

  if (!session) return null;

  // Check if session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    // Clean up expired session
    await deleteGuestSession(sessionId);
    return null;
  }

  // Update last activity
  await db.update(guestSessionTable)
    .set({ 
      lastActivityAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(guestSessionTable.sessionId, sessionId));

  return {
    id: session.id,
    sessionId: session.sessionId,
    ipAddress: session.ipAddress || undefined,
    userAgent: session.userAgent || undefined,
    country: session.country || undefined,
    city: session.city || undefined,
    tempData: session.tempData ? JSON.parse(session.tempData) : {},
    lastActivityAt: session.lastActivityAt.getTime(),
    expiresAt: session.expiresAt.getTime(),
    apiCallCount: session.apiCallCount,
    lastApiCallAt: session.lastApiCallAt?.getTime(),
    createdAt: session.createdAt.getTime(),
    updatedAt: session.updatedAt.getTime(),
  };
}

/**
 * Updates guest session temporary data
 */
export async function updateGuestSessionData(
  sessionId: string, 
  data: Record<string, any>
): Promise<boolean> {
  const db = getDB();
  
  try {
    await db.update(guestSessionTable)
      .set({ 
        tempData: JSON.stringify(data),
        updatedAt: new Date()
      })
      .where(eq(guestSessionTable.sessionId, sessionId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Tracks guest interactions for analytics and abuse prevention
 */
export async function trackGuestInteraction(
  guestSessionId: string,
  interactionType: 'page_view' | 'feature_access' | 'api_call' | 'conversion_prompt',
  interactionData?: Record<string, any>
): Promise<void> {
  const db = getDB();
  const ip = await getIP();

  await db.insert(guestInteractionTable).values({
    guestSessionId,
    interactionType,
    interactionData: interactionData ? JSON.stringify(interactionData) : null,
    ipAddress: ip,
  });
}

/**
 * Checks if guest session has exceeded API rate limits
 */
export async function checkGuestRateLimit(sessionId: string): Promise<{ allowed: boolean; remaining: number }> {
  const db = getDB();
  
  const session = await db.query.guestSessionTable.findFirst({
    where: eq(guestSessionTable.sessionId, sessionId),
    columns: { apiCallCount: true, lastApiCallAt: true }
  });

  if (!session) {
    return { allowed: false, remaining: 0 };
  }

  const now = Date.now();
  const windowStart = now - GUEST_API_RATE_WINDOW;
  
  // Reset counter if outside the rate limit window
  if (!session.lastApiCallAt || session.lastApiCallAt.getTime() < windowStart) {
    await db.update(guestSessionTable)
      .set({ 
        apiCallCount: 1, 
        lastApiCallAt: new Date(now),
        updatedAt: new Date()
      })
      .where(eq(guestSessionTable.sessionId, sessionId));
    
    return { allowed: true, remaining: GUEST_API_RATE_LIMIT - 1 };
  }

  // Check if within limits
  if (session.apiCallCount >= GUEST_API_RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  const newCount = session.apiCallCount + 1;
  await db.update(guestSessionTable)
    .set({ 
      apiCallCount: newCount, 
      lastApiCallAt: new Date(now),
      updatedAt: new Date()
    })
    .where(eq(guestSessionTable.sessionId, sessionId));

  return { allowed: true, remaining: GUEST_API_RATE_LIMIT - newCount };
}

/**
 * Deletes a guest session and associated data
 */
export async function deleteGuestSession(sessionId: string): Promise<void> {
  const db = getDB();
  
  // Delete interactions first (cascade should handle this, but being explicit)
  await db.delete(guestInteractionTable)
    .where(eq(guestInteractionTable.guestSessionId, sessionId));
  
  // Delete session
  await db.delete(guestSessionTable)
    .where(eq(guestSessionTable.sessionId, sessionId));
}

/**
 * Cleans up expired guest sessions (should be run periodically)
 */
export async function cleanupExpiredGuestSessions(): Promise<number> {
  const db = getDB();
  const now = new Date();
  
  // Get expired sessions
  const expiredSessions = await db.query.guestSessionTable.findMany({
    where: lt(guestSessionTable.expiresAt, now),
    columns: { id: true }
  });

  if (expiredSessions.length === 0) return 0;

  // Delete expired sessions (cascade will handle interactions)
  await db.delete(guestSessionTable)
    .where(lt(guestSessionTable.expiresAt, now));

  return expiredSessions.length;
}

/**
 * Gets guest feature access configuration
 */
export function getGuestFeatureAccess(): GuestFeatureAccess {
  return {
    canViewDashboard: true,
    canAccessMarketplace: true,
    canViewComponents: true,
    canMakePurchases: false,
    canCreateTeams: false,
    canAccessBilling: false,
    apiCallLimit: GUEST_API_RATE_LIMIT,
    sessionDurationHours: GUEST_SESSION_DURATION / (1000 * 60 * 60),
  };
}

/**
 * Checks if a specific feature is available for guest users
 */
export function isGuestFeatureEnabled(feature: keyof GuestFeatureAccess): boolean {
  const features = getGuestFeatureAccess();
  return Boolean(features[feature]);
} 