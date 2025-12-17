/**
 * n8n Integration
 * Real n8n API for workflow automation
 */

const axios = require('axios');

class N8nIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.baseUrl = config.instanceUrl || 'https://n8n.io/api/v1';
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('n8n API Key is required');
    }
  }

  getHeaders() {
    return {
      'X-N8N-API-KEY': this.config.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async execute(action, params) {
    const actions = {
      listWorkflows: this.listWorkflows.bind(this),
      getWorkflow: this.getWorkflow.bind(this),
      createWorkflow: this.createWorkflow.bind(this),
      updateWorkflow: this.updateWorkflow.bind(this),
      deleteWorkflow: this.deleteWorkflow.bind(this),
      activateWorkflow: this.activateWorkflow.bind(this),
      deactivateWorkflow: this.deactivateWorkflow.bind(this),
      executeWorkflow: this.executeWorkflow.bind(this),
      listExecutions: this.listExecutions.bind(this),
      getExecution: this.getExecution.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async listWorkflows(params) {
    const { active, tags } = params;

    try {
      const queryParams = {};
      if (active !== undefined) queryParams.active = active;
      if (tags) queryParams.tags = tags;

      const response = await axios.get(
        `${this.baseUrl}/workflows`,
        {
          headers: this.getHeaders(),
          params: queryParams
        }
      );

      return {
        success: true,
        data: {
          workflows: response.data.data.map(wf => ({
            id: wf.id,
            name: wf.name,
            active: wf.active,
            createdAt: wf.createdAt,
            updatedAt: wf.updatedAt
          }))
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getWorkflow(params) {
    const { workflowId } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/workflows/${workflowId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          active: response.data.active,
          nodes: response.data.nodes,
          connections: response.data.connections,
          settings: response.data.settings
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createWorkflow(params) {
    const { name, nodes, connections, settings } = params;
    
    if (!name) {
      throw new Error('Workflow name is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows`,
        {
          name,
          nodes: nodes || [],
          connections: connections || {},
          settings: settings || {}
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          active: response.data.active
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateWorkflow(params) {
    const { workflowId, name, nodes, connections, settings } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/workflows/${workflowId}`,
        {
          ...(name && { name }),
          ...(nodes && { nodes }),
          ...(connections && { connections }),
          ...(settings && { settings })
        },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          updatedAt: response.data.updatedAt
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteWorkflow(params) {
    const { workflowId } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      await axios.delete(
        `${this.baseUrl}/workflows/${workflowId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: { deleted: true, workflowId }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async activateWorkflow(params) {
    const { workflowId } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/workflows/${workflowId}`,
        { active: true },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          active: response.data.active
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async deactivateWorkflow(params) {
    const { workflowId } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      const response = await axios.patch(
        `${this.baseUrl}/workflows/${workflowId}`,
        { active: false },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          active: response.data.active
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async executeWorkflow(params) {
    const { workflowId, data } = params;
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows/${workflowId}/execute`,
        { data: data || {} },
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          executionId: response.data.executionId,
          finished: response.data.finished,
          data: response.data.data
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async listExecutions(params) {
    const { workflowId, limit = 20 } = params;

    try {
      const queryParams = { limit };
      if (workflowId) queryParams.workflowId = workflowId;

      const response = await axios.get(
        `${this.baseUrl}/executions`,
        {
          headers: this.getHeaders(),
          params: queryParams
        }
      );

      return {
        success: true,
        data: {
          executions: response.data.data.map(exec => ({
            id: exec.id,
            workflowId: exec.workflowId,
            finished: exec.finished,
            mode: exec.mode,
            startedAt: exec.startedAt,
            stoppedAt: exec.stoppedAt
          }))
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async getExecution(params) {
    const { executionId } = params;
    
    if (!executionId) {
      throw new Error('Execution ID is required');
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/executions/${executionId}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          workflowId: response.data.workflowId,
          finished: response.data.finished,
          mode: response.data.mode,
          data: response.data.data
        }
      };
    } catch (error) {
      throw new Error(`n8n API error: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = N8nIntegration;
