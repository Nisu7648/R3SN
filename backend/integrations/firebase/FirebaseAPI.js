/**
 * Firebase API Integration
 * Complete backend services including Firestore, Auth, Storage, and Realtime Database
 */

const axios = require('axios');

class FirebaseAPI {
  constructor(projectId, apiKey, databaseURL) {
    this.projectId = projectId || process.env.FIREBASE_PROJECT_ID;
    this.apiKey = apiKey || process.env.FIREBASE_API_KEY;
    this.databaseURL = databaseURL || process.env.FIREBASE_DATABASE_URL;
    this.firestoreURL = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    this.authURL = 'https://identitytoolkit.googleapis.com/v1';
    this.storageURL = `https://firebasestorage.googleapis.com/v0/b/${this.projectId}.appspot.com`;
    
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== AUTHENTICATION ====================

  async signUpWithEmail(email, password, options = {}) {
    const payload = {
      email,
      password,
      returnSecureToken: true,
      ...(options.displayName && { displayName: options.displayName })
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:signUp?key=${this.apiKey}`,
      payload
    );
    return { success: true, user: response.data };
  }

  async signInWithEmail(email, password) {
    const payload = {
      email,
      password,
      returnSecureToken: true
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:signInWithPassword?key=${this.apiKey}`,
      payload
    );
    return { success: true, user: response.data };
  }

  async signInAnonymously() {
    const payload = {
      returnSecureToken: true
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:signUp?key=${this.apiKey}`,
      payload
    );
    return { success: true, user: response.data };
  }

  async sendPasswordResetEmail(email) {
    const payload = {
      requestType: 'PASSWORD_RESET',
      email
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:sendOobCode?key=${this.apiKey}`,
      payload
    );
    return { success: true, email: response.data.email };
  }

  async verifyPasswordResetCode(oobCode) {
    const payload = { oobCode };

    const response = await this.client.post(
      `${this.authURL}/accounts:resetPassword?key=${this.apiKey}`,
      payload
    );
    return { success: true, email: response.data.email };
  }

  async confirmPasswordReset(oobCode, newPassword) {
    const payload = {
      oobCode,
      newPassword
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:resetPassword?key=${this.apiKey}`,
      payload
    );
    return { success: true, email: response.data.email };
  }

  async changePassword(idToken, password) {
    const payload = {
      idToken,
      password,
      returnSecureToken: true
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:update?key=${this.apiKey}`,
      payload
    );
    return { success: true, user: response.data };
  }

  async updateProfile(idToken, data) {
    const payload = {
      idToken,
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.photoUrl && { photoUrl: data.photoUrl }),
      returnSecureToken: true
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:update?key=${this.apiKey}`,
      payload
    );
    return { success: true, user: response.data };
  }

  async getAccountInfo(idToken) {
    const payload = { idToken };

    const response = await this.client.post(
      `${this.authURL}/accounts:lookup?key=${this.apiKey}`,
      payload
    );
    return { success: true, users: response.data.users };
  }

  async deleteAccount(idToken) {
    const payload = { idToken };

    await this.client.post(
      `${this.authURL}/accounts:delete?key=${this.apiKey}`,
      payload
    );
    return { success: true, message: 'Account deleted successfully' };
  }

  async refreshToken(refreshToken) {
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };

    const response = await this.client.post(
      `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
      payload
    );
    return { success: true, tokens: response.data };
  }

  async sendEmailVerification(idToken) {
    const payload = {
      requestType: 'VERIFY_EMAIL',
      idToken
    };

    const response = await this.client.post(
      `${this.authURL}/accounts:sendOobCode?key=${this.apiKey}`,
      payload
    );
    return { success: true, email: response.data.email };
  }

  async verifyEmail(oobCode) {
    const payload = { oobCode };

    const response = await this.client.post(
      `${this.authURL}/accounts:update?key=${this.apiKey}`,
      payload
    );
    return { success: true, email: response.data.email };
  }

  // ==================== FIRESTORE ====================

  async createDocument(collection, documentId, data, idToken) {
    const url = documentId 
      ? `${this.firestoreURL}/${collection}?documentId=${documentId}`
      : `${this.firestoreURL}/${collection}`;

    const payload = {
      fields: this.convertToFirestoreFields(data)
    };

    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.post(url, payload, { headers });
    return { success: true, document: response.data };
  }

  async getDocument(collection, documentId, idToken) {
    const url = `${this.firestoreURL}/${collection}/${documentId}`;
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.get(url, { headers });
    return { 
      success: true, 
      document: this.convertFromFirestoreFields(response.data.fields)
    };
  }

