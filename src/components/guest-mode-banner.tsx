"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, User, Clock, Zap } from "lucide-react";
import { useSessionStore } from "@/state/session";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface GuestModeBannerProps {
  className?: string;
  showDismiss?: boolean;
}

export function GuestModeBanner({ className, showDismiss = true }: GuestModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isGuestSession, getGuestFeatures, getGuestSession } = useSessionStore();

  // Only show for guest sessions
  if (!isGuestSession() || isDismissed) {
    return null;
  }

  const features = getGuestFeatures();
  const guestSession = getGuestSession();
  
  if (!features || !guestSession) {
    return null;
  }

  const remainingTime = Math.max(0, guestSession.expiresAt - Date.now());
  const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const remainingApiCalls = Math.max(0, features.apiCallLimit - guestSession.apiCallCount);

  return (
    <div className={cn(
      "relative border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Free Trial Active
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {remainingHours > 0 
                    ? `${remainingHours}h ${remainingMinutes}m remaining`
                    : `${remainingMinutes}m remaining`
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>{remainingApiCalls} API calls left</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/sign-up">
                Create Free Account
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>

            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile view - simplified layout */}
        <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
          <span>{remainingHours > 0 ? `${remainingHours}h ${remainingMinutes}m` : `${remainingMinutes}m`} left</span>
          <span>{remainingApiCalls} API calls</span>
        </div>
      </div>
    </div>
  );
}

export default GuestModeBanner; 