const axios = require('axios');

/**
 * Free Streaming Aggregator
 * Aggregates FREE and LEGAL streaming sources from multiple platforms
 * No premium subscriptions required - 100% free content
 */
class FreeStreamingAggregator {
  constructor() {
    this.name = 'Free Streaming Aggregator';
    
    // Free streaming sources (all legal and working)
    this.sources = {
      // Free ad-supported platforms
      tubi: {
        name: 'Tubi',
        url: 'https://tubitv.com',
        api: 'https://tubitv.com/oz/videos',
        type: 'free',
        description: '100% free movies and TV shows with ads',
        working: true
      },
      pluto: {
        name: 'Pluto TV',
        url: 'https://pluto.tv',
        api: 'https://api.pluto.tv/v2',
        type: 'free',
        description: 'Free live TV and on-demand content',
        working: true
      },
      crackle: {
        name: 'Crackle',
        url: 'https://crackle.com',
        type: 'free',
        description: 'Free movies and TV shows from Sony',
        working: true
      },
      plex: {
        name: 'Plex Free',
        url: 'https://watch.plex.tv',
        api: 'https://discover.provider.plex.tv',
        type: 'free',
        description: 'Free movies, TV shows, and live TV',
        working: true
      },
      roku: {
        name: 'Roku Channel',
        url: 'https://therokuchannel.roku.com',
        type: 'free',
        description: 'Free movies and TV shows',
        working: true
      },
      imdb: {
        name: 'IMDb TV (Freevee)',
        url: 'https://www.amazon.com/freevee',
        type: 'free',
        description: 'Free Amazon streaming service',
        working: true
      },
      youtube: {
        name: 'YouTube Free Movies',
        url: 'https://www.youtube.com/feed/storefront?bp=ogUCKAY%3D',
        api: 'https://www.googleapis.com/youtube/v3',
        type: 'free',
        description: 'Free movies on YouTube',
        working: true
      },
      vudu: {
        name: 'Vudu Free',
        url: 'https://www.vudu.com/content/movies/free',
        type: 'free',
        description: 'Free movies with ads on Vudu',
        working: true
      },
      peacock_free: {
        name: 'Peacock Free Tier',
        url: 'https://www.peacocktv.com',
        type: 'free',
        description: 'Free tier of Peacock with ads',
        working: true
      },
      archive: {
        name: 'Internet Archive',
        url: 'https://archive.org/details/movies',
        api: 'https://archive.org/advancedsearch.php',
        type: 'free',
        description: 'Public domain movies and shows',
        working: true
      }
    };

    // Free content APIs
    this.apis = {
      omdb: 'http://www.omdbapi.com',
      tmdb: 'https://api.themoviedb.org/3',
      tvmaze: 'https://api.tvmaze.com'
    };
  }

