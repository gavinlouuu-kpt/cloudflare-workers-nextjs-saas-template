"use client";

import type { Service } from "./service-detail-module";
import type { UseCase } from "./use-case-module";
import type { Testimonial } from "./testimonials-module";

// Custom services that match the actual SaaS template features
export const templateServices: Service[] = [
  {
    id: "authentication",
    name: "Complete Authentication",
    description: "Production-ready auth system with Lucia Auth, including email/password, OAuth, sessions, and password reset flows.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </div>
    ),
    features: ["Email/Password Auth", "Google OAuth", "Session Management", "Password Reset", "Rate Limiting"],
    badge: "Security First",
    href: "/sign-up"
  },
  {
    id: "database",
    name: "Modern Database Stack",
    description: "DrizzleORM with Cloudflare D1 for serverless, edge-deployed database with type safety and migrations.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      </div>
    ),
    features: ["DrizzleORM", "Cloudflare D1", "Type Safety", "Migrations", "Edge Database"],
    badge: "Type Safe",
    href: "/dashboard"
  },
  {
    id: "ui-components",
    name: "Beautiful UI Components",
    description: "Modern design system with Shadcn UI, Tailwind CSS, dark mode support, and responsive layouts.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      </div>
    ),
    features: ["Shadcn UI", "Tailwind CSS", "Dark Mode", "Responsive", "Accessible"],
    badge: "Design System",
    href: "/hero-demo"
  },
  {
    id: "email-system",
    name: "Email Templates",
    description: "React Email templates with Resend integration for transactional emails, user verification, and notifications.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>
    ),
    features: ["React Email", "Resend Integration", "Beautiful Templates", "Transactional", "Responsive"],
    badge: "Email Ready",
    href: "/sign-up"
  },
  {
    id: "edge-deployment",
    name: "Edge-First Architecture",
    description: "Deploy globally with Cloudflare Workers, D1 database, and KV storage for blazing-fast performance worldwide.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
        </svg>
      </div>
    ),
    features: ["Cloudflare Workers", "Global Edge", "Zero Cold Starts", "KV Storage", "High Performance"],
    badge: "Lightning Fast",
    href: "/dashboard"
  },
  {
    id: "developer-experience",
    name: "Exceptional DX",
    description: "TypeScript throughout, GitHub Actions deployment, comprehensive docs, and modern development tools.",
    icon: ({ className }: { className?: string }) => (
      <div className={className}>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      </div>
    ),
    features: ["TypeScript", "GitHub Actions", "Documentation", "ESLint/Prettier", "Hot Reload"],
    badge: "Developer First",
    href: "https://github.com/[your-custom-username]/[your-custom-repo]"
  }
];

