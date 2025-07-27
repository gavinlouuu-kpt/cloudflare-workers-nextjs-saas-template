# Hero Template System

A modular, accessible hero section template with two-column layout support that integrates seamlessly with the existing Next.js SaaS template architecture.

## 🚀 Quick Start

```tsx
import { HeroTemplate } from "@/components/landing/hero-template";

export function MyHero() {
  return (
    <HeroTemplate>
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">Welcome to Our Platform</h1>
        <p className="text-lg text-muted-foreground">
          Build amazing applications with our powerful tools.
        </p>
      </div>
    </HeroTemplate>
  );
}
```

## 📋 Components Overview

### Core Components

- **`HeroTemplate`** - Main container with flexible layout options
- **`ImageColumn`** - Left column for images/demos with fallback
- **`InteractiveColumn`** - Right column for interactive elements with fallback
- **`DefaultImageDemo`** - Animated app interface mockup
- **`ServiceSelector`** - Interactive service selection component

## 🎛️ API Reference

### HeroTemplate Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageComponent` | `React.ReactNode` | `<DefaultImageDemo />` | Custom component for image column |
| `serviceComponent` | `React.ReactNode` | `<ServiceSelector />` | Custom component for interactive column |
| `variant` | `"default" \| "centered" \| "reversed"` | `"default"` | Layout variant |
| `showImageColumn` | `boolean` | `true` | Show/hide image column |
| `showInteractiveColumn` | `boolean` | `true` | Show/hide interactive column |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Content above columns |

### Layout Variants

#### Default Layout
```tsx
<HeroTemplate variant="default">
  {/* Image Column (Left) | Interactive Column (Right) */}
</HeroTemplate>
```

#### Reversed Layout
```tsx
<HeroTemplate variant="reversed">
  {/* Interactive Column (Left) | Image Column (Right) */}
</HeroTemplate>
```

#### Centered Layout
```tsx
<HeroTemplate variant="centered">
  {/* Single centered column with stacked content */}
</HeroTemplate>
```

## 🔧 Integration Patterns

### 1. Props-Based Integration

Pass custom components via props:

```tsx
import { HeroTemplate } from "@/components/landing/hero-template";

const MyCustomImage = () => (
  <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
    <video autoPlay muted loop className="w-full h-full object-cover rounded-lg">
      <source src="/demo-video.mp4" type="video/mp4" />
    </video>
  </div>
);

const MyCustomService = () => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">Get Started Today</h3>
    <Button size="lg" className="w-full">Start Free Trial</Button>
  </div>
);

export function CustomHero() {
  return (
    <HeroTemplate 
      imageComponent={<MyCustomImage />}
      serviceComponent={<MyCustomService />}
    >
      <h1 className="text-5xl font-bold text-center">
        Revolutionary Platform
      </h1>
    </HeroTemplate>
  );
}
```

### 2. Individual Column Usage

Use column components separately for custom layouts:

```tsx
import { ImageColumn, InteractiveColumn } from "@/components/landing/hero-template";

export function CustomLayout() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-3 gap-8">
        <ImageColumn className="lg:col-span-1">
          <MyCustomDemo />
        </ImageColumn>
        
        <div className="lg:col-span-1 text-center">
          <h1>Centered Content</h1>
        </div>
        
        <InteractiveColumn className="lg:col-span-1">
          <MyCustomForm />
        </InteractiveColumn>
      </div>
    </div>
  );
}
```

### 3. Slot-Based System

Use children for flexible content composition:

```tsx
<HeroTemplate>
  <div className="text-center space-y-6">
    <Badge>New Feature</Badge>
    <h1 className="text-6xl font-bold">Game Changer</h1>
    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
      Transform your workflow with our latest innovation.
    </p>
    <div className="flex gap-4 justify-center">
      <Button size="lg">Get Started</Button>
      <Button variant="outline" size="lg">Learn More</Button>
    </div>
  </div>
</HeroTemplate>
```

## 🎨 Design System Integration

### CSS Methodology
- Uses Tailwind CSS with design tokens from `globals.css`
- Follows existing BEM-like component naming
- Maintains theme consistency via CSS variables

