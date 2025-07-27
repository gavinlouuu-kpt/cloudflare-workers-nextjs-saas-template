import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredGuestSessions } from "@/utils/guest-session";
import { headers } from "next/headers";

// This endpoint can be called by a cron job to clean up expired sessions
export async function POST(request: NextRequest) {
  try {
    // Basic security: check for authorization header
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    // You should use a proper secret here in production
    if (authorization !== `Bearer ${process.env.CLEANUP_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deletedCount = await cleanupExpiredGuestSessions();

    return NextResponse.json({
      success: true,
      deletedSessions: deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up guest sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow GET for simple health checks
export async function GET() {
  return NextResponse.json({
    status: "Guest session cleanup endpoint is running",
    timestamp: new Date().toISOString(),
  });
} 