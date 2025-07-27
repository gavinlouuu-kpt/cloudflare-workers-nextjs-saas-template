"use client";

import * as React from "react";
import { ServiceDetailModule } from "./service-detail-module";
import { UseCaseModule } from "./use-case-module";
import { TestimonialsModule } from "./testimonials-module";
import { HeroTemplate } from "./hero-template";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Example: Basic Usage with Default Configuration
export function BasicLandingPageExample() {
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <HeroTemplate>
        <div className="space-y-6 text-center">
          <Badge variant="secondary" className="mb-4">
            New Release
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build Your SaaS Platform in
            <span className="text-indigo-600 dark:text-indigo-400"> Hours, Not Months</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete authentication, billing, team management, and edge deployment. 
            Everything you need to launch your SaaS, built on modern technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started Free</Button>
            <Button variant="outline" size="lg">View Documentation</Button>
          </div>
        </div>
      </HeroTemplate>

      {/* Service Detail Module */}
      <ServiceDetailModule />

      {/* Use Case Module */}
      <UseCaseModule />

      {/* Testimonials Module */}
      <TestimonialsModule />
    </div>
  );
}

// Example: Custom Services Configuration
export function CustomServicesExample() {
  const customServices = [
    {
      id: "api-first",
      name: "API-First Architecture",
      description: "RESTful APIs with OpenAPI documentation and automatic client generation.",
      icon: ({ className }: { className?: string }) => (
        <div className={className}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </div>
      ),
      features: ["RESTful Design", "OpenAPI Docs", "Client Generation", "Versioning"],
      badge: "Developer Ready",
      href: "/api"
    },
    {
      id: "real-time",
      name: "Real-time Updates",
      description: "WebSocket connections and server-sent events for live data synchronization.",
      icon: ({ className }: { className?: string }) => (
        <div className={className}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
      ),
      features: ["WebSockets", "Server-Sent Events", "Live Updates", "Offline Support"],
      badge: "Real-time",
      href: "/real-time"
    }
  ];

  return (
    <ServiceDetailModule
      services={customServices}
      title="Advanced Features"
      subtitle="Next-Level Capabilities"
      description="Take your application to the next level with these advanced features."
      variant="grid"
      onServiceClick={(service) => {
        console.log("Service clicked:", service.name);
      }}
    />
  );
}

// Example: Use Cases Showcase Variant
export function UseCaseShowcaseExample() {
  return (
    <UseCaseModule
      variant="showcase"
      title="Success Stories"
      subtitle="Real Results"
      description="See how our platform has transformed businesses across industries."
      showMetrics={true}
      onUseCaseClick={(useCase) => {
        console.log("Use case clicked:", useCase.title);
        // Could open a modal, navigate to a page, etc.
      }}
    />
  );
}

// Example: Featured Testimonials
export function FeaturedTestimonialsExample() {
  const customTestimonials = [
    {
      id: "tech-startup",
      content: "We reduced our time to market from 6 months to 3 weeks. The platform handled everything from user management to payment processing seamlessly.",
      author: {
        name: "Alex Rivera",
        title: "Founder & CEO",
        company: "StartupFlow",
        initials: "AR"
      },
      rating: 5,
      featured: true,
      tags: ["Startup", "Time to Market"],
      caseStudyUrl: "/case-studies/startupflow"
    },
    {
      id: "enterprise-client",
      content: "The security features and compliance tools made our enterprise migration smooth. Our clients love the new performance improvements.",
      author: {
        name: "Jennifer Park",
        title: "Head of Engineering",
        company: "EnterpriseCorpora",
        initials: "JP"
      },
      rating: 5,
      featured: true,
      tags: ["Enterprise", "Security"]
    }
  ];

  return (
    <TestimonialsModule
      testimonials={customTestimonials}
      variant="featured"
      title="Featured Success Stories"
      subtitle="Industry Leaders"
      description="Discover how industry leaders are using our platform to drive innovation."
      maxTestimonials={4}
      onTestimonialClick={(testimonial) => {
        if (testimonial.caseStudyUrl) {
          window.open(testimonial.caseStudyUrl, '_blank');
        }
      }}
    />
  );
}

// Example: Compact Layout for Sidebar or Smaller Spaces
export function CompactModulesExample() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-16">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Compact Layouts</h2>
        <p className="text-muted-foreground">Perfect for sidebars, modals, or constrained spaces.</p>
      </div>

      {/* Compact Services */}
      <ServiceDetailModule
        variant="list"
        title="Core Features"
        subtitle="Essential Tools"
        showCTA={false}
        className="max-w-2xl mx-auto"
      />

      {/* Compact Use Cases */}
      <UseCaseModule
        variant="compact"
        showMetrics={false}
        title="Quick Wins"
        subtitle="Fast Results"
      />

      {/* Compact Testimonials */}
      <TestimonialsModule
        variant="compact"
        maxTestimonials={4}
        showCompanyLogos={false}
        title="What Customers Say"
        subtitle="Happy Users"
      />
    </div>
  );
}

// Example: Interactive Landing Page with State Management
export function InteractiveLandingExample() {
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [selectedUseCase, setSelectedUseCase] = React.useState<string | null>(null);

  return (
    <div className="space-y-0">
      <HeroTemplate variant="centered">
        <div className="space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Interactive Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Click on services and use cases to see them in action.
          </p>
          {selectedService && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm">
                Selected Service: <span className="font-semibold">{selectedService}</span>
              </p>
            </div>
          )}
        </div>
      </HeroTemplate>

      <ServiceDetailModule
        onServiceClick={(service) => {
          setSelectedService(service.name);
          console.log("Service selected:", service);
        }}
        ctaText="Select Service"
      />

      <UseCaseModule
        onUseCaseClick={(useCase) => {
          setSelectedUseCase(useCase.title);
          console.log("Use case selected:", useCase);
        }}
        ctaText="Explore Use Case"
      />

      {selectedUseCase && (
        <div className="bg-muted/50 py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Selected Use Case</h3>
            <p className="text-muted-foreground">{selectedUseCase}</p>
          </div>
        </div>
      )}

      <TestimonialsModule variant="featured" />
    </div>
  );
}

// Example: Single Column Landing Page
export function SingleColumnLandingExample() {
  return (
    <div className="max-w-4xl mx-auto space-y-24 py-16">
      {/* Centered Hero */}
      <HeroTemplate
        variant="centered"
        showImageColumn={false}
        showInteractiveColumn={false}
      >
        <div className="space-y-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Single Column Layout
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Perfect for focused, single-purpose landing pages with minimal distractions.
          </p>
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </div>
      </HeroTemplate>

      {/* List-style Services */}
      <ServiceDetailModule
        variant="list"
        title="What's Included"
        subtitle="Complete Package"
      />

      {/* Compact Use Cases */}
      <UseCaseModule
        variant="compact"
        title="Success Stories"
        subtitle="Proven Results"
      />

      {/* Simple Testimonials */}
      <TestimonialsModule
        variant="compact"
        maxTestimonials={3}
        title="Customer Feedback"
        subtitle="Testimonials"
      />
    </div>
  );
}

// Export default for main example
export default BasicLandingPageExample; 