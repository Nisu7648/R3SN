/**
 * Cloudflare R2 Free Integration
 * 100% FREE - 10GB storage, S3-compatible, zero egress fees
 * No credit card required for free tier
 */

const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class CloudflareR2FreeIntegration {
  constructor(config) {
    this.accountId = config.accountId || process.env.R2_ACCOUNT_ID;
    this.accessKeyId = config.accessKeyId || process.env.R2_ACCESS_KEY_ID;
    this.secretAccessKey = config.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY;
    
    if (!this.accountId || !this.accessKeyId || !this.secretAccessKey) {
      throw new Error('Cloudflare R2 credentials required');
    }
    
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey
      }
    });
  }

  async uploadFile(bucket, key, body, contentType = 'application/octet-stream') {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      });
      
      const result = await this.client.send(command);
      
      return {
        success: true,
        key,
        etag: result.ETag
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async downloadFile(bucket, key) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      const result = await this.client.send(command);
      const body = await result.Body.transformToByteArray();
      
      return {
        success: true,
        data: body,
        contentType: result.ContentType
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFiles(bucket, prefix = '', maxKeys = 1000) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys
      });
      
      const result = await this.client.send(command);
      
      return {
        success: true,
        files: result.Contents || [],
        count: result.KeyCount
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(bucket, key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      await this.client.send(command);
      
      return {
        success: true,
        deleted: key
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getFileMetadata(bucket, key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      const result = await this.client.send(command);
      
      return {
        success: true,
        metadata: {
          contentType: result.ContentType,
          contentLength: result.ContentLength,
          lastModified: result.LastModified,
          etag: result.ETag
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createPresignedUrl(bucket, key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      return {
        success: true,
        url
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createPresignedUploadUrl(bucket, key, expiresIn = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key
      });
      
      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      return {
        success: true,
        url
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async copyFile(sourceBucket, sourceKey, destBucket, destKey) {
    try {
      const command = new PutObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: `${sourceBucket}/${sourceKey}`
      });
      
      const result = await this.client.send(command);
      
      return {
        success: true,
        copied: destKey,
        etag: result.ETag
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = CloudflareR2FreeIntegration;
