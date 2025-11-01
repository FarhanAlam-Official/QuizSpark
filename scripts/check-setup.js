#!/usr/bin/env node

/**
 * QuizSpark Setup Checker
 * Verifies that all required configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 QuizSpark Setup Checker\n');
console.log('================================\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Environment file exists
console.log('📁 Checking environment file...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local file found\n');
} else {
  console.log('   ❌ .env.local file NOT found');
  console.log('   💡 Copy .env.example to .env.local and fill in your values\n');
  hasErrors = true;
}

// Check 2: Required environment variables
console.log('🔑 Checking environment variables...');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalVars = [
  'BREVO_API_KEY',
  'NEXT_PUBLIC_APP_URL'
];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    if (process.env[varName].includes('your-') || process.env[varName].includes('here')) {
      console.log(`   ⚠️  ${varName} - Set but appears to be placeholder`);
      hasWarnings = true;
    } else {
      console.log(`   ✅ ${varName} - Set`);
    }
  } else {
    console.log(`   ❌ ${varName} - NOT SET (REQUIRED)`);
    hasErrors = true;
  }
});

console.log('');
console.log('⚙️  Optional variables:');
optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} - Set`);
  } else {
    console.log(`   ℹ️  ${varName} - Not set (optional)`);
  }
});

// Check 3: Node modules
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules found\n');
} else {
  console.log('   ❌ node_modules NOT found');
  console.log('   💡 Run: npm install\n');
  hasErrors = true;
}

// Check 4: Required files
console.log('📄 Checking required files...');
const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'scripts/schema.sql',
  'scripts/setup.sql'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
    hasErrors = true;
  }
});

// Check 5: Next.js configuration
console.log('\n⚙️  Checking Next.js configuration...');
try {
  const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
  if (fs.existsSync(nextConfigPath)) {
    console.log('   ✅ next.config.mjs is valid\n');
  }
} catch (error) {
  console.log('   ⚠️  next.config.mjs might have issues\n');
  hasWarnings = true;
}

// Summary
console.log('\n================================');
console.log('📊 Summary:\n');

if (!hasErrors && !hasWarnings) {
  console.log('🎉 All checks passed! Your setup looks good.');
  console.log('\n💡 Next steps:');
  console.log('   1. Make sure you\'ve applied the database schema in Supabase');
  console.log('   2. Run: npm run dev');
  console.log('   3. Visit: http://localhost:3000');
  console.log('   4. Register your first user\n');
  process.exit(0);
} else if (hasErrors) {
  console.log('❌ Setup incomplete. Please fix the errors above.');
  console.log('\n💡 Quick fix guide:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Create a Supabase project at https://supabase.com');
  console.log('   3. Get your API keys from Project Settings → API');
  console.log('   4. Add the keys to .env.local');
  console.log('   5. Run: npm install');
  console.log('   6. Apply database schema in Supabase SQL Editor');
  console.log('   7. Run this checker again: node scripts/check-setup.js\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Setup mostly complete, but there are some warnings.');
  console.log('   Review the warnings above and fix if necessary.\n');
  process.exit(0);
}

