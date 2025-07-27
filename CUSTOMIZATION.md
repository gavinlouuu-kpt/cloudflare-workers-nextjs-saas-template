# Project Customization Guide

This guide explains how to customize the Cloudflare Workers Next.js SaaS template with your own branding and information.

## Automated Customization System

The template includes a powerful automated customization system that can replace all placeholders throughout your project from a single configuration file.

### Configuration File Structure

The `customize.config.json` file contains all the customizable fields:

```json
{
  "project": {
    "name": "your-custom-project-name",           // Used in package.json, wrangler.jsonc
    "displayName": "Your Project Name",    // Used in UI, metadata
    "description": "Project description",  // Used in package.json, meta tags
    "version": "1.0.0"                    // Project version
  },
  "domain": {
    "production": "https://yourdomain.com", // Production URL
    "development": "http://localhost:3000"  // Development URL (usually unchanged)
  },
  "company": {
    "name": "Your Company",               // Company name for branding
    "legalName": "Your Legal Name",       // For copyright notices
    "website": "https://yourcompany.com"  // Company website
  },
  "contact": {
    "email": {
      "from": "no-reply@yourdomain.com",     // From email for notifications
      "fromName": "Your Company",            // Display name for emails
      "replyTo": "support@yourdomain.com",   // Reply-to email
      "support": "support@yourdomain.com"    // Support email
    }
  },
  "social": {
    "github": {
      "username": "yourusername",          // GitHub username
      "repository": "your-repo"            // GitHub repository name
    },
    "twitter": {
      "handle": "@yourtwitter"             // Twitter handle (include @)
    }
  },
  "cloudflare": {
    "accountId": "your-account-id",        // Cloudflare account ID
    "databaseId": "your-custom-database-id",      // D1 database ID
    "kvNamespaceId": "your-kv-id",        // KV namespace ID
    "databaseName": "your-db-name"         // Database name
  },
  "seo": {
    "keywords": ["keyword1", "keyword2"]   // SEO keywords array
  }
}
```

### Quick Start

1. **Copy the example configuration:**
   ```bash
   cp customize.config.example.json customize.config.json
   ```

2. **Edit your configuration:**
   ```bash
   # Use your preferred editor
   nano customize.config.json
   # or
   code customize.config.json
   ```

3. **Preview changes (recommended):**
   ```bash
   pnpm customize:dry-run
   ```
   This shows you exactly what will be changed without modifying files.

4. **Apply customization:**
   ```bash
   pnpm customize
   ```

### What Gets Replaced

The customization script replaces placeholders throughout your project:

#### Project Files:
- `package.json` - Project name, description, version
- `wrangler.jsonc` - Project name, database names, email configuration
- `README.md` - Project links and descriptions
- `LICENSE` - Copyright holder
- `.cursor/rules/` - Project context for AI

#### Source Code:
- `src/constants.ts` - Site URL, GitHub repo, project name
- `src/app/layout.tsx` - Metadata, authors, SEO
- `src/components/footer.tsx` - Social links, company info
- `cloudflare-env.d.ts` - Environment variable types

#### Configuration Files:
- All environment variable references
- Database and service names
- Contact information throughout the codebase

### Advanced Configuration

#### Email Configuration
The email settings in the config file update:
- Wrangler environment variables
- React Email templates (from/reply-to addresses)
- Cloudflare environment types

#### Cloudflare Resources
The Cloudflare section updates:
- Account ID in wrangler.jsonc
- Database and KV namespace references
- Service bindings and worker names

#### SEO and Metadata
The SEO section configures:
- Meta keywords in layout.tsx
- Open Graph tags
- Twitter card metadata

### Validation and Error Handling

The customization script includes validation for required fields:

**Required Fields:**
- `project.name`
- `company.name`
- `company.legalName`
- `domain.production`
- `contact.email.from`

If any required fields are missing, the script will show helpful error messages.

### Dry Run Mode

Always use dry run mode first to preview changes:

```bash
pnpm customize:dry-run
```

This shows:
- Which files would be modified
- What replacements would be made
- How many occurrences of each placeholder exist

### File Exclusions

The customization script automatically excludes:
- Binary files (images, fonts)
- Node modules
- Git files
- Generated files (like pnpm-lock.yaml)
- The customization script itself

### Manual Customization

For advanced customization beyond the automated system:

#### 1. Styling and Branding
```bash
# Update CSS variables
src/app/globals.css

# Customize UI components
src/components/ui/

# Landing page components
src/components/landing/
```

#### 2. Email Templates
```bash
# React Email templates
src/react-email/

# Preview emails locally
pnpm email:dev
```

#### 3. Database Schema
```bash
# Modify schema
src/db/schema.ts

# Generate migrations
pnpm db:generate your-migration-name
```

#### 4. Environment Variables
```bash
# Local development
.env (create from .env.example)

# Production (Cloudflare)
wrangler.jsonc (vars section)
```

### Troubleshooting

#### Common Issues:

1. **"Configuration file not found"**
   ```bash
   cp customize.config.example.json customize.config.json
   ```

2. **"Validation failed"**
   - Check that all required fields are filled
   - Ensure URLs include protocol (https://)
   - Verify email addresses are valid format

3. **"Permission denied"**
   ```bash
   chmod +x scripts/customize.js
   ```

4. **"Module not found: glob"**
   ```bash
   pnpm install
   ```

#### Best Practices:

1. **Always use dry run first**
2. **Commit changes before running customization**
3. **Review git diff after customization**
4. **Test the application after customization**
5. **Keep customize.config.json in .gitignore if it contains sensitive data**

### Security Notes

- **Never commit sensitive data** like API keys to the config file
- Use environment variables for secrets
- The config file is for non-sensitive branding/contact information
- Consider adding `customize.config.json` to `.gitignore` if needed

### Integration with Deployment

After customization, update your deployment:

1. **Update Cloudflare resources:**
   - Create new D1 database with your custom name
   - Update wrangler.jsonc with actual IDs
   - Set environment variables/secrets

2. **Update CI/CD:**
   - GitHub Actions variables
   - Environment-specific configurations

3. **DNS and Domain:**
   - Point your domain to Cloudflare
   - Update DNS records
   - Configure SSL certificates

The customization system makes it easy to rebrand the entire template with your information while maintaining all functionality! 