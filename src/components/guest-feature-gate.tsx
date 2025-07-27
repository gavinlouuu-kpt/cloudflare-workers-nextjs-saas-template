"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Crown, Sparkles } from "lucide-react";
import { useSessionStore } from "@/state/session";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface GuestFeatureGateProps {
  children: ReactNode;
  feature: 'canMakePurchases' | 'canCreateTeams' | 'canAccessBilling' | 'apiCallLimit';
  fallback?: ReactNode;
  className?: string;
  showUpgradeCard?: boolean;
}

interface UpgradePromptProps {
  feature: string;
  className?: string;
}

function UpgradePrompt({ feature, className }: UpgradePromptProps) {
  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case 'canMakePurchases':
        return {
          title: "Purchase Components",
          description: "Create an account to purchase and download premium components for your projects.",
          icon: <Sparkles className="h-6 w-6" />,
        };
      case 'canCreateTeams':
        return {
          title: "Create Teams",
          description: "Sign up to create teams, collaborate with others, and manage projects together.",
          icon: <Crown className="h-6 w-6" />,
        };
      case 'canAccessBilling':
        return {
          title: "Billing & Credits",
          description: "Get full access to billing features, credit management, and purchase history.",
          icon: <Lock className="h-6 w-6" />,
        };
      case 'apiCallLimit':
        return {
          title: "API Rate Limit Reached",
          description: "You've reached your guest session API limit. Sign up for unlimited access.",
          icon: <Lock className="h-6 w-6" />,
        };
      default:
        return {
          title: "Premium Feature",
          description: "This feature requires a full account. Sign up to unlock all features.",
          icon: <Lock className="h-6 w-6" />,
        };
    }
  };

  const info = getFeatureInfo(feature);

  return (
    <Card className={cn("border-dashed border-2 border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
          {info.icon}
        </div>
        <CardTitle className="text-amber-900 dark:text-amber-100">{info.title}</CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {info.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-2 pt-0">
        <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          <Link href="/sign-up">
            Create Free Account
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900">
          <Link href="/sign-in">
            Sign In
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GuestFeatureGate({ 
  children, 
  feature, 
  fallback, 
  className, 
  showUpgradeCard = true 
}: GuestFeatureGateProps) {
  const { isGuestSession, getGuestFeatures, getGuestSession } = useSessionStore();

  // Allow all access for authenticated users
  if (!isGuestSession()) {
    return <>{children}</>;
  }

  const features = getGuestFeatures();
  const guestSession = getGuestSession();

  if (!features || !guestSession) {
    return <>{children}</>;
  }

  // Check specific feature access
  let hasAccess = false;
  
  if (feature === 'apiCallLimit') {
    hasAccess = guestSession.apiCallCount < features.apiCallLimit;
  } else {
    hasAccess = features[feature];
  }

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // Show custom fallback or default upgrade prompt
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (showUpgradeCard) {
    return <UpgradePrompt feature={feature} className={className} />;
  }

  return null;
}

export default GuestFeatureGate; 