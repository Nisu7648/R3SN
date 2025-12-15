/**
 * Telegram Bot Integration
 * Complete bot automation
 */

const TelegramBot = require('node-telegram-bot-api');

class TelegramBotIntegration {
  constructor(config) {
    this.token = config.token || process.env.TELEGRAM_BOT_TOKEN;
    if (!this.token) throw new Error('Telegram bot token required');
    
    this.bot = new TelegramBot(this.token, { polling: false });
  }

  async sendMessage(chatId, text, options = {}) {
    try {
      const message = await this.bot.sendMessage(chatId, text, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendPhoto(chatId, photo, options = {}) {
    try {
      const message = await this.bot.sendPhoto(chatId, photo, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendDocument(chatId, document, options = {}) {
    try {
      const message = await this.bot.sendDocument(chatId, document, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendVideo(chatId, video, options = {}) {
    try {
      const message = await this.bot.sendVideo(chatId, video, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendAudio(chatId, audio, options = {}) {
    try {
      const message = await this.bot.sendAudio(chatId, audio, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendLocation(chatId, latitude, longitude, options = {}) {
    try {
      const message = await this.bot.sendLocation(chatId, latitude, longitude, options);
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async editMessageText(text, options) {
    try {
      const result = await this.bot.editMessageText(text, options);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteMessage(chatId, messageId) {
    try {
      await this.bot.deleteMessage(chatId, messageId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMe() {
    try {
      const me = await this.bot.getMe();
      return { success: true, bot: me };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChat(chatId) {
    try {
      const chat = await this.bot.getChat(chatId);
      return { success: true, chat };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getChatMember(chatId, userId) {
    try {
      const member = await this.bot.getChatMember(chatId, userId);
      return { success: true, member };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async kickChatMember(chatId, userId) {
    try {
      await this.bot.kickChatMember(chatId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unbanChatMember(chatId, userId) {
    try {
      await this.bot.unbanChatMember(chatId, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setWebhook(url, options = {}) {
    try {
      await this.bot.setWebHook(url, options);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteWebhook() {
    try {
      await this.bot.deleteWebHook();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getWebhookInfo() {
    try {
      const info = await this.bot.getWebHookInfo();
      return { success: true, info };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendPoll(chatId, question, options, settings = {}) {
    try {
      const poll = await this.bot.sendPoll(chatId, question, options, settings);
      return { success: true, poll };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async stopPoll(chatId, messageId) {
    try {
      const poll = await this.bot.stopPoll(chatId, messageId);
      return { success: true, poll };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendInvoice(chatId, title, description, payload, providerToken, currency, prices, options = {}) {
    try {
      const invoice = await this.bot.sendInvoice(
        chatId, title, description, payload, providerToken, currency, prices, options
      );
      return { success: true, invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async answerCallbackQuery(callbackQueryId, options = {}) {
    try {
      await this.bot.answerCallbackQuery(callbackQueryId, options);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = TelegramBotIntegration;
