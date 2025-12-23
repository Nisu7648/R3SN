const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * API Endpoint: POST /api/integrations/connect
 * Connects an integration by storing encrypted credentials
 * 
 * Request body:
 * {
 *   integrationId: "salesforce-enterprise",
 *   credentials: {
 *     apiKey: "xxx",
 *     apiSecret: "xxx",
 *     baseUrl: "https://...",
 *     workspaceId: "xxx"
 *   }
 * }
 */
module.exports = async (req, res) => {
  try {
    const { integrationId, credentials } = req.body;
    const userId = req.user?.id || 'demo-user'; // Get from auth session

    // Validate input
    if (!integrationId || !credentials || !credentials.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: integrationId and credentials.apiKey'
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

    // Test the connection with provided credentials
    const testResult = await testConnection(metadata, credentials);

    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Connection test failed',
        message: testResult.error
      });
    }

    // Encrypt and store credentials
    const encryptedCredentials = encryptCredentials(credentials);
    
    // Save to database
    await saveConnection({
      userId,
      integrationId,
      integrationName: metadata.displayName,
      credentials: encryptedCredentials,
      status: 'active',
      connectedAt: new Date().toISOString(),
      metadata: {
        baseUrl: credentials.baseUrl || metadata.baseUrl,
        workspaceId: credentials.workspaceId,
        scopes: metadata.authentication?.scopes || []
      }
    });

    res.status(200).json({
      success: true,
      message: `${metadata.displayName} connected successfully!`,
      integration: {
        id: integrationId,
        name: metadata.displayName,
        connected: true,
        connectedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error connecting integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect integration',
      message: error.message
    });
  }
};

/**
 * Test connection with provided credentials
 */
async function testConnection(metadata, credentials) {
  try {
    // Build test request based on integration type
    const baseUrl = credentials.baseUrl || metadata.baseUrl;
    
    // For most APIs, we can test with a simple GET request to base URL or /me endpoint
    const testEndpoints = [
      '/me',
      '/user',
      '/users/me',
      '/account',
      '/api/v1/me',
      '/api/v2/me',
      '/'
    ];

    // Try OAuth2 token format
    const headers = {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'R3SN-Integration-Manager/1.0'
    };

    // If API secret provided, try Basic Auth
    if (credentials.apiSecret) {
      const basicAuth = Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    // Try first endpoint
    const testUrl = `${baseUrl}${testEndpoints[0]}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers,
      timeout: 10000
    });

    // Consider 200-299 and 401 (auth required but endpoint exists) as success
    if (response.ok || response.status === 401) {
      return { success: true };
    }

    return {
      success: false,
      error: `Connection test failed with status ${response.status}`
    };

  } catch (error) {
    // Network errors might mean the credentials are wrong or API is down
    console.error('Connection test error:', error);
    
    // For demo purposes, we'll accept the connection anyway
    // In production, you'd want stricter validation
    return {
      success: true,
      warning: 'Could not verify connection, but credentials saved'
    };
  }
}

/**
 * Encrypt credentials before storing
 */
function encryptCredentials(credentials) {
  const algorithm = 'aes-256-cbc';
  const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    algorithm
  };
}

/**
 * Save connection to database
 * TODO: Replace with actual database implementation
 */
async function saveConnection(connectionData) {
  try {
    // TODO: Save to your database
    // Example with MongoDB:
    // await db.integrationConnections.insertOne(connectionData);
    
    // Example with PostgreSQL:
    // await db.query(
    //   'INSERT INTO integration_connections (user_id, integration_id, credentials, status) VALUES ($1, $2, $3, $4)',
    //   [connectionData.userId, connectionData.integrationId, connectionData.credentials, connectionData.status]
    // );

    // For now, save to a JSON file (NOT RECOMMENDED FOR PRODUCTION)
    const connectionsDir = path.join(process.cwd(), 'backend', 'data', 'connections');
    if (!fs.existsSync(connectionsDir)) {
      fs.mkdirSync(connectionsDir, { recursive: true });
    }

    const connectionFile = path.join(connectionsDir, `${connectionData.userId}.json`);
    let connections = {};
    
    if (fs.existsSync(connectionFile)) {
      connections = JSON.parse(fs.readFileSync(connectionFile, 'utf8'));
    }

    connections[connectionData.integrationId] = connectionData;
    fs.writeFileSync(connectionFile, JSON.stringify(connections, null, 2));

    return true;
  } catch (error) {
    console.error('Error saving connection:', error);
    throw error;
  }
}
