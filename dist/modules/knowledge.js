"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Knowledge = void 0;
const chromadb_1 = require("chromadb");
const redis_1 = require("redis");
const logger_1 = require("../logger");
const uuid_1 = require("uuid");
class Knowledge {
    chroma = null;
    chromaCollection = null;
    redis = null;
    config;
    logger;
    memoryCache = new Map();
    constructor(config) {
        this.config = config;
        this.logger = logger_1.Logger.get();
    }
    async initialize() {
        this.logger.info('Initializing Knowledge module...');
        // Initialize ChromaDB if available
        try {
            this.chroma = new chromadb_1.ChromaClient({
                path: process.env.CHROMA_HOST || 'http://localhost:8000'
            });
            this.chromaCollection = await this.chroma.getOrCreateCollection({
                name: `${this.config.name}-memories`
            });
            this.logger.info('ChromaDB initialized successfully');
        }
        catch (error) {
            this.logger.warn('ChromaDB not available, using in-memory storage:', error);
        }
        // Initialize Redis if available
        try {
            if (process.env.REDIS_URL) {
                this.redis = (0, redis_1.createClient)({
                    url: process.env.REDIS_URL
                });
                await this.redis.connect();
                this.logger.info('Redis connected successfully');
            }
        }
        catch (error) {
            this.logger.warn('Redis not available, using in-memory cache:', error);
        }
    }
    async storeMemory(content, metadata = {}) {
        const memory = {
            id: (0, uuid_1.v4)(),
            content,
            metadata: {
                ...metadata,
                agent: this.config.name
            },
            timestamp: new Date()
        };
        // Store in cache
        this.memoryCache.set(memory.id, memory);
        // Store in ChromaDB with embeddings
        if (this.chromaCollection) {
            try {
                await this.chromaCollection.add({
                    ids: [memory.id],
                    documents: [content],
                    metadatas: [memory.metadata]
                });
            }
            catch (error) {
                this.logger.error('Failed to store memory in ChromaDB:', error);
            }
        }
        // Store in Redis
        if (this.redis) {
            try {
                await this.redis.setEx(`memory:${memory.id}`, 60 * 60 * 24 * 7, // 7 days TTL
                JSON.stringify(memory));
            }
            catch (error) {
                this.logger.error('Failed to store memory in Redis:', error);
            }
        }
        this.logger.debug(`Stored memory: ${memory.id}`);
        return memory.id;
    }
    async retrieveMemory(id) {
        // Check cache first
        if (this.memoryCache.has(id)) {
            return this.memoryCache.get(id);
        }
        // Check Redis
        if (this.redis) {
            try {
                const redisData = await this.redis.get(`memory:${id}`);
                if (redisData) {
                    const memory = JSON.parse(redisData);
                    this.memoryCache.set(id, memory);
                    return memory;
                }
            }
            catch (error) {
                this.logger.error('Failed to retrieve memory from Redis:', error);
            }
        }
        return null;
    }
    async searchMemories(query, limit = 10) {
        if (this.chromaCollection) {
            try {
                const results = await this.chromaCollection.query({
                    queryTexts: [query],
                    nResults: limit
                });
                const memories = [];
                if (results.ids && results.documents && results.metadatas) {
                    for (let i = 0; i < results.ids[0].length; i++) {
                        const id = results.ids[0][i];
                        const content = results.documents[0][i];
                        const metadata = results.metadatas[0][i];
                        memories.push({
                            id,
                            content: content || '',
                            metadata: metadata || {},
                            timestamp: new Date(typeof metadata?.timestamp === 'string' || typeof metadata?.timestamp === 'number'
                                ? metadata.timestamp
                                : Date.now())
                        });
                    }
                }
                return memories;
            }
            catch (error) {
                this.logger.error('Failed to search memories in ChromaDB:', error);
            }
        }
        // Fallback to simple text search in cache
        const cacheResults = [];
        for (const memory of this.memoryCache.values()) {
            if (memory.content.toLowerCase().includes(query.toLowerCase())) {
                cacheResults.push(memory);
            }
        }
        return cacheResults.slice(0, limit);
    }
    async getRecentMemories(limit = 10) {
        const allMemories = Array.from(this.memoryCache.values());
        return allMemories
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    async deleteMemory(id) {
        try {
            // Delete from cache
            this.memoryCache.delete(id);
            // Delete from ChromaDB
            if (this.chromaCollection) {
                await this.chromaCollection.delete({
                    ids: [id]
                });
            }
            // Delete from Redis
            if (this.redis) {
                await this.redis.del(`memory:${id}`);
            }
            this.logger.debug(`Deleted memory: ${id}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to delete memory:', error);
            return false;
        }
    }
    async clearAllMemories() {
        try {
            // Clear cache
            this.memoryCache.clear();
            // Clear ChromaDB collection
            if (this.chromaCollection) {
                await this.chroma?.deleteCollection({
                    name: `${this.config.name}-memories`
                });
                // Recreate collection
                this.chromaCollection = await this.chroma?.getOrCreateCollection({
                    name: `${this.config.name}-memories`
                }) || null;
            }
            // Clear Redis keys
            if (this.redis) {
                const keys = await this.redis.keys('memory:*');
                if (keys.length > 0) {
                    await this.redis.del(keys);
                }
            }
            this.logger.info('Cleared all memories');
        }
        catch (error) {
            this.logger.error('Failed to clear memories:', error);
        }
    }
    async close() {
        if (this.redis) {
            await this.redis.disconnect();
        }
        // ChromaDB doesn't need explicit cleanup
    }
}
exports.Knowledge = Knowledge;
//# sourceMappingURL=knowledge.js.map