  async updateDocument(collection, documentId, data, idToken) {
    const url = `${this.firestoreURL}/${collection}/${documentId}`;

    const payload = {
      fields: this.convertToFirestoreFields(data)
    };

    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.patch(url, payload, { headers });
    return { success: true, document: response.data };
  }

  async deleteDocument(collection, documentId, idToken) {
    const url = `${this.firestoreURL}/${collection}/${documentId}`;
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    await this.client.delete(url, { headers });
    return { success: true, message: 'Document deleted successfully' };
  }

  async listDocuments(collection, options = {}, idToken) {
    const url = `${this.firestoreURL}/${collection}`;
    const params = {
      ...(options.pageSize && { pageSize: options.pageSize }),
      ...(options.pageToken && { pageToken: options.pageToken }),
      ...(options.orderBy && { orderBy: options.orderBy }),
      ...(options.mask && { 'mask.fieldPaths': options.mask })
    };

    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.get(url, { headers, params });
    return { 
      success: true, 
      documents: response.data.documents?.map(doc => ({
        id: doc.name.split('/').pop(),
        ...this.convertFromFirestoreFields(doc.fields)
      })) || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  async queryDocuments(collection, filters, idToken) {
    const url = `${this.firestoreURL}:runQuery`;

    const payload = {
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: filters
      }
    };

    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.post(url, payload, { headers });
    return { 
      success: true, 
      documents: response.data.map(result => ({
        id: result.document.name.split('/').pop(),
        ...this.convertFromFirestoreFields(result.document.fields)
      }))
    };
  }

  async batchGet(documentPaths, idToken) {
    const url = `${this.firestoreURL}:batchGet`;

    const payload = {
      documents: documentPaths.map(path => `${this.firestoreURL}/${path}`)
    };

    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.post(url, payload, { headers });
    return { 
      success: true, 
      documents: response.data.map(result => result.found ? {
        id: result.found.name.split('/').pop(),
        ...this.convertFromFirestoreFields(result.found.fields)
      } : null)
    };
  }

  async batchWrite(writes, idToken) {
    const url = `${this.firestoreURL}:batchWrite`;

    const payload = { writes };
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.post(url, payload, { headers });
    return { success: true, writeResults: response.data.writeResults };
  }

  // Helper methods for Firestore field conversion
  convertToFirestoreFields(data) {
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        fields[key] = Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (value === null) {
        fields[key] = { nullValue: null };
      } else if (Array.isArray(value)) {
        fields[key] = { arrayValue: { values: value.map(v => this.convertToFirestoreFields({ v }).v) } };
      } else if (typeof value === 'object') {
        fields[key] = { mapValue: { fields: this.convertToFirestoreFields(value) } };
      }
    }
    return fields;
  }

