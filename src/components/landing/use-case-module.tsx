"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, PlayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Use case interface for type safety
export interface UseCase {
  id: string;
  title: string;
  description: string;
  scenario: string;
  industry?: string;
  tags: string[];
  benefits: string[];
  imageUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  metrics?: {
    label: string;
    value: string;
    improvement?: string;
  }[];
}

// Props interface following existing patterns
export interface UseCaseModuleProps extends React.HTMLAttributes<HTMLDivElement> {
  useCases?: UseCase[];
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: "default" | "showcase" | "compact";
  showMetrics?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  onUseCaseClick?: (useCase: UseCase) => void;
}

// Default use cases data
const defaultUseCases: UseCase[] = [
  {
    id: "saas-startup",
    title: "SaaS Startup Launch",
    description: "From MVP to production-ready SaaS platform in weeks, not months.",
    scenario: "A startup needed to quickly validate their SaaS idea with a fully functional platform including user management, billing, and team collaboration.",
    industry: "Technology",
    tags: ["MVP", "Rapid Development", "Scalable"],
    benefits: [
      "Reduced development time by 70%",
      "Built-in user authentication and billing",
      "Production-ready from day one",
      "Focus on core business logic"
    ],
    imageUrl: "/images/use-cases/saas-startup.jpg",
    demoUrl: "/demo/saas-startup",
    caseStudyUrl: "/case-studies/saas-startup",
    metrics: [
      { label: "Time to Market", value: "3 weeks", improvement: "70% faster" },
      { label: "Development Cost", value: "$15K", improvement: "60% reduction" },
      { label: "User Onboarding", value: "5 min", improvement: "Instant setup" }
    ]
  },
  {
    id: "enterprise-migration",
    title: "Enterprise Cloud Migration",
    description: "Modernize legacy systems with edge-first architecture and global deployment.",
    scenario: "A Fortune 500 company needed to migrate their legacy customer portal to a modern, globally distributed platform with enhanced security and performance.",
    industry: "Financial Services",
    tags: ["Enterprise", "Migration", "Security"],
    benefits: [
      "99.99% uptime with edge deployment",
      "Enhanced security with modern auth",
      "Global performance optimization",
      "Reduced infrastructure costs"
    ],
    imageUrl: "/images/use-cases/enterprise-migration.jpg",
    demoUrl: "/demo/enterprise-migration",
    caseStudyUrl: "/case-studies/enterprise-migration",
    metrics: [
      { label: "Performance", value: "40% faster", improvement: "Global edge deployment" },
      { label: "Security Score", value: "A+", improvement: "Enhanced authentication" },
      { label: "Cost Savings", value: "$2M/year", improvement: "Infrastructure optimization" }
    ]
  },
  {
    id: "digital-agency",
    title: "Digital Agency Portfolio", 
    description: "Deliver client projects faster with a proven, customizable foundation.",
    scenario: "A digital agency wanted to streamline their client delivery process with a reusable foundation that could be quickly customized for different industries and requirements.",
    industry: "Agency",
    tags: ["White-label", "Customizable", "Client Delivery"],
    benefits: [
      "Faster project delivery",
      "Consistent quality across projects",
      "Reduced client onboarding time",
      "Higher profit margins"
    ],
    imageUrl: "/images/use-cases/digital-agency.jpg",
    demoUrl: "/demo/digital-agency",
    caseStudyUrl: "/case-studies/digital-agency",
    metrics: [
      { label: "Project Delivery", value: "50% faster", improvement: "Reusable foundation" },
      { label: "Client Satisfaction", value: "98%", improvement: "Consistent quality" },
      { label: "Team Efficiency", value: "3x", improvement: "Standardized workflow" }
    ]
  }
];

// Mock Image Component for development
const MockImage = React.forwardRef<HTMLDivElement, {
  title: string;
  industry?: string;
  className?: string;
}>(({ title, industry, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative aspect-[4/3] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:via-background dark:to-purple-950 rounded-lg overflow-hidden",
      className
    )}
  >
    {/* Simulated Dashboard/Application Interface */}
    <div className="absolute inset-4 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
      {/* Header Bar */}
      <div className="h-10 bg-muted border-b border-border flex items-center px-3 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 text-center text-xs text-muted-foreground">
          {title} - {industry}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-indigo-200 dark:bg-indigo-800 rounded w-24"></div>
          <Badge variant="outline" className="text-[8px] px-1 py-0.5">Live</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <div className="h-1.5 bg-muted rounded w-full"></div>
            <div className="h-1.5 bg-muted rounded w-3/4"></div>
            <div className="h-1.5 bg-muted rounded w-1/2"></div>
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 bg-muted rounded w-2/3"></div>
            <div className="h-1.5 bg-muted rounded w-full"></div>
            <div className="h-1.5 bg-muted rounded w-4/5"></div>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <div className="h-1.5 bg-indigo-300 dark:bg-indigo-700 rounded w-16"></div>
          </div>
          <div className="space-y-0.5">
            <div className="h-1 bg-indigo-200 dark:bg-indigo-800 rounded w-full"></div>
            <div className="h-1 bg-indigo-200 dark:bg-indigo-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Industry Badge */}
    {industry && (
      <div className="absolute top-2 right-2">
        <Badge variant="secondary" className="text-xs">
          {industry}
        </Badge>
      </div>
    )}
  </div>
));
MockImage.displayName = "MockImage";

