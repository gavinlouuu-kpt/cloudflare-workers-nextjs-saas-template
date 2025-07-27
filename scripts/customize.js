#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration file path
const CONFIG_FILE = 'customize.config.json';

// Files and patterns to exclude from replacement
const EXCLUDED_PATTERNS = [
  'node_modules/**',
  '.git/**',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.svg',
  '**/*.ico',
  'customize.config.json',
  'scripts/customize.js',
  'pnpm-lock.yaml',
  '.wrangler/**'
];

// Placeholder mapping function
function createReplacementMap(config) {
  return {
    // Project placeholders - Site Name & Branding
    'your-project-name': config.project.name,
    'your-custom-project-name': config.project.name,
    '[Your Project]': config.project.displayName,
    'Your SaaS Project': config.project.displayName,
    'Your Custom SaaS Project': config.project.displayName,
    'SaaS Template': config.project.displayName,
    'Production-Ready SaaS Template': config.project.displayName,
    'Cloudflare Workers SaaS Template': config.project.displayName,
    
    // Domain placeholders
    'https://your-domain.com': config.domain.production,
    'https://your-custom-domain.com': config.domain.production,
    'your-domain.com': new URL(config.domain.production).hostname,
    'your-custom-domain.com': new URL(config.domain.production).hostname,
    
    // Company placeholders
    '[Your Company]': config.company.name,
    '[Your Custom Company]': config.company.name,
    '[Your Name]': config.company.legalName,
    '[Your Custom Name]': config.company.legalName,
    'https://your-company.com': config.company.website,
    'https://your-custom-company.com': config.company.website,
    
    // Email placeholders
    'no-reply@your-domain.com': config.contact.email.from,
    'no-reply@your-custom-domain.com': config.contact.email.from,
    'support@your-domain.com': config.contact.email.support,
    'support@your-custom-domain.com': config.contact.email.support,
    
    // Social placeholders
    '[your-username]': config.social.github.username,
    '[your-custom-username]': config.social.github.username,
    '[your-repo]': config.social.github.repository,
    '[your-custom-repo]': config.social.github.repository,
    'https://github.com/[your-username]/[your-repo]': `https://github.com/${config.social.github.username}/${config.social.github.repository}`,
    'https://github.com/[your-custom-username]/[your-custom-repo]': `https://github.com/${config.social.github.username}/${config.social.github.repository}`,
    '@[your-twitter]': config.social.twitter.handle,
    '@[your-custom-twitter]': config.social.twitter.handle,
    '[your-twitter]': config.social.twitter.handle.replace('@', ''),
    '[your-custom-twitter]': config.social.twitter.handle.replace('@', ''),
    
    // Cloudflare placeholders
    'your-cloudflare-account-id': config.cloudflare.accountId,
    'your-custom-cloudflare-account-id': config.cloudflare.accountId,
    'your-database-id': config.cloudflare.databaseId,
    'your-custom-database-id': config.cloudflare.databaseId,
    'your-kv-namespace-id': config.cloudflare.kvNamespaceId,
    'your-custom-kv-namespace-id': config.cloudflare.kvNamespaceId,
    'your-database-name': config.cloudflare.databaseName,
    'your-custom-database-name': config.cloudflare.databaseName,
  };
}

// Validate configuration
function validateConfig(config) {
  const errors = [];
  
  if (!config.project?.name) errors.push('project.name is required');
  if (!config.company?.name) errors.push('company.name is required');
  if (!config.company?.legalName) errors.push('company.legalName is required');
  if (!config.domain?.production) errors.push('domain.production is required');
  if (!config.contact?.email?.from) errors.push('contact.email.from is required');
  
  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
}

// Replace content in a file
function replaceInFile(filePath, replacementMap, isDryRun = false) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const changes = [];
    
    Object.entries(replacementMap).forEach(([placeholder, replacement]) => {
      if (content.includes(placeholder)) {
        const count = (content.match(new RegExp(escapeRegExp(placeholder), 'g')) || []).length;
        content = content.replace(new RegExp(escapeRegExp(placeholder), 'g'), replacement);
        modified = true;
        changes.push(`${placeholder} → ${replacement} (${count} occurrence${count > 1 ? 's' : ''})`);
      }
    });
    
    if (modified) {
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`📝 Would update: ${filePath}`);
        changes.forEach(change => console.log(`   - ${change}`));
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get all files to process
async function getFilesToProcess() {
  try {
    const allFiles = await glob('**/*', {
      ignore: EXCLUDED_PATTERNS,
      nodir: true,
      dot: true
    });
    
    return allFiles.filter(file => {
      const stat = fs.statSync(file);
      return stat.isFile() && stat.size < 10 * 1024 * 1024; // Skip files larger than 10MB
    });
  } catch (error) {
    console.error('❌ Error getting files:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log(`🚀 Starting project customization${isDryRun ? ' (DRY RUN)' : ''}...\n`);
  
  // Check if config file exists
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`❌ Configuration file '${CONFIG_FILE}' not found.`);
    console.log('📝 Please create a customize.config.json file with your project details.');
    console.log('   You can use customize.config.example.json as a template.');
    console.log('\n💡 Quick start:');
    console.log('   cp customize.config.example.json customize.config.json');
    console.log('   # Edit customize.config.json with your details');
    console.log('   pnpm customize');
    process.exit(1);
  }
  
  // Load and validate configuration
  let config;
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log('📋 Configuration loaded successfully');
  } catch (error) {
    console.error('❌ Error reading configuration file:', error.message);
    process.exit(1);
  }
  
  validateConfig(config);
  console.log('✅ Configuration validated\n');
  
  // Create replacement map
  const replacementMap = createReplacementMap(config);
  
  // Get files to process
  console.log('🔍 Scanning for files to customize...');
  const files = await getFilesToProcess();
  console.log(`📁 Found ${files.length} files to process\n`);
  
  // Process each file
  let modifiedCount = 0;
  for (const file of files) {
    if (replaceInFile(file, replacementMap, isDryRun)) {
      modifiedCount++;
    }
  }
  
  console.log(`\n🎉 Customization ${isDryRun ? 'preview ' : ''}completed!`);
  console.log(`📊 ${modifiedCount} files ${isDryRun ? 'would be' : 'were'} modified out of ${files.length} processed.`);
  
  if (modifiedCount > 0) {
    if (isDryRun) {
      console.log('\n👀 This was a dry run. To apply changes, run:');
      console.log('   pnpm customize');
    } else {
      console.log('\n📋 Next steps:');
      console.log('1. Review the changes in your git diff');
      console.log('2. Update your Cloudflare account ID and resource IDs');
      console.log('3. Set up your environment variables');
      console.log('4. Test your application');
      console.log('\n⚠️  Don\'t forget to commit your changes!');
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

export { createReplacementMap, validateConfig }; 