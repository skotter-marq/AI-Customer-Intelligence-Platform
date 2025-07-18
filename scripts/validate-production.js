#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that all required environment variables and configurations are ready for production
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Required environment variables for production
const requiredEnvVars = [
  'NODE_ENV',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
];

// Optional but recommended environment variables
const optionalEnvVars = [
  'SLACK_BOT_TOKEN',
  'SLACK_WEBHOOK_URL',
  'WEBHOOK_SECRET',
  'JWT_SECRET',
  'MONITORING_ENABLED',
  'LOG_LEVEL',
  'REDIS_URL'
];

// Files that should exist for production deployment
const requiredFiles = [
  'package.json',
  'next.config.js',
  'Dockerfile',
  'docker-compose.yml',
  'nginx.conf',
  'scripts/deploy.sh',
  '.env.production'
];

function validateEnvironmentVariables() {
  logInfo('Validating environment variables...');
  
  // Load environment variables from .env.production
  const envPath = path.join(process.cwd(), '.env.production');
  if (!fs.existsSync(envPath)) {
    logError('.env.production file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Parse environment variables
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=', 2);
      if (key && value) {
        envVars[key] = value;
      }
    }
  });

  let hasErrors = false;

  // Check required environment variables
  requiredEnvVars.forEach(varName => {
    const value = envVars[varName] || process.env[varName];
    if (!value || value === 'your-' + varName.toLowerCase() || value.includes('your-')) {
      logError(`Required environment variable ${varName} is not set or contains placeholder value`);
      hasErrors = true;
    } else {
      logSuccess(`${varName} is configured`);
    }
  });

  // Check optional environment variables
  optionalEnvVars.forEach(varName => {
    const value = envVars[varName] || process.env[varName];
    if (!value || value === 'your-' + varName.toLowerCase() || value.includes('your-')) {
      logWarning(`Optional environment variable ${varName} is not set or contains placeholder value`);
    } else {
      logSuccess(`${varName} is configured`);
    }
  });

  return !hasErrors;
}

function validateFiles() {
  logInfo('Validating required files...');
  
  let hasErrors = false;

  requiredFiles.forEach(fileName => {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      logError(`Required file ${fileName} not found`);
      hasErrors = true;
    } else {
      logSuccess(`${fileName} exists`);
    }
  });

  return !hasErrors;
}

function validatePackageJson() {
  logInfo('Validating package.json...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check for required scripts
    const requiredScripts = ['build', 'start', 'prod:deploy'];
    requiredScripts.forEach(script => {
      if (!packageJson.scripts || !packageJson.scripts[script]) {
        logError(`Required script '${script}' not found in package.json`);
        return false;
      } else {
        logSuccess(`Script '${script}' is configured`);
      }
    });

    // Check for required dependencies
    const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        logError(`Required dependency '${dep}' not found in package.json`);
        return false;
      } else {
        logSuccess(`Dependency '${dep}' is configured`);
      }
    });

    return true;
  } catch (error) {
    logError(`Failed to parse package.json: ${error.message}`);
    return false;
  }
}

function validateDockerConfiguration() {
  logInfo('Validating Docker configuration...');
  
  try {
    // Check Dockerfile
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    if (dockerfile.includes('FROM node:18-alpine')) {
      logSuccess('Dockerfile uses recommended Node.js version');
    } else {
      logWarning('Dockerfile might not use recommended Node.js version');
    }

    // Check docker-compose.yml
    const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
    if (dockerCompose.includes('version:') && dockerCompose.includes('services:')) {
      logSuccess('docker-compose.yml has proper structure');
    } else {
      logError('docker-compose.yml is malformed');
      return false;
    }

    return true;
  } catch (error) {
    logError(`Failed to validate Docker configuration: ${error.message}`);
    return false;
  }
}

function generateProductionChecklist() {
  logInfo('Production Deployment Checklist:');
  console.log('');
  console.log('📋 Pre-deployment checklist:');
  console.log('   □ Environment variables are configured with real values');
  console.log('   □ SSL certificates are available (or will be generated)');
  console.log('   □ Domain name is configured');
  console.log('   □ Supabase database is set up and accessible');
  console.log('   □ OpenAI API key is valid and has sufficient credits');
  console.log('   □ Slack integration is configured (if using)');
  console.log('   □ Monitoring and alerting are set up');
  console.log('   □ Backup strategy is in place');
  console.log('');
  console.log('🚀 Deployment commands:');
  console.log('   1. chmod +x ./scripts/deploy.sh');
  console.log('   2. ./scripts/deploy.sh');
  console.log('   3. Check health: curl -f http://localhost:3000/api/health');
  console.log('   4. Monitor logs: docker-compose logs -f');
  console.log('');
  console.log('📊 Post-deployment verification:');
  console.log('   □ Application is accessible');
  console.log('   □ Health checks are passing');
  console.log('   □ Database connections are working');
  console.log('   □ API endpoints are responding');
  console.log('   □ SSL certificates are valid');
  console.log('   □ Monitoring is collecting metrics');
  console.log('');
}

function main() {
  console.log('🔍 AI Customer Intelligence Platform - Production Validation');
  console.log('===========================================================');
  console.log('');

  let isValid = true;

  // Run all validations
  isValid = validateFiles() && isValid;
  isValid = validatePackageJson() && isValid;
  isValid = validateDockerConfiguration() && isValid;
  isValid = validateEnvironmentVariables() && isValid;

  console.log('');
  console.log('===========================================================');
  
  if (isValid) {
    logSuccess('✅ All validations passed! Ready for production deployment.');
    console.log('');
    generateProductionChecklist();
  } else {
    logError('❌ Some validations failed. Please fix the issues before deployment.');
    process.exit(1);
  }
}

// Run the validation
main();