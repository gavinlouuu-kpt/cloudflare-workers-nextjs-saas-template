# Modular Landing Page Components

A comprehensive collection of modular, accessible landing page components designed to work seamlessly with the existing Next.js SaaS template architecture. These components follow the established design system and can be combined to create beautiful, functional landing pages.

## 🚀 Quick Start

```tsx
import { ServiceDetailModule, UseCaseModule, TestimonialsModule } from "@/components/landing";

export function LandingPage() {
  return (
    <div className="space-y-0">
      <ServiceDetailModule />
      <UseCaseModule />
      <TestimonialsModule />
    </div>
  );
}
```

## 📋 Components Overview

### Core Modules

- **`ServiceDetailModule`** - Showcase services/features with icons, descriptions, and CTAs
- **`UseCaseModule`** - Display customer scenarios with visual examples and metrics
- **`TestimonialsModule`** - Social proof with customer quotes, avatars, and ratings
- **`HeroTemplate`** - Flexible hero section (existing component)

### Supporting Components

- **`ServiceCard`** - Individual service display card
- **`UseCaseCard`** - Customer scenario card with metrics
- **`TestimonialCard`** - Customer quote with author info
- **`StarRating`** - Configurable star rating display

## 🎛️ API Reference

### ServiceDetailModule Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `services` | `Service[]` | `defaultServices` | Array of service objects |
| `title` | `string` | `"Core Services"` | Main heading |
| `subtitle` | `string` | `"Everything You Need"` | Section subtitle |
| `description` | `string` | Auto-generated | Section description |
| `variant` | `"default" \| "grid" \| "list"` | `"default"` | Layout variant |
| `showCTA` | `boolean` | `true` | Show call-to-action buttons |
| `ctaText` | `string` | `"Learn More"` | CTA button text |
| `onServiceClick` | `(service: Service) => void` | - | Click handler |

#### Service Interface

```tsx
interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  badge?: string;
  href?: string;
}
```

### UseCaseModule Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `useCases` | `UseCase[]` | `defaultUseCases` | Array of use case objects |
| `title` | `string` | `"Success Stories"` | Main heading |
| `subtitle` | `string` | `"Proven Results"` | Section subtitle |
| `description` | `string` | Auto-generated | Section description |
| `variant` | `"default" \| "showcase" \| "compact"` | `"default"` | Layout variant |
| `showMetrics` | `boolean` | `true` | Show metrics/results |
| `showCTA` | `boolean` | `true` | Show call-to-action buttons |
| `ctaText` | `string` | `"View Case Study"` | CTA button text |
| `onUseCaseClick` | `(useCase: UseCase) => void` | - | Click handler |

#### UseCase Interface

```tsx
interface UseCase {
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
```

### TestimonialsModule Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `testimonials` | `Testimonial[]` | `defaultTestimonials` | Array of testimonial objects |
| `title` | `string` | `"What Our Customers Say"` | Main heading |
| `subtitle` | `string` | `"Trusted by Developers"` | Section subtitle |
| `description` | `string` | Auto-generated | Section description |
| `variant` | `"default" \| "featured" \| "compact" \| "masonry"` | `"default"` | Layout variant |
| `showRatings` | `boolean` | `true` | Show star ratings |
| `showCompanyLogos` | `boolean` | `true` | Show company logos |
| `maxTestimonials` | `number` | `6` | Maximum testimonials to display |
| `onTestimonialClick` | `(testimonial: Testimonial) => void` | - | Click handler |

#### Testimonial Interface

```tsx
interface Testimonial {
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
```

## 🎨 Layout Variants

### ServiceDetailModule Variants

#### Default Layout (3-column grid)
```tsx
<ServiceDetailModule variant="default" />
```

#### Grid Layout (4-column grid)
```tsx
<ServiceDetailModule variant="grid" />
```

#### List Layout (vertical stack)
```tsx
<ServiceDetailModule variant="list" />
```

### UseCaseModule Variants

#### Default Layout
```tsx
<UseCaseModule variant="default" />
```

