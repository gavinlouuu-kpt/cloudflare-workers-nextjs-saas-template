#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Convert .env file to JSON format for wrangler secret bulk
 * Usage: node scripts/env-to-json.js [input-env-file] [output-json-file]
 */

const inputFile = process.argv[2] || '.env';
const outputFile = process.argv[3] || 'secrets.json';

function parseEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const secrets = {};
    
    // Split into lines and process each one
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // Skip empty lines and comments
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      
      // Find the first = character
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        continue; // Skip lines without =
      }
      
      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      if (key) {
        secrets[key] = value;
      }
    }
    
    return secrets;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

function writeJsonFile(secrets, outputPath) {
  try {
    const jsonContent = JSON.stringify(secrets, null, 2);
    fs.writeFileSync(outputPath, jsonContent, 'utf8');
    console.log(`✅ Successfully converted secrets to ${outputPath}`);
    console.log(`📊 Found ${Object.keys(secrets).length} secrets:`);
    Object.keys(secrets).forEach(key => {
      console.log(`   • ${key}`);
    });
  } catch (error) {
    console.error(`❌ Error writing ${outputPath}:`, error.message);
    process.exit(1);
  }
}

// Main execution
console.log(`🔄 Converting ${inputFile} to ${outputFile}...`);

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: ${inputFile} not found`);
  process.exit(1);
}

const secrets = parseEnvFile(inputFile);

if (Object.keys(secrets).length === 0) {
  console.warn(`⚠️  Warning: No secrets found in ${inputFile}`);
  process.exit(1);
}

writeJsonFile(secrets, outputFile);

console.log(`\n🚀 Next steps:`);
console.log(`   1. Review the generated ${outputFile} file`);
console.log(`   2. Upload secrets: wrangler secret bulk ${outputFile}`);
console.log(`   3. Delete the JSON file for security: rm ${outputFile}`); 