// Use Case Card Component
const UseCaseCard = React.forwardRef<HTMLDivElement, {
  useCase: UseCase;
  onClick?: (useCase: UseCase) => void;
  showMetrics?: boolean;
  showCTA?: boolean;
  ctaText?: string;
  variant?: "default" | "showcase" | "compact";
  className?: string;
}>(({ 
  useCase, 
  onClick, 
  showMetrics = true, 
  showCTA = true, 
  ctaText = "View Case Study", 
  variant = "default",
  className,
  ...props 
}, ref) => {
  const isShowcase = variant === "showcase";
  const isCompact = variant === "compact";

  return (
    <Card
      ref={ref}
      className={cn(
        "group relative h-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25",
        "border-border/50 hover:border-indigo-300 dark:hover:border-indigo-700",
        onClick && "cursor-pointer",
        isShowcase && "hover:-translate-y-2",
        className
      )}
      onClick={() => onClick?.(useCase)}
      {...props}
    >
      {/* Image Section */}
      <div className="relative">
        {useCase.imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
            <Image
              src={useCase.imageUrl}
              alt={useCase.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <MockImage 
            title={useCase.title}
            industry={useCase.industry}
            className="rounded-t-lg"
          />
        )}
        
        {/* Demo Play Button Overlay */}
        {useCase.demoUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-t-lg">
            <div className="bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <PlayIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <CardHeader className={cn("pb-3", isCompact && "pb-2")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className={cn("text-lg", isCompact && "text-base")}>
              {useCase.title}
            </CardTitle>
            {useCase.industry && !isCompact && (
              <Badge variant="outline" className="mt-1 text-xs">
                {useCase.industry}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className={cn("text-sm leading-relaxed", isCompact && "text-xs")}>
          {useCase.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={cn("pt-0", isCompact && "space-y-3")}>
        {/* Scenario */}
        {!isCompact && (
          <div className="space-y-3 mb-4">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Scenario</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {useCase.scenario}
              </p>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {useCase.tags.slice(0, isCompact ? 2 : 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {isCompact && useCase.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{useCase.tags.length - 2}
            </Badge>
          )}
        </div>

        {/* Benefits */}
        {!isCompact && (
          <div className="space-y-2 mb-4">
            <h5 className="text-sm font-medium text-muted-foreground">Key Benefits</h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {useCase.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && useCase.metrics && !isCompact && (
          <div className="space-y-3 mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h5 className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Results</h5>
            <div className="grid grid-cols-1 gap-2">
              {useCase.metrics.slice(0, 2).map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {metric.value}
                    </span>
                    {metric.improvement && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {metric.improvement}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA Buttons */}
        {showCTA && (
          <div className={cn("flex gap-2", isCompact ? "flex-col" : "flex-row")}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 group-hover:bg-indigo-50 group-hover:border-indigo-300 dark:group-hover:bg-indigo-950/30 dark:group-hover:border-indigo-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(useCase);
              }}
            >
              {ctaText}
              <ArrowRightIcon className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
            {useCase.demoUrl && !isCompact && (
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                onClick={(e) => {
                  e.stopPropagation();
                  if (useCase.demoUrl) window.open(useCase.demoUrl, '_blank');
                }}
              >
                <PlayIcon className="w-4 h-4 mr-1" />
                Demo
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
UseCaseCard.displayName = "UseCaseCard";

// Main Use Case Module Component
const UseCaseModule = React.forwardRef<HTMLDivElement, UseCaseModuleProps>(
  ({
    className,
    useCases = defaultUseCases,
    title = "Success Stories",
    subtitle = "Proven Results",
    description = "See how organizations across industries have transformed their operations with our platform.",
    variant = "default",
    showMetrics = true,
    showCTA = true,
    ctaText = "View Case Study",
    onUseCaseClick,
    ...props
  }, ref) => {
    
    const handleUseCaseClick = React.useCallback((useCase: UseCase) => {
      onUseCaseClick?.(useCase);
      // Default behavior: navigate to case study if provided
      if (useCase.caseStudyUrl && !onUseCaseClick) {
        window.open(useCase.caseStudyUrl, '_blank');
      }
    }, [onUseCaseClick]);

    const containerClass = cn(
      "py-24 sm:py-32",
      variant === "showcase" && "bg-muted/30",
      className
    );

    const gridClass = cn(
      "grid gap-6 sm:gap-8",
      variant === "compact" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      variant === "showcase" && "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
      variant === "default" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    );

    return (
      <div ref={ref} className={containerClass} {...props}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header Section */}
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
              {subtitle}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Use Cases Grid */}
          <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24">
            <div className={gridClass}>
              {useCases.map((useCase) => (
                <UseCaseCard
                  key={useCase.id}
                  useCase={useCase}
                  onClick={handleUseCaseClick}
                  showMetrics={showMetrics}
                  showCTA={showCTA}
                  ctaText={ctaText}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
UseCaseModule.displayName = "UseCaseModule";

export { UseCaseModule, UseCaseCard, defaultUseCases }; 