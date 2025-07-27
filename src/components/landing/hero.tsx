import { Button } from "@/components/ui/button";
import { GITHUB_REPO_URL } from "@/constants";
import Link from "next/link";
import ShinyButton from "@/components/ui/shiny-button";
import { getTotalUsers } from "@/utils/stats";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroTemplate } from "./hero-template";

export function Hero() {
  return (
    <HeroTemplate>
      <div className="mx-auto max-w-2xl text-center space-y-10">
        <div className="flex justify-center gap-4 flex-wrap">
          <ShinyButton className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            100% Free & Open Source
          </ShinyButton>
          <Suspense fallback={<TotalUsersButtonSkeleton />}>
            <TotalUsersButton />
          </Suspense>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Production-Ready Your Custom SaaS Project
        </h1>
        
        <p className="text-lg leading-8 text-muted-foreground">
          A modern, open-source template for building SaaS applications with Next.js 15,
          Cloudflare Workers, and everything you need to launch quickly.
        </p>
        
        <div className="flex items-center justify-center gap-x-4 md:gap-x-6">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
              Try it Free - No Signup Required
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="rounded-full">
              I Have an Account
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center gap-x-4 text-sm text-muted-foreground">
          <span>✨ 2-hour trial</span>
          <span>•</span>
          <span>🚀 No credit card</span>
          <span>•</span>
          <a href={GITHUB_REPO_URL} target="_blank" className="hover:text-indigo-600 transition-colors">
            ⭐ Star on GitHub
          </a>
        </div>
      </div>
    </HeroTemplate>
  );
}

// This component will be wrapped in Suspense
async function TotalUsersButton() {
  const totalUsers = await getTotalUsers();

  if (!totalUsers) return null;

  return (
    <ShinyButton className="rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-500/20">
      {totalUsers} Users & Growing
    </ShinyButton>
  );
}

// Skeleton fallback for the TotalUsersButton
function TotalUsersButtonSkeleton() {
  return (
    <div className="rounded-full bg-purple-500/10 ring-1 ring-inset ring-purple-500/20 px-4 py-1.5 text-sm font-medium">
      <Skeleton className="w-32 h-5" />
    </div>
  );
}
