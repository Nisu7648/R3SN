/**
 * JSONPlaceholder Integration
 * FREE fake REST API for testing and prototyping
 * NO API KEY REQUIRED - 100% FREE
 */

const axios = require('axios');

class JSONPlaceholderIntegration {
  constructor(config = {}) {
    this.baseUrl = 'https://jsonplaceholder.typicode.com';
  }

  async execute(action, params) {
    const actions = {
      getPosts: this.getPosts.bind(this),
      getPost: this.getPost.bind(this),
      createPost: this.createPost.bind(this),
      updatePost: this.updatePost.bind(this),
      deletePost: this.deletePost.bind(this),
      getComments: this.getComments.bind(this),
      getUsers: this.getUsers.bind(this),
      getUser: this.getUser.bind(this),
      getTodos: this.getTodos.bind(this),
      getAlbums: this.getAlbums.bind(this),
      getPhotos: this.getPhotos.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async getPosts(params) {
    const { userId, limit = 10 } = params;

    try {
      const url = userId 
        ? `${this.baseUrl}/posts?userId=${userId}`
        : `${this.baseUrl}/posts`;

      const response = await axios.get(url);
      const posts = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          posts: posts.map(post => ({
            id: post.id,
            userId: post.userId,
            title: post.title,
            body: post.body
          })),
          count: posts.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getPost(params) {
    const { postId } = params;
    
    if (!postId) {
      throw new Error('Post ID is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/posts/${postId}`);

      return {
        success: true,
        data: {
          id: response.data.id,
          userId: response.data.userId,
          title: response.data.title,
          body: response.data.body
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async createPost(params) {
    const { title, body, userId = 1 } = params;
    
    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/posts`,
        { title, body, userId }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          title: response.data.title,
          body: response.data.body,
          userId: response.data.userId
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async updatePost(params) {
    const { postId, title, body } = params;
    
    if (!postId) {
      throw new Error('Post ID is required');
    }

    try {
      const response = await axios.put(
        `${this.baseUrl}/posts/${postId}`,
        { title, body, userId: 1 }
      );

      return {
        success: true,
        data: {
          id: response.data.id,
          title: response.data.title,
          body: response.data.body
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async deletePost(params) {
    const { postId } = params;
    
    if (!postId) {
      throw new Error('Post ID is required');
    }

    try {
      await axios.delete(`${this.baseUrl}/posts/${postId}`);

      return {
        success: true,
        data: { deleted: true, postId }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getComments(params) {
    const { postId, limit = 10 } = params;

    try {
      const url = postId
        ? `${this.baseUrl}/posts/${postId}/comments`
        : `${this.baseUrl}/comments`;

      const response = await axios.get(url);
      const comments = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          comments: comments.map(comment => ({
            id: comment.id,
            postId: comment.postId,
            name: comment.name,
            email: comment.email,
            body: comment.body
          })),
          count: comments.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getUsers(params) {
    const { limit = 10 } = params;

    try {
      const response = await axios.get(`${this.baseUrl}/users`);
      const users = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            website: user.website
          })),
          count: users.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getUser(params) {
    const { userId } = params;
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`);

      return {
        success: true,
        data: {
          id: response.data.id,
          name: response.data.name,
          username: response.data.username,
          email: response.data.email,
          address: response.data.address,
          phone: response.data.phone,
          website: response.data.website,
          company: response.data.company
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getTodos(params) {
    const { userId, limit = 10 } = params;

    try {
      const url = userId
        ? `${this.baseUrl}/todos?userId=${userId}`
        : `${this.baseUrl}/todos`;

      const response = await axios.get(url);
      const todos = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          todos: todos.map(todo => ({
            id: todo.id,
            userId: todo.userId,
            title: todo.title,
            completed: todo.completed
          })),
          count: todos.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getAlbums(params) {
    const { userId, limit = 10 } = params;

    try {
      const url = userId
        ? `${this.baseUrl}/albums?userId=${userId}`
        : `${this.baseUrl}/albums`;

      const response = await axios.get(url);
      const albums = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          albums: albums.map(album => ({
            id: album.id,
            userId: album.userId,
            title: album.title
          })),
          count: albums.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }

  async getPhotos(params) {
    const { albumId, limit = 10 } = params;

    try {
      const url = albumId
        ? `${this.baseUrl}/albums/${albumId}/photos`
        : `${this.baseUrl}/photos`;

      const response = await axios.get(url);
      const photos = response.data.slice(0, limit);

      return {
        success: true,
        data: {
          photos: photos.map(photo => ({
            id: photo.id,
            albumId: photo.albumId,
            title: photo.title,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl
          })),
          count: photos.length
        }
      };
    } catch (error) {
      throw new Error(`JSONPlaceholder API error: ${error.message}`);
    }
  }
}

module.exports = JSONPlaceholderIntegration;