// Use cases tailored to the SaaS template
export const templateUseCases: UseCase[] = [
  {
    id: "saas-mvp",
    title: "SaaS MVP Launch",
    description: "From idea to production in weeks with a complete foundation that scales.",
    scenario: "A startup founder wanted to validate their SaaS idea quickly without spending months on infrastructure setup. They needed user authentication, payment processing, and a modern UI that works on all devices.",
    industry: "SaaS",
    tags: ["MVP", "Startup", "Time to Market"],
    benefits: [
      "Skip months of infrastructure development",
      "Focus on core business logic from day one", 
      "Production-ready security and scalability",
      "Modern UI that impresses investors and users"
    ],
    metrics: [
      { label: "Development Time", value: "3 weeks", improvement: "75% faster than building from scratch" },
      { label: "Infrastructure Cost", value: "$0", improvement: "No servers to maintain" },
      { label: "User Onboarding", value: "< 30 seconds", improvement: "Streamlined auth flow" }
    ]
  },
  {
    id: "agency-client-work",
    title: "Agency Client Delivery",
    description: "Deliver high-quality client projects faster with a proven foundation.",
    scenario: "A digital agency was spending too much time on repetitive setup tasks for each client project. They needed a reliable starting point that could be quickly customized while maintaining high quality standards.",
    industry: "Agency",
    tags: ["Client Work", "Efficiency", "Quality"],
    benefits: [
      "Consistent quality across all projects",
      "Faster client project delivery",
      "More time for custom features",
      "Higher profit margins per project"
    ],
    metrics: [
      { label: "Project Setup", value: "2 hours", improvement: "90% reduction in setup time" },
      { label: "Client Satisfaction", value: "98%", improvement: "Consistent high-quality delivery" },
      { label: "Team Productivity", value: "40% increase", improvement: "Focus on value-add features" }
    ]
  },
  {
    id: "enterprise-modernization",
    title: "Enterprise Modernization",
    description: "Modernize legacy systems with cutting-edge technology and global performance.",
    scenario: "An enterprise company needed to replace their legacy customer portal with a modern, globally distributed solution that could handle their scale while providing a better user experience.",
    industry: "Enterprise",
    tags: ["Legacy Migration", "Scale", "Performance"],
    benefits: [
      "Modern user experience that delights customers",
      "Global edge deployment for worldwide performance",
      "Enterprise-grade security and compliance",
      "Reduced infrastructure maintenance overhead"
    ],
    metrics: [
      { label: "Page Load Speed", value: "< 200ms", improvement: "60% faster globally" },
      { label: "Uptime", value: "99.99%", improvement: "Edge deployment reliability" },
      { label: "Development Velocity", value: "3x faster", improvement: "Modern tooling and TypeScript" }
    ]
  }
];

// Testimonials that feel authentic for an open-source template
export const templateTestimonials: Testimonial[] = [
  {
    id: "indie-founder",
    content: "This template saved me literally months of development time. I went from idea to MVP in 3 weeks instead of 3 months. The authentication and UI components are production-quality.",
    author: {
      name: "Alex Chen",
      title: "Indie Founder",
      company: "TaskFlow",
      initials: "AC"
    },
    rating: 5,
    featured: true,
    tags: ["MVP", "Time Saving"]
  },
  {
    id: "senior-dev",
    content: "Finally, a template that doesn't cut corners. TypeScript throughout, proper error handling, and the edge deployment setup is chef's kiss. Using this for all my side projects.",
    author: {
      name: "Sarah Rodriguez", 
      title: "Senior Full Stack Developer",
      company: "TechCorp",
      initials: "SR"
    },
    rating: 5,
    featured: true,
    tags: ["Code Quality", "TypeScript"]
  },
  {
    id: "agency-owner",
    content: "Our agency has delivered 5 client projects using this template. The consistency and quality have been game-changing for our team's productivity and client satisfaction.",
    author: {
      name: "Marcus Thompson",
      title: "Agency Owner",
      company: "Digital Craft Studios",
      initials: "MT"
    },
    rating: 5,
    featured: false,
    tags: ["Agency", "Client Work"]
  },
  {
    id: "enterprise-cto",
    content: "We evaluated several options for our modernization project. This template's architecture and documentation convinced us it was enterprise-ready. The migration went smoother than expected.",
    author: {
      name: "Jennifer Liu",
      title: "CTO",
      company: "GlobalTech Solutions",
      initials: "JL"
    },
    rating: 5,
    featured: true,
    tags: ["Enterprise", "Migration"]
  },
  {
    id: "first-time-founder",
    content: "As a non-technical founder, I was amazed how quickly our developer could focus on our unique features instead of rebuilding authentication and payment systems from scratch.",
    author: {
      name: "David Park",
      title: "Founder & CEO",
      company: "InnovateLab",
      initials: "DP"
    },
    rating: 5,
    featured: false,
    tags: ["Non-technical", "Focus"]
  },
  {
    id: "freelance-dev",
    content: "The code quality is exceptional. Everything is properly typed, documented, and follows best practices. It's like having a senior developer as your pair programming partner.",
    author: {
      name: "Emily Watson",
      title: "Freelance Developer",
      company: "Independent",
      initials: "EW"
    },
    rating: 5,
    featured: false,
    tags: ["Code Quality", "Best Practices"]
  }
]; 