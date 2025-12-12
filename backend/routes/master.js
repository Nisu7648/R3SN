/**
 * Master API Routes - Exposes All R3SN Capabilities
 * Complete REST API for all engines and features
 */

const express = require('express');
const router = express.Router();
const { getInstance } = require('../core/MasterOrchestrator');

// Get master orchestrator instance
const getMaster = async () => {
  const master = getInstance();
  if (!master.initialized) {
    await master.initialize();
  }
  return master;
};

/**
 * Universal Execution
 */

// Execute any prompt
router.post('/execute', async (req, res) => {
  try {
    const master = await getMaster();
    const { task, context } = req.body;

    const result = await master.execute(task, context);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute universal prompt
router.post('/execute/prompt', async (req, res) => {
  try {
    const master = await getMaster();
    const { prompt, context } = req.body;

    const result = await master.execute({ prompt }, context);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Web Search
 */

// Universal search
router.post('/search', async (req, res) => {
  try {
    const master = await getMaster();
    const { query, options } = req.body;

    const result = await master.engines.webSearch.search(query, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search with specific provider
router.post('/search/:provider', async (req, res) => {
  try {
    const master = await getMaster();
    const { provider } = req.params;
    const { query, options } = req.body;

    const result = await master.engines.webSearch.search(query, {
      ...options,
      provider
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search and analyze with AI
router.post('/search/analyze', async (req, res) => {
  try {
    const master = await getMaster();
    const { query, options } = req.body;

    const result = await master.searchAndAnalyze(query, {
      ...options,
      analyzeWithAI: true
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get search statistics
router.get('/search/stats', async (req, res) => {
  try {
    const master = await getMaster();
    const stats = master.engines.webSearch.getStatistics();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * AI Operations
 */

// Analyze image
router.post('/ai/image/analyze', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.analyzeImage(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate image
router.post('/ai/image/generate', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.generateImage(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transcribe audio
router.post('/ai/audio/transcribe', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.transcribeAudio(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate speech
router.post('/ai/audio/generate', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.generateSpeech(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze video
router.post('/ai/video/analyze', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.analyzeVideo(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate video
router.post('/ai/video/generate', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.generateVideo(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze document
router.post('/ai/document/analyze', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.analyzeDocument(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Multi-modal reasoning
router.post('/ai/reasoning', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.multiModalReasoning(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start stream analysis
router.post('/ai/stream/start', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.multiModalAI.streamAnalysis(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop stream analysis
router.post('/ai/stream/stop/:streamId', async (req, res) => {
  try {
    const master = await getMaster();
    const { streamId } = req.params;
    
    const result = master.engines.multiModalAI.stopStreamAnalysis(streamId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Blockchain Operations
 */

// Execute smart contract
router.post('/blockchain/contract/execute', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.blockchain.executeContract(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Read smart contract
router.post('/blockchain/contract/read', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.blockchain.readContract(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Monitor blockchain events
router.post('/blockchain/events/monitor', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.blockchain.monitorEvents(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop monitoring events
router.post('/blockchain/events/stop/:listenerId', async (req, res) => {
  try {
    const master = await getMaster();
    const { listenerId } = req.params;
    
    const result = master.engines.blockchain.stopMonitoring(listenerId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get balance
router.post('/blockchain/balance', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.blockchain.getBalance(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transfer tokens
router.post('/blockchain/transfer', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.engines.blockchain.transfer(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DeFi operations
router.post('/blockchain/defi/:protocol/:operation', async (req, res) => {
  try {
    const master = await getMaster();
    const { protocol, operation } = req.params;
    
    const result = await master.engines.blockchain.defiOperation({
      protocol,
      operation,
      ...req.body
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// NFT operations
router.post('/blockchain/nft/:operation', async (req, res) => {
  try {
    const master = await getMaster();
    const { operation } = req.params;
    
    const result = await master.engines.blockchain.nftOperation({
      operation,
      ...req.body
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Scheduling
 */

// Schedule task
router.post('/schedule', async (req, res) => {
  try {
    const master = await getMaster();
    const { task, options } = req.body;
    
    const result = await master.engines.quantumScheduler.scheduleTask(task, options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scheduled tasks
router.get('/schedule/tasks', async (req, res) => {
  try {
    const master = await getMaster();
    const tasks = master.engines.quantumScheduler.getAllTasks();

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get task status
router.get('/schedule/tasks/:taskId', async (req, res) => {
  try {
    const master = await getMaster();
    const { taskId } = req.params;
    
    const task = master.engines.quantumScheduler.getTaskStatus(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel task
router.delete('/schedule/tasks/:taskId', async (req, res) => {
  try {
    const master = await getMaster();
    const { taskId } = req.params;
    
    const result = master.engines.quantumScheduler.cancelTask(taskId);

    res.json({
      success: result,
      message: result ? 'Task cancelled' : 'Task not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Workflow Optimization
 */

// Optimize workflow
router.post('/optimize/workflow', async (req, res) => {
  try {
    const master = await getMaster();
    const { workflow, context } = req.body;
    
    const result = await master.engines.neuralOrchestrator.optimizeWorkflow(workflow, context);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Train neural orchestrator
router.post('/optimize/train', async (req, res) => {
  try {
    const master = await getMaster();
    const { executionData } = req.body;
    
    await master.engines.neuralOrchestrator.train(executionData);

    res.json({
      success: true,
      message: 'Training complete'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Complex Workflows
 */

// Create complex workflow
router.post('/workflow/complex', async (req, res) => {
  try {
    const master = await getMaster();
    const result = await master.createComplexWorkflow(req.body);

    res.json({
      success: true,
      workflow: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * System Status
 */

// Get system status
router.get('/status', async (req, res) => {
  try {
    const master = await getMaster();
    const status = master.getStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get statistics
router.get('/statistics', async (req, res) => {
  try {
    const master = await getMaster();
    const stats = await master.getStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Advanced Combined Operations
 */

// Search and execute workflow
router.post('/advanced/search-workflow', async (req, res) => {
  try {
    const master = await getMaster();
    const { searchQuery, workflowConfig } = req.body;

    // Search first
    const searchResults = await master.engines.webSearch.search(searchQuery);

    // Create workflow with search results
    const workflow = await master.createComplexWorkflow({
      ...workflowConfig,
      steps: [
        { type: 'data', config: { data: searchResults } },
        ...workflowConfig.steps
      ]
    });

    // Execute workflow
    const result = await master.engines.workflowEngine.execute(workflow);

    res.json({
      success: true,
      searchResults,
      workflow,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI-powered blockchain transaction
router.post('/advanced/ai-blockchain', async (req, res) => {
  try {
    const master = await getMaster();
    const { transaction, verifyWithAI } = req.body;

    const result = await master.blockchainWithAI(transaction, verifyWithAI);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
