const axios = require('axios');

class GoogleDriveIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://www.googleapis.com/drive/v3';
    this.headers = { 'Authorization': `Bearer ${accessToken}` };
  }

  async listFiles(pageSize = 100) {
    const response = await axios.get(`${this.baseURL}/files`, {
      headers: this.headers,
      params: { pageSize, fields: 'files(id,name,mimeType,size,createdTime)' }
    });
    return response.data;
  }

  async getFile(fileId) {
    const response = await axios.get(`${this.baseURL}/files/${fileId}`, {
      headers: this.headers,
      params: { fields: '*' }
    });
    return response.data;
  }

  async uploadFile(name, mimeType, content) {
    const metadata = { name, mimeType };
    const form = new FormData();
    form.append('metadata', JSON.stringify(metadata), { contentType: 'application/json' });
    form.append('file', content);

    const response = await axios.post(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      form,
      { headers: { ...this.headers, ...form.getHeaders() } }
    );
    return response.data;
  }

  async deleteFile(fileId) {
    const response = await axios.delete(`${this.baseURL}/files/${fileId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async createFolder(name, parentId = null) {
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] })
    };

    const response = await axios.post(`${this.baseURL}/files`, metadata, {
      headers: this.headers
    });
    return response.data;
  }

  async shareFile(fileId, email, role = 'reader') {
    const response = await axios.post(
      `${this.baseURL}/files/${fileId}/permissions`,
      { type: 'user', role, emailAddress: email },
      { headers: this.headers }
    );
    return response.data;
  }
}

module.exports = GoogleDriveIntegration;
