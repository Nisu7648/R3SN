/**
 * API Designer Routes
 */

const express = require('express');
const router = express.Router();

// API Designer will be injected
let apiDesigner;

const setAPIDesigner = (designer) => {
  apiDesigner = designer;
};

/**
 * @route   POST /api/designer/apis
 * @desc    Create a new API design
 * @access  Public
 */
router.post('/apis', async (req, res) => {
  try {
    const api = apiDesigner.createAPI(req.body);

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/designer/apis
 * @desc    Get all APIs
 * @access  Public
 */
router.get('/apis', async (req, res) => {
  try {
    const apis = apiDesigner.getAllAPIs();

    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/designer/apis/:apiId
 * @desc    Get API by ID
 * @access  Public
 */
router.get('/apis/:apiId', async (req, res) => {
  try {
    const api = apiDesigner.getAPI(req.params.apiId);

    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/designer/apis/:apiId
 * @desc    Update API
 * @access  Public
 */
router.put('/apis/:apiId', async (req, res) => {
  try {
    const api = apiDesigner.updateAPI(req.params.apiId, req.body);

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/designer/apis/:apiId
 * @desc    Delete API
 * @access  Public
 */
router.delete('/apis/:apiId', async (req, res) => {
  try {
    apiDesigner.deleteAPI(req.params.apiId);

    res.json({
      success: true,
      message: 'API deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/designer/apis/:apiId/endpoints
 * @desc    Add endpoint to API
 * @access  Public
 */
router.post('/apis/:apiId/endpoints', async (req, res) => {
  try {
    const api = apiDesigner.getAPI(req.params.apiId);

    if (!api) {
      return res.status(404).json({
        success: false,
        error: 'API not found'
      });
    }

    const endpoint = apiDesigner.addEndpoint(api, req.body);

    res.json({
      success: true,
      data: endpoint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/designer/apis/:apiId/schema
 * @desc    Generate OpenAPI schema
 * @access  Public
 */
router.get('/apis/:apiId/schema', async (req, res) => {
  try {
    const schema = apiDesigner.generateSchema(req.params.apiId);

    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/designer/apis/:apiId/nodes
 * @desc    Convert API to workflow nodes
 * @access  Public
 */
router.get('/apis/:apiId/nodes', async (req, res) => {
  try {
    const nodes = apiDesigner.convertToNodes(req.params.apiId);

    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/designer/apis/:apiId/test/:endpointId
 * @desc    Test API endpoint
 * @access  Public
 */
router.post('/apis/:apiId/test/:endpointId', async (req, res) => {
  try {
    const result = await apiDesigner.testEndpoint(
      req.params.apiId,
      req.params.endpointId,
      req.body
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/designer/import/schema
 * @desc    Import API from OpenAPI schema
 * @access  Public
 */
router.post('/import/schema', async (req, res) => {
  try {
    const api = apiDesigner.importFromSchema(req.body);

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/designer/import/url
 * @desc    Import API from URL
 * @access  Public
 */
router.post('/import/url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const api = await apiDesigner.importFromURL(url);

    res.json({
      success: true,
      data: api
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/designer/apis/:apiId/export
 * @desc    Export API as JSON
 * @access  Public
 */
router.get('/apis/:apiId/export', async (req, res) => {
  try {
    const json = apiDesigner.exportAPI(req.params.apiId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="api-${req.params.apiId}.json"`);
    res.send(json);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, setAPIDesigner };
