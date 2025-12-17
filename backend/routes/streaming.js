const express = require('express');
const router = express.Router();
const StreamingManager = require('../integrations/streaming/StreamingManager');

// Initialize streaming manager
const streaming = new StreamingManager();

/**
 * @route GET /api/streaming/platforms
 * @desc Get all supported streaming platforms
 */
router.get('/platforms', (req, res) => {
  try {
    const stats = streaming.getPlatformStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/streaming/platform/:platform/toggle
 * @desc Enable/disable a platform
 */
router.post('/platform/:platform/toggle', (req, res) => {
  try {
    const { enabled } = req.body;
    const result = streaming.togglePlatform(req.params.platform, enabled);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/search
 * @desc Search across all platforms or specific platform
 */
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'all', platform = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    let result;
    if (platform === 'all') {
      result = await streaming.searchAll(query, type);
    } else {
      result = await streaming.searchPlatform(platform, query, type);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/availability
 * @desc Check content availability across platforms
 */
router.get('/availability', async (req, res) => {
  try {
    const { title, country = 'us' } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title parameter is required'
      });
    }

    const result = await streaming.getAvailability(title, country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/trending
 * @desc Get trending content
 */
router.get('/trending', async (req, res) => {
  try {
    const { platform = 'all', country = 'us' } = req.query;
    const result = await streaming.getTrending(platform, country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/new-releases
 * @desc Get new releases
 */
router.get('/new-releases', async (req, res) => {
  try {
    const { platform = 'all', country = 'us', days = 7 } = req.query;
    const result = await streaming.getNewReleases(platform, country, parseInt(days));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/genre
 * @desc Get content by genre
 */
router.get('/genre', async (req, res) => {
  try {
    const { genre, platform = 'all', country = 'us' } = req.query;
    
    if (!genre) {
      return res.status(400).json({
        success: false,
        error: 'Genre parameter is required'
      });
    }

    const result = await streaming.getByGenre(genre, platform, country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/compare-prices
 * @desc Compare prices across platforms
 */
router.get('/compare-prices', async (req, res) => {
  try {
    const { title, country = 'us' } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title parameter is required'
      });
    }

    const result = await streaming.comparePrices(title, country);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/netflix/search
 * @desc Search Netflix specifically
 */
router.get('/netflix/search', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const result = await streaming.searchPlatform('netflix', query, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/prime/search
 * @desc Search Prime Video specifically
 */
router.get('/prime/search', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const result = await streaming.searchPlatform('prime', query, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/disney/search
 * @desc Search Disney+ specifically
 */
router.get('/disney/search', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const result = await streaming.searchPlatform('disney', query, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/hbo/search
 * @desc Search HBO Max specifically
 */
router.get('/hbo/search', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const result = await streaming.searchPlatform('hbo', query, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/youtube/search
 * @desc Search YouTube Premium specifically
 */
router.get('/youtube/search', async (req, res) => {
  try {
    const { query, maxResults = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const result = await streaming.searchYouTube(query, parseInt(maxResults));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/streaming/youtube/trending
 * @desc Get YouTube trending videos
 */
router.get('/youtube/trending', async (req, res) => {
  try {
    const { regionCode = 'US', maxResults = 20 } = req.query;
    const result = await streaming.getYouTubeTrending(regionCode, parseInt(maxResults));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
