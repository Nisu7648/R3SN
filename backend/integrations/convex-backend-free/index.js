const axios = require('axios');

/**
 * Convex Backend Premium Integration
 * FREE Backend as a Service
 * Unlimited free tier (saves $50+/month)
 * Real-time database, serverless functions, file storage
 */
class ConvexIntegration {
  constructor(deployKey, deploymentUrl) {
    this.deployKey = deployKey || 'YOUR_CONVEX_DEPLOY_KEY';
    this.deploymentUrl = deploymentUrl || 'https://your-deployment.convex.cloud';
  }

  /**
   * Execute a query
   */
  async query(functionName, args = {}) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/query`,
        {
          path: functionName,
          args,
          format: 'json'
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.value,
        result: response.data.value
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a mutation
   */
  async mutation(functionName, args = {}) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/mutation`,
        {
          path: functionName,
          args,
          format: 'json'
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.value,
        result: response.data.value
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute an action
   */
  async action(functionName, args = {}) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/action`,
        {
          path: functionName,
          args,
          format: 'json'
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data.value,
        result: response.data.value
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
      const response = await axios.get(
        `${this.deploymentUrl}/api/list_functions`,
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`
          }
        }
      );

      return {
        success: true,
        data: response.data,
        functions: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(file, contentType = 'application/octet-stream') {
    try {
      // First, get upload URL
      const uploadUrlResponse = await axios.post(
        `${this.deploymentUrl}/api/storage/upload`,
        {},
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { uploadUrl, storageId } = uploadUrlResponse.data;

      // Upload file to the URL
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': contentType
        }
      });

      return {
        success: true,
        storageId,
        message: 'File uploaded successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(storageId) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/storage/getUrl`,
        { storageId },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        url: response.data.url,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(storageId) {
    try {
      await axios.post(
        `${this.deploymentUrl}/api/storage/delete`,
        { storageId },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule a function
   */
  async scheduleFunction(functionName, scheduledTime, args = {}) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/schedule`,
        {
          path: functionName,
          scheduledTime,
          args
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        jobId: response.data.jobId,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a scheduled function
   */
  async cancelScheduledFunction(jobId) {
    try {
      await axios.post(
        `${this.deploymentUrl}/api/cancel_job`,
        { jobId },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        message: 'Scheduled function cancelled successfully'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform full-text search
   */
  async search(indexName, query, limit = 10) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/search`,
        {
          indexName,
          query,
          limit
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        results: response.data.results,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform vector search
   */
  async vectorSearch(indexName, vector, limit = 10) {
    try {
      const response = await axios.post(
        `${this.deploymentUrl}/api/vector_search`,
        {
          indexName,
          vector,
          limit
        },
        {
          headers: {
            'Authorization': `Convex ${this.deployKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        results: response.data.results,
        data: response.data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Create a document
   */
  async createDocument(tableName, document) {
    return this.mutation(`${tableName}:create`, document);
  }

  /**
   * Helper: Get document by ID
   */
  async getDocument(tableName, id) {
    return this.query(`${tableName}:get`, { id });
  }

  /**
   * Helper: Update document
   */
  async updateDocument(tableName, id, updates) {
    return this.mutation(`${tableName}:update`, { id, ...updates });
  }

  /**
   * Helper: Delete document
   */
  async deleteDocument(tableName, id) {
    return this.mutation(`${tableName}:delete`, { id });
  }

  /**
   * Helper: List documents
   */
  async listDocuments(tableName, limit = 100) {
    return this.query(`${tableName}:list`, { limit });
  }
}

module.exports = ConvexIntegration;
