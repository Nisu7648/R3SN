const express = require('express');
const router = express.Router();
const FreeStreamingAggregator = require('../integrations/streaming/FreeStreamingAggregator');

// Initialize free streaming aggregator
const freeStreaming = new FreeStreamingAggregator();

/**
 * @route GET /api/free-streaming/platforms
 * @desc Get all free streaming platforms (100% free, no subscription needed)
 */
router.get('/platforms', (req, res) => {
  try {
    const platforms = freeStreaming.getFreePlatforms();
    res.json(platforms);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/search
 * @desc Search for FREE content across all free platforms
 * @example /api/free-streaming/search?query=Inception&type=movie
 */
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const results = await freeStreaming.searchFreeContent(query, type);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/links
 * @desc Get direct FREE streaming links for a title
 * @example /api/free-streaming/links?title=The Matrix
 */
router.get('/links', async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title parameter is required'
      });
    }

    const links = await freeStreaming.getStreamingLinks(title);
    res.json(links);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/check
 * @desc Check if content is available for FREE
 * @example /api/free-streaming/check?title=Inception
 */
router.get('/check', async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title parameter is required'
      });
    }

    const availability = await freeStreaming.checkFreeAvailability(title);
    res.json(availability);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/trending
 * @desc Get trending FREE content
 */
router.get('/trending', async (req, res) => {
  try {
    const trending = await freeStreaming.getTrendingFree();
    res.json(trending);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/genre
 * @desc Get FREE content by genre
 * @example /api/free-streaming/genre?genre=action
 */
router.get('/genre', async (req, res) => {
  try {
    const { genre } = req.query;
    
    if (!genre) {
      return res.status(400).json({
        success: false,
        error: 'Genre parameter is required'
      });
    }

    const content = await freeStreaming.getFreeByGenre(genre);
    res.json(content);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/recommendations
 * @desc Get recommendations for FREE streaming platforms
 * @example /api/free-streaming/recommendations?genre=comedy
 */
router.get('/recommendations', async (req, res) => {
  try {
    const { genre = 'action' } = req.query;
    const recommendations = await freeStreaming.getFreeRecommendations(genre);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/youtube-movies
 * @desc Search YouTube for FREE full movies
 * @example /api/free-streaming/youtube-movies?query=action movies
 */
router.get('/youtube-movies', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const movies = await freeStreaming.searchYouTubeFreeMovies(query);
    res.json({
      success: true,
      query,
      platform: 'YouTube Free Movies',
      cost: 'FREE',
      count: movies.length,
      movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/free-streaming/archive
 * @desc Search Internet Archive for FREE public domain content
 * @example /api/free-streaming/archive?query=classic movies&type=movie
 */
router.get('/archive', async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const content = await freeStreaming.searchInternetArchive(query, type);
    res.json({
      success: true,
      query,
      platform: 'Internet Archive',
      cost: 'FREE - Public Domain',
      count: content.length,
      content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
