import "server-only";

import { cookies } from "next/headers";
import { getDB } from "@/db";
import { eq } from "drizzle-orm";
import { guestSessionTable, guestInteractionTable } from "@/db/schema";
import { validateGuestSession, trackGuestInteraction, deleteGuestSession, GUEST_SESSION_COOKIE_NAME } from "./guest-session";
import { deleteGuestSessionCookie } from "./auth";

export interface GuestConversionData {
  guestSessionId: string;
  tempData: Record<string, any>;
  interactionCount: number;
  sessionDuration: number;
  topInteractions: string[];
}

/**
 * Converts a guest session to a registered user, transferring relevant data
 */
export async function convertGuestToUser(userId: string): Promise<GuestConversionData | null> {
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;

  if (!guestSessionId) {
    return null;
  }

  try {
    // Get guest session data
    const guestSession = await validateGuestSession(guestSessionId);
    if (!guestSession) {
      return null;
    }

    // Get guest interactions for analytics
    const db = getDB();
    const interactions = await db.query.guestInteractionTable.findMany({
      where: eq(guestInteractionTable.guestSessionId, guestSession.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    // Calculate session duration
    const sessionDuration = Date.now() - guestSession.createdAt;

    // Get top interaction types
    const interactionTypes = interactions.reduce((acc, interaction) => {
      acc[interaction.interactionType] = (acc[interaction.interactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topInteractions = Object.entries(interactionTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    // Track conversion
    await trackGuestInteraction(
      guestSession.id,
      'conversion_prompt',
      {
        userId,
        conversionType: 'signup',
        sessionDuration,
        interactionCount: interactions.length,
      }
    );

    const conversionData: GuestConversionData = {
      guestSessionId: guestSession.id,
      tempData: guestSession.tempData || {},
      interactionCount: interactions.length,
      sessionDuration,
      topInteractions,
    };

    // Clean up guest session after successful conversion
    await deleteGuestSession(guestSessionId);
    await deleteGuestSessionCookie();

    return conversionData;
  } catch (error) {
    console.error("Error converting guest to user:", error);
    return null;
  }
}

/**
 * Tracks when a guest user views a conversion prompt
 */
export async function trackConversionPrompt(
  location: string,
  feature: string,
  additionalData?: Record<string, any>
): Promise<void> {
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;

  if (!guestSessionId) {
    return;
  }

  try {
    const guestSession = await validateGuestSession(guestSessionId);
    if (!guestSession) {
      return;
    }

    await trackGuestInteraction(
      guestSession.id,
      'conversion_prompt',
      {
        location,
        feature,
        timestamp: Date.now(),
        ...additionalData,
      }
    );
  } catch (error) {
    console.error("Error tracking conversion prompt:", error);
  }
}

/**
 * Gets guest session analytics for conversion optimization
 */
export async function getGuestSessionAnalytics(timeframeHours: number = 24): Promise<{
  totalSessions: number;
  activeSessions: number;
  conversions: number;
  avgSessionDuration: number;
  topFeatures: Array<{ feature: string; count: number }>;
  conversionRate: number;
}> {
  const db = getDB();
  const since = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

  try {
    // Get session counts
    const totalSessions = await db.query.guestSessionTable.findMany({
      where: (table, { gte }) => gte(table.createdAt, since),
    });

    const activeSessions = totalSessions.filter(
      session => session.expiresAt.getTime() > Date.now()
    );

    // Get interactions
    const interactions = await db.query.guestInteractionTable.findMany({
      where: (table, { gte, eq }) => gte(table.createdAt, since),
    });

    // Count conversions
    const conversions = interactions.filter(
      interaction => interaction.interactionType === 'conversion_prompt' && 
      interaction.interactionData?.includes('conversionType')
    ).length;

    // Calculate average session duration
    const avgSessionDuration = totalSessions.reduce((sum, session) => {
      const duration = Math.min(
        Date.now() - session.createdAt.getTime(),
        session.expiresAt.getTime() - session.createdAt.getTime()
      );
      return sum + duration;
    }, 0) / Math.max(totalSessions.length, 1);

    // Get top features accessed
    const featureAccess = interactions
      .filter(interaction => interaction.interactionType === 'feature_access')
      .reduce((acc, interaction) => {
        const feature = interaction.interactionData || 'unknown';
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topFeatures = Object.entries(featureAccess)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([feature, count]) => ({ feature, count }));

    const conversionRate = totalSessions.length > 0 ? (conversions / totalSessions.length) * 100 : 0;

    return {
      totalSessions: totalSessions.length,
      activeSessions: activeSessions.length,
      conversions,
      avgSessionDuration,
      topFeatures,
      conversionRate,
    };
  } catch (error) {
    console.error("Error getting guest session analytics:", error);
    return {
      totalSessions: 0,
      activeSessions: 0,
      conversions: 0,
      avgSessionDuration: 0,
      topFeatures: [],
      conversionRate: 0,
    };
  }
} 