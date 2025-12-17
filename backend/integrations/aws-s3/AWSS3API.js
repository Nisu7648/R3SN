/**
 * AWS S3 API Integration
 * Complete cloud storage and bucket management
 */

const axios = require('axios');
const crypto = require('crypto');

class AWSS3API {
  constructor(accessKeyId, secretAccessKey, region = 'us-east-1') {
    this.accessKeyId = accessKeyId || process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
    this.region = region || process.env.AWS_REGION || 'us-east-1';
    this.service = 's3';
    this.baseURL = `https://s3.${this.region}.amazonaws.com`;
    
    this.client = axios.create({
      baseURL: this.baseURL
    });
  }

  // AWS Signature V4 signing
  sign(method, path, headers = {}, payload = '') {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);

    headers['x-amz-date'] = amzDate;
    headers['host'] = `s3.${this.region}.amazonaws.com`;

    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');

    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = [
      method,
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
      const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
      return kSigning;
    };

    const signingKey = getSignatureKey(this.secretAccessKey, dateStamp, this.region, this.service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    headers['Authorization'] = `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return headers;
  }

  // ==================== BUCKETS ====================

  async listBuckets() {
    const headers = this.sign('GET', '/');
    const response = await this.client.get('/', { headers });
    return { success: true, buckets: response.data };
  }

  async createBucket(bucketName, options = {}) {
    const path = `/${bucketName}`;
    const headers = this.sign('PUT', path);

    let payload = '';
    if (this.region !== 'us-east-1') {
      payload = `<CreateBucketConfiguration><LocationConstraint>${this.region}</LocationConstraint></CreateBucketConfiguration>`;
      headers['Content-Type'] = 'application/xml';
    }

    await this.client.put(path, payload, { headers });
    return { success: true, message: `Bucket ${bucketName} created successfully` };
  }

  async deleteBucket(bucketName) {
    const path = `/${bucketName}`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: `Bucket ${bucketName} deleted successfully` };
  }

  async headBucket(bucketName) {
    const path = `/${bucketName}`;
    const headers = this.sign('HEAD', path);

    const response = await this.client.head(path, { headers });
    return { success: true, exists: response.status === 200 };
  }

  // ==================== OBJECTS ====================

  async listObjects(bucketName, options = {}) {
    const path = `/${bucketName}`;
    const params = {
      'list-type': 2,
      ...(options.prefix && { prefix: options.prefix }),
      ...(options.delimiter && { delimiter: options.delimiter }),
      ...(options.maxKeys && { 'max-keys': options.maxKeys }),
      ...(options.continuationToken && { 'continuation-token': options.continuationToken })
    };

    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const headers = this.sign('GET', `${path}?${queryString}`);

    const response = await this.client.get(path, { headers, params });
    return { success: true, objects: response.data };
  }

  async getObject(bucketName, key) {
    const path = `/${bucketName}/${key}`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { 
      headers,
      responseType: 'arraybuffer'
    });
    return { 
      success: true, 
      data: response.data,
      contentType: response.headers['content-type']
    };
  }

  async putObject(bucketName, key, data, options = {}) {
    const path = `/${bucketName}/${key}`;
    const headers = {
      ...(options.contentType && { 'Content-Type': options.contentType }),
      ...(options.acl && { 'x-amz-acl': options.acl }),
      ...(options.metadata && Object.keys(options.metadata).reduce((acc, k) => {
        acc[`x-amz-meta-${k}`] = options.metadata[k];
        return acc;
      }, {}))
    };

    const signedHeaders = this.sign('PUT', path, headers, data);

    await this.client.put(path, data, { headers: signedHeaders });
    return { success: true, message: `Object ${key} uploaded successfully` };
  }

  async deleteObject(bucketName, key) {
    const path = `/${bucketName}/${key}`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: `Object ${key} deleted successfully` };
  }

  async deleteObjects(bucketName, keys) {
    const path = `/${bucketName}?delete`;
    
    const deleteXml = `<?xml version="1.0" encoding="UTF-8"?>
      <Delete>
        ${keys.map(key => `<Object><Key>${key}</Key></Object>`).join('')}
      </Delete>`;

    const headers = {
      'Content-Type': 'application/xml',
      'Content-MD5': crypto.createHash('md5').update(deleteXml).digest('base64')
    };

    const signedHeaders = this.sign('POST', path, headers, deleteXml);

    const response = await this.client.post(path, deleteXml, { headers: signedHeaders });
    return { success: true, deleted: response.data };
  }

  async copyObject(sourceBucket, sourceKey, destBucket, destKey, options = {}) {
    const path = `/${destBucket}/${destKey}`;
    const headers = {
      'x-amz-copy-source': `/${sourceBucket}/${sourceKey}`,
      ...(options.acl && { 'x-amz-acl': options.acl }),
      ...(options.metadataDirective && { 'x-amz-metadata-directive': options.metadataDirective })
    };

    const signedHeaders = this.sign('PUT', path, headers);

    const response = await this.client.put(path, null, { headers: signedHeaders });
    return { success: true, copy: response.data };
  }

  async headObject(bucketName, key) {
    const path = `/${bucketName}/${key}`;
    const headers = this.sign('HEAD', path);

    const response = await this.client.head(path, { headers });
    return { 
      success: true, 
      metadata: {
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        lastModified: response.headers['last-modified'],
        etag: response.headers['etag']
      }
    };
  }

  // ==================== PRESIGNED URLS ====================

  async getPresignedUrl(bucketName, key, expiresIn = 3600, method = 'GET') {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;

    const path = `/${bucketName}/${key}`;
    const params = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${this.accessKeyId}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': expiresIn,
      'X-Amz-SignedHeaders': 'host'
    };

    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const canonicalRequest = [
      method,
      path,
      queryString,
      `host:s3.${this.region}.amazonaws.com\n`,
      'host',
      'UNSIGNED-PAYLOAD'
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    const getSignatureKey = (key, dateStamp, regionName, serviceName) => {
      const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
      const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
      return kSigning;
    };

    const signingKey = getSignatureKey(this.secretAccessKey, dateStamp, this.region, this.service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const url = `https://s3.${this.region}.amazonaws.com${path}?${queryString}&X-Amz-Signature=${signature}`;
    return { success: true, url };
  }

