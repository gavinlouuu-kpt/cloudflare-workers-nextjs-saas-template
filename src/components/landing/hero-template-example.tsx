import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HeroTemplate, 
  ImageColumn, 
  InteractiveColumn, 
  DefaultImageDemo, 
  ServiceSelector 
} from "./hero-template";
import { GITHUB_REPO_URL } from "@/constants";
import Link from "next/link";
import ShinyButton from "@/components/ui/shiny-button";
import { PlayIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

// Example 1: Basic usage with default components
export function BasicHeroExample() {
  return (
    <HeroTemplate>
      <div className="space-y-6">
        <div className="flex justify-center">
          <ShinyButton className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            100% Free & Open Source
          </ShinyButton>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Production-Ready SaaS Template
        </h1>
        <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          A modern, open-source template for building SaaS applications with Next.js 15,
          Cloudflare Workers, and everything you need to launch quickly.
        </p>
      </div>
    </HeroTemplate>
  );
}

// Example 2: Custom image component
export function CustomImageHeroExample() {
  const CustomVideoDemo = () => (
    <Card className="overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 shadow-2xl">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-indigo-900 to-purple-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-semibold">Watch Demo</h3>
                <p className="text-white/80">See our platform in action</p>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              2:30 min
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <HeroTemplate 
      imageComponent={<CustomVideoDemo />}
      variant="reversed"
    >
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          See It In Action
        </h1>
        <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Watch how easy it is to build and deploy your SaaS application.
        </p>
      </div>
    </HeroTemplate>
  );
}

// Example 3: Custom service component with pricing
export function PricingHeroExample() {
  const PricingSelector = () => {
    const plans = [
      {
        name: "Starter",
        price: "$0",
        features: ["Up to 3 projects", "5GB storage", "Community support"],
        popular: false
      },
      {
        name: "Pro",
        price: "$29",
        features: ["Unlimited projects", "100GB storage", "Priority support", "Advanced analytics"],
        popular: true
      },
      {
        name: "Enterprise",
        price: "Custom",
        features: ["Custom deployment", "Unlimited storage", "24/7 support", "SLA guarantee"],
        popular: false
      }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Choose Your Plan</h3>
          <p className="text-muted-foreground">Start free, scale as you grow</p>
        </div>
        
        <div className="space-y-4">
          {plans.map((plan, index) => (
            <Card key={index} className={plan.popular ? "border-indigo-500 relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{plan.price}</div>
                    {plan.price !== "Custom" && <div className="text-sm text-muted-foreground">/month</div>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  size="sm" 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <HeroTemplate 
      serviceComponent={<PricingSelector />}
      variant="default"
    >
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          No hidden fees, no surprises. Choose the plan that works for your business.
        </p>
      </div>
    </HeroTemplate>
  );
}

// Example 4: Centered layout without columns
export function CenteredHeroExample() {
  return (
    <HeroTemplate 
      variant="centered"
      showImageColumn={false}
      showInteractiveColumn={false}
    >
      <div className="space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-xl leading-8 text-muted-foreground">
            We're working on something amazing. Be the first to know when we launch.
          </p>
        </div>
        
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 border border-input rounded-lg bg-background"
            />
            <Button>Notify Me</Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            No spam, unsubscribe at any time.
          </p>
        </div>
      </div>
    </HeroTemplate>
  );
}

// Example 5: Using individual column components for custom layouts
export function CustomLayoutExample() {
  return (
    <div className="relative isolate pt-14 dark:bg-gray-900">
      <div className="pt-20 pb-24 sm:pt-20 sm:pb-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Custom three-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <ImageColumn className="lg:col-span-1">
              <DefaultImageDemo />
            </ImageColumn>
            
            <div className="lg:col-span-1 space-y-6 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                The Complete Solution
              </h1>
              <p className="text-lg leading-7 text-muted-foreground">
                Everything you need in one integrated platform.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg">Get Started</Button>
                </Link>
                <a href={GITHUB_REPO_URL} target="_blank">
                  <Button variant="outline" size="lg">View Code</Button>
                </a>
              </div>
            </div>
            
            <InteractiveColumn className="lg:col-span-1">
              <ServiceSelector />
            </InteractiveColumn>
          </div>
        </div>
      </div>
    </div>
  );
} 