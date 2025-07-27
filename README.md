# Cloudflare Workers Your Custom SaaS Project

A comprehensive Next.js SaaS template for Cloudflare Workers.

This is a SaaS template for Cloudflare Workers. It uses the [OpenNext](https://opennext.js.org/cloudflare) framework to build a SaaS application.

Have a look at the [project plan](./cursor-docs/project-plan.md) to get an overview of the project.



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

- [ ] Add an eslint rule to check for unused imports and exports
- [ ] Add an eslint rule to check for unused variables and functions
- [ ] Upgrade to Tailwind 4 and fix the errors and visual regressions
- [ ] Update Meta SEO tags 🔍
- [ ] Dynamic OpenGraph images 📸
- [ ] sitemap.xml 📄
- [ ] robots.txt 📄
- [ ] Multi-language support (i18n) 🌐
- [ ] Notifications 🔔
- [ ] Webhooks 🔗

# Running it locally

1. `pnpm install`
2.  Copy `.dev.vars.example` to `.dev.vars` and fill in the values.
3.  Copy `.env.example` to `.env` and fill in the values.
4. `pnpm db:migrate:dev` - Creates a local SQLite database and applies migrations
5. `pnpm dev`
6.  Open http://localhost:3000

## Changes to wrangler.jsonc

After making a change to wrangler.jsonc, you need to run `pnpm cf-typegen` to generate the new types.

## Quick Customization

This template includes an automated customization system that replaces all placeholders with your actual project details from a single configuration file.

### Step 1: Create your configuration file
```bash
cp customize.config.example.json customize.config.json
```

### Step 2: Edit the configuration
Open `customize.config.json` and update it with your project details:

```json
{
  "project": {
    "name": "your-awesome-saas",
    "displayName": "Your Awesome SaaS",
    "description": "Your project description here"
  },
  "company": {
    "name": "Your Company",
    "legalName": "Your Legal Name"
  },
  "domain": {
    "production": "https://yourdomain.com"
  },
  "contact": {
    "email": {
      "from": "no-reply@yourdomain.com",
      "support": "support@yourdomain.com"
    }
  },
  "social": {
    "github": {
      "username": "yourusername",
      "repository": "your-repo"
    },
    "twitter": {
      "handle": "@yourtwitter"
    }
  },
  "cloudflare": {
    "accountId": "your-custom-cloudflare-account-id",
    "databaseId": "your-custom-database-id",
    "kvNamespaceId": "your-custom-kv-namespace-id",
    "databaseName": "your-custom-database-name"
  }
}
```

### Step 3: Preview changes (optional)
```bash
pnpm customize:dry-run
```

### Step 4: Apply customization
```bash
pnpm customize
```

This will automatically update all files in your project with your custom values!

📚 **For detailed customization options, see [CUSTOMIZATION.md](./CUSTOMIZATION.md)**

### Available Commands

```bash
# Preview what changes will be made (recommended first step)
pnpm customize:dry-run

# Apply customization to your project
pnpm customize

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Generate Cloudflare types after config changes
pnpm cf-typegen
```

### Manual Customization (Advanced)

If you prefer manual customization or need to make additional changes:

1. Update the color palette in `src/app/globals.css`
2. Customize the landing page components in `src/components/landing/`
3. Modify the email templates in `src/react-email/`
4. Update `.cursor/rules/001-main-project-context.mdc` with your project specification

## Deploying to Cloudflare with Github Actions

1. Create D1 and KV namespaces
2. Set either `RESEND_API_KEY` or `BREVO_API_KEY` as a secret in your Cloudflare Worker depending on which email service you want to use.
3. Create a Turnstile catcha in your Cloudflare account, and set the `NEXT_PUBLIC_TURNSTILE_SITE_KEY` as a Github Actions variable.
4. Set `TURNSTILE_SECRET_KEY` as a secret in your Cloudflare Worker.
5. Update the `wrangler.jsonc` file with the new database and KV namespaces, env variables and account id. Update the project name throughout the repository. Don't forget that the name you choose at the top of the wrangler.jsonc should be the same as `services->[0]->service` in the same file.
6. Go to https://dash.cloudflare.com/profile/api-tokens and click on "Use template" next to "Edit Cloudflare Workers". On the next, page add the following permissions in addition to the ones from the template:
    - Account:AI Gateway:Edit
    - Account:Workers AI:Edit
    - Account:Workers AI:Read
    - Account:Queues:Edit
    - Account:Vectorize:Edit
    - Account:D1:Edit
    - Account:Cloudflare Images:Edit
    - Account:Workers KV Storage:Edit
    - Zone:Cache Purge:Purge
7. Add the API token to the Github repository secrets as `CLOUDFLARE_API_TOKEN`
8. Add the Cloudflare account id to the Github repository variables as `CLOUDFLARE_ACCOUNT_ID`
9. Optional: If you want clear the CDN cache on deploy, add `CLOUDFLARE_ZONE_ID` to the Github repository variables for the zone id of your domain. This is the zone id of your domain, not the account id.
10. Push to the main branch

## Email templates
If you want to preview and edit the email templates you can:
1. `pnpm email:dev`
2. Open http://localhost:3001
3. Edit the email templates in the `src/react-email` folder
4. For inspiration you can checkout https://react.email/templates
