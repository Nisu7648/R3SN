const axios = require('axios');

/**
 * Trigger.dev Premium Integration
 * FREE Background Jobs & Workflows
 * 500,000 runs/month FREE (worth $500/month)
 * Scheduled jobs, webhooks, long-running tasks
 */
class TriggerDevIntegration {
  constructor(apiKey, apiUrl = 'https://api.trigger.dev') {
    this.apiKey = apiKey || 'YOUR_TRIGGER_DEV_API_KEY';
    this.apiUrl = apiUrl;
  }

  /**
   * Trigger a job
   */
  async triggerJob(jobId, payload = {}) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/jobs/${jobId}/trigger`,
        { payload },
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
        run: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get job run status
   */
  async getRunStatus(runId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        run: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List job runs
   */
  async listRuns(jobId = null, status = null, limit = 20) {
    try {
      const params = { limit };
      if (jobId) params.jobId = jobId;
      if (status) params.status = status;

      const response = await axios.get(
        `${this.apiUrl}/api/v1/runs`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          params
        }
      );

      return {
        success: true,
        data: response.data,
        runs: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a job run
   */
  async cancelRun(runId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/runs/${runId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
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
   * Replay a failed run
   */
  async replayRun(runId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/runs/${runId}/replay`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        run: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List jobs
   */
  async listJobs() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/jobs`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        jobs: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get job details
   */
  async getJob(jobId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        job: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a scheduled trigger
   */
  async createSchedule(jobId, cron, payload = {}) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/schedules`,
        {
          jobId,
          cron,
          payload
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
        schedule: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List schedules
   */
  async listSchedules() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/schedules`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        schedules: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/v1/schedules/${scheduleId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
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
   * Create webhook
   */
  async createWebhook(jobId, url, events = ['*']) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/webhooks`,
        {
          jobId,
          url,
          events
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
        webhook: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List webhooks
   */
  async listWebhooks() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/webhooks`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        webhooks: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/v1/webhooks/${webhookId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
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
   * Get environment variables
   */
  async getEnvironmentVariables() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/environment-variables`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        variables: response.data.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Set environment variable
   */
  async setEnvironmentVariable(key, value) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/environment-variables`,
        { key, value },
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
   * Delete environment variable
   */
  async deleteEnvironmentVariable(key) {
    try {
      const response = await axios.delete(
        `${this.apiUrl}/api/v1/environment-variables/${key}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
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
   * Get project usage
   */
  async getUsage() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/usage`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        usage: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = TriggerDevIntegration;
