const axios = require('axios');

class DropboxIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.dropboxapi.com/2';
    this.headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }

  async listFolder(path = '') {
    const response = await axios.post(
      `${this.baseURL}/files/list_folder`,
      { path },
      { headers: this.headers }
    );
    return response.data;
  }

  async uploadFile(path, content) {
    const response = await axios.post(
      'https://content.dropboxapi.com/2/files/upload',
      content,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path, mode: 'add', autorename: true }),
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    return response.data;
  }

  async downloadFile(path) {
    const response = await axios.post(
      'https://content.dropboxapi.com/2/files/download',
      null,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path })
        },
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  }

  async deleteFile(path) {
    const response = await axios.post(
      `${this.baseURL}/files/delete_v2`,
      { path },
      { headers: this.headers }
    );
    return response.data;
  }

  async createFolder(path) {
    const response = await axios.post(
      `${this.baseURL}/files/create_folder_v2`,
      { path },
      { headers: this.headers }
    );
    return response.data;
  }

  async shareFolder(path) {
    const response = await axios.post(
      `${this.baseURL}/sharing/create_shared_link_with_settings`,
      { path },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = DropboxIntegration;
