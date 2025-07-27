import { NextResponse } from "next/server";
import { setGuestSessionCookie } from "@/utils/auth";
import { createGuestSession, getGuestFeatureAccess } from "@/utils/guest-session";

export async function POST() {
  try {
    // Create new guest session
    const newGuestSession = await createGuestSession();
    
    // Set guest session cookie
    await setGuestSessionCookie(newGuestSession.sessionId, new Date(newGuestSession.expiresAt));
    
    return NextResponse.json({
      success: true,
      session: {
        type: 'guest',
        session: newGuestSession,
        features: getGuestFeatureAccess(),
      }
    });
  } catch (error) {
    console.error('Error creating guest session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
} 