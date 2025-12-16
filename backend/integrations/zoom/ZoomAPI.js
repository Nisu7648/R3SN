/**
 * Zoom API Integration
 * Complete video conferencing and meetings management
 */

const axios = require('axios');

class ZoomAPI {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey || process.env.ZOOM_API_KEY;
    this.apiSecret = apiSecret || process.env.ZOOM_API_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ==================== USERS ====================

  async listUsers(options = {}) {
    const params = {
      status: options.status || 'active',
      page_size: options.page_size || 30,
      ...(options.page_number && { page_number: options.page_number }),
      ...(options.role_id && { role_id: options.role_id })
    };

    const response = await this.client.get('/users', { params });
    return { success: true, users: response.data.users, page_count: response.data.page_count };
  }

  async createUser(data) {
    const payload = {
      action: data.action || 'create',
      user_info: {
        email: data.email,
        type: data.type || 1,
        first_name: data.first_name,
        last_name: data.last_name,
        ...(data.password && { password: data.password })
      }
    };

    const response = await this.client.post('/users', payload);
    return { success: true, user: response.data };
  }

  async getUser(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return { success: true, user: response.data };
  }

  async updateUser(userId, data) {
    const response = await this.client.patch(`/users/${userId}`, data);
    return { success: true, message: 'User updated successfully' };
  }

  async deleteUser(userId, options = {}) {
    const params = {
      action: options.action || 'delete',
      ...(options.transfer_email && { transfer_email: options.transfer_email }),
      ...(options.transfer_meeting && { transfer_meeting: options.transfer_meeting }),
      ...(options.transfer_webinar && { transfer_webinar: options.transfer_webinar })
    };

    await this.client.delete(`/users/${userId}`, { params });
    return { success: true, message: 'User deleted successfully' };
  }

  async getUserSettings(userId) {
    const response = await this.client.get(`/users/${userId}/settings`);
    return { success: true, settings: response.data };
  }

  async updateUserSettings(userId, settings) {
    const response = await this.client.patch(`/users/${userId}/settings`, settings);
    return { success: true, message: 'Settings updated successfully' };
  }

  // ==================== MEETINGS ====================

  async listMeetings(userId, options = {}) {
    const params = {
      type: options.type || 'scheduled',
      page_size: options.page_size || 30,
      ...(options.page_number && { page_number: options.page_number })
    };

    const response = await this.client.get(`/users/${userId}/meetings`, { params });
    return { success: true, meetings: response.data.meetings };
  }

  async createMeeting(userId, data) {
    const payload = {
      topic: data.topic,
      type: data.type || 2,
      start_time: data.start_time,
      duration: data.duration || 60,
      timezone: data.timezone || 'UTC',
      password: data.password,
      agenda: data.agenda,
      settings: {
        host_video: data.host_video !== undefined ? data.host_video : true,
        participant_video: data.participant_video !== undefined ? data.participant_video : true,
        join_before_host: data.join_before_host || false,
        mute_upon_entry: data.mute_upon_entry || false,
        watermark: data.watermark || false,
        audio: data.audio || 'both',
        auto_recording: data.auto_recording || 'none',
        waiting_room: data.waiting_room !== undefined ? data.waiting_room : true,
        ...(data.settings && data.settings)
      }
    };

    const response = await this.client.post(`/users/${userId}/meetings`, payload);
    return { success: true, meeting: response.data };
  }

  async getMeeting(meetingId) {
    const response = await this.client.get(`/meetings/${meetingId}`);
    return { success: true, meeting: response.data };
  }

  async updateMeeting(meetingId, data) {
    const response = await this.client.patch(`/meetings/${meetingId}`, data);
    return { success: true, message: 'Meeting updated successfully' };
  }

  async deleteMeeting(meetingId, options = {}) {
    const params = {
      ...(options.occurrence_id && { occurrence_id: options.occurrence_id }),
      ...(options.schedule_for_reminder && { schedule_for_reminder: options.schedule_for_reminder })
    };

    await this.client.delete(`/meetings/${meetingId}`, { params });
    return { success: true, message: 'Meeting deleted successfully' };
  }

  async endMeeting(meetingId) {
    const response = await this.client.put(`/meetings/${meetingId}/status`, {
      action: 'end'
    });
    return { success: true, message: 'Meeting ended successfully' };
  }

  async getMeetingInvitation(meetingId) {
    const response = await this.client.get(`/meetings/${meetingId}/invitation`);
    return { success: true, invitation: response.data.invitation };
  }

