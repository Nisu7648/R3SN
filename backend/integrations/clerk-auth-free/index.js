const axios = require('axios');

/**
 * Clerk Authentication Premium Integration
 * FREE Authentication & User Management
 * 10,000 MAU FREE (worth $500/month)
 * Complete auth solution with social logins, MFA, sessions
 */
class ClerkAuthIntegration {
  constructor(secretKey) {
    this.secretKey = secretKey || 'YOUR_CLERK_SECRET_KEY';
    this.baseURL = 'https://api.clerk.com/v1';
  }

  /**
   * List all users
   */
  async listUsers(limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/users`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        },
        params: { limit, offset }
      });

      return {
        success: true,
        data: response.data,
        users: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      return {
        success: true,
        data: response.data,
        user: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new user
   */
  async createUser(emailAddress, password, firstName = null, lastName = null) {
    try {
      const response = await axios.post(
        `${this.baseURL}/users`,
        {
          email_address: [emailAddress],
          password,
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName })
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        user: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/users/${userId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        user: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const response = await axios.delete(`${this.baseURL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ban user
   */
  async banUser(userId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/users/${userId}/ban`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        user: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Unban user
   */
  async unbanUser(userId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/users/${userId}/unban`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        user: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List sessions
   */
  async listSessions(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/users/${userId}/sessions`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        sessions: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/sessions/${sessionId}/revoke`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify session token
   */
  async verifyToken(token) {
    try {
      const response = await axios.post(
        `${this.baseURL}/sessions/verify`,
        { token },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        session: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List organizations
   */
  async listOrganizations(limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/organizations`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        },
        params: { limit, offset }
      });

      return {
        success: true,
        data: response.data,
        organizations: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create organization
   */
  async createOrganization(name, createdBy) {
    try {
      const response = await axios.post(
        `${this.baseURL}/organizations`,
        {
          name,
          created_by: createdBy
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        organization: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get organization
   */
  async getOrganization(organizationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/organizations/${organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        organization: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(organizationId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/organizations/${organizationId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        organization: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/organizations/${organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List organization memberships
   */
  async listOrganizationMemberships(organizationId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/organizations/${organizationId}/memberships`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        memberships: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create organization membership
   */
  async createOrganizationMembership(organizationId, userId, role = 'basic_member') {
    try {
      const response = await axios.post(
        `${this.baseURL}/organizations/${organizationId}/memberships`,
        {
          user_id: userId,
          role
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        membership: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(userId, emailAddressId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/users/${userId}/email_addresses/${emailAddressId}/send_verification`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user count
   */
  async getUserCount() {
    try {
      const response = await axios.get(`${this.baseURL}/users/count`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`
        }
      });

      return {
        success: true,
        data: response.data,
        count: response.data.object === 'total_count' ? response.data.total_count : response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ClerkAuthIntegration;
