const axios = require('axios');

/**
 * Inngest Workflows Premium Integration
 * FREE Event-Driven Workflows & Background Jobs
 * 1M function runs/month FREE (saves $100+/month)
 * Durable execution with automatic retries
 */
class InngestIntegration {
  constructor(apiKey, eventKey = null) {
    this.apiKey = apiKey || 'YOUR_INNGEST_API_KEY';
    this.eventKey = eventKey || apiKey;
    this.baseURL = 'https://api.inngest.com';
  }

  /**
   * Send an event
   */
  async sendEvent(name, data = {}, user = null, ts = null) {
    try {
      const event = {
        name,
        data,
        ...(user && { user }),
        ...(ts && { ts })
      };

      const response = await axios.post(
        `${this.baseURL}/v1/events`,
        event,
        {
          headers: {
            'Authorization': `Bearer ${this.eventKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        eventId: response.data.id,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple events
   */
  async sendEvents(events) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/events`,
        events,
        {
          headers: {
            'Authorization': `Bearer ${this.eventKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        count: events.length,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all functions
   */
  async listFunctions() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/functions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        functions: response.data.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get function details
   */
  async getFunction(functionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/functions/${functionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        function: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List function runs
   */
  async listRuns(functionId = null, status = null, limit = 50) {
    try {
      const params = { limit };
      if (functionId) params.function_id = functionId;
      if (status) params.status = status;

      const response = await axios.get(`${this.baseURL}/v1/runs`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params
      });

      return {
        success: true,
        runs: response.data.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get run details
   */
  async getRun(runId) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        run: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a run
   */
  async cancelRun(runId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/runs/${runId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        message: 'Run cancelled successfully',
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Replay a run
   */
  async replayRun(runId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/runs/${runId}/replay`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        newRunId: response.data.id,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List events
   */
  async listEvents(limit = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/events`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: { limit }
      });

      return {
        success: true,
        events: response.data.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get event details
   */
  async getEvent(eventId) {
    try {
      const response = await axios.get(`${this.baseURL}/v1/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return {
        success: true,
        event: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Trigger a workflow
   */
  async triggerWorkflow(workflowName, data = {}) {
    return this.sendEvent(`workflow/${workflowName}`, data);
  }

  /**
   * Helper: Schedule a delayed event
   */
  async scheduleEvent(name, data, delaySeconds) {
    const ts = Date.now() + (delaySeconds * 1000);
    return this.sendEvent(name, data, null, ts);
  }

  /**
   * Helper: Send user event
   */
  async sendUserEvent(userId, eventName, data = {}) {
    return this.sendEvent(eventName, data, { id: userId });
  }

  /**
   * Helper: Batch send events
   */
  async batchSendEvents(eventName, dataArray) {
    const events = dataArray.map(data => ({
      name: eventName,
      data
    }));
    
    return this.sendEvents(events);
  }
}

module.exports = InngestIntegration;
