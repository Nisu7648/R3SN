const axios = require('axios');

/**
 * Vercel Premium Integration
 * FREE Hosting & Deployment Platform
 * 100GB bandwidth/month FREE (worth $400/month)
 * Serverless functions, edge network, instant deployments
 */
class VercelIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken || 'YOUR_VERCEL_API_TOKEN';
    this.baseURL = 'https://api.vercel.com';
  }

  /**
   * List deployments
   */
  async listDeployments(projectId = null, limit = 20) {
    try {
      const params = { limit };
      if (projectId) params.projectId = projectId;

      const response = await axios.get(`${this.baseURL}/v6/deployments`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        },
        params
      });

      return {
        success: true,
        data: response.data,
        deployments: response.data.deployments
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get deployment details
   */
  async getDeployment(deploymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v13/deployments/${deploymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        deployment: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create deployment
   */
  async createDeployment(name, files, projectSettings = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v13/deployments`,
        {
          name,
          files,
          projectSettings
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        deployment: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel deployment
   */
  async cancelDeployment(deploymentId) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/v12/deployments/${deploymentId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * List projects
   */
  async listProjects(limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/v9/projects`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        },
        params: { limit }
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
   * Get project
   */
  async getProject(projectId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v9/projects/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create project
   */
  async createProject(name, framework = null, gitRepository = null) {
    try {
      const payload = { name };
      if (framework) payload.framework = framework;
      if (gitRepository) payload.gitRepository = gitRepository;

      const response = await axios.post(
        `${this.baseURL}/v9/projects`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      const response = await axios.patch(
        `${this.baseURL}/v9/projects/${projectId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data
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
      const response = await axios.delete(
        `${this.baseURL}/v9/projects/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * List domains
   */
  async listDomains() {
    try {
      const response = await axios.get(`${this.baseURL}/v5/domains`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return {
        success: true,
        data: response.data,
        domains: response.data.domains
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add domain
   */
  async addDomain(name, projectId = null) {
    try {
      const payload = { name };
      if (projectId) payload.projectId = projectId;

      const response = await axios.post(
        `${this.baseURL}/v10/domains`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        domain: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove domain
   */
  async removeDomain(domain) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/v6/domains/${domain}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * List environment variables
   */
  async listEnvironmentVariables(projectId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v9/projects/${projectId}/env`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        envs: response.data.envs
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create environment variable
   */
  async createEnvironmentVariable(projectId, key, value, target = ['production', 'preview', 'development']) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v10/projects/${projectId}/env`,
        {
          key,
          value,
          target,
          type: 'encrypted'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        env: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete environment variable
   */
  async deleteEnvironmentVariable(projectId, envId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/v9/projects/${projectId}/env/${envId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v2/deployments/${deploymentId}/events`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
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
   * List teams
   */
  async listTeams() {
    try {
      const response = await axios.get(`${this.baseURL}/v2/teams`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return {
        success: true,
        data: response.data,
        teams: response.data.teams
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user info
   */
  async getUserInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/v2/user`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      return {
        success: true,
        data: response.data,
        user: response.data.user
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Redeploy
   */
  async redeploy(deploymentId, name = null) {
    try {
      const payload = { deploymentId };
      if (name) payload.name = name;

      const response = await axios.post(
        `${this.baseURL}/v13/deployments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        deployment: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = VercelIntegration;
