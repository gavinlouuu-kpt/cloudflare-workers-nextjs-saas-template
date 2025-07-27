"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, PlayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Types for the hero template configuration
export interface HeroTemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  imageComponent?: React.ReactNode;
  serviceComponent?: React.ReactNode;
  variant?: "default" | "centered" | "reversed";
  showImageColumn?: boolean;
  showInteractiveColumn?: boolean;
}

export interface ImageColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface InteractiveColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// Default Image Demo Component
const DefaultImageDemo = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative group", className)}
      {...props}
    >
      <Card className="overflow-hidden border-2 border-border/50 shadow-2xl group-hover:shadow-3xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950 dark:via-background dark:to-purple-950">
            {/* Simulated App Interface */}
            <div className="absolute inset-4 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
              {/* Header Bar */}
              <div className="h-12 bg-muted border-b border-border flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  Your SaaS Dashboard
                </div>
              </div>
              
              {/* Content Area */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-indigo-200 dark:bg-indigo-800 rounded w-32"></div>
                  <Badge variant="secondary" className="text-xs">Live Demo</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded w-full"></div>
                    <div className="h-2 bg-muted rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded w-2/3"></div>
                    <div className="h-2 bg-muted rounded w-full"></div>
                    <div className="h-2 bg-muted rounded w-4/5"></div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <div className="h-2 bg-indigo-300 dark:bg-indigo-700 rounded w-20"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded w-full"></div>
                    <div className="h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 dark:bg-background/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                <PlayIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Floating Elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-bounce"></div>
      <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-purple-500 rounded-full opacity-60"></div>
    </div>
  )
);
DefaultImageDemo.displayName = "DefaultImageDemo";

// Service Selector Demo Component
const ServiceSelector = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const [selectedService, setSelectedService] = React.useState<string>("authentication");
    
    const services = [
      {
        id: "authentication",
        name: "Authentication",
        description: "Secure user login with multi-factor authentication",
        icon: "🔐",
        features: ["Email/Password", "OAuth", "2FA", "Session Management"]
      },
      {
        id: "billing",
        name: "Billing & Payments",
        description: "Stripe integration with subscription management",
        icon: "💳",
        features: ["Subscriptions", "Invoicing", "Usage Tracking", "Webhooks"]
      },
      {
        id: "teams",
        name: "Team Management",
        description: "Multi-tenant architecture with role-based access",
        icon: "👥",
        features: ["Organizations", "Permissions", "Invitations", "Admin Panel"]
      }
    ];
    
    const selectedServiceData = services.find(s => s.id === selectedService);
    
    return (
      <div
        ref={ref}
        className={cn("space-y-6", className)}
        {...props}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Your Service</h3>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all duration-200",
                  "hover:border-indigo-300 dark:hover:border-indigo-700",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  selectedService === service.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" 
                    : "border-border bg-card"
                )}
                aria-pressed={selectedService === service.id}
                aria-describedby={`${service.id}-description`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl" role="img" aria-label={service.name}>
                    {service.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{service.name}</div>
                    <div 
                      id={`${service.id}-description`}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      {service.description}
                    </div>
                  </div>
                  {selectedService === service.id && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" aria-hidden="true"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {selectedServiceData && (
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={selectedServiceData.name}>
                    {selectedServiceData.icon}
                  </span>
                  <h4 className="text-xl font-semibold">{selectedServiceData.name}</h4>
                </div>
                
                <p className="text-muted-foreground">{selectedServiceData.description}</p>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Key Features:</h5>
                  <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                    {selectedServiceData.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" aria-hidden="true"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Button size="sm" className="w-full group">
                    Get Started
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);
ServiceSelector.displayName = "ServiceSelector";

// Image Column Component
const ImageColumn = React.forwardRef<HTMLDivElement, ImageColumnProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-1 flex items-center justify-center p-6 lg:p-8",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-lg">
        {children || <DefaultImageDemo />}
      </div>
    </div>
  )
);
ImageColumn.displayName = "ImageColumn";

// Interactive Column Component  
const InteractiveColumn = React.forwardRef<HTMLDivElement, InteractiveColumnProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-1 flex items-center justify-center p-6 lg:p-8",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-md">
        {children || <ServiceSelector />}
      </div>
    </div>
  )
);
InteractiveColumn.displayName = "InteractiveColumn";

// Main Hero Template Component
const HeroTemplate = React.forwardRef<HTMLDivElement, HeroTemplateProps>(
  ({ 
    className, 
    imageComponent, 
    serviceComponent, 
    variant = "default",
    showImageColumn = true,
    showInteractiveColumn = true,
    children,
    ...props 
  }, ref) => {
    const isReversed = variant === "reversed";
    const isCentered = variant === "centered";
    
    if (isCentered) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative isolate pt-14 dark:bg-gray-900",
            className
          )}
          {...props}
        >
          <div className="pt-20 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center space-y-12">
                {children}
                {showInteractiveColumn && (
                  <div className="mx-auto max-w-2xl">
                    {serviceComponent || <ServiceSelector />}
                  </div>
                )}
                {showImageColumn && (
                  <div className="mx-auto max-w-3xl">
                    {imageComponent || <DefaultImageDemo />}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative isolate pt-14 dark:bg-gray-900",
          className
        )}
        {...props}
      >
        <div className="pt-20 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div 
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center",
                  isReversed && "lg:grid-flow-col-dense"
                )}
              >
                {/* Content slot for additional elements */}
                {children && (
                  <div className="lg:col-span-2 text-center mb-8">
                    {children}
                  </div>
                )}
                
                {/* Image Column */}
                {showImageColumn && (
                  <ImageColumn 
                    className={cn(
                      isReversed && "lg:col-start-2"
                    )}
                  >
                    {imageComponent}
                  </ImageColumn>
                )}
                
                {/* Interactive Column */}
                {showInteractiveColumn && (
                  <InteractiveColumn 
                    className={cn(
                      isReversed && "lg:col-start-1"
                    )}
                  >
                    {serviceComponent}
                  </InteractiveColumn>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
HeroTemplate.displayName = "HeroTemplate";

export { 
  HeroTemplate, 
  ImageColumn, 
  InteractiveColumn, 
  DefaultImageDemo, 
  ServiceSelector 
}; 