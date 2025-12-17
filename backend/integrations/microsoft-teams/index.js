/**
 * Microsoft Teams Collaboration Integration
 */

const axios = require('axios');

class MicrosoftTeamsIntegration {
  constructor(config) {
    this.accessToken = config.accessToken || process.env.MS_TEAMS_ACCESS_TOKEN;
    if (!this.accessToken) throw new Error('Microsoft Teams access token required');
    
    this.baseURL = 'https://graph.microsoft.com/v1.0';
  }

  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
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

  async getTeams() {
    return await this.makeRequest('GET', '/me/joinedTeams');
  }

  async getTeam(teamId) {
    return await this.makeRequest('GET', `/teams/${teamId}`);
  }

  async getChannels(teamId) {
    return await this.makeRequest('GET', `/teams/${teamId}/channels`);
  }

  async createChannel(teamId, displayName, description = '') {
    return await this.makeRequest('POST', `/teams/${teamId}/channels`, {
      displayName,
      description
    });
  }

  async getMessages(teamId, channelId) {
    return await this.makeRequest('GET', `/teams/${teamId}/channels/${channelId}/messages`);
  }

  async sendMessage(teamId, channelId, content) {
    return await this.makeRequest('POST', `/teams/${teamId}/channels/${channelId}/messages`, {
      body: {
        content
      }
    });
  }

  async replyToMessage(teamId, channelId, messageId, content) {
    return await this.makeRequest('POST', `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`, {
      body: {
        content
      }
    });
  }

  async getMembers(teamId) {
    return await this.makeRequest('GET', `/teams/${teamId}/members`);
  }

  async addMember(teamId, userId, roles = ['member']) {
    return await this.makeRequest('POST', `/teams/${teamId}/members`, {
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      roles,
      'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`
    });
  }

  async removeMember(teamId, membershipId) {
    return await this.makeRequest('DELETE', `/teams/${teamId}/members/${membershipId}`);
  }

  async getTabs(teamId, channelId) {
    return await this.makeRequest('GET', `/teams/${teamId}/channels/${channelId}/tabs`);
  }

  async createTab(teamId, channelId, displayName, teamsAppId, configuration) {
    return await this.makeRequest('POST', `/teams/${teamId}/channels/${channelId}/tabs`, {
      displayName,
      'teamsApp@odata.bind': `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${teamsAppId}`,
      configuration
    });
  }

  async scheduleOnlineMeeting(subject, startDateTime, endDateTime, participants) {
    return await this.makeRequest('POST', '/me/onlineMeetings', {
      subject,
      startDateTime,
      endDateTime,
      participants: {
        attendees: participants.map(email => ({
          identity: {
            user: {
              id: email
            }
          }
        }))
      }
    });
  }

  async getOnlineMeetings() {
    return await this.makeRequest('GET', '/me/onlineMeetings');
  }

  async getCalendarEvents() {
    return await this.makeRequest('GET', '/me/calendar/events');
  }
}

module.exports = MicrosoftTeamsIntegration;
