/**
 * Spotify API Integration
 * Complete music streaming and playlist management
 */

const axios = require('axios');

class SpotifyAPI {
  constructor(accessToken) {
    this.accessToken = accessToken || process.env.SPOTIFY_ACCESS_TOKEN;
    this.baseURL = 'https://api.spotify.com/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== ALBUMS ====================

  async getAlbum(albumId, options = {}) {
    const params = {
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get(`/albums/${albumId}`, { params });
    return { success: true, album: response.data };
  }

  async getAlbums(albumIds, options = {}) {
    const params = {
      ids: albumIds.join(','),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/albums', { params });
    return { success: true, albums: response.data.albums };
  }

  async getAlbumTracks(albumId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get(`/albums/${albumId}/tracks`, { params });
    return { success: true, tracks: response.data.items };
  }

  async getSavedAlbums(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/me/albums', { params });
    return { success: true, albums: response.data.items };
  }

  async saveAlbums(albumIds) {
    const payload = { ids: albumIds };
    await this.client.put('/me/albums', payload);
    return { success: true, message: 'Albums saved successfully' };
  }

  async removeAlbums(albumIds) {
    const payload = { ids: albumIds };
    await this.client.delete('/me/albums', { data: payload });
    return { success: true, message: 'Albums removed successfully' };
  }

  async checkSavedAlbums(albumIds) {
    const params = { ids: albumIds.join(',') };
    const response = await this.client.get('/me/albums/contains', { params });
    return { success: true, saved: response.data };
  }

  async getNewReleases(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.country && { country: options.country })
    };

    const response = await this.client.get('/browse/new-releases', { params });
    return { success: true, albums: response.data.albums.items };
  }

  // ==================== ARTISTS ====================

  async getArtist(artistId) {
    const response = await this.client.get(`/artists/${artistId}`);
    return { success: true, artist: response.data };
  }

  async getArtists(artistIds) {
    const params = { ids: artistIds.join(',') };
    const response = await this.client.get('/artists', { params });
    return { success: true, artists: response.data.artists };
  }

  async getArtistAlbums(artistId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.include_groups && { include_groups: options.include_groups }),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get(`/artists/${artistId}/albums`, { params });
    return { success: true, albums: response.data.items };
  }

  async getArtistTopTracks(artistId, market = 'US') {
    const params = { market };
    const response = await this.client.get(`/artists/${artistId}/top-tracks`, { params });
    return { success: true, tracks: response.data.tracks };
  }

  async getRelatedArtists(artistId) {
    const response = await this.client.get(`/artists/${artistId}/related-artists`);
    return { success: true, artists: response.data.artists };
  }

  // ==================== TRACKS ====================