  // ==================== MEETING PARTICIPANTS ====================

  async listMeetingParticipants(meetingId, options = {}) {
    const params = {
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get(`/past_meetings/${meetingId}/participants`, { params });
    return { 
      success: true, 
      participants: response.data.participants,
      next_page_token: response.data.next_page_token
    };
  }

  async getMeetingParticipantReports(meetingId, options = {}) {
    const params = {
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token }),
      ...(options.include_fields && { include_fields: options.include_fields })
    };

    const response = await this.client.get(`/report/meetings/${meetingId}/participants`, { params });
    return { success: true, participants: response.data.participants };
  }

  // ==================== WEBINARS ====================

  async listWebinars(userId, options = {}) {
    const params = {
      page_size: options.page_size || 30,
      ...(options.page_number && { page_number: options.page_number })
    };

    const response = await this.client.get(`/users/${userId}/webinars`, { params });
    return { success: true, webinars: response.data.webinars };
  }

  async createWebinar(userId, data) {
    const payload = {
      topic: data.topic,
      type: data.type || 5,
      start_time: data.start_time,
      duration: data.duration || 60,
      timezone: data.timezone || 'UTC',
      password: data.password,
      agenda: data.agenda,
      settings: {
        host_video: data.host_video !== undefined ? data.host_video : true,
        panelists_video: data.panelists_video !== undefined ? data.panelists_video : true,
        practice_session: data.practice_session || false,
        hd_video: data.hd_video || false,
        approval_type: data.approval_type || 2,
        registration_type: data.registration_type || 1,
        audio: data.audio || 'both',
        auto_recording: data.auto_recording || 'none',
        ...(data.settings && data.settings)
      }
    };

    const response = await this.client.post(`/users/${userId}/webinars`, payload);
    return { success: true, webinar: response.data };
  }

  async getWebinar(webinarId) {
    const response = await this.client.get(`/webinars/${webinarId}`);
    return { success: true, webinar: response.data };
  }

  async updateWebinar(webinarId, data) {
    const response = await this.client.patch(`/webinars/${webinarId}`, data);
    return { success: true, message: 'Webinar updated successfully' };
  }

  async deleteWebinar(webinarId, options = {}) {
    const params = {
      ...(options.occurrence_id && { occurrence_id: options.occurrence_id })
    };

    await this.client.delete(`/webinars/${webinarId}`, { params });
    return { success: true, message: 'Webinar deleted successfully' };
  }

  async listWebinarPanelists(webinarId) {
    const response = await this.client.get(`/webinars/${webinarId}/panelists`);
    return { success: true, panelists: response.data.panelists };
  }

  async addWebinarPanelists(webinarId, panelists) {
    const payload = { panelists };
    const response = await this.client.post(`/webinars/${webinarId}/panelists`, payload);
    return { success: true, panelists: response.data.panelists };
  }

  async removeWebinarPanelist(webinarId, panelistId) {
    await this.client.delete(`/webinars/${webinarId}/panelists/${panelistId}`);
    return { success: true, message: 'Panelist removed successfully' };
  }

  // ==================== RECORDINGS ====================

  async listRecordings(userId, options = {}) {
    const params = {
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token }),
      ...(options.from && { from: options.from }),
      ...(options.to && { to: options.to })
    };

    const response = await this.client.get(`/users/${userId}/recordings`, { params });
    return { 
      success: true, 
      meetings: response.data.meetings,
      next_page_token: response.data.next_page_token
    };
  }

  async getMeetingRecordings(meetingId) {
    const response = await this.client.get(`/meetings/${meetingId}/recordings`);
    return { success: true, recording: response.data };
  }

  async deleteRecording(meetingId, options = {}) {
    const params = {
      action: options.action || 'trash',
      ...(options.recording_id && { recording_id: options.recording_id })
    };

    await this.client.delete(`/meetings/${meetingId}/recordings`, { params });
    return { success: true, message: 'Recording deleted successfully' };
  }

  async recoverRecording(meetingId) {
    const response = await this.client.put(`/meetings/${meetingId}/recordings/status`, {
      action: 'recover'
    });
    return { success: true, message: 'Recording recovered successfully' };
  }

  async getRecordingSettings(meetingId) {
    const response = await this.client.get(`/meetings/${meetingId}/recordings/settings`);
    return { success: true, settings: response.data };
  }

  async updateRecordingSettings(meetingId, settings) {
    const response = await this.client.patch(`/meetings/${meetingId}/recordings/settings`, settings);
    return { success: true, message: 'Recording settings updated successfully' };
  }

  // ==================== REPORTS ====================

  async getDailyUsageReport(options = {}) {
    const params = {
      year: options.year || new Date().getFullYear(),
      month: options.month || new Date().getMonth() + 1
    };

    const response = await this.client.get('/report/daily', { params });
    return { success: true, report: response.data };
  }

  async getUserActivityReport(userId, options = {}) {
    const params = {
      from: options.from,
      to: options.to,
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get(`/report/users/${userId}/meetings`, { params });
    return { success: true, meetings: response.data.meetings };
  }

  async getMeetingDetailsReport(meetingId) {
    const response = await this.client.get(`/report/meetings/${meetingId}`);
    return { success: true, meeting: response.data };
  }

  // ==================== CLOUD RECORDING ====================

  async listAccountRecordings(options = {}) {
    const params = {
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token }),
      from: options.from,
      to: options.to
    };

    const response = await this.client.get('/accounts/me/recordings', { params });
    return { success: true, recordings: response.data.meetings };
  }

  // ==================== DASHBOARDS ====================

  async getMeetingsDashboard(options = {}) {
    const params = {
      from: options.from,
      to: options.to,
      type: options.type || 'past',
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get('/metrics/meetings', { params });
    return { success: true, meetings: response.data.meetings };
  }

  async getWebinarsDashboard(options = {}) {
    const params = {
      from: options.from,
      to: options.to,
      type: options.type || 'past',
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get('/metrics/webinars', { params });
    return { success: true, webinars: response.data.webinars };
  }

  async getZoomRoomsDashboard(options = {}) {
    const params = {
      from: options.from,
      to: options.to,
      page_size: options.page_size || 30,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get('/metrics/zoomrooms', { params });
    return { success: true, zoom_rooms: response.data.zoom_rooms };
  }

  // ==================== CHAT CHANNELS ====================

  async listChatChannels(userId, options = {}) {
    const params = {
      page_size: options.page_size || 10,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get(`/chat/users/${userId}/channels`, { params });
    return { success: true, channels: response.data.channels };
  }

  async getChatChannel(channelId) {
    const response = await this.client.get(`/chat/channels/${channelId}`);
    return { success: true, channel: response.data };
  }

  async createChatChannel(userId, data) {
    const payload = {
      name: data.name,
      type: data.type || 1,
      members: data.members || []
    };

    const response = await this.client.post(`/chat/users/${userId}/channels`, payload);
    return { success: true, channel: response.data };
  }

  async updateChatChannel(channelId, data) {
    const response = await this.client.patch(`/chat/channels/${channelId}`, data);
    return { success: true, message: 'Channel updated successfully' };
  }

  async deleteChatChannel(channelId) {
    await this.client.delete(`/chat/channels/${channelId}`);
    return { success: true, message: 'Channel deleted successfully' };
  }

  // ==================== CHAT MESSAGES ====================

  async listChatMessages(options = {}) {
    const params = {
      to_contact: options.to_contact,
      to_channel: options.to_channel,
      date: options.date,
      page_size: options.page_size || 50,
      ...(options.next_page_token && { next_page_token: options.next_page_token })
    };

    const response = await this.client.get('/chat/users/me/messages', { params });
    return { success: true, messages: response.data.messages };
  }

  async sendChatMessage(data) {
    const payload = {
      message: data.message,
      to_contact: data.to_contact,
      to_channel: data.to_channel,
      ...(data.reply_main_message_id && { reply_main_message_id: data.reply_main_message_id }),
      ...(data.at_items && { at_items: data.at_items })
    };

    const response = await this.client.post('/chat/users/me/messages', payload);
    return { success: true, message: response.data };
  }

  async updateChatMessage(messageId, data) {
    const payload = {
      message: data.message,
      to_contact: data.to_contact,
      to_channel: data.to_channel
    };

    const response = await this.client.put(`/chat/users/me/messages/${messageId}`, payload);
    return { success: true, message: 'Message updated successfully' };
  }

  async deleteChatMessage(messageId, options = {}) {
    const params = {
      to_contact: options.to_contact,
      to_channel: options.to_channel
    };

    await this.client.delete(`/chat/users/me/messages/${messageId}`, { params });
    return { success: true, message: 'Message deleted successfully' };
  }
}

module.exports = ZoomAPI;
