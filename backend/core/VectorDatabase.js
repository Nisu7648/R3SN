/**
 * R3SN Vector Database
 * Vector storage, embedding generation, and similarity search
 */

const axios = require('axios');
const EventEmitter = require('events');

class VectorDatabase extends EventEmitter {
    constructor() {
        super();
        this.collections = new Map();
        this.embeddings = new Map();
        this.dimensions = 1536; // OpenAI ada-002 default
    }

    /**
     * Create collection
     */
    async createCollection(name, options = {}) {
        if (this.collections.has(name)) {
            throw new Error(`Collection ${name} already exists`);
        }

        const collection = {
            name,
            dimensions: options.dimensions || this.dimensions,
            metric: options.metric || 'cosine',
            vectors: [],
            metadata: {},
            createdAt: Date.now()
        };

        this.collections.set(name, collection);

        this.emit('collection:created', { name });

        return {
            success: true,
            collection: name,
            dimensions: collection.dimensions
        };
    }

    /**
     * Insert vector
     */
    async insert(collection, id, vector, metadata = {}) {
        const coll = this.collections.get(collection);
        if (!coll) {
            throw new Error(`Collection ${collection} not found`);
        }

        if (vector.length !== coll.dimensions) {
            throw new Error(`Vector dimension mismatch: expected ${coll.dimensions}, got ${vector.length}`);
        }

        const vectorData = {
            id,
            vector,
            metadata,
            timestamp: Date.now()
        };

        // Remove existing vector with same ID
        coll.vectors = coll.vectors.filter(v => v.id !== id);
        
        // Add new vector
        coll.vectors.push(vectorData);

        this.emit('vector:inserted', { collection, id });

        return {
            success: true,
            collection,
            id,
            dimensions: vector.length
        };
    }

    /**
     * Insert multiple vectors
     */
    async insertBatch(collection, vectors) {
        const results = [];

        for (const { id, vector, metadata } of vectors) {
            const result = await this.insert(collection, id, vector, metadata);
            results.push(result);
        }

        return {
            success: true,
            collection,
            inserted: results.length
        };
    }

    /**
     * Search similar vectors
     */
    async search(collection, queryVector, options = {}) {
        const coll = this.collections.get(collection);
        if (!coll) {
            throw new Error(`Collection ${collection} not found`);
        }

        if (queryVector.length !== coll.dimensions) {
            throw new Error(`Query vector dimension mismatch: expected ${coll.dimensions}, got ${queryVector.length}`);
        }

        // Calculate similarities
        const results = coll.vectors.map(item => ({
            id: item.id,
            score: this.calculateSimilarity(queryVector, item.vector, coll.metric),
            metadata: item.metadata,
            vector: options.includeVectors ? item.vector : undefined
        }));

        // Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        // Apply limit
        const limit = options.limit || 10;
        const topResults = results.slice(0, limit);

        // Apply threshold
        const threshold = options.threshold || 0;
        const filtered = topResults.filter(r => r.score >= threshold);

        this.emit('search:completed', { collection, results: filtered.length });

        return {
            success: true,
            collection,
            results: filtered,
            count: filtered.length
        };
    }

    /**
     * Generate embedding using OpenAI
     */
    async generateEmbedding(text, options = {}) {
        const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not provided');
        }

