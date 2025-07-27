"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// Service interface for type safety
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  badge?: string;
  href?: string;
}

// Props interface following existing patterns
export interface ServiceDetailModuleProps extends React.HTMLAttributes<HTMLDivElement> {
  services?: Service[];
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: "default" | "grid" | "list";
  showCTA?: boolean;
  ctaText?: string;
  onServiceClick?: (service: Service) => void;
}

// Default services data following existing feature patterns
const defaultServices: Service[] = [
  {
    id: "authentication",
    name: "Authentication System",
    description: "Complete auth solution with email/password, OAuth, and session management using Lucia Auth.",
    icon: ({ className }: { className?: string }) => (
      <div className={cn("flex items-center justify-center", className)}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
    ),
    features: ["Email/Password Auth", "OAuth Integration", "Session Management", "Password Reset"],
    badge: "Secure",
    href: "/auth"
  },
  {
    id: "billing", 
    name: "Billing & Payments",
    description: "Stripe integration with subscription management, invoicing, and usage tracking.",
    icon: ({ className }: { className?: string }) => (
      <div className={cn("flex items-center justify-center", className)}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
    ),
    features: ["Stripe Integration", "Subscription Management", "Usage Tracking", "Automated Invoicing"],
    badge: "Revenue Ready",
    href: "/billing"
  },
  {
    id: "teams",
    name: "Team Management", 
    description: "Multi-tenant architecture with role-based access control and team collaboration.",
    icon: ({ className }: { className?: string }) => (
      <div className={cn("flex items-center justify-center", className)}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      </div>
    ),
    features: ["Role-Based Access", "Team Invitations", "Multi-tenancy", "Admin Dashboard"],
    badge: "Enterprise",
    href: "/teams"
  },
  {
    id: "infrastructure",
    name: "Edge Infrastructure",
    description: "Deploy globally with Cloudflare Workers for zero cold starts and blazing performance.",
    icon: ({ className }: { className?: string }) => (
      <div className={cn("flex items-center justify-center", className)}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
        </svg>
      </div>
    ),
    features: ["Cloudflare Workers", "Edge Computing", "Zero Cold Starts", "Global CDN"],
    badge: "Fast",
    href: "/infrastructure"
  },
  {
    id: "developer-experience",
    name: "Developer Experience",
    description: "TypeScript, modern tooling, and comprehensive documentation for rapid development.",
    icon: ({ className }: { className?: string }) => (
      <div className={cn("flex items-center justify-center", className)}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      </div>
    ),
    features: ["TypeScript Support", "Modern Tooling", "Documentation", "GitHub Actions"],
    badge: "DX First",
    href: "/docs"
  }
];

// Service Card Component
const ServiceCard = React.forwardRef<HTMLDivElement, {
  service: Service;
  onClick?: (service: Service) => void;
  showCTA?: boolean;
  ctaText?: string;
  className?: string;
}>(({ service, onClick, showCTA = true, ctaText = "Learn More", className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        "group relative h-full transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1",
        "border-border/50 hover:border-indigo-300 dark:hover:border-indigo-700",
        onClick && "cursor-pointer",
        className
      )}
      onClick={() => onClick?.(service)}
      {...props}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <service.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              {service.badge && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {service.badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {service.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">Key Features</h5>
            <ul className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          {showCTA && (
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-indigo-50 group-hover:border-indigo-300 dark:group-hover:bg-indigo-950/30 dark:group-hover:border-indigo-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(service);
              }}
            >
              {ctaText}
              <ArrowRightIcon className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
ServiceCard.displayName = "ServiceCard";

// Main Service Detail Module Component
const ServiceDetailModule = React.forwardRef<HTMLDivElement, ServiceDetailModuleProps>(
  ({
    className,
    services = defaultServices,
    title = "Core Services",
    subtitle = "Everything You Need",
    description = "Comprehensive services designed to accelerate your development and ensure production readiness.",
    variant = "default",
    showCTA = true,
    ctaText = "Learn More",
    onServiceClick,
    ...props
  }, ref) => {
    
    const handleServiceClick = React.useCallback((service: Service) => {
      onServiceClick?.(service);
      // Default behavior: navigate to href if provided
      if (service.href && !onServiceClick) {
        window.location.href = service.href;
      }
    }, [onServiceClick]);

    const containerClass = cn(
      "py-24 sm:py-32",
      className
    );

    const gridClass = cn(
      variant === "list" 
        ? "space-y-6"
        : "grid gap-6 sm:gap-8",
      variant === "default" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      variant === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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

          {/* Services Grid */}
          <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24">
            <div className={gridClass}>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={handleServiceClick}
                  showCTA={showCTA}
                  ctaText={ctaText}
                  className={variant === "list" ? "max-w-2xl mx-auto" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ServiceDetailModule.displayName = "ServiceDetailModule";

export { ServiceDetailModule, ServiceCard, defaultServices }; 