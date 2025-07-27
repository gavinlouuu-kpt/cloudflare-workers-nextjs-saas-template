// Hero Components
export { HeroTemplate, ImageColumn, InteractiveColumn, DefaultImageDemo, ServiceSelector } from './hero-template';
export { Hero } from './hero';

// Modular Landing Page Components  
export { ServiceDetailModule, ServiceCard, defaultServices } from './service-detail-module';
export { UseCaseModule, UseCaseCard, defaultUseCases } from './use-case-module';
export { TestimonialsModule, TestimonialCard, StarRating, defaultTestimonials } from './testimonials-module';

// Other Landing Components
export { FAQ } from './faq';

// Configuration and Examples
export { 
  templateServices, 
  templateUseCases, 
  templateTestimonials 
} from './landing-page-config';

// Type Exports
export type { Service } from './service-detail-module';
export type { UseCase } from './use-case-module';  
export type { Testimonial } from './testimonials-module';
export type { 
  HeroTemplateProps,
  ImageColumnProps,
  InteractiveColumnProps
} from './hero-template'; 