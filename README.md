# Cloudflare Workers SaaS Template

[![.github/workflows/deploy.yml](https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template/actions/workflows/deploy.yml/badge.svg)](https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template/actions/workflows/deploy.yml)

# [Live Demo](https://nextjs-saas-template.agenticdev.agency/sign-up)
# [Github Repo](https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template)

This is a SaaS template for Cloudflare Workers. It uses the [OpenNext](https://opennext.js.org/cloudflare) framework to build a SaaS application.

Have a look at the [project plan](./cursor-docs/project-plan.md) to get an overview of the project.

> [!TIP]
> This template is brought to you by 👉 [AgenticDev](https://agenticdev.agency/?ref=github-readme-nextjs-template) 👈 - where we help businesses automate operations and boost productivity through custom AI implementations. Just like this open-source project demonstrates technical excellence, we deliver:
>
> - Process automation with LLM-powered workflows
> - AI strategy consulting for sustainable scaling
> - Custom SaaS development using cutting-edge stacks
>
> Hundrets of developers already trust our codebase - Just Imagine what we could build for your business.

# Supported Features:

- 🔐 Authentication with Lucia Auth
  - 📧 Email/Password Sign In
  - 📝 Email/Password Sign Up
  - 🔑 WebAuthn/Passkey Authentication
  - 🌐 Google OAuth/SSO Integration
  - 🔄 Forgot Password Flow
  - 🔒 Change Password
  - ✉️ Email Verification
  - 🗝️ Session Management with Cloudflare KV
  - 🤖 Turnstile Captcha Integration
  - ⚡ Rate Limiting for Auth Endpoints
  - 🛡️ Protected Routes and Layouts
  - 📋 Session Listing and Management
  - 🔒 Anti-Disposable Email Protection
- 💾 Database with Drizzle and Cloudflare D1
  - 🏗️ Type-safe Database Operations
  - 🔄 Automatic Migration Generation
  - 💻 SQLite for Local Development
  - ⚡ Efficient Data Fetching
  - 🔍 Type-safe Queries
- 📨 Email Service with React Email and Resend or Brevo
  - 🎨 Beautiful Email Templates
  - 👀 Email Preview Mode
  - 🔧 Local Email Development Server
  - 📬 Transactional Emails
  - ✉️ Email Verification Flow
  - 📱 Responsive Email Templates
- 🚀 Deployment with Github Actions
  - ⚙️ Automatic Deployments
  - 🔐 Environment Variables Management
  - 📦 Database Migrations
  - 🔄 Comprehensive CI/CD Pipeline
  - 🧹 Cache Purging
  - ✅ Type Checking
- 🎨 Modern UI
  - 🎨 Tailwind CSS
  - 🧩 Shadcn UI Components
  - 🌓 Dark/Light Mode
  - 📱 Responsive Design
  - ⚡ Loading States and Animations
  - 🔔 Toast Notifications
  - ⚙️ Settings Dashboard
  - 🏠 Landing Page
  - ✨ Beautiful Email Templates
  - 👤 Profile Settings Page
  - 🎯 Form Validation States
- 💳 Credit Billing System
  - 💰 Credit-based Pricing Model
  - 🔄 Monthly Credit Refresh
  - 📊 Credit Usage Tracking
  - 💳 Stripe Payment Integration
  - 📜 Transaction History
  - 📦 Credit Package Management
  - 💸 Pay-as-you-go Model
  - 📈 Usage Analytics
  - 🧾 Automatic Receipt System
    - 📧 Stripe-powered Receipt Emails
    - 🔗 Receipt URLs in Dashboard
    - 💼 Professional Receipt Formatting
    - 🔄 Webhook-based Credit Fulfillment
- 👑 Admin Dashboard
  - 👥 User Management
- ✨ Validations with Zod and React Hook Form
  - 🛡️ Type-safe Form Validations
  - 🔒 Server-side Validations
  - 🔍 Client-side Validations
  - 🧹 Input Sanitization
  - ⚡ Real-time Validation
  - 🔄 Form State Management
- 👨‍💻 Developer Experience
  - 🧪 Local Development Setup
  - 📘 TypeScript Support
  - 🔍 ESLint Configuration
  - ✨ Prettier Configuration
  - 🔐 Type-safe Environment Variables
  - 🏗️ Cloudflare Types Generation
  - 🤖 AI-powered Development with Cursor
  - 📚 Comprehensive Documentation
  - 📐 Project Structure Best Practices
- ⚡ Edge Computing
  - 🌍 Global Deployment with Cloudflare Workers
  - 🚀 Zero Cold Starts
  - 💨 Edge Caching
  - ⚛️ React Server Components
  - 🖥️ Server-side Rendering
  - 💾 Edge Database with D1
  - 🗄️ Session Storage with KV
  - ⚡ API Rate Limiting
- 🏢 Multi-tenancy Support
  - 👥 Organization Management
  - 👤 User Roles and Permissions
  - 🔍 Tenant Isolation
  - 🔄 Resource Sharing Controls
  - 📊 Per-tenant Analytics
  - 🔐 Tenant-specific Configurations
  - 💼 Team Collaboration Features

## Planned features (TODO):

- [ ] Update Meta SEO tags 🔍
- [ ] Dynamic OpenGraph images 📸
- [ ] sitemap.xml 📄
- [ ] robots.txt 📄
- [ ] Multi-language support (i18n) 🌐
- [ ] Notifications 🔔
- [ ] Webhooks 🔗
- [ ] Track bundle size with https://www.npmjs.com/package/webpack-bundle-analyzer 📊

# Running it locally

1. `pnpm install`
2.  Copy `.dev.vars.example` to `.dev.vars` and fill in the values.
3.  Copy `.env.example` to `.env` and fill in the values.
4. `pnpm db:migrate:dev` - Creates a local SQLite database and applies migrations
5. `pnpm dev`
6.  Open http://localhost:3000

## Stripe Configuration & Webhook Setup

### Required Environment Variables

#### For Local Development:
Add these to your `.dev.vars` file:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Stripe secret key from dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI (see setup below)

# Other required vars for billing
STRIPE_PUBLISHABLE_KEY=pk_test_... # Stripe publishable key
```

#### For Production:
Set these as Cloudflare Worker secrets:
```bash
# Stripe Configuration (Production)
STRIPE_SECRET_KEY=sk_live_... # Live Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe dashboard webhook endpoint
STRIPE_PUBLISHABLE_KEY=pk_live_... # Live publishable key
```

### Local Development Webhook Setup

To test payments and receipts locally, you need to forward Stripe webhooks:

1. **Install Stripe CLI** (if not already installed):
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local dev server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from the CLI output (starts with `whsec_...`) and add it to your `.dev.vars`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_4e7c3814cb20e157403aceaa0622e9ff4abeb9b8b2013c91e409fc825c63cd1f
   ```

5. **Restart your dev server** after updating `.dev.vars`

### Production Webhook Setup

1. **Create webhook endpoint** in Stripe Dashboard:
   - Go to: Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Copy webhook secret** from the newly created endpoint and set as Cloudflare Worker secret:
   ```bash
   wrangler secret put STRIPE_WEBHOOK_SECRET
   # Paste the webhook secret when prompted
   ```

### How It Works

- **Payment Processing**: Frontend creates payment intent → User pays → Stripe confirms payment
- **Credit Fulfillment**: Webhook receives `payment_intent.succeeded` → Adds credits to user account → Stores Stripe receipt URL
- **Receipt Delivery**: Stripe automatically emails receipt to customer (no custom code needed)
- **Transaction Tracking**: All payments logged in database with receipt URLs for dashboard access

## Changes to wrangler.jsonc

After making a change to wrangler.jsonc, you need to run `pnpm cf-typegen` to generate the new types.

## Things to change and customize before deploying to production
1. Go to `src/constants.ts` and update it with your project details
2. Update `.cursor/rules/001-main-project-context.mdc` with your project specification so that Cursor AI can give you better suggestions
3. Update the footer in `src/components/footer.tsx` with your project details and links
4. Optional: Update the color palette in `src/app/globals.css`
5. Update the metadata in `src/app/layout.tsx` with your project details

## Deploying to Cloudflare with Github Actions

1. Create D1 and KV namespaces
2. Set either `RESEND_API_KEY` or `BREVO_API_KEY` as a secret in your Cloudflare Worker depending on which email service you want to use.
3. Create a Turnstile catcha in your Cloudflare account, and set the `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as a Github Actions variable.
4. Set `TURNSTILE_SECRET_KEY` as a secret in your Cloudflare Worker.
5. **Configure Stripe for production**:
   - Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` as Cloudflare Worker secrets
   - Create production webhook endpoint in Stripe Dashboard pointing to your domain
6. Update the `wrangler.jsonc` file with the new database and KV namespaces, env variables and account id. Search for "cloudflare-workers-nextjs-saas-template" recursively in the whole repository and change that to the name of your project. Don't forget that the name you choose at the top of the wrangler.jsonc should be the same as `services->[0]->service` in the same file.
7. Go to https://dash.cloudflare.com/profile/api-tokens and click on "Use template" next to "Edit Cloudflare Workers". On the next, page add the following permissions in addition to the ones from the template:
    - Account:AI Gateway:Edit
    - Account:Workers AI:Edit
    - Account:Workers AI:Read
    - Account:Queues:Edit
    - Account:Vectorize:Edit
    - Account:D1:Edit
    - Account:Cloudflare Images:Edit
    - Account:Workers KV Storage:Edit
    - Zone:Cache Purge:Purge
8. Add the API token to the Github repository secrets as `CLOUDFLARE_API_TOKEN`
9. Add the Cloudflare account id to the Github repository variables as `CLOUDFLARE_ACCOUNT_ID`
10. Optional: If you want clear the CDN cache on deploy, add `CLOUDFLARE_ZONE_ID` to the Github repository variables for the zone id of your domain. This is the zone id of your domain, not the account id.
11. Push to the main branch

## Email templates
If you want to preview and edit the email templates you can:
1. `pnpm email:dev`
2. Open http://localhost:3001
3. Edit the email templates in the `src/react-email` folder
4. For inspiration you can checkout https://react.email/templates
