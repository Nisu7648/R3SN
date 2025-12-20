const axios = require('axios');

/**
 * Railway Premium Integration
 * FREE Deployment Platform
 * $5 credit/month FREE + 500 hours (worth $300/month)
 * Deploy apps, databases, cron jobs instantly
 */
class RailwayIntegration {
  constructor(apiToken) {
    this.apiToken = apiToken || 'YOUR_RAILWAY_API_TOKEN';
    this.baseURL = 'https://backboard.railway.app/graphql/v2';
  }

  /**
   * Execute GraphQL query
   */
  async executeQuery(query, variables = {}) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          query,
          variables
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
        data: response.data.data,
        errors: response.data.errors
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List projects
   */
  async listProjects() {
    const query = `
      query {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    return await this.executeQuery(query);
  }

  /**
   * Create project
   */
  async createProject(name, description = null) {
    const query = `
      mutation ProjectCreate($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          id
          name
          description
        }
      }
    `;

    const variables = {
      input: {
        name,
        ...(description && { description })
      }
    };

    return await this.executeQuery(query, variables);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    const query = `
      mutation ProjectDelete($id: String!) {
        projectDelete(id: $id)
      }
    `;

    return await this.executeQuery(query, { id: projectId });
  }

  /**
   * List services in a project
   */
  async listServices(projectId) {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          services {
            edges {
              node {
                id
                name
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: projectId });
  }

  /**
   * Create service from GitHub repo
   */
  async createService(projectId, name, source) {
    const query = `
      mutation ServiceCreate($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          id
          name
        }
      }
    `;

    const variables = {
      input: {
        projectId,
        name,
        source
      }
    };

    return await this.executeQuery(query, variables);
  }

  /**
   * Delete service
   */
  async deleteService(serviceId) {
    const query = `
      mutation ServiceDelete($id: String!) {
        serviceDelete(id: $id)
      }
    `;

    return await this.executeQuery(query, { id: serviceId });
  }

  /**
   * List deployments
   */
  async listDeployments(serviceId) {
    const query = `
      query Service($id: String!) {
        service(id: $id) {
          deployments {
            edges {
              node {
                id
                status
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: serviceId });
  }

  /**
   * Trigger deployment
   */
  async triggerDeployment(serviceId) {
    const query = `
      mutation DeploymentTrigger($serviceId: String!) {
        deploymentTrigger(serviceId: $serviceId) {
          id
          status
        }
      }
    `;

    return await this.executeQuery(query, { serviceId });
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId, limit = 100) {
    const query = `
      query Deployment($id: String!, $limit: Int) {
        deployment(id: $id) {
          logs(limit: $limit) {
            edges {
              node {
                message
                timestamp
              }
            }
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: deploymentId, limit });
  }

  /**
   * List environment variables
   */
  async listEnvironmentVariables(serviceId) {
    const query = `
      query Service($id: String!) {
        service(id: $id) {
          variables {
            edges {
              node {
                id
                name
                value
              }
            }
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: serviceId });
  }

  /**
   * Set environment variable
   */
  async setEnvironmentVariable(serviceId, name, value) {
    const query = `
      mutation VariableUpsert($input: VariableUpsertInput!) {
        variableUpsert(input: $input) {
          id
          name
        }
      }
    `;

    const variables = {
      input: {
        serviceId,
        name,
        value
      }
    };

    return await this.executeQuery(query, variables);
  }

  /**
   * Delete environment variable
   */
  async deleteEnvironmentVariable(variableId) {
    const query = `
      mutation VariableDelete($id: String!) {
        variableDelete(id: $id)
      }
    `;

    return await this.executeQuery(query, { id: variableId });
  }

  /**
   * List databases
   */
  async listDatabases(projectId) {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          plugins {
            edges {
              node {
                id
                name
                type
              }
            }
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: projectId });
  }

  /**
   * Create database
   */
  async createDatabase(projectId, type = 'postgresql') {
    const query = `
      mutation PluginCreate($input: PluginCreateInput!) {
        pluginCreate(input: $input) {
          id
          name
          type
        }
      }
    `;

    const variables = {
      input: {
        projectId,
        type
      }
    };

    return await this.executeQuery(query, variables);
  }

  /**
   * Get service metrics
   */
  async getServiceMetrics(serviceId) {
    const query = `
      query Service($id: String!) {
        service(id: $id) {
          metrics {
            cpu
            memory
            network
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: serviceId });
  }

  /**
   * Get project usage
   */
  async getProjectUsage(projectId) {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          usage {
            current
            limit
          }
        }
      }
    `;

    return await this.executeQuery(query, { id: projectId });
  }

  /**
   * Create custom domain
   */
  async createCustomDomain(serviceId, domain) {
    const query = `
      mutation CustomDomainCreate($input: CustomDomainCreateInput!) {
        customDomainCreate(input: $input) {
          id
          domain
        }
      }
    `;

    const variables = {
      input: {
        serviceId,
        domain
      }
    };

    return await this.executeQuery(query, variables);
  }

  /**
   * Delete custom domain
   */
  async deleteCustomDomain(domainId) {
    const query = `
      mutation CustomDomainDelete($id: String!) {
        customDomainDelete(id: $id)
      }
    `;

    return await this.executeQuery(query, { id: domainId });
  }
}

module.exports = RailwayIntegration;
