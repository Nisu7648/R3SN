const fs = require('fs');
const path = require('path');

/**
 * API Endpoint: GET /api/integrations/list
 * Returns all available integrations with their metadata and connection status
 */
module.exports = async (req, res) => {
  try {
    const integrationsDir = path.join(process.cwd(), 'backend', 'integrations');
    
    // Read all integration folders
    const folders = fs.readdirSync(integrationsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const integrations = [];

    // Load metadata for each integration
    for (const folder of folders) {
      const metadataPath = path.join(integrationsDir, folder, 'metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          
          // Check if integration is connected (check from database or config)
          const connected = await checkConnectionStatus(metadata.name, req.user?.id);
          
          integrations.push({
            ...metadata,
            connected,
            folder
          });
        } catch (error) {
          console.error(`Error loading metadata for ${folder}:`, error);
        }
      }
    }

    // Sort by: connected first, then by name
    integrations.sort((a, b) => {
      if (a.connected && !b.connected) return -1;
      if (!a.connected && b.connected) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    res.status(200).json({
      success: true,
      count: integrations.length,
      integrations
    });

  } catch (error) {
    console.error('Error listing integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load integrations',
      message: error.message
    });
  }
};

/**
 * Check if integration is connected for user
 * This should query your database to check stored credentials
 */
async function checkConnectionStatus(integrationName, userId) {
  if (!userId) return false;

  try {
    // TODO: Replace with actual database query
    // Example: Check if credentials exist in database
    // const connection = await db.integrationConnections.findOne({
    //   userId,
    //   integrationName,
    //   status: 'active'
    // });
    // return !!connection;

    // For now, return false (not connected)
    return false;
  } catch (error) {
    console.error('Error checking connection status:', error);
    return false;
  }
}
