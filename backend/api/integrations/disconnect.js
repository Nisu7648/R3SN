const fs = require('fs');
const path = require('path');

/**
 * API Endpoint: POST /api/integrations/disconnect
 * Disconnects an integration by removing stored credentials
 * 
 * Request body:
 * {
 *   integrationId: "salesforce-enterprise"
 * }
 */
module.exports = async (req, res) => {
  try {
    const { integrationId } = req.body;
    const userId = req.user?.id || 'demo-user'; // Get from auth session

    // Validate input
    if (!integrationId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: integrationId'
      });
    }

    // Remove from database
    const removed = await removeConnection(userId, integrationId);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Integration disconnected successfully',
      integrationId
    });

  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect integration',
      message: error.message
    });
  }
};

/**
 * Remove connection from database
 * TODO: Replace with actual database implementation
 */
async function removeConnection(userId, integrationId) {
  try {
    // TODO: Remove from your database
    // Example with MongoDB:
    // const result = await db.integrationConnections.deleteOne({
    //   userId,
    //   integrationId
    // });
    // return result.deletedCount > 0;
    
    // Example with PostgreSQL:
    // const result = await db.query(
    //   'DELETE FROM integration_connections WHERE user_id = $1 AND integration_id = $2',
    //   [userId, integrationId]
    // );
    // return result.rowCount > 0;

    // For now, remove from JSON file (NOT RECOMMENDED FOR PRODUCTION)
    const connectionsDir = path.join(process.cwd(), 'backend', 'data', 'connections');
    const connectionFile = path.join(connectionsDir, `${userId}.json`);
    
    if (!fs.existsSync(connectionFile)) {
      return false;
    }

    const connections = JSON.parse(fs.readFileSync(connectionFile, 'utf8'));
    
    if (!connections[integrationId]) {
      return false;
    }

    delete connections[integrationId];
    fs.writeFileSync(connectionFile, JSON.stringify(connections, null, 2));

    return true;
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
}
