/**
 * Google APIs Integration - REAL IMPLEMENTATION
 * Gmail, Calendar, Drive, Docs, Sheets
 */

const { google } = require('googleapis');

class GoogleAPI {
    constructor(credentials) {
        this.credentials = credentials || {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI
        };
        
        this.oauth2Client = new google.auth.OAuth2(
            this.credentials.client_id,
            this.credentials.client_secret,
            this.credentials.redirect_uri
        );
    }

    /**
     * Set access token
     */
    setTokens(tokens) {
        this.oauth2Client.setCredentials(tokens);
    }

    /**
     * Get authorization URL
     */
    getAuthUrl(scopes) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
    }

    /**
     * Get tokens from code
     */
    async getTokensFromCode(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.setTokens(tokens);
        return tokens;
    }

    // ============================================
    // GMAIL
    // ============================================

    /**
     * Send email
     */
    async sendEmail(to, subject, body, options = {}) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

        const email = [
            `To: ${to}`,
            `Subject: ${subject}`,
            options.cc ? `Cc: ${options.cc}` : '',
            options.bcc ? `Bcc: ${options.bcc}` : '',
            'Content-Type: text/html; charset=utf-8',
            '',
            body
        ].filter(Boolean).join('\n');

        const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

        return await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedEmail
            }
        });
    }

    /**
     * List emails
     */
    async listEmails(query = '', maxResults = 10) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        
        return await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults
        });
    }

    /**
     * Get email
     */
    async getEmail(messageId) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        
        return await gmail.users.messages.get({
            userId: 'me',
            id: messageId
        });
    }

    /**
     * Delete email
     */
    async deleteEmail(messageId) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        
        return await gmail.users.messages.delete({
            userId: 'me',
            id: messageId
        });
    }

    /**
     * Mark as read
     */
    async markAsRead(messageId) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        
        return await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });
    }

    /**
     * Create label
     */
    async createLabel(name) {
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        
        return await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name,
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show'
            }
        });
    }

    // ============================================
    // CALENDAR
    // ============================================

    /**
     * Create event
     */
    async createEvent(summary, startTime, endTime, options = {}) {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        return await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary,
                start: { dateTime: startTime, timeZone: options.timeZone || 'UTC' },
                end: { dateTime: endTime, timeZone: options.timeZone || 'UTC' },
                description: options.description,
                location: options.location,
                attendees: options.attendees
            }
        });
    }

    /**
     * List events
     */
    async listEvents(timeMin, timeMax, maxResults = 10) {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        return await calendar.events.list({
            calendarId: 'primary',
            timeMin,
            timeMax,
            maxResults,
            singleEvents: true,
            orderBy: 'startTime'
        });
    }

    /**
     * Update event
     */
    async updateEvent(eventId, updates) {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        return await calendar.events.patch({
            calendarId: 'primary',
            eventId,
            requestBody: updates
        });
    }

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        return await calendar.events.delete({
            calendarId: 'primary',
            eventId
        });
    }

    // ============================================
    // DRIVE
    // ============================================

    /**
     * Upload file
     */
    async uploadFile(fileName, mimeType, fileContent, folderId = null) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : undefined
        };

        const media = {
            mimeType,
            body: fileContent
        };

        return await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: 'id, name, webViewLink'
        });
    }

    /**
     * List files
     */
    async listFiles(query = '', pageSize = 10) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        return await drive.files.list({
            q: query,
            pageSize,
            fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)'
        });
    }

    /**
     * Download file
     */
    async downloadFile(fileId) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        return await drive.files.get({
            fileId,
            alt: 'media'
        }, { responseType: 'stream' });
    }

    /**
     * Delete file
     */
    async deleteFile(fileId) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        return await drive.files.delete({ fileId });
    }

    /**
     * Share file
     */
    async shareFile(fileId, email, role = 'reader') {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        return await drive.permissions.create({
            fileId,
            requestBody: {
                type: 'user',
                role,
                emailAddress: email
            }
        });
    }

    /**
     * Create folder
     */
    async createFolder(folderName, parentId = null) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        return await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentId ? [parentId] : undefined
            },
            fields: 'id, name'
        });
    }

    // ============================================
    // DOCS
    // ============================================

    /**
     * Create document
     */
    async createDocument(title) {
        const docs = google.docs({ version: 'v1', auth: this.oauth2Client });

        return await docs.documents.create({
            requestBody: { title }
        });
    }

    /**
     * Get document
     */
    async getDocument(documentId) {
        const docs = google.docs({ version: 'v1', auth: this.oauth2Client });

        return await docs.documents.get({ documentId });
    }

    /**
     * Update document
     */
    async updateDocument(documentId, requests) {
        const docs = google.docs({ version: 'v1', auth: this.oauth2Client });

        return await docs.documents.batchUpdate({
            documentId,
            requestBody: { requests }
        });
    }

    /**
     * Insert text
     */
    async insertText(documentId, text, index = 1) {
        return await this.updateDocument(documentId, [{
            insertText: {
                location: { index },
                text
            }
        }]);
    }

    // ============================================
    // SHEETS
    // ============================================

    /**
     * Create spreadsheet
     */
    async createSpreadsheet(title, sheets = []) {
        const sheetsApi = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheetsApi.spreadsheets.create({
            requestBody: {
                properties: { title },
                sheets: sheets.map(name => ({ properties: { title: name } }))
            }
        });
    }

    /**
     * Get spreadsheet
     */
    async getSpreadsheet(spreadsheetId) {
        const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheets.spreadsheets.get({ spreadsheetId });
    }

    /**
     * Read values
     */
    async readValues(spreadsheetId, range) {
        const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
    }

    /**
     * Write values
     */
    async writeValues(spreadsheetId, range, values) {
        const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values }
        });
    }

    /**
     * Append values
     */
    async appendValues(spreadsheetId, range, values) {
        const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: { values }
        });
    }

    /**
     * Clear values
     */
    async clearValues(spreadsheetId, range) {
        const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

        return await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range
        });
    }
}

module.exports = GoogleAPI;