#### Showcase Layout (featured cases)
```tsx
<UseCaseModule variant="showcase" />
```

#### Compact Layout (smaller cards)
```tsx
<UseCaseModule variant="compact" />
```

### TestimonialsModule Variants

#### Default Layout
```tsx
<TestimonialsModule variant="default" />
```

#### Featured Layout (mixed sizes)
```tsx
<TestimonialsModule variant="featured" />
```

#### Compact Layout (smaller cards)
```tsx
<TestimonialsModule variant="compact" />
```

#### Masonry Layout (variable heights)
```tsx
<TestimonialsModule variant="masonry" />
```

## 🔧 Customization Examples

### Custom Services

```tsx
const customServices = [
  {
    id: "api-first",
    name: "API-First Architecture",
    description: "RESTful APIs with comprehensive documentation.",
    icon: ApiIcon,
    features: ["REST APIs", "OpenAPI", "Client SDKs", "Versioning"],
    badge: "Developer Ready",
    href: "/api-docs"
  }
];

<ServiceDetailModule services={customServices} />
```

### Custom Use Cases

```tsx
const customUseCases = [
  {
    id: "fintech-startup",
    title: "FinTech Startup",
    description: "Rapid deployment of secure financial platform.",
    scenario: "A fintech startup needed to launch quickly with full compliance.",
    industry: "Financial Services",
    tags: ["Compliance", "Security", "Fast Launch"],
    benefits: ["SOC 2 compliant", "Bank-grade security", "3-week launch"],
    metrics: [
      { label: "Compliance Score", value: "100%", improvement: "Full SOC 2" },
      { label: "Launch Time", value: "3 weeks", improvement: "80% faster" }
    ]
  }
];

<UseCaseModule useCases={customUseCases} />
```

### Custom Testimonials

```tsx
const customTestimonials = [
  {
    id: "happy-customer",
    content: "Amazing platform that saved us months of development.",
    author: {
      name: "John Doe",
      title: "CTO",
      company: "TechCorp",
      initials: "JD"
    },
    rating: 5,
    featured: true,
    tags: ["Development Speed"]
  }
];

<TestimonialsModule testimonials={customTestimonials} />
```

## 🎨 Design System Integration

### Color Scheme
- Follows existing CSS custom properties (`--primary`, `--muted`, etc.)
- Consistent indigo accent color (`text-indigo-600 dark:text-indigo-400`)
- Automatic dark/light mode support

### Typography
- Uses established font hierarchy
- Consistent text sizes and weights
- Proper text color tokens (`text-muted-foreground`, etc.)

### Spacing
- Standard Tailwind spacing scale
- Consistent padding and margins
- Mobile-first responsive design

### Animations
- Subtle hover effects with `transition-all duration-300`
- Transform animations (`hover:-translate-y-1`)
- Opacity transitions for interactive elements

## ♿ Accessibility Features

### Built-in Accessibility
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant

### Implementation Examples

```tsx
// Service card with accessibility
<Card 
  onClick={handleClick}
  className="cursor-pointer focus:ring-2 focus:ring-indigo-500"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  <CardHeader>
    <CardTitle id="service-title">{service.name}</CardTitle>
    <CardDescription aria-describedby="service-title">
      {service.description}
    </CardDescription>
  </CardHeader>
</Card>

// Star rating with screen reader support
<StarRating rating={5} aria-label="5 out of 5 stars" />

// Avatar with proper alt text
<Avatar>
  <AvatarImage src={avatar} alt={`${name}'s profile picture`} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

## 📱 Mobile-First Responsive Design

### Breakpoint Strategy
```tsx
// Mobile: single column
// Tablet: 2 columns  
// Desktop: 3-4 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Responsive text sizes
className="text-base sm:text-lg lg:text-xl"

// Responsive spacing
className="py-16 sm:py-20 lg:py-24"
```

### Touch Interactions
- Minimum 44px touch targets
- Hover states adapted for touch
- Smooth scrolling and gestures

## ⚡ Performance Optimization

