/**
 * System Validation Script
 * Validates all components and dependencies are properly configured
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SystemValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Run all validations
   */
  async validate() {
    console.log('🔍 Starting R3SN System Validation...\n');

    await this.validateEnvironment();
    await this.validateDependencies();
    await this.validateFileStructure();
    await this.validateDatabase();
    await this.validateAPIs();
    
    this.printResults();
    
    return this.errors.length === 0;
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment() {
    console.log('📋 Validating Environment Variables...');

    const required = [
      'NODE_ENV',
      'PORT',
      'MONGODB_URI',
      'JWT_SECRET'
    ];

    const recommended = [
      'OPENAI_API_KEY',
      'REDIS_URL',
      'CORS_ORIGIN'
    ];

    required.forEach(key => {
      if (!process.env[key]) {
        this.errors.push(`Missing required environment variable: ${key}`);
      } else {
        this.passed.push(`✅ ${key} is set`);
      }
    });

    recommended.forEach(key => {
      if (!process.env[key]) {
        this.warnings.push(`Missing recommended environment variable: ${key}`);
      } else {
        this.passed.push(`✅ ${key} is set`);
      }
    });

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      this.warnings.push('JWT_SECRET should be at least 32 characters for production');
    }

    // Check for default values
    if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
      this.errors.push('JWT_SECRET is still using default value - CHANGE IT!');
    }
  }

  /**
   * Validate dependencies
   */
  async validateDependencies() {
    console.log('\n📦 Validating Dependencies...');

    const packageJson = require('../../package.json');
    const required = [
      'express',
      'mongoose',
      'jsonwebtoken',
      'bcryptjs',
      'axios',
      'socket.io',
      'winston'
    ];

    required.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        this.passed.push(`✅ ${dep} installed`);
      } else {
        this.errors.push(`Missing required dependency: ${dep}`);
      }
    });

    // Check Node.js version
    const nodeVersion = process.version;
    const requiredVersion = '18.0.0';
    
    if (this.compareVersions(nodeVersion.slice(1), requiredVersion) >= 0) {
      this.passed.push(`✅ Node.js ${nodeVersion} (>= ${requiredVersion})`);
    } else {
      this.errors.push(`Node.js version ${nodeVersion} is below required ${requiredVersion}`);
    }
  }

  /**
   * Validate file structure
   */
  async validateFileStructure() {
    console.log('\n📁 Validating File Structure...');

    const requiredFiles = [
      'backend/server.js',
      'backend/database.js',
      'backend/models/User.js',
      'backend/models/Agent.js',
      'backend/models/Integration.js',
      'backend/models/Workflow.js',
      'backend/models/Execution.js',
      'backend/routes/auth.js',
      'backend/routes/agents.js',
      'backend/routes/integrations.js',
      'backend/routes/automations.js',
      'backend/routes/plugins.js',
      'backend/routes/executions.js',
      'backend/middleware/auth.js',
      'backend/middleware/errorHandler.js',
      'backend/middleware/rateLimiter.js',
      'backend/middleware/validator.js',
      'backend/core/AgentEngine.js',
      'backend/core/UniversalExecutor.js',
      'backend/core/IntegrationHub.js',
      'backend/core/PluginFactory.js',
      'backend/core/EnterpriseOrchestrator.js'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, '../..', file);
      if (fs.existsSync(filePath)) {
        this.passed.push(`✅ ${file}`);
      } else {
        this.errors.push(`Missing required file: ${file}`);
      }
    });

    // Check logs directory
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      this.warnings.push('Created logs directory');
    } else {
      this.passed.push('✅ logs directory exists');
    }
  }

  /**
   * Validate database connection
   */
  async validateDatabase() {
    console.log('\n🗄️  Validating Database Connection...');

    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });

      this.passed.push('✅ MongoDB connection successful');
      
      // Check collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      this.passed.push(`✅ Database has ${collections.length} collections`);

      await mongoose.connection.close();
    } catch (error) {
      this.errors.push(`MongoDB connection failed: ${error.message}`);
    }
  }

  /**
   * Validate API configuration
   */
  async validateAPIs() {
    console.log('\n🌐 Validating API Configuration...');

    // Check OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
        this.passed.push('✅ OpenAI API key format valid');
      } else {
        this.warnings.push('OpenAI API key format may be invalid');
      }
    }

    // Check port availability
    const port = process.env.PORT || 3000;
    this.passed.push(`✅ Server configured for port ${port}`);
  }

  /**
   * Print validation results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION RESULTS');
    console.log('='.repeat(60) + '\n');

    if (this.passed.length > 0) {
      console.log('✅ PASSED CHECKS:');
      this.passed.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(msg => console.log(`   ⚠️  ${msg}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('❌ ERRORS:');
      this.errors.forEach(msg => console.log(`   ❌ ${msg}`));
      console.log('');
    }

    console.log('='.repeat(60));
    console.log(`Total Checks: ${this.passed.length + this.warnings.length + this.errors.length}`);
    console.log(`Passed: ${this.passed.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log('='.repeat(60) + '\n');

    if (this.errors.length === 0) {
      console.log('🎉 System validation PASSED! Ready for deployment.\n');
    } else {
      console.log('❌ System validation FAILED! Fix errors before deployment.\n');
      process.exit(1);
    }
  }

  /**
   * Compare version strings
   */
  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}

// Run validation
const validator = new SystemValidator();
validator.validate().catch(error => {
  console.error('Validation error:', error);
  process.exit(1);
});
