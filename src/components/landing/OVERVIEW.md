# Landing Components Overview

This folder contains all the components needed to build beautiful, modular landing pages for the SaaS template.

## 📁 Folder Structure

```
src/components/landing/
├── index.ts                          # Main exports file
├── OVERVIEW.md                       # This file - high-level overview
│
├── hero.tsx                          # Current hero component
├── hero-template.tsx                 # Modular hero template system
├── hero-template-example.tsx         # Hero template usage examples
├── README.md                         # Hero template documentation
│
├── service-detail-module.tsx         # Service showcase component
├── use-case-module.tsx              # Customer scenarios component  
├── testimonials-module.tsx          # Social proof component
├── landing-page-config.tsx          # Template-specific content
├── landing-modules-example.tsx      # Modular components examples
├── landing-modules-README.md        # Modular components documentation
│
└── faq.tsx                          # FAQ component
```

## 🎯 Component Categories

### 1. Hero Components
- **`Hero`** - Current production hero (uses HeroTemplate internally)
- **`HeroTemplate`** - Flexible hero template system with variants
- Supporting: `ImageColumn`, `InteractiveColumn`, `DefaultImageDemo`, `ServiceSelector`

### 2. Modular Landing Components
- **`ServiceDetailModule`** - Showcase services/features with icons and CTAs
- **`UseCaseModule`** - Display customer scenarios with metrics
- **`TestimonialsModule`** - Social proof with ratings and avatars
- Supporting: `ServiceCard`, `UseCaseCard`, `TestimonialCard`, `StarRating`

### 3. Other Components
- **`FAQ`** - Frequently asked questions component

### 4. Configuration & Data
- **`landing-page-config.tsx`** - Template-specific services, use cases, and testimonials
- **`landing-modules-example.tsx`** - Usage examples and demos

## 🚀 Quick Start

### Basic Usage
```tsx
import { 
  Hero,
  ServiceDetailModule,
  UseCaseModule,
  TestimonialsModule,
  FAQ
} from "@/components/landing";

export function LandingPage() {
  return (
    <main>
      <Hero />
      <ServiceDetailModule />
      <UseCaseModule />
      <TestimonialsModule />
      <FAQ />
    </main>
  );
}
```

### Custom Configuration
```tsx
import { 
  ServiceDetailModule,
  templateServices,
  templateUseCases,
  templateTestimonials
} from "@/components/landing";

export function CustomLandingPage() {
  return (
    <main>
      <ServiceDetailModule 
        services={templateServices}
        title="Our Core Services"
        variant="grid"
      />
      {/* ... other components */}
    </main>
  );
}
```

## 📖 Documentation

### Detailed Documentation
- **Hero System**: See `README.md` for comprehensive hero template documentation
- **Modular Components**: See `landing-modules-README.md` for detailed API reference

### Examples
- **Live Examples**: Visit `/modules-demo` to see all components in action
- **Code Examples**: Check `landing-modules-example.tsx` for implementation patterns

## 🎨 Design System

All components follow the established design system:
- **Colors**: Uses CSS custom properties (`--primary`, `--muted`, etc.)
- **Typography**: Consistent font hierarchy and text tokens  
- **Spacing**: Standard Tailwind spacing scale
- **Components**: Built on existing UI components (Card, Button, Avatar, etc.)
- **Responsive**: Mobile-first design with proper breakpoints
- **Accessibility**: WCAG 2.1 AA compliant

## 🔧 Customization

### Service Configuration
Create custom services by extending the `Service` interface:
```tsx
const customServices: Service[] = [
  {
    id: "my-service",
    name: "My Custom Service", 
    description: "Description of the service",
    icon: MyIcon,
    features: ["Feature 1", "Feature 2"],
    badge: "Custom",
    href: "/my-service"
  }
];
```

### Layout Variants
Each component supports multiple variants:
- **ServiceDetailModule**: `default`, `grid`, `list`
- **UseCaseModule**: `default`, `showcase`, `compact`
- **TestimonialsModule**: `default`, `featured`, `compact`, `masonry`
- **HeroTemplate**: `default`, `centered`, `reversed`

## 🎯 Usage Guidelines

### When to Use Each Component

**ServiceDetailModule**: 
- Showcasing product features
- Service offerings
- Technical capabilities

**UseCaseModule**:
- Customer success stories
- Industry-specific scenarios
- Results and metrics

**TestimonialsModule**:
- Social proof
- Customer feedback
- Trust building

**HeroTemplate**:
- Landing page headers
- Product introductions
- Call-to-action sections

### Performance Tips
- Use `variant="compact"` for smaller spaces
- Implement lazy loading for below-fold content
- Memoize custom data arrays
- Use the index file for clean imports

## 🏗️ Architecture

### Component Hierarchy
```
LandingPage
├── Hero (uses HeroTemplate)
├── ServiceDetailModule
│   └── ServiceCard[]
├── UseCaseModule  
│   └── UseCaseCard[]
├── TestimonialsModule
│   └── TestimonialCard[]
└── FAQ
```

### Data Flow
1. Configuration (`landing-page-config.tsx`)
2. Component Props (title, description, variant)
3. Data Arrays (services, use cases, testimonials)
4. Individual Cards/Items
5. User Interactions (click handlers)

---

*For specific implementation details, see the individual README files and example components.* 