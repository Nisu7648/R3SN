/**
 * Simple API Routes - Basic Working Endpoints
 * These are simple, tested, working endpoints without complex dependencies
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * 1. SIMPLE WEB SEARCH
 * Uses DuckDuckGo (no API key needed)
 */
router.post('/search/simple', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Use DuckDuckGo Instant Answer API (free, no key needed)
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      },
      timeout: 10000
    });

    res.json({
      success: true,
      query,
      provider: 'DuckDuckGo',
      results: {
        abstract: response.data.Abstract,
        abstractText: response.data.AbstractText,
        abstractSource: response.data.AbstractSource,
        abstractURL: response.data.AbstractURL,
        image: response.data.Image,
        heading: response.data.Heading,
        relatedTopics: response.data.RelatedTopics?.slice(0, 5) || [],
        answer: response.data.Answer,
        type: response.data.Type
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to perform search'
    });
  }
});

/**
 * 2. SIMPLE TEXT ANALYSIS
 * Basic text processing without AI
 */
router.post('/text/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    // Basic text analysis
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    // Word frequency
    const wordFreq = {};
    words.forEach(word => {
      const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 3) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    // Top words
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Average lengths
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const avgSentenceLength = words.length / sentences.length;

    res.json({
      success: true,
      analysis: {
        statistics: {
          characters: text.length,
          words: words.length,
          sentences: sentences.length,
          paragraphs: paragraphs.length,
          avgWordLength: Math.round(avgWordLength * 10) / 10,
          avgSentenceLength: Math.round(avgSentenceLength * 10) / 10
        },
        topWords,
        readingTime: Math.ceil(words.length / 200) // ~200 words per minute
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 3. SIMPLE URL METADATA
 * Fetch and parse URL metadata
 */
router.post('/url/metadata', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Fetch URL
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; R3SN/1.0)'
      }
    });

    const html = response.data;
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      url,
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[name="description"]').attr('content') || 
                   $('meta[property="og:description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || '',
      siteName: $('meta[property="og:site_name"]').attr('content') || '',
      type: $('meta[property="og:type"]').attr('content') || 'website',
      author: $('meta[name="author"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || url,
      favicon: $('link[rel="icon"]').attr('href') || 
               $('link[rel="shortcut icon"]').attr('href') || '',
      language: $('html').attr('lang') || 'en'
    };

    res.json({
      success: true,
      metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to fetch URL metadata'
    });
  }
});

/**
 * 4. SIMPLE DATA TRANSFORMATION
 * Convert between JSON, CSV, XML
 */
router.post('/data/transform', async (req, res) => {
  try {
    const { data, from, to } = req.body;

    if (!data || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'data, from, and to parameters are required'
      });
    }

    let result;

    // JSON to CSV
    if (from === 'json' && to === 'csv') {
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      const array = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      if (array.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Empty data array'
        });
      }

      const headers = Object.keys(array[0]);
      const csvRows = [headers.join(',')];
      
      array.forEach(obj => {
        const values = headers.map(header => {
          const value = obj[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        });
        csvRows.push(values.join(','));
      });

      result = csvRows.join('\n');
    }
    // CSV to JSON
    else if (from === 'csv' && to === 'json') {
      const lines = data.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      result = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });
    }
    // JSON to XML
    else if (from === 'json' && to === 'xml') {
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      
      const jsonToXml = (obj, rootName = 'root') => {
        let xml = `<${rootName}>`;
        
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              xml += jsonToXml(item, key);
            });
          } else if (typeof value === 'object' && value !== null) {
            xml += jsonToXml(value, key);
          } else {
            xml += `<${key}>${value}</${key}>`;
          }
        }
        
        xml += `</${rootName}>`;
        return xml;
      };

      result = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(jsonData);
    }
    else {
      return res.status(400).json({
        success: false,
        error: `Transformation from ${from} to ${to} not supported`
      });
    }

    res.json({
      success: true,
      from,
      to,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Failed to transform data'
    });
  }
});

/**
 * 5. SIMPLE MATH OPERATIONS
 * Basic calculator API
 */
router.post('/math/calculate', async (req, res) => {
  try {
    const { expression, operation, numbers } = req.body;

    let result;

    // Expression evaluation
    if (expression) {
      // Safe eval using Function constructor (limited operations)
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      try {
        result = Function(`'use strict'; return (${sanitized})`)();
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid mathematical expression'
        });
      }
    }
    // Operation on array of numbers
    else if (operation && numbers && Array.isArray(numbers)) {
      switch (operation) {
        case 'sum':
          result = numbers.reduce((a, b) => a + b, 0);
          break;
        case 'average':
          result = numbers.reduce((a, b) => a + b, 0) / numbers.length;
          break;
        case 'min':
          result = Math.min(...numbers);
          break;
        case 'max':
          result = Math.max(...numbers);
          break;
        case 'median':
          const sorted = [...numbers].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          result = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unknown operation: ${operation}`
          });
      }
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'Either expression or (operation + numbers) required'
      });
    }

    res.json({
      success: true,
      result,
      input: { expression, operation, numbers },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 6. SIMPLE STRING OPERATIONS
 * Text manipulation utilities
 */
router.post('/string/manipulate', async (req, res) => {
  try {
    const { text, operations } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    let result = text;
    const appliedOps = [];

    // Apply operations
    if (operations && Array.isArray(operations)) {
      operations.forEach(op => {
        switch (op) {
          case 'uppercase':
            result = result.toUpperCase();
            appliedOps.push('uppercase');
            break;
          case 'lowercase':
            result = result.toLowerCase();
            appliedOps.push('lowercase');
            break;
          case 'capitalize':
            result = result.replace(/\b\w/g, l => l.toUpperCase());
            appliedOps.push('capitalize');
            break;
          case 'reverse':
            result = result.split('').reverse().join('');
            appliedOps.push('reverse');
            break;
          case 'trim':
            result = result.trim();
            appliedOps.push('trim');
            break;
          case 'removeSpaces':
            result = result.replace(/\s+/g, '');
            appliedOps.push('removeSpaces');
            break;
          case 'slug':
            result = result.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            appliedOps.push('slug');
            break;
        }
      });
    }

    res.json({
      success: true,
      original: text,
      result,
      operations: appliedOps,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
