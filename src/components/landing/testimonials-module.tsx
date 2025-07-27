"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "@heroicons/react/24/solid";

// Testimonial interface for type safety
export interface Testimonial {
  id: string;
  content: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar?: string;
    initials?: string;
  };
  rating?: number;
  featured?: boolean;
  tags?: string[];
  companyLogo?: string;
  caseStudyUrl?: string;
}

// Props interface following existing patterns
export interface TestimonialsModuleProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: "default" | "featured" | "compact" | "masonry";
  showRatings?: boolean;
  showCompanyLogos?: boolean;
  maxTestimonials?: number;
  onTestimonialClick?: (testimonial: Testimonial) => void;
}

// Default testimonials data
const defaultTestimonials: Testimonial[] = [
  {
    id: "sarah-chen",
    content: "This platform transformed our development workflow. We went from months of setup to shipping our MVP in just 3 weeks. The authentication and billing systems worked flawlessly out of the box.",
    author: {
      name: "Sarah Chen",
      title: "CTO",
      company: "TechFlow Solutions",
      avatar: "/images/testimonials/sarah-chen.jpg",
      initials: "SC"
    },
    rating: 5,
    featured: true,
    tags: ["Development Speed", "MVP Launch"],
    companyLogo: "/images/companies/techflow.svg"
  },
  {
    id: "marcus-rodriguez",
    content: "The edge deployment and performance optimizations have been game-changing for our global user base. Page load times improved by 60% and our infrastructure costs dropped significantly.",
    author: {
      name: "Marcus Rodriguez",
      title: "Lead Developer",
      company: "GlobalScale Inc",
      avatar: "/images/testimonials/marcus-rodriguez.jpg", 
      initials: "MR"
    },
    rating: 5,
    featured: false,
    tags: ["Performance", "Global Scale"],
    companyLogo: "/images/companies/globalscale.svg"
  },
  {
    id: "emily-watson",
    content: "As a non-technical founder, I was amazed at how quickly our development team could focus on our core features instead of rebuilding authentication and payment systems.",
    author: {
      name: "Emily Watson",
      title: "Founder & CEO",
      company: "InnovateNow",
      avatar: "/images/testimonials/emily-watson.jpg",
      initials: "EW"
    },
    rating: 5,
    featured: true,
    tags: ["Founder Friendly", "Time to Market"],
    companyLogo: "/images/companies/innovatenow.svg"
  },
  {
    id: "james-kim",
    content: "The team management and billing features are incredibly robust. We've processed over $2M in transactions with zero payment issues. The admin dashboard gives us complete visibility.",
    author: {
      name: "James Kim",
      title: "Head of Operations",
      company: "ScaleUp Ventures",
      avatar: "/images/testimonials/james-kim.jpg",
      initials: "JK"
    },
    rating: 5,
    featured: false,
    tags: ["Enterprise Grade", "Billing"],
    companyLogo: "/images/companies/scaleup.svg"
  },
  {
    id: "alexandra-popov",
    content: "Migration from our legacy system was surprisingly smooth. The documentation is excellent and the TypeScript support made integration with our existing codebase seamless.",
    author: {
      name: "Alexandra Popov",
      title: "Senior Full Stack Developer",
      company: "TechCorp",
      avatar: "/images/testimonials/alexandra-popov.jpg",
      initials: "AP"
    },
    rating: 5,
    featured: false,
    tags: ["Migration", "Developer Experience"],
    companyLogo: "/images/companies/techcorp.svg"
  },
  {
    id: "david-thompson",
    content: "The security features and compliance tools have been essential for our enterprise clients. We passed security audits with flying colors thanks to the built-in security practices.",
    author: {
      name: "David Thompson",
      title: "VP of Engineering",
      company: "SecureData Systems",
      avatar: "/images/testimonials/david-thompson.jpg",
      initials: "DT"
    },
    rating: 5,
    featured: true,
    tags: ["Security", "Compliance"],
    companyLogo: "/images/companies/securedata.svg"
  }
];

// Star Rating Component
const StarRating = React.forwardRef<HTMLDivElement, {
  rating: number;
  showNumber?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}>(({ rating, showNumber = false, size = "sm", className }, ref) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <div ref={ref} className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={index}
            className={cn(
              sizeClasses[size],
              index < rating
                ? "text-yellow-400 fill-current"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating}/5
        </span>
      )}
    </div>
  );
});
StarRating.displayName = "StarRating";

// Company Logo Component (Mock for development)
const CompanyLogo = React.forwardRef<HTMLDivElement, {
  company: string;
  logoUrl?: string;
  className?: string;
}>(({ company, logoUrl, className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center h-8 px-3 bg-muted/50 rounded border border-border/50",
      className
    )}
  >
    {logoUrl ? (
      <img
        src={logoUrl}
        alt={`${company} logo`}
        className="h-6 w-auto object-contain opacity-60"
      />
    ) : (
      <span className="text-xs font-medium text-muted-foreground">
        {company}
      </span>
    )}
  </div>
));
CompanyLogo.displayName = "CompanyLogo";