  async getTrack(trackId, options = {}) {
    const params = {
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get(`/tracks/${trackId}`, { params });
    return { success: true, track: response.data };
  }

  async getTracks(trackIds, options = {}) {
    const params = {
      ids: trackIds.join(','),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/tracks', { params });
    return { success: true, tracks: response.data.tracks };
  }

  async getSavedTracks(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/me/tracks', { params });
    return { success: true, tracks: response.data.items };
  }

  async saveTracks(trackIds) {
    const payload = { ids: trackIds };
    await this.client.put('/me/tracks', payload);
    return { success: true, message: 'Tracks saved successfully' };
  }

  async removeTracks(trackIds) {
    const payload = { ids: trackIds };
    await this.client.delete('/me/tracks', { data: payload });
    return { success: true, message: 'Tracks removed successfully' };
  }

  async checkSavedTracks(trackIds) {
    const params = { ids: trackIds.join(',') };
    const response = await this.client.get('/me/tracks/contains', { params });
    return { success: true, saved: response.data };
  }

  async getTrackAudioFeatures(trackId) {
    const response = await this.client.get(`/audio-features/${trackId}`);
    return { success: true, audio_features: response.data };
  }

  async getTracksAudioFeatures(trackIds) {
    const params = { ids: trackIds.join(',') };
    const response = await this.client.get('/audio-features', { params });
    return { success: true, audio_features: response.data.audio_features };
  }

  async getTrackAudioAnalysis(trackId) {
    const response = await this.client.get(`/audio-analysis/${trackId}`);
    return { success: true, audio_analysis: response.data };
  }

  async getRecommendations(options = {}) {
    const params = {
      ...(options.seed_artists && { seed_artists: options.seed_artists.join(',') }),
      ...(options.seed_genres && { seed_genres: options.seed_genres.join(',') }),
      ...(options.seed_tracks && { seed_tracks: options.seed_tracks.join(',') }),
      limit: options.limit || 20,
      ...(options.market && { market: options.market }),
      ...(options.min_acousticness && { min_acousticness: options.min_acousticness }),
      ...(options.max_acousticness && { max_acousticness: options.max_acousticness }),
      ...(options.target_acousticness && { target_acousticness: options.target_acousticness })
    };

    const response = await this.client.get('/recommendations', { params });
    return { success: true, tracks: response.data.tracks };
  }

  // ==================== PLAYLISTS ====================

  async getPlaylist(playlistId, options = {}) {
    const params = {
      ...(options.market && { market: options.market }),
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/playlists/${playlistId}`, { params });
    return { success: true, playlist: response.data };
  }

  async getPlaylistTracks(playlistId, options = {}) {
    const params = {
      limit: options.limit || 100,
      ...(options.offset && { offset: options.offset }),
      ...(options.market && { market: options.market }),
      ...(options.fields && { fields: options.fields })
    };

    const response = await this.client.get(`/playlists/${playlistId}/tracks`, { params });
    return { success: true, tracks: response.data.items };
  }

  async createPlaylist(userId, data) {
    const payload = {
      name: data.name,
      public: data.public !== undefined ? data.public : true,
      collaborative: data.collaborative || false,
      ...(data.description && { description: data.description })
    };

    const response = await this.client.post(`/users/${userId}/playlists`, payload);
    return { success: true, playlist: response.data };
  }

  async updatePlaylist(playlistId, data) {
    const payload = {
      ...(data.name && { name: data.name }),
      ...(data.public !== undefined && { public: data.public }),
      ...(data.collaborative !== undefined && { collaborative: data.collaborative }),
      ...(data.description && { description: data.description })
    };

    await this.client.put(`/playlists/${playlistId}`, payload);
    return { success: true, message: 'Playlist updated successfully' };
  }

  async addTracksToPlaylist(playlistId, uris, position = null) {
    const payload = {
      uris,
      ...(position !== null && { position })
    };

    const response = await this.client.post(`/playlists/${playlistId}/tracks`, payload);
    return { success: true, snapshot_id: response.data.snapshot_id };
  }

  async reorderPlaylistTracks(playlistId, data) {
    const payload = {
      range_start: data.range_start,
      insert_before: data.insert_before,
      ...(data.range_length && { range_length: data.range_length }),
      ...(data.snapshot_id && { snapshot_id: data.snapshot_id })
    };

    const response = await this.client.put(`/playlists/${playlistId}/tracks`, payload);
    return { success: true, snapshot_id: response.data.snapshot_id };
  }

  async replacePlaylistTracks(playlistId, uris) {
    const payload = { uris };
    const response = await this.client.put(`/playlists/${playlistId}/tracks`, payload);
    return { success: true, snapshot_id: response.data.snapshot_id };
  }

  async removeTracksFromPlaylist(playlistId, tracks) {
    const payload = {
      tracks: tracks.map(uri => ({ uri }))
    };

    const response = await this.client.delete(`/playlists/${playlistId}/tracks`, { data: payload });
    return { success: true, snapshot_id: response.data.snapshot_id };
  }

  async getCurrentUserPlaylists(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/me/playlists', { params });
    return { success: true, playlists: response.data.items };
  }

  async getUserPlaylists(userId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get(`/users/${userId}/playlists`, { params });
    return { success: true, playlists: response.data.items };
  }

  async getFeaturedPlaylists(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.country && { country: options.country }),
      ...(options.locale && { locale: options.locale }),
      ...(options.timestamp && { timestamp: options.timestamp })
    };

    const response = await this.client.get('/browse/featured-playlists', { params });
    return { success: true, playlists: response.data.playlists.items };
  }

  async getCategoryPlaylists(categoryId, options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.country && { country: options.country })
    };

    const response = await this.client.get(`/browse/categories/${categoryId}/playlists`, { params });
    return { success: true, playlists: response.data.playlists.items };
  }

  async getPlaylistCoverImage(playlistId) {
    const response = await this.client.get(`/playlists/${playlistId}/images`);
    return { success: true, images: response.data };
  }

  async uploadPlaylistCoverImage(playlistId, imageBase64) {
    await this.client.put(`/playlists/${playlistId}/images`, imageBase64, {
      headers: { 'Content-Type': 'image/jpeg' }
    });
    return { success: true, message: 'Cover image uploaded successfully' };
  }

  // ==================== SEARCH ====================

  async search(query, types, options = {}) {
    const params = {
      q: query,
      type: types.join(','),
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.market && { market: options.market }),
      ...(options.include_external && { include_external: options.include_external })
    };

    const response = await this.client.get('/search', { params });
    return { success: true, results: response.data };
  }

  // ==================== USER PROFILE ====================

  async getCurrentUser() {
    const response = await this.client.get('/me');
    return { success: true, user: response.data };
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return { success: true, user: response.data };
  }

  async getTopArtists(options = {}) {
    const params = {
      time_range: options.time_range || 'medium_term',
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/me/top/artists', { params });
    return { success: true, artists: response.data.items };
  }

  async getTopTracks(options = {}) {
    const params = {
      time_range: options.time_range || 'medium_term',
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset })
    };

    const response = await this.client.get('/me/top/tracks', { params });
    return { success: true, tracks: response.data.items };
  }

  // ==================== PLAYER ====================

  async getPlaybackState(options = {}) {
    const params = {
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/me/player', { params });
    return { success: true, playback: response.data };
  }

  async transferPlayback(deviceIds, play = false) {
    const payload = {
      device_ids: deviceIds,
      play
    };

    await this.client.put('/me/player', payload);
    return { success: true, message: 'Playback transferred successfully' };
  }

  async getAvailableDevices() {
    const response = await this.client.get('/me/player/devices');
    return { success: true, devices: response.data.devices };
  }

  async getCurrentlyPlaying(options = {}) {
    const params = {
      ...(options.market && { market: options.market })
    };

    const response = await this.client.get('/me/player/currently-playing', { params });
    return { success: true, track: response.data };
  }

  async startPlayback(data = {}) {
    const payload = {
      ...(data.context_uri && { context_uri: data.context_uri }),
      ...(data.uris && { uris: data.uris }),
      ...(data.offset && { offset: data.offset }),
      ...(data.position_ms && { position_ms: data.position_ms })
    };

    await this.client.put('/me/player/play', payload);
    return { success: true, message: 'Playback started' };
  }

  async pausePlayback() {
    await this.client.put('/me/player/pause');
    return { success: true, message: 'Playback paused' };
  }

  async skipToNext() {
    await this.client.post('/me/player/next');
    return { success: true, message: 'Skipped to next track' };
  }

  async skipToPrevious() {
    await this.client.post('/me/player/previous');
    return { success: true, message: 'Skipped to previous track' };
  }

  async seekToPosition(positionMs) {
    const params = { position_ms: positionMs };
    await this.client.put('/me/player/seek', null, { params });
    return { success: true, message: 'Seeked to position' };
  }

  async setRepeatMode(state) {
    const params = { state };
    await this.client.put('/me/player/repeat', null, { params });
    return { success: true, message: 'Repeat mode set' };
  }

  async setVolume(volumePercent) {
    const params = { volume_percent: volumePercent };
    await this.client.put('/me/player/volume', null, { params });
    return { success: true, message: 'Volume set' };
  }

  async toggleShuffle(state) {
    const params = { state };
    await this.client.put('/me/player/shuffle', null, { params });
    return { success: true, message: 'Shuffle toggled' };
  }

  async getRecentlyPlayed(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.after && { after: options.after }),
      ...(options.before && { before: options.before })
    };

    const response = await this.client.get('/me/player/recently-played', { params });
    return { success: true, tracks: response.data.items };
  }

  async getQueue() {
    const response = await this.client.get('/me/player/queue');
    return { success: true, queue: response.data };
  }

  async addToQueue(uri) {
    const params = { uri };
    await this.client.post('/me/player/queue', null, { params });
    return { success: true, message: 'Added to queue' };
  }

  // ==================== FOLLOW ====================

  async followArtists(artistIds) {
    const payload = { ids: artistIds };
    await this.client.put('/me/following', payload, {
      params: { type: 'artist' }
    });
    return { success: true, message: 'Artists followed' };
  }

  async unfollowArtists(artistIds) {
    const payload = { ids: artistIds };
    await this.client.delete('/me/following', {
      params: { type: 'artist' },
      data: payload
    });
    return { success: true, message: 'Artists unfollowed' };
  }

  async checkFollowingArtists(artistIds) {
    const params = {
      type: 'artist',
      ids: artistIds.join(',')
    };

    const response = await this.client.get('/me/following/contains', { params });
    return { success: true, following: response.data };
  }

  async getFollowedArtists(options = {}) {
    const params = {
      type: 'artist',
      limit: options.limit || 20,
      ...(options.after && { after: options.after })
    };

    const response = await this.client.get('/me/following', { params });
    return { success: true, artists: response.data.artists.items };
  }

  // ==================== BROWSE ====================

  async getCategories(options = {}) {
    const params = {
      limit: options.limit || 20,
      ...(options.offset && { offset: options.offset }),
      ...(options.country && { country: options.country }),
      ...(options.locale && { locale: options.locale })
    };

    const response = await this.client.get('/browse/categories', { params });
    return { success: true, categories: response.data.categories.items };
  }

  async getCategory(categoryId, options = {}) {
    const params = {
      ...(options.country && { country: options.country }),
      ...(options.locale && { locale: options.locale })
    };

    const response = await this.client.get(`/browse/categories/${categoryId}`, { params });
    return { success: true, category: response.data };
  }

  async getAvailableGenreSeeds() {
    const response = await this.client.get('/recommendations/available-genre-seeds');
    return { success: true, genres: response.data.genres };
  }

  async getAvailableMarkets() {
    const response = await this.client.get('/markets');
    return { success: true, markets: response.data.markets };
  }
}

module.exports = SpotifyAPI;