### Theme Compliance
```tsx
// Automatic dark/light mode support
<div className="bg-background text-foreground border-border">
  <h1 className="text-primary">Themed Content</h1>
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

### Responsive Breakpoints
```tsx
// Mobile-first responsive design
className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8"

// Standard breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
```

## ♿ Accessibility Features

### Built-in Accessibility
- **Focus Management**: Proper focus indicators and keyboard navigation
- **ARIA Labels**: Screen reader support with descriptive labels
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Color Contrast**: WCAG AA compliant color combinations

### Implementation Examples
```tsx
// Service selector with accessibility
<button 
  aria-pressed={isSelected}
  aria-describedby="service-description"
  className="focus:ring-2 focus:ring-indigo-500"
>
  <div id="service-description">Service details</div>
</button>

// Image with proper alt text
<img 
  src="/demo.jpg" 
  alt="Dashboard interface showing analytics data"
  className="w-full h-auto"
/>
```

## ⚡ Performance Optimizations

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<HeroTemplate 
  imageComponent={
    <Suspense fallback={<Skeleton className="w-full h-64" />}>
      <HeavyComponent />
    </Suspense>
  }
/>
```

### Memoization
```tsx
import { memo } from 'react';

const OptimizedServiceSelector = memo(ServiceSelector);

<HeroTemplate serviceComponent={<OptimizedServiceSelector />} />
```

### Image Optimization
```tsx
import Image from 'next/image';

const OptimizedImageDemo = () => (
  <Image
    src="/demo.jpg"
    alt="Product demo"
    width={600}
    height={400}
    priority
    className="rounded-lg"
  />
);
```

## 📱 Mobile-First Responsive Behavior

### Automatic Stacking
```tsx
// Desktop: side-by-side columns
// Mobile: stacked layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <ImageColumn />      {/* Stacks first on mobile */}
  <InteractiveColumn /> {/* Stacks second on mobile */}
</div>
```

### Touch Interactions
```tsx
// Touch-friendly interactive elements
<button className="min-h-[44px] min-w-[44px] touch-manipulation">
  Touch Target
</button>
```

## 🛠️ Customization Examples

### Custom Color Schemes
```tsx
<HeroTemplate className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
  <div className="text-center">
    <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
      Emerald Theme
    </h1>
  </div>
</HeroTemplate>
```

### Animation Variants
```tsx
import { motion } from 'framer-motion';

const AnimatedHero = () => (
  <HeroTemplate
    imageComponent={
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DefaultImageDemo />
      </motion.div>
    }
  />
);
```

### Configuration-Based Setup
```tsx
// config/hero.config.ts
export const heroConfig = {
  variant: "default" as const,
  showBranding: true,
  customTheme: {
    primary: "indigo",
    accent: "purple"
  }
};

// Component usage
<HeroTemplate variant={heroConfig.variant}>
  {heroConfig.showBranding && <BrandingBadge />}
  <StyledContent theme={heroConfig.customTheme} />
</HeroTemplate>
```

## 🔍 Troubleshooting

### Common Issues

**Layout Breaking on Mobile**
```tsx
// ❌ Incorrect - fixed widths
<div className="w-[500px]">Content</div>

// ✅ Correct - responsive widths  
<div className="w-full max-w-lg">Content</div>
```

**Missing Fallbacks**
```tsx
// ❌ Risk of empty columns
<HeroTemplate imageComponent={null} />

// ✅ Proper fallback handling
<HeroTemplate imageComponent={image || <DefaultImageDemo />} />
```

**Theme Inconsistencies**
```tsx
// ❌ Hard-coded colors
<div className="bg-white text-black">

// ✅ Theme-aware colors
<div className="bg-background text-foreground">
```

## 📚 More Examples

See `src/components/landing/hero-template-example.tsx` for comprehensive usage examples including:

- Basic usage with defaults
- Custom image components  
- Pricing integration
- Centered layouts
- Complex multi-column layouts

## 🤝 Contributing

When extending the hero template:

1. Maintain TypeScript interfaces
2. Follow existing naming conventions  
3. Ensure accessibility compliance
4. Add responsive design considerations
5. Include proper error boundaries
6. Document new props and variants

---

*Built with ❤️ for the Next.js SaaS Template ecosystem* 