        try {
            const response = await axios.post('https://api.openai.com/v1/embeddings', {
                input: text,
                model: options.model || 'text-embedding-ada-002'
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const embedding = response.data.data[0].embedding;

            // Cache embedding
            this.embeddings.set(text, {
                vector: embedding,
                model: options.model || 'text-embedding-ada-002',
                timestamp: Date.now()
            });

            return {
                success: true,
                vector: embedding,
                dimensions: embedding.length,
                model: options.model || 'text-embedding-ada-002'
            };

        } catch (error) {
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Generate embeddings for multiple texts
     */
    async generateEmbeddings(texts, options = {}) {
        const embeddings = [];

        for (const text of texts) {
            const result = await this.generateEmbedding(text, options);
            embeddings.push(result.vector);
        }

        return {
            success: true,
            embeddings,
            count: embeddings.length
        };
    }

    /**
     * Semantic search with text query
     */
    async semanticSearch(collection, query, options = {}) {
        // Generate embedding for query
        const embeddingResult = await this.generateEmbedding(query, options);
        
        // Search with embedding
        return await this.search(collection, embeddingResult.vector, options);
    }

    /**
     * Add document with automatic chunking
     */
    async addDocument(collection, document, options = {}) {
        const chunks = this.chunkDocument(document.text, options.chunkSize || 500);
        const results = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const id = `${document.id}_chunk_${i}`;
            
            // Generate embedding
            const embeddingResult = await this.generateEmbedding(chunk, options);
            
            // Insert vector
            await this.insert(collection, id, embeddingResult.vector, {
                ...document.metadata,
                documentId: document.id,
                chunkIndex: i,
                chunkText: chunk
            });

            results.push({ id, chunk });
        }

        return {
            success: true,
            collection,
            documentId: document.id,
            chunks: results.length
        };
    }

    /**
     * Chunk document into smaller pieces
     */
    chunkDocument(text, chunkSize) {
        const words = text.split(/\s+/);
        const chunks = [];

        for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk);
        }

        return chunks;
    }

    /**
     * Calculate similarity
     */
    calculateSimilarity(vec1, vec2, metric) {
        switch (metric) {
            case 'cosine':
                return this.cosineSimilarity(vec1, vec2);
            case 'euclidean':
                return 1 / (1 + this.euclideanDistance(vec1, vec2));
            case 'dot':
                return this.dotProduct(vec1, vec2);
            default:
                return this.cosineSimilarity(vec1, vec2);
        }
    }

    /**
     * Cosine similarity
     */
    cosineSimilarity(vec1, vec2) {
        const dotProd = this.dotProduct(vec1, vec2);
        const mag1 = this.magnitude(vec1);
        const mag2 = this.magnitude(vec2);
        return dotProd / (mag1 * mag2);
    }

    /**
     * Euclidean distance
     */
    euclideanDistance(vec1, vec2) {
        let sum = 0;
        for (let i = 0; i < vec1.length; i++) {
            sum += Math.pow(vec1[i] - vec2[i], 2);
        }
        return Math.sqrt(sum);
    }

    /**
     * Dot product
     */
    dotProduct(vec1, vec2) {
        let sum = 0;
        for (let i = 0; i < vec1.length; i++) {
            sum += vec1[i] * vec2[i];
        }
        return sum;
    }

    /**
     * Vector magnitude
     */
    magnitude(vec) {
        let sum = 0;
        for (let i = 0; i < vec.length; i++) {
            sum += vec[i] * vec[i];
        }
        return Math.sqrt(sum);
    }

    /**
     * Delete vector
     */
    async delete(collection, id) {
        const coll = this.collections.get(collection);
        if (!coll) {
            throw new Error(`Collection ${collection} not found`);
        }

        const initialLength = coll.vectors.length;
        coll.vectors = coll.vectors.filter(v => v.id !== id);
        const deleted = initialLength - coll.vectors.length;

        this.emit('vector:deleted', { collection, id });

        return {
            success: true,
            collection,
            id,
            deleted: deleted > 0
        };
    }

    /**
     * Delete collection
     */
    async deleteCollection(name) {
        if (!this.collections.has(name)) {
            throw new Error(`Collection ${name} not found`);
        }

        this.collections.delete(name);

        this.emit('collection:deleted', { name });

        return {
            success: true,
            collection: name,
            deleted: true
        };
    }

    /**
     * Get collection info
     */
    getCollection(name) {
        const coll = this.collections.get(name);
        if (!coll) {
            return null;
        }

        return {
            name: coll.name,
            dimensions: coll.dimensions,
            metric: coll.metric,
            vectorCount: coll.vectors.length,
            createdAt: coll.createdAt
        };
    }

    /**
     * List collections
     */
    listCollections() {
        return Array.from(this.collections.keys()).map(name => this.getCollection(name));
    }

    /**
     * Get statistics
     */
    getStats() {
        const totalVectors = Array.from(this.collections.values())
            .reduce((sum, coll) => sum + coll.vectors.length, 0);

        return {
            collections: this.collections.size,
            totalVectors,
            cachedEmbeddings: this.embeddings.size,
            dimensions: this.dimensions
        };
    }
}

module.exports = VectorDatabase;
