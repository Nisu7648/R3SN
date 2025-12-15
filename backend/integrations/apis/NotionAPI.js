/**
 * Notion API Integration - COMPLETE IMPLEMENTATION
 * Databases, Pages, Blocks, Users, Search
 */

const axios = require('axios');

class NotionAPI {
    constructor(token) {
        this.token = token || process.env.NOTION_TOKEN;
        this.baseUrl = 'https://api.notion.com/v1';
        this.version = '2022-06-28';
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Notion-Version': this.version,
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    // ============================================
    // PAGES
    // ============================================

    /**
     * Create page
     */
    async createPage(parent, properties, children = []) {
        return await this.request('POST', '/pages', {
            parent,
            properties,
            children
        });
    }

    /**
     * Get page
     */
    async getPage(pageId) {
        return await this.request('GET', `/pages/${pageId}`);
    }

    /**
     * Update page
     */
    async updatePage(pageId, properties) {
        return await this.request('PATCH', `/pages/${pageId}`, {
            properties
        });
    }

    /**
     * Archive page
     */
    async archivePage(pageId) {
        return await this.request('PATCH', `/pages/${pageId}`, {
            archived: true
        });
    }

    /**
     * Get page property
     */
    async getPageProperty(pageId, propertyId) {
        return await this.request('GET', `/pages/${pageId}/properties/${propertyId}`);
    }

    // ============================================
    // DATABASES
    // ============================================

    /**
     * Create database
     */
    async createDatabase(parent, title, properties) {
        return await this.request('POST', '/databases', {
            parent,
            title: [{ text: { content: title } }],
            properties
        });
    }

    /**
     * Get database
     */
    async getDatabase(databaseId) {
        return await this.request('GET', `/databases/${databaseId}`);
    }

    /**
     * Update database
     */
    async updateDatabase(databaseId, updates) {
        return await this.request('PATCH', `/databases/${databaseId}`, updates);
    }

    /**
     * Query database
     */
    async queryDatabase(databaseId, filter = null, sorts = null, startCursor = null, pageSize = 100) {
        const data = { page_size: pageSize };
        if (filter) data.filter = filter;
        if (sorts) data.sorts = sorts;
        if (startCursor) data.start_cursor = startCursor;

        return await this.request('POST', `/databases/${databaseId}/query`, data);
    }

    /**
     * Query all pages in database
     */
    async queryAllPages(databaseId, filter = null, sorts = null) {
        let allResults = [];
        let hasMore = true;
        let startCursor = null;

        while (hasMore) {
            const response = await this.queryDatabase(databaseId, filter, sorts, startCursor);
            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }

        return allResults;
    }

    // ============================================
    // BLOCKS
    // ============================================

    /**
     * Get block
     */
    async getBlock(blockId) {
        return await this.request('GET', `/blocks/${blockId}`);
    }

    /**
     * Get block children
     */
    async getBlockChildren(blockId, startCursor = null, pageSize = 100) {
        const params = new URLSearchParams({ page_size: pageSize });
        if (startCursor) params.append('start_cursor', startCursor);

        return await this.request('GET', `/blocks/${blockId}/children?${params}`);
    }

    /**
     * Append block children
     */
    async appendBlockChildren(blockId, children) {
        return await this.request('PATCH', `/blocks/${blockId}/children`, {
            children
        });
    }

    /**
     * Update block
     */
    async updateBlock(blockId, updates) {
        return await this.request('PATCH', `/blocks/${blockId}`, updates);
    }

    /**
     * Delete block
     */
    async deleteBlock(blockId) {
        return await this.request('DELETE', `/blocks/${blockId}`);
    }

    // ============================================
    // BLOCK HELPERS
    // ============================================

    /**
     * Create paragraph block
     */
    createParagraphBlock(text, color = 'default') {
        return {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{ text: { content: text } }],
                color
            }
        };
    }

    /**
     * Create heading block
     */
    createHeadingBlock(level, text, color = 'default') {
        const type = `heading_${level}`;
        return {
            object: 'block',
            type,
            [type]: {
                rich_text: [{ text: { content: text } }],
                color
            }
        };
    }

    /**
     * Create to-do block
     */
    createToDoBlock(text, checked = false) {
        return {
            object: 'block',
            type: 'to_do',
            to_do: {
                rich_text: [{ text: { content: text } }],
                checked
            }
        };
    }

    /**
     * Create bulleted list block
     */
    createBulletedListBlock(text) {
        return {
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: [{ text: { content: text } }]
            }
        };
    }

    /**
     * Create numbered list block
     */
    createNumberedListBlock(text) {
        return {
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: {
                rich_text: [{ text: { content: text } }]
            }
        };
    }

    /**
     * Create code block
     */
    createCodeBlock(code, language = 'javascript') {
        return {
            object: 'block',
            type: 'code',
            code: {
                rich_text: [{ text: { content: code } }],
                language
            }
        };
    }

    /**
     * Create quote block
     */
    createQuoteBlock(text) {
        return {
            object: 'block',
            type: 'quote',
            quote: {
                rich_text: [{ text: { content: text } }]
            }
        };
    }

    /**
     * Create divider block
     */
    createDividerBlock() {
        return {
            object: 'block',
            type: 'divider',
            divider: {}
        };
    }

    // ============================================
    // USERS
    // ============================================

    /**
     * Get user
     */
    async getUser(userId) {
        return await this.request('GET', `/users/${userId}`);
    }

    /**
     * List users
     */
    async listUsers(startCursor = null, pageSize = 100) {
        const params = new URLSearchParams({ page_size: pageSize });
        if (startCursor) params.append('start_cursor', startCursor);

        return await this.request('GET', `/users?${params}`);
    }

    /**
     * Get current bot user
     */
    async getMe() {
        return await this.request('GET', '/users/me');
    }

    // ============================================
    // SEARCH
    // ============================================

    /**
     * Search
     */
    async search(query = '', filter = null, sort = null, startCursor = null, pageSize = 100) {
        const data = { page_size: pageSize };
        if (query) data.query = query;
        if (filter) data.filter = filter;
        if (sort) data.sort = sort;
        if (startCursor) data.start_cursor = startCursor;

        return await this.request('POST', '/search', data);
    }

    /**
     * Search pages
     */
    async searchPages(query) {
        return await this.search(query, { property: 'object', value: 'page' });
    }

    /**
     * Search databases
     */
    async searchDatabases(query) {
        return await this.search(query, { property: 'object', value: 'database' });
    }

    // ============================================
    // COMMENTS
    // ============================================

    /**
     * Create comment
     */
    async createComment(pageId, richText) {
        return await this.request('POST', '/comments', {
            parent: { page_id: pageId },
            rich_text: richText
        });
    }

    /**
     * Get comments
     */
    async getComments(blockId, startCursor = null, pageSize = 100) {
        const params = new URLSearchParams({
            block_id: blockId,
            page_size: pageSize
        });
        if (startCursor) params.append('start_cursor', startCursor);

        return await this.request('GET', `/comments?${params}`);
    }

    // ============================================
    // PROPERTY HELPERS
    // ============================================

    /**
     * Create title property
     */
    createTitleProperty(text) {
        return {
            title: [{ text: { content: text } }]
        };
    }

    /**
     * Create rich text property
     */
    createRichTextProperty(text) {
        return {
            rich_text: [{ text: { content: text } }]
        };
    }

    /**
     * Create number property
     */
    createNumberProperty(number) {
        return { number };
    }

    /**
     * Create select property
     */
    createSelectProperty(name) {
        return {
            select: { name }
        };
    }

    /**
     * Create multi-select property
     */
    createMultiSelectProperty(names) {
        return {
            multi_select: names.map(name => ({ name }))
        };
    }

    /**
     * Create date property
     */
    createDateProperty(start, end = null) {
        const date = { start };
        if (end) date.end = end;
        return { date };
    }

    /**
     * Create checkbox property
     */
    createCheckboxProperty(checked) {
        return { checkbox: checked };
    }

    /**
     * Create URL property
     */
    createURLProperty(url) {
        return { url };
    }

    /**
     * Create email property
     */
    createEmailProperty(email) {
        return { email };
    }

    /**
     * Create phone property
     */
    createPhoneProperty(phone) {
        return { phone_number: phone };
    }

    /**
     * Create relation property
     */
    createRelationProperty(pageIds) {
        return {
            relation: pageIds.map(id => ({ id }))
        };
    }

    /**
     * Create people property
     */
    createPeopleProperty(userIds) {
        return {
            people: userIds.map(id => ({ id }))
        };
    }

    /**
     * Create files property
     */
    createFilesProperty(files) {
        return {
            files: files.map(file => ({
                name: file.name,
                external: { url: file.url }
            }))
        };
    }
}

module.exports = NotionAPI;
