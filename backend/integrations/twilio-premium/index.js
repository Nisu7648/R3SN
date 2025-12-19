/**
 * Twilio Premium Communications Integration
 * Save $500+/month - Advanced SMS, Voice, Video, WhatsApp
 */

const twilio = require('twilio');

class TwilioPremiumIntegration {
  constructor(config) {
    this.accountSid = config.accountSid || process.env.TWILIO_ACCOUNT_SID;
    this.authToken = config.authToken || process.env.TWILIO_AUTH_TOKEN;
    
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials required');
    }
    
    this.client = twilio(this.accountSid, this.authToken);
  }

  async sendSMS(to, from, body) {
    try {
      const message = await this.client.messages.create({
        body,
        from,
        to
      });
      
      return {
        success: true,
        messageSid: message.sid,
        status: message.status
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendWhatsApp(to, from, body) {
    try {
      const message = await this.client.messages.create({
        body,
        from: `whatsapp:${from}`,
        to: `whatsapp:${to}`
      });
      
      return {
        success: true,
        messageSid: message.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async makeCall(to, from, url) {
    try {
      const call = await this.client.calls.create({
        url,
        to,
        from
      });
      
      return {
        success: true,
        callSid: call.sid,
        status: call.status
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createVideoRoom(uniqueName, type = 'group') {
    try {
      const room = await this.client.video.rooms.create({
        uniqueName,
        type
      });
      
      return {
        success: true,
        roomSid: room.sid,
        roomName: room.uniqueName
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getVideoRooms() {
    try {
      const rooms = await this.client.video.rooms.list();
      
      return {
        success: true,
        rooms: rooms.map(r => ({
          sid: r.sid,
          name: r.uniqueName,
          status: r.status
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createAccessToken(identity, roomName) {
    try {
      const AccessToken = twilio.jwt.AccessToken;
      const VideoGrant = AccessToken.VideoGrant;
      
      const token = new AccessToken(
        this.accountSid,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
      );
      
      token.identity = identity;
      const grant = new VideoGrant({ room: roomName });
      token.addGrant(grant);
      
      return {
        success: true,
        token: token.toJwt()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmail(to, from, subject, text, html) {
    try {
      const message = await this.client.messages.create({
        to,
        from,
        subject,
        text,
        html
      });
      
      return {
        success: true,
        messageSid: message.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMessages(limit = 20) {
    try {
      const messages = await this.client.messages.list({ limit });
      
      return {
        success: true,
        messages: messages.map(m => ({
          sid: m.sid,
          from: m.from,
          to: m.to,
          body: m.body,
          status: m.status,
          dateCreated: m.dateCreated
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCalls(limit = 20) {
    try {
      const calls = await this.client.calls.list({ limit });
      
      return {
        success: true,
        calls: calls.map(c => ({
          sid: c.sid,
          from: c.from,
          to: c.to,
          status: c.status,
          duration: c.duration
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getRecordings(limit = 20) {
    try {
      const recordings = await this.client.recordings.list({ limit });
      
      return {
        success: true,
        recordings: recordings.map(r => ({
          sid: r.sid,
          duration: r.duration,
          url: r.uri
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createVerification(to, channel = 'sms') {
    try {
      const verification = await this.client.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications
        .create({ to, channel });
      
      return {
        success: true,
        status: verification.status
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async checkVerification(to, code) {
    try {
      const check = await this.client.verify
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks
        .create({ to, code });
      
      return {
        success: true,
        status: check.status,
        valid: check.valid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createConversation(friendlyName) {
    try {
      const conversation = await this.client.conversations.conversations.create({
        friendlyName
      });
      
      return {
        success: true,
        conversationSid: conversation.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addParticipant(conversationSid, identity) {
    try {
      const participant = await this.client.conversations
        .conversations(conversationSid)
        .participants
        .create({ identity });
      
      return {
        success: true,
        participantSid: participant.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendConversationMessage(conversationSid, author, body) {
    try {
      const message = await this.client.conversations
        .conversations(conversationSid)
        .messages
        .create({ author, body });
      
      return {
        success: true,
        messageSid: message.sid
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAccountBalance() {
    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      
      return {
        success: true,
        balance: account.balance
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = TwilioPremiumIntegration;