  /**
   * Search for free streaming content across all sources
   */
  async searchFreeContent(query, type = 'all') {
    const results = {
      success: true,
      query,
      type,
      totalSources: Object.keys(this.sources).length,
      availableSources: [],
      content: []
    };

    // Search YouTube free movies
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const ytResults = await this.searchYouTubeFreeMovies(query);
        if (ytResults.length > 0) {
          results.availableSources.push('YouTube Free Movies');
          results.content.push(...ytResults);
        }
      } catch (error) {
        console.error('YouTube search error:', error.message);
      }
    }

    // Search Internet Archive
    try {
      const archiveResults = await this.searchInternetArchive(query, type);
      if (archiveResults.length > 0) {
        results.availableSources.push('Internet Archive');
        results.content.push(...archiveResults);
      }
    } catch (error) {
      console.error('Archive search error:', error.message);
    }

    // Add metadata from TMDB
    try {
      const tmdbResults = await this.searchTMDB(query, type);
      results.metadata = tmdbResults;
    } catch (error) {
      console.error('TMDB search error:', error.message);
    }

    return results;
  }

  /**
   * Search YouTube for free movies
   */
  async searchYouTubeFreeMovies(query) {
    if (!process.env.YOUTUBE_API_KEY) {
      return [];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: `${query} full movie free`,
          type: 'video',
          videoDuration: 'long',
          videoLicense: 'any',
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY
        }
      });

      return response.data.items.map(item => ({
        title: item.snippet.title,
        source: 'YouTube Free Movies',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.high.url,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channel: item.snippet.channelTitle,
        type: 'free',
        cost: 'FREE',
        working: true
      }));
    } catch (error) {
      console.error('YouTube API error:', error.message);
      return [];
    }
  }

  /**
   * Search Internet Archive for public domain content
   */
  async searchInternetArchive(query, type = 'all') {
    try {
      const mediaType = type === 'series' ? 'tv' : 'movies';
      
      const response = await axios.get('https://archive.org/advancedsearch.php', {
        params: {
          q: `${query} AND mediatype:${mediaType}`,
          fl: 'identifier,title,description,year,creator,downloads',
          sort: 'downloads desc',
          rows: 10,
          output: 'json'
        }
      });

      if (!response.data.response || !response.data.response.docs) {
        return [];
      }

      return response.data.response.docs.map(item => ({
        title: item.title,
        source: 'Internet Archive',
        url: `https://archive.org/details/${item.identifier}`,
        streamUrl: `https://archive.org/embed/${item.identifier}`,
        description: item.description || 'Public domain content',
        year: item.year,
        creator: item.creator,
        downloads: item.downloads,
        type: 'free',
        cost: 'FREE - Public Domain',
        working: true
      }));
    } catch (error) {
      console.error('Internet Archive error:', error.message);
      return [];
    }
  }

  /**
   * Search TMDB for metadata (free API)
   */
  async searchTMDB(query, type = 'all') {
    if (!process.env.TMDB_API_KEY) {
      return null;
    }

    try {
      const endpoint = type === 'series' ? 'tv' : type === 'movie' ? 'movie' : 'multi';
      
      const response = await axios.get(`https://api.themoviedb.org/3/search/${endpoint}`, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query,
          include_adult: false
        }
      });

      return response.data.results.slice(0, 5).map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        rating: item.vote_average,
        popularity: item.popularity,
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null
      }));
    } catch (error) {
      console.error('TMDB error:', error.message);
      return null;
    }
  }

  /**
   * Get all free streaming platforms
   */
  getFreePlatforms() {
    return {
      success: true,
      totalPlatforms: Object.keys(this.sources).length,
      platforms: Object.entries(this.sources).map(([key, platform]) => ({
        id: key,
        name: platform.name,
        url: platform.url,
        description: platform.description,
        type: platform.type,
        cost: 'FREE',
        working: platform.working
      }))
    };
  }

  /**
   * Get trending free content
   */
  async getTrendingFree() {
    const trending = {
      success: true,
      sources: []
    };

    // Get trending from Internet Archive
    try {
      const response = await axios.get('https://archive.org/advancedsearch.php', {
        params: {
          q: 'mediatype:movies',
          fl: 'identifier,title,description,year,downloads',
          sort: 'downloads desc',
          rows: 20,
          output: 'json'
        }
      });

      trending.sources.push({
        platform: 'Internet Archive',
        content: response.data.response.docs.map(item => ({
          title: item.title,
          url: `https://archive.org/details/${item.identifier}`,
          year: item.year,
          downloads: item.downloads,
          cost: 'FREE'
        }))
      });
    } catch (error) {
      console.error('Archive trending error:', error.message);
    }

    return trending;
  }

  /**
   * Get free movies by genre
   */
  async getFreeByGenre(genre) {
    try {
      const response = await axios.get('https://archive.org/advancedsearch.php', {
        params: {
          q: `mediatype:movies AND subject:${genre}`,
          fl: 'identifier,title,description,year,subject',
          sort: 'downloads desc',
          rows: 20,
          output: 'json'
        }
      });

      return {
        success: true,
        genre,
        platform: 'Internet Archive',
        cost: 'FREE',
        content: response.data.response.docs.map(item => ({
          title: item.title,
          url: `https://archive.org/details/${item.identifier}`,
          streamUrl: `https://archive.org/embed/${item.identifier}`,
          description: item.description,
          year: item.year,
          genres: item.subject
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get direct streaming links (legal free sources)
   */
  async getStreamingLinks(title) {
    const links = {
      success: true,
      title,
      freeLinks: [],
      platforms: []
    };

    // Search Internet Archive
    try {
      const archiveResults = await this.searchInternetArchive(title);
      if (archiveResults.length > 0) {
        links.freeLinks.push(...archiveResults.map(item => ({
          platform: 'Internet Archive',
          url: item.url,
          streamUrl: item.streamUrl,
          quality: 'Various',
          cost: 'FREE',
          legal: true
        })));
        links.platforms.push('Internet Archive');
      }
    } catch (error) {
      console.error('Archive links error:', error.message);
    }

    // Search YouTube
    try {
      const ytResults = await this.searchYouTubeFreeMovies(title);
      if (ytResults.length > 0) {
        links.freeLinks.push(...ytResults.map(item => ({
          platform: 'YouTube',
          url: item.url,
          streamUrl: item.url,
          quality: 'HD',
          cost: 'FREE',
          legal: true
        })));
        links.platforms.push('YouTube');
      }
    } catch (error) {
      console.error('YouTube links error:', error.message);
    }

    // Add platform links (no direct streaming, but free to access)
    const freePlatformLinks = [
      { name: 'Tubi', url: `https://tubitv.com/search/${encodeURIComponent(title)}` },
      { name: 'Pluto TV', url: `https://pluto.tv/search?query=${encodeURIComponent(title)}` },
      { name: 'Plex', url: `https://watch.plex.tv/search?query=${encodeURIComponent(title)}` },
      { name: 'Crackle', url: `https://www.crackle.com/search?query=${encodeURIComponent(title)}` },
      { name: 'Roku Channel', url: `https://therokuchannel.roku.com/search/${encodeURIComponent(title)}` }
    ];

    links.platformSearchLinks = freePlatformLinks;

    return links;
  }

  /**
   * Check if content is available for free
   */
  async checkFreeAvailability(title) {
    const availability = {
      success: true,
      title,
      availableForFree: false,
      sources: []
    };

    // Check Internet Archive
    const archiveResults = await this.searchInternetArchive(title);
    if (archiveResults.length > 0) {
      availability.availableForFree = true;
      availability.sources.push({
        platform: 'Internet Archive',
        url: archiveResults[0].url,
        streamUrl: archiveResults[0].streamUrl,
        cost: 'FREE',
        legal: true
      });
    }

    // Check YouTube
    const ytResults = await this.searchYouTubeFreeMovies(title);
    if (ytResults.length > 0) {
      availability.availableForFree = true;
      availability.sources.push({
        platform: 'YouTube',
        url: ytResults[0].url,
        cost: 'FREE',
        legal: true
      });
    }

    return availability;
  }

  /**
   * Get recommendations for free content
   */
  async getFreeRecommendations(genre = 'action') {
    return {
      success: true,
      genre,
      recommendations: [
        {
          platform: 'Tubi',
          url: 'https://tubitv.com',
          description: '40,000+ free movies and TV shows',
          cost: 'FREE with ads'
        },
        {
          platform: 'Pluto TV',
          url: 'https://pluto.tv',
          description: '250+ live channels and thousands of movies',
          cost: 'FREE with ads'
        },
        {
          platform: 'Plex',
          url: 'https://watch.plex.tv',
          description: 'Free movies, TV shows, and live TV',
          cost: 'FREE with ads'
        },
        {
          platform: 'Internet Archive',
          url: 'https://archive.org/details/movies',
          description: 'Public domain movies and classic content',
          cost: 'FREE - No ads'
        },
        {
          platform: 'YouTube Free Movies',
          url: 'https://www.youtube.com/feed/storefront?bp=ogUCKAY%3D',
          description: 'Free movies on YouTube',
          cost: 'FREE with ads'
        }
      ]
    };
  }
}

module.exports = FreeStreamingAggregator;
