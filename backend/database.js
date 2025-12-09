/**
 * Database Configuration and Connection
 * MongoDB connection with retry logic and monitoring
 */

const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/r3sn';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    try {
      this.connection = await mongoose.connect(mongoUri, options);
      console.log('✅ MongoDB connected successfully');
      this.setupEventHandlers();
      this.retryAttempts = 0;
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.log(`Retrying connection (${this.retryAttempts}/${this.maxRetries}) in ${this.retryDelay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect();
      } else {
        throw new Error('Failed to connect to MongoDB after maximum retries');
      }
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();
