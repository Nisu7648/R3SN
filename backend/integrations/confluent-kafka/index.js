/**
 * Confluent Kafka Event Streaming Integration
 * Save $800+/month - Real-time event streaming
 */

const { Kafka } = require('kafkajs');
const axios = require('axios');

class ConfluentKafkaIntegration {
  constructor(config) {
    this.apiKey = config.apiKey || process.env.CONFLUENT_API_KEY;
    this.apiSecret = config.apiSecret || process.env.CONFLUENT_API_SECRET;
    this.bootstrapServers = config.bootstrapServers || process.env.CONFLUENT_BOOTSTRAP_SERVERS;
    this.cloudApiUrl = config.cloudApiUrl || 'https://api.confluent.cloud';
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Confluent credentials required');
    }
    
    this.kafka = new Kafka({
      clientId: 'r3sn-client',
      brokers: this.bootstrapServers ? this.bootstrapServers.split(',') : [],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: this.apiKey,
        password: this.apiSecret
      }
    });
    
    this.producer = null;
    this.consumer = null;
  }

  async makeCloudRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.cloudApiUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.apiKey,
        password: this.apiSecret
      }
    };

    if (data) config.data = data;

    try {
      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async createProducer() {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendMessage(topic, messages) {
    try {
      if (!this.producer) {
        await this.createProducer();
      }
      
      const result = await this.producer.send({
        topic,
        messages: messages.map(msg => ({
          key: msg.key,
          value: JSON.stringify(msg.value)
        }))
      });
      
      return {
        success: true,
        result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createConsumer(groupId) {
    try {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async subscribe(topics) {
    try {
      if (!this.consumer) {
        return { success: false, error: 'Consumer not created' };
      }
      
      await this.consumer.subscribe({ topics, fromBeginning: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async consumeMessages(callback) {
    try {
      if (!this.consumer) {
        return { success: false, error: 'Consumer not created' };
      }
      
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          callback({
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: JSON.parse(message.value.toString())
          });
        }
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTopic(topicName, partitions = 3, replicationFactor = 3) {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      await admin.createTopics({
        topics: [{
          topic: topicName,
          numPartitions: partitions,
          replicationFactor
        }]
      });
      
      await admin.disconnect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listTopics() {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const topics = await admin.listTopics();
      
      await admin.disconnect();
      return {
        success: true,
        topics
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTopic(topicName) {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      await admin.deleteTopics({
        topics: [topicName]
      });
      
      await admin.disconnect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTopicMetadata(topicName) {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });
      
      await admin.disconnect();
      return {
        success: true,
        metadata
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listClusters() {
    return await this.makeCloudRequest('GET', '/cmk/v2/clusters');
  }

  async getCluster(clusterId) {
    return await this.makeCloudRequest('GET', `/cmk/v2/clusters/${clusterId}`);
  }

  async listEnvironments() {
    return await this.makeCloudRequest('GET', '/org/v2/environments');
  }

  async createConnector(connectorConfig) {
    return await this.makeCloudRequest('POST', '/connect/v1/connectors', connectorConfig);
  }

  async listConnectors() {
    return await this.makeCloudRequest('GET', '/connect/v1/connectors');
  }

  async getConnector(connectorName) {
    return await this.makeCloudRequest('GET', `/connect/v1/connectors/${connectorName}`);
  }

  async deleteConnector(connectorName) {
    return await this.makeCloudRequest('DELETE', `/connect/v1/connectors/${connectorName}`);
  }

  async disconnect() {
    try {
      if (this.producer) await this.producer.disconnect();
      if (this.consumer) await this.consumer.disconnect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = ConfluentKafkaIntegration;
