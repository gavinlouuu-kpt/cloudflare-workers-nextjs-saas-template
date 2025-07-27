import { Metadata } from "next";
import {
  BasicLandingPageExample,
  CustomServicesExample,
  UseCaseShowcaseExample,
  FeaturedTestimonialsExample,
  CompactModulesExample,
  InteractiveLandingExample,
  SingleColumnLandingExample,
} from "@/components/landing/landing-modules-example";

export const metadata: Metadata = {
  title: "Modular Components Demo - Your Custom SaaS Project",
  description: "Demonstration of the modular landing page components with various layout options and customization examples.",
};

export default function ModulesDemoPage() {
  return (
    <main className="space-y-32">
      {/* Section 1: Basic Complete Landing Page */}
      <section>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Complete Landing Page Example
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                A full landing page using all modular components with the default SaaS template configuration.
              </p>
            </div>
          </div>
        </div>
        <BasicLandingPageExample />
      </section>

      {/* Section 2: Custom Services */}
      <section>
        <div className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Custom Services Configuration
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                ServiceDetailModule with custom services and grid layout variant.
              </p>
            </div>
          </div>
        </div>
        <CustomServicesExample />
      </section>

      {/* Section 3: Use Case Showcase */}
      <section>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Use Case Showcase Variant
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                UseCaseModule with showcase variant for highlighting key customer scenarios.
              </p>
            </div>
          </div>
        </div>
        <UseCaseShowcaseExample />
      </section>

      {/* Section 4: Featured Testimonials */}
      <section>
        <div className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Featured Testimonials Layout
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                TestimonialsModule with featured variant for highlighting key customer feedback.
              </p>
            </div>
          </div>
        </div>
        <FeaturedTestimonialsExample />
      </section>

      {/* Section 5: Compact Layouts */}
      <section>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Compact Module Variants
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                All modules in compact variants for constrained spaces and sidebar usage.
              </p>
            </div>
          </div>
        </div>
        <CompactModulesExample />
      </section>

      {/* Section 6: Interactive Landing */}
      <section>
        <div className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Interactive Landing Page
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Demonstrates state management and interaction between modular components.
              </p>
            </div>
          </div>
        </div>
        <InteractiveLandingExample />
      </section>

      {/* Section 7: Single Column Layout */}
      <section>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Single Column Layout
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Focused, single-purpose landing page design with minimal distractions.
              </p>
            </div>
          </div>
        </div>
        <SingleColumnLandingExample />
      </section>

      {/* Documentation CTA */}
      <section className="py-24 bg-indigo-50 dark:bg-indigo-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Use the Modular System?
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Check out the comprehensive documentation and start building your own landing pages with these modular components.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <a
                href="/landing-modules-README.md"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                View Documentation
              </a>
              <a
                href="/"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
              >
                Back to Home <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 