  convertFromFirestoreFields(fields) {
    if (!fields) return {};
    const data = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value.stringValue !== undefined) data[key] = value.stringValue;
      else if (value.integerValue !== undefined) data[key] = parseInt(value.integerValue);
      else if (value.doubleValue !== undefined) data[key] = value.doubleValue;
      else if (value.booleanValue !== undefined) data[key] = value.booleanValue;
      else if (value.nullValue !== undefined) data[key] = null;
      else if (value.arrayValue) data[key] = value.arrayValue.values?.map(v => this.convertFromFirestoreFields({ v }).v) || [];
      else if (value.mapValue) data[key] = this.convertFromFirestoreFields(value.mapValue.fields);
    }
    return data;
  }

  // ==================== REALTIME DATABASE ====================

  async rtdbGet(path, idToken, options = {}) {
    const url = `${this.databaseURL}/${path}.json`;
    const params = {
      auth: idToken || this.apiKey,
      ...(options.orderBy && { orderBy: JSON.stringify(options.orderBy) }),
      ...(options.limitToFirst && { limitToFirst: options.limitToFirst }),
      ...(options.limitToLast && { limitToLast: options.limitToLast }),
      ...(options.startAt && { startAt: options.startAt }),
      ...(options.endAt && { endAt: options.endAt }),
      ...(options.equalTo && { equalTo: options.equalTo })
    };

    const response = await this.client.get(url, { params });
    return { success: true, data: response.data };
  }

  async rtdbSet(path, data, idToken) {
    const url = `${this.databaseURL}/${path}.json`;
    const params = { auth: idToken || this.apiKey };

    const response = await this.client.put(url, data, { params });
    return { success: true, data: response.data };
  }

  async rtdbUpdate(path, data, idToken) {
    const url = `${this.databaseURL}/${path}.json`;
    const params = { auth: idToken || this.apiKey };

    const response = await this.client.patch(url, data, { params });
    return { success: true, data: response.data };
  }

  async rtdbPush(path, data, idToken) {
    const url = `${this.databaseURL}/${path}.json`;
    const params = { auth: idToken || this.apiKey };

    const response = await this.client.post(url, data, { params });
    return { success: true, name: response.data.name };
  }

  async rtdbDelete(path, idToken) {
    const url = `${this.databaseURL}/${path}.json`;
    const params = { auth: idToken || this.apiKey };

    await this.client.delete(url, { params });
    return { success: true, message: 'Data deleted successfully' };
  }

  // ==================== CLOUD STORAGE ====================

  async uploadFile(path, file, metadata = {}, idToken) {
    const url = `${this.storageURL}/o?name=${encodeURIComponent(path)}`;
    const headers = {
      'Content-Type': metadata.contentType || 'application/octet-stream',
      ...(idToken && { 'Authorization': `Bearer ${idToken}` })
    };

    const response = await this.client.post(url, file, { headers });
    return { success: true, file: response.data };
  }

  async getFile(path, idToken) {
    const url = `${this.storageURL}/o/${encodeURIComponent(path)}`;
    const params = { alt: 'media' };
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.get(url, { 
      headers, 
      params,
      responseType: 'arraybuffer'
    });
    return { success: true, data: response.data };
  }

  async getFileMetadata(path, idToken) {
    const url = `${this.storageURL}/o/${encodeURIComponent(path)}`;
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.get(url, { headers });
    return { success: true, metadata: response.data };
  }

  async updateFileMetadata(path, metadata, idToken) {
    const url = `${this.storageURL}/o/${encodeURIComponent(path)}`;
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.patch(url, metadata, { headers });
    return { success: true, metadata: response.data };
  }

  async deleteFile(path, idToken) {
    const url = `${this.storageURL}/o/${encodeURIComponent(path)}`;
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    await this.client.delete(url, { headers });
    return { success: true, message: 'File deleted successfully' };
  }

  async listFiles(prefix = '', options = {}, idToken) {
    const url = `${this.storageURL}/o`;
    const params = {
      prefix,
      ...(options.delimiter && { delimiter: options.delimiter }),
      ...(options.maxResults && { maxResults: options.maxResults }),
      ...(options.pageToken && { pageToken: options.pageToken })
    };
    const headers = idToken ? { 'Authorization': `Bearer ${idToken}` } : {};

    const response = await this.client.get(url, { headers, params });
    return { 
      success: true, 
      items: response.data.items || [],
      prefixes: response.data.prefixes || [],
      nextPageToken: response.data.nextPageToken
    };
  }

  async getDownloadURL(path, idToken) {
    const metadata = await this.getFileMetadata(path, idToken);
    const token = metadata.metadata.downloadTokens;
    const url = `${this.storageURL}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return { success: true, url };
  }

  // ==================== CLOUD MESSAGING (FCM) ====================

  async sendMessage(data, idToken) {
    const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;
    
    const payload = {
      message: {
        ...(data.token && { token: data.token }),
        ...(data.topic && { topic: data.topic }),
        ...(data.condition && { condition: data.condition }),
        ...(data.notification && { notification: data.notification }),
        ...(data.data && { data: data.data }),
        ...(data.android && { android: data.android }),
        ...(data.apns && { apns: data.apns }),
        ...(data.webpush && { webpush: data.webpush })
      }
    };

    const headers = { 'Authorization': `Bearer ${idToken}` };

    const response = await this.client.post(url, payload, { headers });
    return { success: true, name: response.data.name };
  }

  async subscribeToTopic(tokens, topic, idToken) {
    const url = `https://iid.googleapis.com/iid/v1:batchAdd`;
    
    const payload = {
      to: `/topics/${topic}`,
      registration_tokens: tokens
    };

    const headers = { 'Authorization': `Bearer ${idToken}` };

    const response = await this.client.post(url, payload, { headers });
    return { success: true, results: response.data.results };
  }

  async unsubscribeFromTopic(tokens, topic, idToken) {
    const url = `https://iid.googleapis.com/iid/v1:batchRemove`;
    
    const payload = {
      to: `/topics/${topic}`,
      registration_tokens: tokens
    };

    const headers = { 'Authorization': `Bearer ${idToken}` };

    const response = await this.client.post(url, payload, { headers });
    return { success: true, results: response.data.results };
  }
}

module.exports = FirebaseAPI;
