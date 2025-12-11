/**
 * AgentMemory.js - Agent Memory System
 * Short-term and long-term memory with search capabilities
 */

class AgentMemory {
  constructor() {
    this.shortTerm = new Map();
    this.longTerm = new Map();
    this.maxShortTerm = 100;
    this.maxLongTerm = 1000;
  }

  async initialize() {
    // In production, load long-term memory from database
    console.log('💾 Agent memory initialized');
  }

  async store(key, value, type = 'short') {
    const memory = {
      key,
      value,
      timestamp: Date.now(),
      type,
      accessCount: 0,
      lastAccess: Date.now()
    };

    if (type === 'short') {
      this.shortTerm.set(key, memory);
      
      // Cleanup old short-term memories
      if (this.shortTerm.size > this.maxShortTerm) {
        const oldest = Array.from(this.shortTerm.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        
        // Move to long-term if important
        if (this.isImportant(oldest[1])) {
          this.longTerm.set(oldest[0], { ...oldest[1], type: 'long' });
        }
        
        this.shortTerm.delete(oldest[0]);
      }
    } else {
      this.longTerm.set(key, memory);
      
      // Cleanup old long-term memories
      if (this.longTerm.size > this.maxLongTerm) {
        const oldest = Array.from(this.longTerm.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
        this.longTerm.delete(oldest[0]);
      }
    }

    return { success: true, key, type };
  }

  async retrieve(key) {
    // Check short-term first
    const shortMem = this.shortTerm.get(key);
    if (shortMem) {
      shortMem.accessCount++;
      shortMem.lastAccess = Date.now();
      return shortMem.value;
    }

    // Check long-term
    const longMem = this.longTerm.get(key);
    if (longMem) {
      longMem.accessCount++;
      longMem.lastAccess = Date.now();
      return longMem.value;
    }

    return null;
  }

  async search(query) {
    const results = [];

    // Search short-term
    for (const [key, memory] of this.shortTerm.entries()) {
      if (this.matchesQuery(key, memory.value, query)) {
        results.push({
          ...memory,
          source: 'short-term'
        });
      }
    }

    // Search long-term
    for (const [key, memory] of this.longTerm.entries()) {
      if (this.matchesQuery(key, memory.value, query)) {
        results.push({
          ...memory,
          source: 'long-term'
        });
      }
    }

    // Sort by relevance (access count and recency)
    results.sort((a, b) => {
      const scoreA = a.accessCount * 0.5 + (Date.now() - a.lastAccess) * -0.0001;
      const scoreB = b.accessCount * 0.5 + (Date.now() - b.lastAccess) * -0.0001;
      return scoreB - scoreA;
    });

    return results;
  }

  matchesQuery(key, value, query) {
    const queryLower = query.toLowerCase();
    
    if (key.toLowerCase().includes(queryLower)) {
      return true;
    }

    const valueStr = JSON.stringify(value).toLowerCase();
    return valueStr.includes(queryLower);
  }

  async forget(key) {
    this.shortTerm.delete(key);
    this.longTerm.delete(key);
    return { success: true, key };
  }

  async consolidate() {
    // Move important short-term memories to long-term
    const important = Array.from(this.shortTerm.entries())
      .filter(([key, mem]) => this.isImportant(mem))
      .slice(0, 10);

    for (const [key, mem] of important) {
      this.longTerm.set(key, {
        ...mem,
        type: 'long',
        consolidatedAt: Date.now()
      });
    }

    return {
      success: true,
      consolidated: important.length
    };
  }

  isImportant(memory) {
    // Importance heuristics
    const recency = Date.now() - memory.timestamp < 3600000; // Last hour
    const frequency = memory.accessCount > 5;
    const recent = memory.lastAccess > Date.now() - 1800000; // Last 30 min

    return recency || frequency || recent;
  }

  async clear(type = 'all') {
    if (type === 'short' || type === 'all') {
      this.shortTerm.clear();
    }
    
    if (type === 'long' || type === 'all') {
      this.longTerm.clear();
    }

    return {
      success: true,
      cleared: type
    };
  }

  getSize() {
    return {
      shortTerm: this.shortTerm.size,
      longTerm: this.longTerm.size,
      total: this.shortTerm.size + this.longTerm.size
    };
  }

  getMemoryStats() {
    const allMemories = [
      ...Array.from(this.shortTerm.values()),
      ...Array.from(this.longTerm.values())
    ];

    return {
      size: this.getSize(),
      totalAccesses: allMemories.reduce((sum, m) => sum + m.accessCount, 0),
      averageAge: allMemories.length > 0
        ? allMemories.reduce((sum, m) => sum + (Date.now() - m.timestamp), 0) / allMemories.length
        : 0,
      mostAccessed: allMemories
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 5)
        .map(m => ({ key: m.key, accessCount: m.accessCount }))
    };
  }
}

module.exports = AgentMemory;
