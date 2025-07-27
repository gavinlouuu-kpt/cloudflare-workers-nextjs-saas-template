import { Metadata } from "next";
import { 
  BasicHeroExample,
  CustomImageHeroExample, 
  PricingHeroExample,
  CenteredHeroExample,
  CustomLayoutExample 
} from "@/components/landing/hero-template-example";

export const metadata: Metadata = {
  title: "Hero Template Demo - Your Custom SaaS Project",
  description: "Demonstration of the modular hero section template with various layout options and customization examples.",
};

export default function HeroDemoPage() {
  return (
    <main className="space-y-32">
      {/* Section 1: Basic Example */}
      <section>
        <BasicHeroExample />
      </section>

      {/* Section 2: Custom Image Example */}
      <section>
        <CustomImageHeroExample />
      </section>

      {/* Section 3: Pricing Example */}
      <section>
        <PricingHeroExample />
      </section>

      {/* Section 4: Centered Layout */}
      <section>
        <CenteredHeroExample />
      </section>

      {/* Section 5: Custom Three-Column Layout */}
      <section>
        <CustomLayoutExample />
      </section>

      {/* Documentation CTA */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Use the Hero Template?
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Check out the comprehensive documentation and examples to get started with your own hero sections.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="https://github.com/your-repo/tree/main/src/components/landing"
                target="_blank"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                View Documentation
              </a>
              <a 
                href="https://github.com/your-repo/blob/main/src/components/landing/hero-template.tsx"
                target="_blank"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                View Source Code
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 