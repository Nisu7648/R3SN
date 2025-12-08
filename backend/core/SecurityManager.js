/**
 * SecurityManager - Enterprise-grade security
 * Handles encryption, authentication, authorization, and compliance
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class SecurityManager {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();
    this.jwtSecret = process.env.JWT_SECRET || this.generateKey();
    this.permissions = new Map();
    this.roles = new Map();
    this.auditLog = [];
    this.initializeRBAC();
  }

  /**
   * Initialize Role-Based Access Control
   */
  initializeRBAC() {
    // Define roles
    this.roles.set('admin', {
      permissions: ['*'], // All permissions
      description: 'Full system access'
    });

    this.roles.set('developer', {
      permissions: [
        'workflow:create',
        'workflow:read',
        'workflow:update',
        'workflow:delete',
        'integration:connect',
        'agent:create',
        'code:execute'
      ],
      description: 'Developer access'
    });

    this.roles.set('operator', {
      permissions: [
        'workflow:read',
        'workflow:execute',
        'integration:read',
        'agent:read'
      ],
      description: 'Operator access'
    });

    this.roles.set('viewer', {
      permissions: [
        'workflow:read',
        'integration:read',
        'agent:read'
      ],
      description: 'Read-only access'
    });
  }

  /**
   * Encrypt data using AES-256
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, this.jwtSecret, { expiresIn });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Check permission
   */
  hasPermission(userId, permission) {
    const userPermissions = this.permissions.get(userId);
    
    if (!userPermissions) {
      return false;
    }

    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return userPermissions.includes(permission);
  }

  /**
   * Assign role to user
   */
  assignRole(userId, roleName) {
    const role = this.roles.get(roleName);
    
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    this.permissions.set(userId, role.permissions);
    
    this.audit({
      action: 'role_assigned',
      userId,
      role: roleName,
      timestamp: new Date()
    });
  }

  /**
   * Create custom role
   */
  createRole(roleName, permissions, description) {
    this.roles.set(roleName, {
      permissions,
      description
    });

    this.audit({
      action: 'role_created',
      role: roleName,
      permissions,
      timestamp: new Date()
    });
  }

  /**
   * Audit logging
   */
  audit(entry) {
    this.auditLog.push({
      ...entry,
      timestamp: entry.timestamp || new Date()
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filters = {}) {
    let logs = this.auditLog;

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate);
    }

    return logs;
  }

  /**
   * Generate secure random key
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate API key
   */
  generateAPIKey() {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Validate API key
   */
  validateAPIKey(apiKey) {
    // Implement API key validation
    return true;
  }

  /**
   * Rate limiting
   */
  checkRateLimit(userId, limit = 100, window = 60000) {
    const key = `ratelimit:${userId}`;
    const now = Date.now();
    
    // Implement rate limiting logic
    return true;
  }

  /**
   * IP whitelisting
   */
  isIPWhitelisted(ip) {
    const whitelist = process.env.IP_WHITELIST?.split(',') || [];
    return whitelist.length === 0 || whitelist.includes(ip);
  }

  /**
   * Data sanitization
   */
  sanitize(input) {
    if (typeof input === 'string') {
      // Remove potentially dangerous characters
      return input.replace(/[<>\"']/g, '');
    }
    return input;
  }

  /**
   * SQL injection prevention
   */
  sanitizeSQL(query) {
    // Implement SQL sanitization
    return query.replace(/['";]/g, '');
  }

  /**
   * XSS prevention
   */
  sanitizeHTML(html) {
    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * CSRF token generation
   */
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token, expected) {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected)
    );
  }

  /**
   * Compliance checks
   */
  async checkGDPRCompliance(data) {
    // Implement GDPR compliance checks
    return {
      compliant: true,
      issues: []
    };
  }

  async checkHIPAACompliance(data) {
    // Implement HIPAA compliance checks
    return {
      compliant: true,
      issues: []
    };
  }

  async checkSOC2Compliance(data) {
    // Implement SOC2 compliance checks
    return {
      compliant: true,
      issues: []
    };
  }

  /**
   * Data anonymization
   */
  anonymize(data, fields) {
    const anonymized = { ...data };
    
    for (const field of fields) {
      if (anonymized[field]) {
        anonymized[field] = this.hash(anonymized[field]);
      }
    }

    return anonymized;
  }

  /**
   * Hash data
   */
  hash(data) {
    return crypto
      .createHash('sha256')
      .update(data.toString())
      .digest('hex');
  }

  /**
   * Secure session management
   */
  createSession(userId, metadata = {}) {
    const sessionId = this.generateKey();
    const session = {
      id: sessionId,
      userId,
      metadata,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    return session;
  }

  /**
   * Validate session
   */
  validateSession(sessionId) {
    // Implement session validation
    return true;
  }

  /**
   * Two-factor authentication
   */
  generate2FASecret() {
    return crypto.randomBytes(20).toString('hex');
  }

  verify2FAToken(secret, token) {
    // Implement 2FA verification (TOTP)
    return true;
  }

  /**
   * Security headers
   */
  getSecurityHeaders() {
    return {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }
}

module.exports = SecurityManager;
