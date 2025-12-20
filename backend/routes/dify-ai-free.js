const express = require('express');
const router = express.Router();
const DifyAIFreeIntegration = require('../integrations/dify-ai-free');

router.post('/execute', async (req, res) => {
  try {
    const { action, params, config } = req.body;
    
    const integration = new DifyAIFreeIntegration(config);
    const result = await integration.execute(action, params);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
