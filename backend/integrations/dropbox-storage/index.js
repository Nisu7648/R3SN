/**
 * Dropbox Cloud Storage Integration
 */

const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

class DropboxIntegration {
  constructor(config) {
    this.accessToken = config.accessToken || process.env.DROPBOX_ACCESS_TOKEN;
    if (!this.accessToken) throw new Error('Dropbox access token required');
    
    this.dbx = new Dropbox({ accessToken: this.accessToken, fetch });
  }

  async uploadFile(path, contents) {
    try {
      const result = await this.dbx.filesUpload({ path, contents });
      return { success: true, file: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async downloadFile(path) {
    try {
      const result = await this.dbx.filesDownload({ path });
      return { success: true, file: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFolder(path = '') {
    try {
      const result = await this.dbx.filesListFolder({ path });
      return { success: true, entries: result.result.entries };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createFolder(path) {
    try {
      const result = await this.dbx.filesCreateFolderV2({ path });
      return { success: true, folder: result.result.metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(path) {
    try {
      const result = await this.dbx.filesDeleteV2({ path });
      return { success: true, metadata: result.result.metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async moveFile(fromPath, toPath) {
    try {
      const result = await this.dbx.filesMoveV2({ from_path: fromPath, to_path: toPath });
      return { success: true, metadata: result.result.metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async copyFile(fromPath, toPath) {
    try {
      const result = await this.dbx.filesCopyV2({ from_path: fromPath, to_path: toPath });
      return { success: true, metadata: result.result.metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMetadata(path) {
    try {
      const result = await this.dbx.filesGetMetadata({ path });
      return { success: true, metadata: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSharedLink(path) {
    try {
      const result = await this.dbx.sharingCreateSharedLinkWithSettings({ path });
      return { success: true, link: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchFiles(query) {
    try {
      const result = await this.dbx.filesSearchV2({ query });
      return { success: true, matches: result.result.matches };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSpaceUsage() {
    try {
      const result = await this.dbx.usersGetSpaceUsage();
      return { success: true, usage: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCurrentAccount() {
    try {
      const result = await this.dbx.usersGetCurrentAccount();
      return { success: true, account: result.result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = DropboxIntegration;
