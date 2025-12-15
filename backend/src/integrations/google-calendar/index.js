/**
 * Google Calendar Integration
 * Real Google Calendar API for event management
 */

const { google } = require('googleapis');

class GoogleCalendarIntegration {
  constructor(config) {
    this.config = config;
    this.validateConfig();
    this.calendar = null;
  }

  validateConfig() {
    if (!this.config.credentials) {
      throw new Error('Google credentials are required');
    }
  }

  async getCalendarClient() {
    if (this.calendar) return this.calendar;

    const creds = typeof this.config.credentials === 'string' 
      ? JSON.parse(this.config.credentials) 
      : this.config.credentials;

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    this.calendar = google.calendar({ version: 'v3', auth });
    return this.calendar;
  }

  async execute(action, params) {
    const actions = {
      listEvents: this.listEvents.bind(this),
      getEvent: this.getEvent.bind(this),
      createEvent: this.createEvent.bind(this),
      updateEvent: this.updateEvent.bind(this),
      deleteEvent: this.deleteEvent.bind(this),
      listCalendars: this.listCalendars.bind(this),
      createCalendar: this.createCalendar.bind(this),
      quickAdd: this.quickAdd.bind(this),
    };

    if (!actions[action]) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await actions[action](params);
  }

  async listEvents(params) {
    const { 
      calendarId = 'primary', 
      maxResults = 10, 
      timeMin, 
      timeMax,
      q 
    } = params;

    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.events.list({
        calendarId,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
        ...(timeMin && { timeMin }),
        ...(timeMax && { timeMax }),
        ...(q && { q })
      });

      return {
        success: true,
        data: {
          events: response.data.items.map(event => ({
            id: event.id,
            summary: event.summary,
            description: event.description,
            start: event.start,
            end: event.end,
            location: event.location,
            attendees: event.attendees
          }))
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async getEvent(params) {
    const { calendarId = 'primary', eventId } = params;
    
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.events.get({
        calendarId,
        eventId
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          summary: response.data.summary,
          description: response.data.description,
          start: response.data.start,
          end: response.data.end,
          location: response.data.location,
          attendees: response.data.attendees,
          htmlLink: response.data.htmlLink
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async createEvent(params) {
    const { 
      calendarId = 'primary', 
      summary, 
      description, 
      start, 
      end, 
      location,
      attendees 
    } = params;
    
    if (!summary || !start || !end) {
      throw new Error('Summary, start, and end are required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      const event = {
        summary,
        description,
        start,
        end,
        ...(location && { location }),
        ...(attendees && { attendees: attendees.map(email => ({ email })) })
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          summary: response.data.summary,
          start: response.data.start,
          end: response.data.end,
          htmlLink: response.data.htmlLink
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async updateEvent(params) {
    const { 
      calendarId = 'primary', 
      eventId, 
      summary, 
      description, 
      start, 
      end, 
      location 
    } = params;
    
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      const event = {
        ...(summary && { summary }),
        ...(description && { description }),
        ...(start && { start }),
        ...(end && { end }),
        ...(location && { location })
      };

      const response = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: event
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          summary: response.data.summary,
          updated: response.data.updated
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async deleteEvent(params) {
    const { calendarId = 'primary', eventId } = params;
    
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      await calendar.events.delete({
        calendarId,
        eventId
      });

      return {
        success: true,
        data: { deleted: true, eventId }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async listCalendars(params) {
    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.calendarList.list();

      return {
        success: true,
        data: {
          calendars: response.data.items.map(cal => ({
            id: cal.id,
            summary: cal.summary,
            description: cal.description,
            timeZone: cal.timeZone,
            primary: cal.primary
          }))
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async createCalendar(params) {
    const { summary, description, timeZone } = params;
    
    if (!summary) {
      throw new Error('Calendar summary is required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.calendars.insert({
        requestBody: {
          summary,
          ...(description && { description }),
          ...(timeZone && { timeZone })
        }
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          summary: response.data.summary,
          timeZone: response.data.timeZone
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }

  async quickAdd(params) {
    const { calendarId = 'primary', text } = params;
    
    if (!text) {
      throw new Error('Quick add text is required');
    }

    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.events.quickAdd({
        calendarId,
        text
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          summary: response.data.summary,
          start: response.data.start,
          end: response.data.end,
          htmlLink: response.data.htmlLink
        }
      };
    } catch (error) {
      throw new Error(`Google Calendar API error: ${error.message}`);
    }
  }
}

module.exports = GoogleCalendarIntegration;
