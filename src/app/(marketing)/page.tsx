import { Metadata } from "next";
import { 
  Hero,
  ServiceDetailModule,
  UseCaseModule, 
  TestimonialsModule,
  FAQ,
  templateServices,
  templateUseCases,
  templateTestimonials
} from "@/components/landing";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiceDetailModule 
        services={templateServices}
        title="Everything You Need to Launch"
        subtitle="Production Ready"
        description="Skip months of development with a complete, production-ready foundation that includes authentication, database, UI components, and deployment."
      />
      <UseCaseModule 
        useCases={templateUseCases}
        title="Trusted by Developers Worldwide"
        subtitle="Success Stories"
        description="See how developers and teams are using this template to ship faster and focus on what matters most."
      />
      <TestimonialsModule 
        testimonials={templateTestimonials}
        variant="featured"
        title="Loved by the Community"
        subtitle="Developer Testimonials"
        description="Join thousands of developers who've accelerated their projects with our template."
      />
      <FAQ />
    </main>
  );
}
