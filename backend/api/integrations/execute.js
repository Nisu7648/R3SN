const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * API Endpoint: POST /api/integrations/execute
 * Executes an action on a connected integration
 * 
 * Request body:
 * {
 *   integrationId: "salesforce-enterprise",
 *   endpointId: "create_contact",
 *   params: {
 *     firstName: "John",
 *     lastName: "Doe",
 *     email: "john@example.com"
 *   }
 * }
 */
module.exports = async (req, res) => {
  try {
    const { integrationId, endpointId, params } = req.body;
    const userId = req.user?.id || 'demo-user';

    // Validate input
    if (!integrationId || !endpointId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: integrationId and endpointId'
      });
    }

    // Load integration metadata
    const metadataPath = path.join(
      process.cwd(),
      'backend',
      'integrations',
      integrationId,
      'metadata.json'
    );

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Find endpoint
    const endpoint = metadata.endpoints?.find(e => e.id === endpointId);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    // Get stored credentials
    const credentials = await getCredentials(userId, integrationId);
    if (!credentials) {
      return res.status(401).json({
        success: false,
        error: 'Integration not connected. Please connect first.'
      });
    }

    // Execute the API call
    const result = await executeEndpoint(metadata, endpoint, credentials, params);

    res.status(200).json({
      success: true,
      integration: metadata.displayName,
      endpoint: endpoint.name,
      result
    });

  } catch (error) {
    console.error('Error executing integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute integration',
      message: error.message
    });
  }
};

/**
 * Get decrypted credentials from storage
 */
async function getCredentials(userId, integrationId) {
  try {
    // TODO: Get from your database
    // For now, read from JSON file
    const connectionsDir = path.join(process.cwd(), 'backend', 'data', 'connections');
    const connectionFile = path.join(connectionsDir, `${userId}.json`);

    if (!fs.existsSync(connectionFile)) {
      return null;
    }

    const connections = JSON.parse(fs.readFileSync(connectionFile, 'utf8'));
    const connection = connections[integrationId];

    if (!connection) {
      return null;
    }

    // Decrypt credentials
    return decryptCredentials(connection.credentials);
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
}

/**
 * Decrypt stored credentials
 */
function decryptCredentials(encryptedData) {
  try {
    const algorithm = encryptedData.algorithm || 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    const iv = Buffer.from(encryptedData.iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting credentials:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Execute API endpoint
 */
async function executeEndpoint(metadata, endpoint, credentials, params) {
  try {
    const baseUrl = credentials.baseUrl || metadata.baseUrl;
    
    // Build URL with path parameters
    let url = `${baseUrl}${endpoint.path}`;
    
    // Replace path parameters
    if (params) {
      Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, params[key]);
      });
    }

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'R3SN-Integration-Manager/1.0'
    };

    // Add authentication
    if (metadata.authentication?.type === 'oauth2') {
      headers['Authorization'] = `Bearer ${credentials.apiKey}`;
    } else if (credentials.apiSecret) {
      const basicAuth = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    } else {
      headers['Authorization'] = `Bearer ${credentials.apiKey}`;
    }

    // Build request options
    const options = {
      method: endpoint.method || 'GET',
      headers,
      timeout: 30000
    };

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(options.method) && params) {
      options.body = JSON.stringify(params);
    }

    // Execute request
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return {
      status: response.status,
      data
    };

  } catch (error) {
    console.error('Error executing endpoint:', error);
    throw error;
  }
}
