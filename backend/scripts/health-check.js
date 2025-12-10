/**
 * Health Check Script
 * Comprehensive health monitoring for R3SN system
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

class HealthChecker {
  constructor() {
    this.checks = [];
    this.results = {
      healthy: true,
      checks: {},
      timestamp: new Date(),
      uptime: process.uptime()
    };
  }

  /**
   * Run all health checks
   */
  async runChecks() {
    console.log('🏥 Running Health Checks...\n');

    await this.checkServer();
    await this.checkDatabase();
    await this.checkRedis();
    await this.checkDiskSpace();
    await this.checkMemory();
    await this.checkAPIs();

    this.printResults();
    
    return this.results.healthy;
  }

  /**
   * Check server health
   */
  async checkServer() {
    const port = process.env.PORT || 3000;
    
    try {
      const response = await this.makeRequest(`http://localhost:${port}/health`);
      
      if (response.status === 'healthy') {
        this.addCheck('server', true, 'Server is running');
      } else {
        this.addCheck('server', false, 'Server returned unhealthy status');
      }
    } catch (error) {
      this.addCheck('server', false, `Server not responding: ${error.message}`);
    }
  }

  /**
   * Check database connection
   */
  async checkDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });

      const dbState = mongoose.connection.readyState;
      
      if (dbState === 1) {
        this.addCheck('database', true, 'MongoDB connected');
        
        // Check database size
        const stats = await mongoose.connection.db.stats();
        this.results.checks.database.size = this.formatBytes(stats.dataSize);
        this.results.checks.database.collections = stats.collections;
      } else {
        this.addCheck('database', false, 'MongoDB not connected');
      }

      await mongoose.connection.close();
    } catch (error) {
      this.addCheck('database', false, `MongoDB error: ${error.message}`);
    }
  }

  /**
   * Check Redis connection
   */
  async checkRedis() {
    if (!process.env.REDIS_URL) {
      this.addCheck('redis', null, 'Redis not configured (optional)');
      return;
    }

    try {
      const redis = require('redis');
      const client = redis.createClient({ url: process.env.REDIS_URL });
      
      await client.connect();
      await client.ping();
      
      this.addCheck('redis', true, 'Redis connected');
      
      const info = await client.info();
      this.results.checks.redis.memory = this.extractRedisMemory(info);
      
      await client.quit();
    } catch (error) {
      this.addCheck('redis', false, `Redis error: ${error.message}`);
    }
  }

  /**
   * Check disk space
   */
  async checkDiskSpace() {
    try {
      const { execSync } = require('child_process');
      const output = execSync('df -h /').toString();
      const lines = output.split('\n');
      const data = lines[1].split(/\s+/);
      
      const used = parseInt(data[4]);
      
      if (used < 80) {
        this.addCheck('disk', true, `Disk usage: ${used}%`);
      } else if (used < 90) {
        this.addCheck('disk', true, `Disk usage: ${used}% (warning)`);
        this.results.healthy = false;
      } else {
        this.addCheck('disk', false, `Disk usage critical: ${used}%`);
      }
    } catch (error) {
      this.addCheck('disk', null, 'Could not check disk space');
    }
  }

  /**
   * Check memory usage
   */
  async checkMemory() {
    const usage = process.memoryUsage();
    const totalMem = require('os').totalmem();
    const freeMem = require('os').freemem();
    
    const usedPercent = ((totalMem - freeMem) / totalMem) * 100;
    
    this.results.checks.memory = {
      rss: this.formatBytes(usage.rss),
      heapUsed: this.formatBytes(usage.heapUsed),
      heapTotal: this.formatBytes(usage.heapTotal),
      systemUsed: `${usedPercent.toFixed(2)}%`
    };

    if (usedPercent < 80) {
      this.addCheck('memory', true, `Memory usage: ${usedPercent.toFixed(2)}%`);
    } else {
      this.addCheck('memory', false, `Memory usage high: ${usedPercent.toFixed(2)}%`);
    }
  }

  /**
   * Check external APIs
   */
  async checkAPIs() {
    // Check OpenAI API
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Simple test call
        await openai.models.list();
        
        this.addCheck('openai', true, 'OpenAI API accessible');
      } catch (error) {
        this.addCheck('openai', false, `OpenAI API error: ${error.message}`);
      }
    } else {
      this.addCheck('openai', null, 'OpenAI API key not configured');
    }
  }

  /**
   * Make HTTP request
   */
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Add check result
   */
  addCheck(name, status, message) {
    this.results.checks[name] = {
      status: status === true ? 'healthy' : status === false ? 'unhealthy' : 'warning',
      message
    };

    if (status === false) {
      this.results.healthy = false;
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Extract Redis memory from info
   */
  extractRedisMemory(info) {
    const match = info.match(/used_memory_human:([^\r\n]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Print results
   */
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 HEALTH CHECK RESULTS');
    console.log('='.repeat(60) + '\n');

    Object.entries(this.results.checks).forEach(([name, check]) => {
      const icon = check.status === 'healthy' ? '✅' : 
                   check.status === 'unhealthy' ? '❌' : '⚠️';
      console.log(`${icon} ${name.toUpperCase()}: ${check.message}`);
      
      if (check.size) console.log(`   Size: ${check.size}`);
      if (check.collections) console.log(`   Collections: ${check.collections}`);
      if (check.memory) console.log(`   Memory: ${check.memory}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Overall Status: ${this.results.healthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`Timestamp: ${this.results.timestamp.toISOString()}`);
    console.log(`Uptime: ${this.formatUptime(this.results.uptime)}`);
    console.log('='.repeat(60) + '\n');

    if (!this.results.healthy) {
      console.log('⚠️  System is unhealthy. Check errors above.\n');
      process.exit(1);
    } else {
      console.log('🎉 All systems operational!\n');
    }
  }

  /**
   * Format uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }
}

// Run health check
const checker = new HealthChecker();
checker.runChecks().catch(error => {
  console.error('Health check error:', error);
  process.exit(1);
});