// Testimonial Card Component
const TestimonialCard = React.forwardRef<HTMLDivElement, {
  testimonial: Testimonial;
  onClick?: (testimonial: Testimonial) => void;
  showRating?: boolean;
  showCompanyLogo?: boolean;
  variant?: "default" | "featured" | "compact" | "masonry";
  className?: string;
}>(({ 
  testimonial, 
  onClick, 
  showRating = true, 
  showCompanyLogo = true,
  variant = "default",
  className,
  ...props 
}, ref) => {
  const isFeatured = variant === "featured" || testimonial.featured;
  const isCompact = variant === "compact";

  return (
    <Card
      ref={ref}
      className={cn(
        "group relative h-full transition-all duration-300",
        "border-border/50 hover:border-indigo-300 dark:hover:border-indigo-700",
        "hover:shadow-lg hover:shadow-indigo-500/25",
        onClick && "cursor-pointer",
        isFeatured && "ring-2 ring-indigo-500/20 border-indigo-300 dark:border-indigo-700",
        isCompact && "p-4",
        className
      )}
      onClick={() => onClick?.(testimonial)}
      {...props}
    >
      <CardContent className={cn("p-6", isCompact && "p-4")}>
        <div className="space-y-4">
          {/* Header with rating and featured badge */}
          <div className="flex items-start justify-between">
            {showRating && testimonial.rating && (
              <StarRating 
                rating={testimonial.rating} 
                size={isCompact ? "sm" : "md"}
              />
            )}
            {isFeatured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
          </div>

          {/* Quote Content */}
          <blockquote className={cn(
            "text-muted-foreground leading-relaxed",
            isCompact ? "text-sm" : "text-base",
            isFeatured && "text-lg"
          )}>
            "{testimonial.content}"
          </blockquote>

          {/* Tags */}
          {testimonial.tags && !isCompact && (
            <div className="flex flex-wrap gap-1.5">
              {testimonial.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-3 pt-2">
            <Avatar className={cn("border border-border", isCompact ? "h-8 w-8" : "h-10 w-10")}>
              <AvatarImage
                src={testimonial.author.avatar}
                alt={testimonial.author.name}
              />
              <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-sm">
                {testimonial.author.initials || 
                 testimonial.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className={cn("font-semibold", isCompact ? "text-sm" : "text-base")}>
                {testimonial.author.name}
              </div>
              <div className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                {testimonial.author.title}
              </div>
              <div className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-sm")}>
                {testimonial.author.company}
              </div>
            </div>

            {/* Company Logo */}
            {showCompanyLogo && !isCompact && (
              <CompanyLogo 
                company={testimonial.author.company}
                logoUrl={testimonial.companyLogo}
                className="ml-auto"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
TestimonialCard.displayName = "TestimonialCard";

// Main Testimonials Module Component
const TestimonialsModule = React.forwardRef<HTMLDivElement, TestimonialsModuleProps>(
  ({
    className,
    testimonials = defaultTestimonials,
    title = "What Our Customers Say",
    subtitle = "Trusted by Developers",
    description = "Join thousands of developers and companies who've accelerated their growth with our platform.",
    variant = "default",
    showRatings = true,
    showCompanyLogos = true,
    maxTestimonials = 6,
    onTestimonialClick,
    ...props
  }, ref) => {
    
    const displayedTestimonials = testimonials.slice(0, maxTestimonials);
    
    const handleTestimonialClick = React.useCallback((testimonial: Testimonial) => {
      onTestimonialClick?.(testimonial);
      // Default behavior: navigate to case study if provided
      if (testimonial.caseStudyUrl && !onTestimonialClick) {
        window.open(testimonial.caseStudyUrl, '_blank');
      }
    }, [onTestimonialClick]);

    const containerClass = cn(
      "py-24 sm:py-32",
      variant === "featured" && "bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background",
      className
    );

    const gridClass = cn(
      "grid gap-6 sm:gap-8",
      variant === "compact" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      variant === "masonry" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      variant === "featured" && "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3", 
      variant === "default" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    );

    // Separate featured testimonials for special layout
    const featuredTestimonials = displayedTestimonials.filter(t => t.featured);
    const regularTestimonials = displayedTestimonials.filter(t => !t.featured);

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

          {/* Testimonials Grid */}
          <div className="mx-auto mt-16 max-w-6xl sm:mt-20 lg:mt-24">
            {variant === "featured" && featuredTestimonials.length > 0 ? (
              <div className="space-y-12">
                {/* Featured Testimonials - Larger Cards */}
                <div className="grid gap-8 lg:grid-cols-2">
                  {featuredTestimonials.slice(0, 2).map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                      onClick={handleTestimonialClick}
                      showRating={showRatings}
                      showCompanyLogo={showCompanyLogos}
                      variant="featured"
                    />
                  ))}
                </div>
                
                {/* Regular Testimonials */}
                {regularTestimonials.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {regularTestimonials.map((testimonial) => (
                      <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        onClick={handleTestimonialClick}
                        showRating={showRatings}
                        showCompanyLogo={showCompanyLogos}
                        variant="default"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={gridClass}>
                {displayedTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onClick={handleTestimonialClick}
                    showRating={showRatings}
                    showCompanyLogo={showCompanyLogos}
                    variant={variant}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
TestimonialsModule.displayName = "TestimonialsModule";

export { TestimonialsModule, TestimonialCard, StarRating, defaultTestimonials }; 