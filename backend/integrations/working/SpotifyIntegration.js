/**
 * SPOTIFY INTEGRATION - FULLY WORKING
 * Music streaming integration
 * 
 * FREE TIER: Full API access
 * Get credentials: https://developer.spotify.com/dashboard
 * 
 * Usage:
 *   const spotify = new SpotifyIntegration({ 
 *     clientId: 'xxx',
 *     clientSecret: 'xxx'
 *   });
 *   await spotify.authenticate();
 *   const tracks = await spotify.searchTracks('Bohemian Rhapsody');
 */

const BaseIntegration = require('../core/BaseIntegration');

class SpotifyIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'spotify',
      baseURL: 'https://api.spotify.com/v1',
      ...config
    });
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = null;
  }

  /**
   * Authenticate and get access token
   */
  async authenticate() {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await this.client.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.accessToken = response.data.access_token;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.accessToken}`;
    return { success: true, token: this.accessToken };
  }

  /**
   * Search tracks
   */
  async searchTracks(query, limit = 10) {
    const response = await this.get('/search', {
      q: query,
      type: 'track',
      limit
    });

    return {
      success: true,
      tracks: response.data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name),
        album: track.album.name,
        duration: track.duration_ms,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        url: track.external_urls.spotify
      }))
    };
  }

  /**
   * Get track details
   */
  async getTrack(trackId) {
    const response = await this.get(`/tracks/${trackId}`);
    const track = response.data;

    return {
      success: true,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => ({ name: a.name, id: a.id })),
        album: track.album.name,
        releaseDate: track.album.release_date,
        duration: track.duration_ms,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        url: track.external_urls.spotify
      }
    };
  }

  /**
   * Search artists
   */
  async searchArtists(query, limit = 10) {
    const response = await this.get('/search', {
      q: query,
      type: 'artist',
      limit
    });

    return {
      success: true,
      artists: response.data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        image: artist.images[0]?.url,
        url: artist.external_urls.spotify
      }))
    };
  }

  /**
   * Get artist details
   */
  async getArtist(artistId) {
    const response = await this.get(`/artists/${artistId}`);
    const artist = response.data;

    return {
      success: true,
      artist: {
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        images: artist.images,
        url: artist.external_urls.spotify
      }
    };
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(artistId, market = 'US') {
    const response = await this.get(`/artists/${artistId}/top-tracks`, { market });

    return {
      success: true,
      tracks: response.data.tracks.map(track => ({
        id: track.id,
        name: track.name,
        album: track.album.name,
        popularity: track.popularity,
        previewUrl: track.preview_url
      }))
    };
  }

  /**
   * Search albums
   */
  async searchAlbums(query, limit = 10) {
    const response = await this.get('/search', {
      q: query,
      type: 'album',
      limit
    });

    return {
      success: true,
      albums: response.data.albums.items.map(album => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(a => a.name),
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        image: album.images[0]?.url,
        url: album.external_urls.spotify
      }))
    };
  }

  /**
   * Get album tracks
   */
  async getAlbumTracks(albumId) {
    const response = await this.get(`/albums/${albumId}/tracks`);

    return {
      success: true,
      tracks: response.data.items.map(track => ({
        id: track.id,
        name: track.name,
        trackNumber: track.track_number,
        duration: track.duration_ms,
        previewUrl: track.preview_url
      }))
    };
  }

  /**
   * Get featured playlists
   */
  async getFeaturedPlaylists(limit = 10) {
    const response = await this.get('/browse/featured-playlists', { limit });

    return {
      success: true,
      playlists: response.data.playlists.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        tracks: playlist.tracks.total,
        image: playlist.images[0]?.url,
        url: playlist.external_urls.spotify
      }))
    };
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit = 10) {
    const response = await this.get('/browse/new-releases', { limit });

    return {
      success: true,
      albums: response.data.albums.items.map(album => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map(a => a.name),
        releaseDate: album.release_date,
        image: album.images[0]?.url
      }))
    };
  }

  async testConnection() {
    try {
      await this.authenticate();
      await this.searchTracks('test', 1);
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }
}

module.exports = SpotifyIntegration;
