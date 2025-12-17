/**
 * Evernote Note-Taking & Organization Integration
 * Complete note management and organization
 */

const Evernote = require('evernote');

class EvernoteIntegration {
  constructor(config) {
    this.token = config.token || process.env.EVERNOTE_TOKEN;
    this.sandbox = config.sandbox || process.env.EVERNOTE_SANDBOX === 'true';
    
    if (!this.token) throw new Error('Evernote token required');
    
    this.client = new Evernote.Client({
      token: this.token,
      sandbox: this.sandbox
    });
    
    this.noteStore = this.client.getNoteStore();
    this.userStore = this.client.getUserStore();
  }

  async createNote(title, content, notebookGuid = null, tags = []) {
    try {
      const note = new Evernote.Types.Note();
      note.title = title;
      note.content = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
        <en-note>${content}</en-note>`;
      
      if (notebookGuid) note.notebookGuid = notebookGuid;
      if (tags.length > 0) note.tagNames = tags;
      
      const createdNote = await this.noteStore.createNote(note);
      
      return {
        success: true,
        note: {
          guid: createdNote.guid,
          title: createdNote.title,
          created: new Date(createdNote.created),
          updated: new Date(createdNote.updated)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNote(noteGuid, withContent = true, withResourcesData = false) {
    try {
      const note = await this.noteStore.getNote(
        noteGuid,
        withContent,
        withResourcesData,
        false,
        false
      );
      
      return {
        success: true,
        note: {
          guid: note.guid,
          title: note.title,
          content: note.content,
          created: new Date(note.created),
          updated: new Date(note.updated),
          tags: note.tagNames || [],
          notebookGuid: note.notebookGuid
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateNote(noteGuid, updates) {
    try {
      const note = await this.noteStore.getNote(noteGuid, true, false, false, false);
      
      if (updates.title) note.title = updates.title;
      if (updates.content) {
        note.content = `<?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
          <en-note>${updates.content}</en-note>`;
      }
      if (updates.tags) note.tagNames = updates.tags;
      
      const updatedNote = await this.noteStore.updateNote(note);
      
      return {
        success: true,
        note: {
          guid: updatedNote.guid,
          title: updatedNote.title,
          updated: new Date(updatedNote.updated)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteNote(noteGuid) {
    try {
      await this.noteStore.deleteNote(noteGuid);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async searchNotes(query, maxResults = 50) {
    try {
      const filter = new Evernote.Types.NoteFilter();
      filter.words = query;
      
      const spec = new Evernote.Types.NotesMetadataResultSpec();
      spec.includeTitle = true;
      spec.includeCreated = true;
      spec.includeUpdated = true;
      
      const results = await this.noteStore.findNotesMetadata(filter, 0, maxResults, spec);
      
      return {
        success: true,
        notes: results.notes.map(note => ({
          guid: note.guid,
          title: note.title,
          created: new Date(note.created),
          updated: new Date(note.updated)
        })),
        totalNotes: results.totalNotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listNotebooks() {
    try {
      const notebooks = await this.noteStore.listNotebooks();
      
      return {
        success: true,
        notebooks: notebooks.map(nb => ({
          guid: nb.guid,
          name: nb.name,
          stack: nb.stack,
          defaultNotebook: nb.defaultNotebook
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createNotebook(name, stack = null) {
    try {
      const notebook = new Evernote.Types.Notebook();
      notebook.name = name;
      if (stack) notebook.stack = stack;
      
      const created = await this.noteStore.createNotebook(notebook);
      
      return {
        success: true,
        notebook: {
          guid: created.guid,
          name: created.name,
          stack: created.stack
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listTags() {
    try {
      const tags = await this.noteStore.listTags();
      
      return {
        success: true,
        tags: tags.map(tag => ({
          guid: tag.guid,
          name: tag.name,
          parentGuid: tag.parentGuid
        }))
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTag(name, parentGuid = null) {
    try {
      const tag = new Evernote.Types.Tag();
      tag.name = name;
      if (parentGuid) tag.parentGuid = parentGuid;
      
      const created = await this.noteStore.createTag(tag);
      
      return {
        success: true,
        tag: {
          guid: created.guid,
          name: created.name
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserInfo() {
    try {
      const user = await this.userStore.getUser();
      
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          timezone: user.timezone,
          privilege: user.privilege,
          created: new Date(user.created)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNotesInNotebook(notebookGuid, maxResults = 50) {
    try {
      const filter = new Evernote.Types.NoteFilter();
      filter.notebookGuid = notebookGuid;
      
      const spec = new Evernote.Types.NotesMetadataResultSpec();
      spec.includeTitle = true;
      spec.includeCreated = true;
      spec.includeUpdated = true;
      
      const results = await this.noteStore.findNotesMetadata(filter, 0, maxResults, spec);
      
      return {
        success: true,
        notes: results.notes.map(note => ({
          guid: note.guid,
          title: note.title,
          created: new Date(note.created),
          updated: new Date(note.updated)
        })),
        totalNotes: results.totalNotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNotesByTag(tagGuid, maxResults = 50) {
    try {
      const filter = new Evernote.Types.NoteFilter();
      filter.tagGuids = [tagGuid];
      
      const spec = new Evernote.Types.NotesMetadataResultSpec();
      spec.includeTitle = true;
      spec.includeCreated = true;
      spec.includeUpdated = true;
      
      const results = await this.noteStore.findNotesMetadata(filter, 0, maxResults, spec);
      
      return {
        success: true,
        notes: results.notes.map(note => ({
          guid: note.guid,
          title: note.title,
          created: new Date(note.created),
          updated: new Date(note.updated)
        })),
        totalNotes: results.totalNotes
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = EvernoteIntegration;
