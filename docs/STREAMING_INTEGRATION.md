# 📺 Streaming Services Integration - 10 Platforms

Complete integration with **10 major streaming platforms** for content discovery, search, and tracking.

## 📋 Table of Contents
- [Supported Platforms](#supported-platforms)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)

---

## 🎬 Supported Platforms

| Platform | Content Type | Region Support |
|----------|--------------|----------------|
| **Netflix** | Movies, Series | Global |
| **Amazon Prime Video** | Movies, Series, Originals | Global |
| **Disney+** | Movies, Series, Marvel, Star Wars | Global |
| **HBO Max** | Movies, Series, Originals | US, EU |
| **Hulu** | Movies, Series, Live TV | US |
| **Apple TV+** | Originals, Movies, Series | Global |
| **Paramount+** | Movies, Series, CBS Content | US, Global |
| **Peacock** | Movies, Series, NBC Content | US |
| **Discovery+** | Documentaries, Reality | Global |
| **YouTube Premium** | Videos, Originals | Global |

---

## ✨ Features

### Core Capabilities
- ✅ **Universal Search** - Search across all platforms
- ✅ **Content Discovery** - Find movies & series
- ✅ **Availability Check** - See where content is available
- ✅ **Trending Content** - Get what's popular
- ✅ **New Releases** - Latest additions
- ✅ **Genre Filtering** - Browse by category
- ✅ **Price Comparison** - Compare subscription/rental costs
- ✅ **Multi-Region** - Support for different countries

### Platform-Specific
- 🎥 **Netflix** - Expiring soon, top rated
- 📦 **Prime Video** - Amazon originals
- 🏰 **Disney+** - Marvel, Star Wars, Pixar
- 🎭 **HBO Max** - HBO originals, Warner Bros
- 📺 **Hulu** - Live TV integration
- 🍎 **Apple TV+** - Apple originals
- ⭐ **Paramount+** - CBS, MTV, Nickelodeon
- 🦚 **Peacock** - NBC, Universal content
- 🔍 **Discovery+** - Discovery networks
- ▶️ **YouTube** - Trending, search, channels

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# .env file
RAPIDAPI_KEY=your_rapidapi_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 2. Initialize Streaming Manager

```javascript
const StreamingManager = require('./backend/integrations/streaming/StreamingManager');

const streaming = new StreamingManager({
  rapidAPIKey: process.env.RAPIDAPI_KEY,
  youtubeAPIKey: process.env.YOUTUBE_API_KEY
});

// Get platform stats
const stats = streaming.getPlatformStats();
console.log(stats);
```

### 3. Search Content

```javascript
// Search across all platforms
const results = await streaming.searchAll('Stranger Things');

// Search specific platform
const netflixResults = await streaming.searchPlatform('netflix', 'Breaking Bad');
```

---

## 📚 API Reference

### Platform Management

#### Get All Platforms
```http
GET /api/streaming/platforms
```

**Response:**
```json
{
  "success": true,
  "totalPlatforms": 10,
  "enabledPlatforms": 10,
  "platforms": [
    {
      "key": "netflix",
      "name": "Netflix",
      "enabled": true
    },
    ...
  ]
}
```

#### Toggle Platform
```http
POST /api/streaming/platform/:platform/toggle
Content-Type: application/json

{
  "enabled": false
}
```

### Search Operations

#### Universal Search
```http
GET /api/streaming/search?query=Inception&type=movie&platform=all
```

**Parameters:**
- `query` (required): Search term
- `type` (optional): `movie`, `series`, or `all` (default: `all`)
- `platform` (optional): Platform key or `all` (default: `all`)

**Example:**
```bash
curl "http://localhost:3000/api/streaming/search?query=The%20Matrix&type=movie"
```

**Response:**
```json
{
  "success": true,
  "query": "The Matrix",
  "type": "movie",
  "platforms": {
    "netflix": {
      "success": true,
      "platform": "Netflix",
      "results": [...]
    },
    "prime": {
      "success": true,
      "platform": "Amazon Prime Video",
      "results": [...]
    },
    ...
  },
  "totalResults": 45
}
```

#### Platform-Specific Search
```http
GET /api/streaming/netflix/search?query=Stranger Things
GET /api/streaming/prime/search?query=The Boys
GET /api/streaming/disney/search?query=The Mandalorian
GET /api/streaming/hbo/search?query=Game of Thrones
GET /api/streaming/youtube/search?query=Tech Reviews&maxResults=20
```

### Content Discovery

#### Check Availability
```http
GET /api/streaming/availability?title=Inception&country=us
```

**Response:**
```json
{
  "success": true,
  "title": "Inception",
  "year": 2010,
  "type": "movie",
  "availability": {
    "netflix": {...},
    "prime": {...},
    "hbo": {...}
  },
  "platforms": ["netflix", "prime", "hbo"]
}
```

#### Get Trending
```http
GET /api/streaming/trending?platform=all&country=us
```

**Response:**
```json
{
  "success": true,
  "country": "us",
  "platforms": {
    "netflix": {
      "success": true,
      "platform": "Netflix",
      "trending": [...]
    },
    ...
  }
}
```

#### Get New Releases
```http
GET /api/streaming/new-releases?platform=netflix&country=us&days=7
```

**Parameters:**
- `platform` (optional): Platform key or `all` (default: `all`)
- `country` (optional): Country code (default: `us`)
- `days` (optional): Number of days (default: `7`)

#### Browse by Genre
```http
GET /api/streaming/genre?genre=action&platform=all&country=us
```

**Supported Genres:**
- Action
- Comedy
- Drama
- Horror
- Thriller
- Romance
- Sci-Fi
- Documentary
- Animation
- Fantasy

### Price Comparison

#### Compare Prices
```http
GET /api/streaming/compare-prices?title=Dune&country=us
```

**Response:**
```json
{
  "success": true,
  "title": "Dune",
  "country": "us",
  "prices": {
    "netflix": {
      "platform": "Netflix",
      "subscription": "$15.49/month",
      "rent": null,
      "buy": null
    },
    "prime": {
      "platform": "Amazon Prime Video",
      "subscription": "$14.99/month",
      "rent": "$3.99",
      "buy": "$14.99"
    },
    ...
  }
}
```

### YouTube Specific

#### YouTube Search
```http
GET /api/streaming/youtube/search?query=AI Tutorial&maxResults=20
```

#### YouTube Trending
```http
GET /api/streaming/youtube/trending?regionCode=US&maxResults=20
```

**Response:**
```json
{
  "success": true,
  "platform": "YouTube Premium",
  "regionCode": "US",
  "trending": [
    {
      "id": "dQw4w9WgXcQ",
      "title": "Amazing Video",
      "description": "...",
      "thumbnail": "https://...",
      "channelTitle": "Cool Channel",
      "viewCount": "1000000",
      "likeCount": "50000"
    },
    ...
  ]
}
```

---

## 💡 Examples

### Example 1: Find Where to Watch a Movie

```javascript
const streaming = new StreamingManager();

// Check availability
const availability = await streaming.getAvailability('The Dark Knight', 'us');

console.log(`"${availability.title}" is available on:`);
availability.platforms.forEach(platform => {
  console.log(`- ${platform}`);
});
```

### Example 2: Get Trending Across All Platforms

```javascript
const trending = await streaming.getTrending('all', 'us');

for (const [platform, data] of Object.entries(trending.platforms)) {
  if (data.success) {
    console.log(`\n${data.platform} Trending:`);
    data.trending.slice(0, 5).forEach((item, i) => {
      console.log(`${i + 1}. ${item.title}`);
    });
  }
}
```

### Example 3: Search Specific Platform

```javascript
// Search Netflix
const netflixResults = await streaming.searchPlatform('netflix', 'Sci-Fi', 'series');

console.log(`Found ${netflixResults.results.length} sci-fi series on Netflix`);
netflixResults.results.forEach(show => {
  console.log(`- ${show.title} (${show.year}) - Rating: ${show.rating}`);
});
```

### Example 4: Compare Streaming Prices

```javascript
const prices = await streaming.comparePrices('Oppenheimer', 'us');

console.log(`\nWhere to watch "${prices.title}":`);
for (const [key, info] of Object.entries(prices.prices)) {
  console.log(`\n${info.platform}:`);
  if (info.subscription) console.log(`  Subscription: ${info.subscription}`);
  if (info.rent) console.log(`  Rent: ${info.rent}`);
  if (info.buy) console.log(`  Buy: ${info.buy}`);
}
```

### Example 5: Get New Releases This Week

```javascript
const newReleases = await streaming.getNewReleases('all', 'us', 7);

for (const [platform, data] of Object.entries(newReleases.platforms)) {
  if (data.success && data.newReleases.length > 0) {
    console.log(`\n${data.platform} - New This Week:`);
    data.newReleases.slice(0, 3).forEach(item => {
      console.log(`- ${item.title}`);
    });
  }
}
```

### Example 6: YouTube Trending Videos

```javascript
const ytTrending = await streaming.getYouTubeTrending('US', 10);

console.log('\nTop 10 Trending on YouTube:');
ytTrending.trending.forEach((video, i) => {
  console.log(`${i + 1}. ${video.title}`);
  console.log(`   Channel: ${video.channelTitle}`);
  console.log(`   Views: ${parseInt(video.viewCount).toLocaleString()}`);
});
```

### Example 7: Browse by Genre

```javascript
const actionMovies = await streaming.getByGenre('action', 'all', 'us');

console.log(`\nAction Movies Available:`);
actionMovies.content.slice(0, 10).forEach(movie => {
  console.log(`- ${movie.title} (${movie.year})`);
});
```

---

## 🎯 Use Cases

### 1. Content Aggregator App
Build an app that shows users where their favorite content is available across all platforms.

### 2. Price Tracker
Track price changes and notify users when content becomes available or goes on sale.

### 3. Watchlist Manager
Create a unified watchlist across multiple streaming services.

### 4. Recommendation Engine
Combine trending data from all platforms to suggest what to watch.

### 5. Release Calendar
Track new releases across all platforms in one place.

---

## 🔧 Configuration

### API Keys Required

1. **RapidAPI Key** (for most platforms)
   - Sign up at [RapidAPI](https://rapidapi.com)
   - Subscribe to "Streaming Availability" API
   - Add key to `.env` as `RAPIDAPI_KEY`

2. **YouTube API Key** (for YouTube)
   - Get from [Google Cloud Console](https://console.cloud.google.com)
   - Enable YouTube Data API v3
   - Add key to `.env` as `YOUTUBE_API_KEY`

### Platform Toggle

Enable/disable platforms programmatically:

```javascript
// Disable a platform
streaming.togglePlatform('hulu', false);

// Enable a platform
streaming.togglePlatform('hulu', true);
```

---

## 📊 Response Formats

### Search Result
```json
{
  "id": "12345",
  "title": "Movie Title",
  "type": "movie",
  "year": 2023,
  "rating": 8.5,
  "synopsis": "Description...",
  "image": "https://...",
  "runtime": 120,
  "genres": ["Action", "Thriller"]
}
```

### Availability Info
```json
{
  "subscription": {
    "price": "$15.49/month",
    "quality": "4K"
  },
  "rent": {
    "sd": "$3.99",
    "hd": "$4.99",
    "uhd": "$5.99"
  },
  "buy": {
    "sd": "$9.99",
    "hd": "$14.99",
    "uhd": "$19.99"
  }
}
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue:** "API key not found"
- **Solution:** Check `.env` file has `RAPIDAPI_KEY` and `YOUTUBE_API_KEY`

**Issue:** Empty results
- **Solution:** Verify content is available in specified country

**Issue:** Rate limit exceeded
- **Solution:** Implement caching or upgrade RapidAPI plan

---

## 🚀 Future Enhancements

- [ ] Add more streaming platforms
- [ ] Implement caching for better performance
- [ ] Add user watchlist management
- [ ] Price drop notifications
- [ ] Content recommendations
- [ ] Multi-language support

---

## 📞 Support

For issues or questions:
- GitHub Issues: [R3SN Issues](https://github.com/Nisu7648/R3SN/issues)
- Documentation: [Full Docs](https://github.com/Nisu7648/R3SN/docs)

---

**Happy Streaming! 🍿**
