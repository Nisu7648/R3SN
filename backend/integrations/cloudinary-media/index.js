/**
 * Cloudinary Media Management Integration
 */

const cloudinary = require('cloudinary').v2;

class CloudinaryIntegration {
  constructor(config) {
    this.cloudName = config.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = config.apiKey || process.env.CLOUDINARY_API_KEY;
    this.apiSecret = config.apiSecret || process.env.CLOUDINARY_API_SECRET;
    
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary credentials required');
    }
    
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret
    });
  }

  async uploadImage(file, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'image',
        ...options
      });
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadVideo(file, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'video',
        ...options
      });
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
        bytes: result.bytes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadRaw(file, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'raw',
        ...options
      });
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteAsset(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return {
        success: result.result === 'ok',
        result: result.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAssetDetails(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });
      
      return {
        success: true,
        asset: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listAssets(resourceType = 'image', options = {}) {
    try {
      const result = await cloudinary.api.resources({
        resource_type: resourceType,
        max_results: 100,
        ...options
      });
      
      return {
        success: true,
        assets: result.resources,
        nextCursor: result.next_cursor
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchAssets(expression, options = {}) {
    try {
      const result = await cloudinary.search
        .expression(expression)
        .max_results(100)
        .execute();
      
      return {
        success: true,
        assets: result.resources,
        totalCount: result.total_count
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createFolder(path) {
    try {
      const result = await cloudinary.api.create_folder(path);
      
      return {
        success: true,
        folder: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFolder(path) {
    try {
      const result = await cloudinary.api.delete_folder(path);
      
      return {
        success: true,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFolders() {
    try {
      const result = await cloudinary.api.root_folders();
      
      return {
        success: true,
        folders: result.folders
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addTag(publicId, tag, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.add_tag(tag, [publicId], {
        resource_type: resourceType
      });
      
      return {
        success: true,
        publicIds: result.public_ids
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeTag(publicId, tag, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.remove_tag(tag, [publicId], {
        resource_type: resourceType
      });
      
      return {
        success: true,
        publicIds: result.public_ids
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  generateTransformationUrl(publicId, transformations) {
    try {
      const url = cloudinary.url(publicId, transformations);
      
      return {
        success: true,
        url
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUsage() {
    try {
      const result = await cloudinary.api.usage();
      
      return {
        success: true,
        usage: result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = CloudinaryIntegration;
