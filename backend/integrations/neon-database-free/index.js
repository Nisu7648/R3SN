const axios = require('axios');

/**
 * Neon Database Premium Integration
 * FREE Serverless PostgreSQL database
 * 10 projects, 3GB storage FREE (worth $700/month)
 * Instant branching, autoscaling, serverless
 */
class NeonDatabaseIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey || 'YOUR_NEON_API_KEY';
    this.baseURL = 'https://console.neon.tech/api/v2';
  }

  /**
   * List all projects
   */
  async listProjects() {
    try {
      const response = await axios.get(`${this.baseURL}/projects`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        projects: response.data.projects
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new project
   */
  async createProject(name, region = 'aws-us-east-2') {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects`,
        {
          project: {
            name,
            region_id: region
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data.project,
        connectionUri: response.data.connection_uris
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get project details
   */
  async getProject(projectId) {
    try {
      const response = await axios.get(`${this.baseURL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data,
        project: response.data.project
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, name) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/projects/${projectId}`,
        {
          project: { name }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data.project
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      const response = await axios.delete(`${this.baseURL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
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
   * List branches in a project
   */
  async listBranches(projectId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/branches`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        branches: response.data.branches
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a branch (instant database copy)
   */
  async createBranch(projectId, name, parentId = null) {
    try {
      const payload = {
        branch: { name }
      };
      
      if (parentId) {
        payload.branch.parent_id = parentId;
      }

      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/branches`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        branch: response.data.branch,
        endpoints: response.data.endpoints
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get branch details
   */
  async getBranch(projectId, branchId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        branch: response.data.branch
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(projectId, branchId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
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
   * List endpoints (compute instances)
   */
  async listEndpoints(projectId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/endpoints`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        endpoints: response.data.endpoints
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create endpoint
   */
  async createEndpoint(projectId, branchId, type = 'read_write') {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/endpoints`,
        {
          endpoint: {
            branch_id: branchId,
            type
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        endpoint: response.data.endpoint
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Start endpoint
   */
  async startEndpoint(projectId, endpointId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/endpoints/${endpointId}/start`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        endpoint: response.data.endpoint
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Suspend endpoint
   */
  async suspendEndpoint(projectId, endpointId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/endpoints/${endpointId}/suspend`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        endpoint: response.data.endpoint
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get connection URI
   */
  async getConnectionUri(projectId, branchId, databaseName = 'neondb', role = 'neondb_owner') {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/connection_uri`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: {
            branch_id: branchId,
            database_name: databaseName,
            role_name: role
          }
        }
      );

      return {
        success: true,
        data: response.data,
        uri: response.data.uri
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get project consumption metrics
   */
  async getConsumption(projectId, from, to) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/consumption`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: { from, to }
        }
      );

      return {
        success: true,
        data: response.data,
        consumption: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List databases in a branch
   */
  async listDatabases(projectId, branchId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}/databases`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        databases: response.data.databases
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create database
   */
  async createDatabase(projectId, branchId, name, owner) {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}/databases`,
        {
          database: {
            name,
            owner_name: owner
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        database: response.data.database
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List roles in a branch
   */
  async listRoles(projectId, branchId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}/roles`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        roles: response.data.roles
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create role
   */
  async createRole(projectId, branchId, name) {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/${projectId}/branches/${branchId}/roles`,
        {
          role: { name }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        role: response.data.role
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = NeonDatabaseIntegration;