### Lazy Loading Support
```tsx
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TestimonialsModule = lazy(() => import('./testimonials-module'));

<Suspense fallback={<Skeleton className="h-96 w-full" />}>
  <TestimonialsModule />
</Suspense>
```

### Memoization
```tsx
import { memo } from 'react';

const OptimizedServiceCard = memo(ServiceCard);
const OptimizedTestimonialCard = memo(TestimonialCard);
```

### Image Optimization
```tsx
import Image from 'next/image';

// In use case cards
<Image
  src={useCase.imageUrl}
  alt={useCase.title}
  width={600}
  height={400}
  className="object-cover"
  loading="lazy"
/>
```

## 🔧 Advanced Usage Patterns

### State Management Integration

```tsx
import { useCallback } from 'react';

function InteractiveLanding() {
  const [selectedService, setSelectedService] = useState(null);
  
  const handleServiceClick = useCallback((service) => {
    setSelectedService(service);
    // Analytics tracking
    analytics.track('service_selected', { service: service.id });
  }, []);

  return (
    <ServiceDetailModule 
      onServiceClick={handleServiceClick}
      // Highlight selected service
      services={services.map(s => ({
        ...s,
        selected: s.id === selectedService?.id
      }))}
    />
  );
}
```

### Analytics Integration

```tsx
const handleTestimonialClick = useCallback((testimonial) => {
  // Track engagement
  analytics.track('testimonial_clicked', {
    testimonial_id: testimonial.id,
    author: testimonial.author.name,
    company: testimonial.author.company
  });
  
  // Navigate to case study
  if (testimonial.caseStudyUrl) {
    window.open(testimonial.caseStudyUrl, '_blank');
  }
}, []);
```

### A/B Testing Support

```tsx
function ABTestLanding({ variant }) {
  return (
    <div>
      <ServiceDetailModule 
        variant={variant === 'control' ? 'default' : 'grid'}
        title={variant === 'control' ? 'Features' : 'Core Services'}
      />
      
      <TestimonialsModule
        variant={variant === 'control' ? 'default' : 'featured'}
        maxTestimonials={variant === 'control' ? 3 : 6}
      />
    </div>
  );
}
```

## 🧪 Testing Examples

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ServiceDetailModule } from './service-detail-module';

test('service click handler is called', () => {
  const handleClick = jest.fn();
  const services = [{ id: 'test', name: 'Test Service', ... }];
  
  render(
    <ServiceDetailModule 
      services={services} 
      onServiceClick={handleClick} 
    />
  );
  
  fireEvent.click(screen.getByText('Test Service'));
  expect(handleClick).toHaveBeenCalledWith(services[0]);
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

test('testimonials module has no accessibility violations', async () => {
  const { container } = render(<TestimonialsModule />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Integration Examples

See `src/components/landing/landing-modules-example.tsx` for comprehensive usage examples including:

- Basic landing page composition
- Custom data and configuration
- Interactive state management
- Responsive layout variations
- Single-column layouts
- Compact variants for constrained spaces

## 🤝 Contributing

When extending these modules:

1. **Maintain TypeScript interfaces** - Keep type safety
2. **Follow naming conventions** - Use existing patterns
3. **Ensure accessibility** - Test with screen readers
4. **Add responsive design** - Mobile-first approach
5. **Include proper documentation** - Update interfaces and examples
6. **Test thoroughly** - Unit tests and integration tests

## 🏗️ Architecture Notes

### Component Structure
```
landing-module/
├── index.tsx              # Main component
├── types.ts              # TypeScript interfaces  
├── data.ts               # Default data
├── subcomponents/        # Supporting components
├── examples/            # Usage examples
└── tests/               # Component tests
```

### Design Patterns
- **Composition over Configuration** - Flexible component composition
- **Props-Based Customization** - Extensive prop interfaces
- **Fallback Defaults** - Graceful degradation
- **Event-Driven Architecture** - Callback-based interactions

---

*Built with ❤️ for the Next.js SaaS Template ecosystem* 