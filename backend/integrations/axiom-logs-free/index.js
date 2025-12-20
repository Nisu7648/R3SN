const axios = require('axios');

/**
 * Axiom Log Management Premium Integration
 * FREE Log Management & Analytics
 * 500GB/month FREE (saves $200+/month)
 * Better than Datadog/Splunk
 */
class AxiomIntegration {
  constructor(apiToken, orgId = null) {
    this.apiToken = apiToken || 'YOUR_AXIOM_API_TOKEN';
    this.orgId = orgId;
    this.baseURL = 'https://api.axiom.co';
  }

  /**
   * Ingest logs to a dataset
   */
  async ingestLogs(dataset, logs) {
    try {
      const logsArray = Array.isArray(logs) ? logs : [logs];
      
      const response = await axios.post(
        `${this.baseURL}/v1/datasets/${dataset}/ingest`,
        logsArray,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        ingested: response.data.ingested,
        failed: response.data.failed,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Query logs from a dataset
   */
  async query(dataset, apl, startTime = null, endTime = null) {
    try {
      const payload = { apl };
      
      if (startTime) payload.startTime = startTime;
      if (endTime) payload.endTime = endTime;

      const response = await axios.post(
        `${this.baseURL}/v1/datasets/${dataset}/query`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        matches: response.data.matches,
        buckets: response.data.buckets,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all datasets
   */
  async listDatasets() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/datasets`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
        }
      });

      return {
        success: true,
        datasets: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new dataset
   */
  async createDataset(name, description = '') {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/datasets`,
        { name, description },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        dataset: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get dataset info
   */
  async getDataset(dataset) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1/datasets/${dataset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        dataset: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a dataset
   */
  async deleteDataset(dataset) {
    try {
      await axios.delete(`${this.baseURL}/v1/datasets/${dataset}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
        }
      });

      return {
        success: true,
        message: `Dataset ${dataset} deleted successfully`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all monitors
   */
  async listMonitors() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/monitors`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
        }
      });

      return {
        success: true,
        monitors: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a monitor
   */
  async createMonitor(monitorData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/monitors`,
        monitorData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        monitor: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a monitor
   */
  async updateMonitor(monitorId, updates) {
    try {
      const response = await axios.put(
        `${this.baseURL}/v1/monitors/${monitorId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        monitor: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a monitor
   */
  async deleteMonitor(monitorId) {
    try {
      await axios.delete(`${this.baseURL}/v1/monitors/${monitorId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
        }
      });

      return {
        success: true,
        message: 'Monitor deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all notifiers
   */
  async listNotifiers() {
    try {
      const response = await axios.get(`${this.baseURL}/v1/notifiers`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
        }
      });

      return {
        success: true,
        notifiers: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a notifier
   */
  async createNotifier(notifierData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/v1/notifiers`,
        notifierData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...(this.orgId && { 'X-Axiom-Org-Id': this.orgId })
          }
        }
      );

      return {
        success: true,
        notifier: response.data,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Log an event
   */
  async logEvent(dataset, event) {
    const logEntry = {
      _time: new Date().toISOString(),
      ...event
    };
    
    return this.ingestLogs(dataset, logEntry);
  }

  /**
   * Helper: Log multiple events
   */
  async logEvents(dataset, events) {
    const logEntries = events.map(event => ({
      _time: new Date().toISOString(),
      ...event
    }));
    
    return this.ingestLogs(dataset, logEntries);
  }

  /**
   * Helper: Search logs
   */
  async searchLogs(dataset, searchTerm, limit = 100) {
    const apl = `['${dataset}'] | where _raw contains "${searchTerm}" | limit ${limit}`;
    return this.query(dataset, apl);
  }

  /**
   * Helper: Get recent logs
   */
  async getRecentLogs(dataset, minutes = 60, limit = 100) {
    const apl = `['${dataset}'] | where _time > ago(${minutes}m) | limit ${limit}`;
    return this.query(dataset, apl);
  }

  /**
   * Helper: Count logs by field
   */
  async countByField(dataset, field, minutes = 60) {
    const apl = `['${dataset}'] | where _time > ago(${minutes}m) | summarize count() by ${field}`;
    return this.query(dataset, apl);
  }
}

module.exports = AxiomIntegration;