  // ==================== MULTIPART UPLOAD ====================

  async createMultipartUpload(bucketName, key, options = {}) {
    const path = `/${bucketName}/${key}?uploads`;
    const headers = {
      ...(options.contentType && { 'Content-Type': options.contentType }),
      ...(options.acl && { 'x-amz-acl': options.acl })
    };

    const signedHeaders = this.sign('POST', path, headers);

    const response = await this.client.post(path, null, { headers: signedHeaders });
    return { success: true, uploadId: response.data.UploadId };
  }

  async uploadPart(bucketName, key, uploadId, partNumber, data) {
    const path = `/${bucketName}/${key}?partNumber=${partNumber}&uploadId=${uploadId}`;
    const headers = this.sign('PUT', path, {}, data);

    const response = await this.client.put(path, data, { headers });
    return { 
      success: true, 
      etag: response.headers['etag'],
      partNumber
    };
  }

  async completeMultipartUpload(bucketName, key, uploadId, parts) {
    const path = `/${bucketName}/${key}?uploadId=${uploadId}`;
    
    const completeXml = `<?xml version="1.0" encoding="UTF-8"?>
      <CompleteMultipartUpload>
        ${parts.map(part => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>${part.etag}</ETag></Part>`).join('')}
      </CompleteMultipartUpload>`;

    const headers = { 'Content-Type': 'application/xml' };
    const signedHeaders = this.sign('POST', path, headers, completeXml);

    const response = await this.client.post(path, completeXml, { headers: signedHeaders });
    return { success: true, location: response.data.Location };
  }

  async abortMultipartUpload(bucketName, key, uploadId) {
    const path = `/${bucketName}/${key}?uploadId=${uploadId}`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: 'Multipart upload aborted' };
  }

  async listParts(bucketName, key, uploadId, options = {}) {
    const path = `/${bucketName}/${key}`;
    const params = {
      uploadId,
      ...(options.maxParts && { 'max-parts': options.maxParts }),
      ...(options.partNumberMarker && { 'part-number-marker': options.partNumberMarker })
    };

    const queryString = Object.keys(params)
      .map(k => `${k}=${encodeURIComponent(params[k])}`)
      .join('&');

    const headers = this.sign('GET', `${path}?${queryString}`);

    const response = await this.client.get(path, { headers, params });
    return { success: true, parts: response.data };
  }

  // ==================== BUCKET POLICIES ====================

  async getBucketPolicy(bucketName) {
    const path = `/${bucketName}?policy`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { headers });
    return { success: true, policy: response.data };
  }

  async putBucketPolicy(bucketName, policy) {
    const path = `/${bucketName}?policy`;
    const policyJson = JSON.stringify(policy);
    const headers = { 'Content-Type': 'application/json' };
    const signedHeaders = this.sign('PUT', path, headers, policyJson);

    await this.client.put(path, policyJson, { headers: signedHeaders });
    return { success: true, message: 'Bucket policy updated' };
  }

  async deleteBucketPolicy(bucketName) {
    const path = `/${bucketName}?policy`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: 'Bucket policy deleted' };
  }

  // ==================== BUCKET CORS ====================

  async getBucketCors(bucketName) {
    const path = `/${bucketName}?cors`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { headers });
    return { success: true, cors: response.data };
  }

  async putBucketCors(bucketName, corsRules) {
    const path = `/${bucketName}?cors`;
    
    const corsXml = `<?xml version="1.0" encoding="UTF-8"?>
      <CORSConfiguration>
        ${corsRules.map(rule => `
          <CORSRule>
            ${rule.allowedOrigins.map(origin => `<AllowedOrigin>${origin}</AllowedOrigin>`).join('')}
            ${rule.allowedMethods.map(method => `<AllowedMethod>${method}</AllowedMethod>`).join('')}
            ${rule.allowedHeaders ? rule.allowedHeaders.map(header => `<AllowedHeader>${header}</AllowedHeader>`).join('') : ''}
            ${rule.maxAgeSeconds ? `<MaxAgeSeconds>${rule.maxAgeSeconds}</MaxAgeSeconds>` : ''}
          </CORSRule>
        `).join('')}
      </CORSConfiguration>`;

    const headers = { 'Content-Type': 'application/xml' };
    const signedHeaders = this.sign('PUT', path, headers, corsXml);

    await this.client.put(path, corsXml, { headers: signedHeaders });
    return { success: true, message: 'CORS configuration updated' };
  }

  async deleteBucketCors(bucketName) {
    const path = `/${bucketName}?cors`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: 'CORS configuration deleted' };
  }

  // ==================== BUCKET VERSIONING ====================

  async getBucketVersioning(bucketName) {
    const path = `/${bucketName}?versioning`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { headers });
    return { success: true, versioning: response.data };
  }

  async putBucketVersioning(bucketName, status) {
    const path = `/${bucketName}?versioning`;
    
    const versioningXml = `<?xml version="1.0" encoding="UTF-8"?>
      <VersioningConfiguration>
        <Status>${status}</Status>
      </VersioningConfiguration>`;

    const headers = { 'Content-Type': 'application/xml' };
    const signedHeaders = this.sign('PUT', path, headers, versioningXml);

    await this.client.put(path, versioningXml, { headers: signedHeaders });
    return { success: true, message: 'Versioning configuration updated' };
  }

  // ==================== BUCKET LIFECYCLE ====================

  async getBucketLifecycle(bucketName) {
    const path = `/${bucketName}?lifecycle`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { headers });
    return { success: true, lifecycle: response.data };
  }

  async putBucketLifecycle(bucketName, rules) {
    const path = `/${bucketName}?lifecycle`;
    
    const lifecycleXml = `<?xml version="1.0" encoding="UTF-8"?>
      <LifecycleConfiguration>
        ${rules.map(rule => `
          <Rule>
            <ID>${rule.id}</ID>
            <Status>${rule.status}</Status>
            ${rule.prefix ? `<Prefix>${rule.prefix}</Prefix>` : ''}
            ${rule.expiration ? `<Expiration><Days>${rule.expiration.days}</Days></Expiration>` : ''}
          </Rule>
        `).join('')}
      </LifecycleConfiguration>`;

    const headers = { 'Content-Type': 'application/xml' };
    const signedHeaders = this.sign('PUT', path, headers, lifecycleXml);

    await this.client.put(path, lifecycleXml, { headers: signedHeaders });
    return { success: true, message: 'Lifecycle configuration updated' };
  }

  async deleteBucketLifecycle(bucketName) {
    const path = `/${bucketName}?lifecycle`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: 'Lifecycle configuration deleted' };
  }

  // ==================== BUCKET TAGGING ====================

  async getBucketTagging(bucketName) {
    const path = `/${bucketName}?tagging`;
    const headers = this.sign('GET', path);

    const response = await this.client.get(path, { headers });
    return { success: true, tags: response.data };
  }

  async putBucketTagging(bucketName, tags) {
    const path = `/${bucketName}?tagging`;
    
    const taggingXml = `<?xml version="1.0" encoding="UTF-8"?>
      <Tagging>
        <TagSet>
          ${Object.keys(tags).map(key => `<Tag><Key>${key}</Key><Value>${tags[key]}</Value></Tag>`).join('')}
        </TagSet>
      </Tagging>`;

    const headers = { 'Content-Type': 'application/xml' };
    const signedHeaders = this.sign('PUT', path, headers, taggingXml);

    await this.client.put(path, taggingXml, { headers: signedHeaders });
    return { success: true, message: 'Bucket tagging updated' };
  }

  async deleteBucketTagging(bucketName) {
    const path = `/${bucketName}?tagging`;
    const headers = this.sign('DELETE', path);

    await this.client.delete(path, { headers });
    return { success: true, message: 'Bucket tagging deleted' };
  }
}

module.exports = AWSS3API;
