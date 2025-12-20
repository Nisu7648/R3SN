/**
 * Supabase Free Integration
 * 100% FREE - PostgreSQL database, authentication, storage, realtime
 * No credit card required - Free forever tier
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseFreeIntegration {
  constructor(config) {
    this.supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL;
    this.supabaseKey = config.supabaseKey || process.env.SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      throw new Error('Supabase credentials required');
    }
    
    this.client = createClient(this.supabaseUrl, this.supabaseKey);
  }

  // Database Operations
  async selectData(table, filters = {}) {
    try {
      let query = this.client.from(table).select('*');
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        count: data.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async insertData(table, records) {
    try {
      const { data, error } = await this.client
        .from(table)
        .insert(records)
        .select();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        inserted: data.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateData(table, updates, filters) {
    try {
      let query = this.client.from(table).update(updates);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query.select();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        updated: data.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteData(table, filters) {
    try {
      let query = this.client.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query.select();
      
      if (error) throw error;
      
      return {
        success: true,
        deleted: data.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async executeRPC(functionName, params = {}) {
    try {
      const { data, error } = await this.client.rpc(functionName, params);
      
      if (error) throw error;
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Authentication
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser();
      
      if (error) throw error;
      
      return {
        success: true,
        user
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Storage Operations
  async uploadFile(bucket, path, file) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      
      return {
        success: true,
        path: data.path
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async downloadFile(bucket, path) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async listFiles(bucket, path = '') {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .list(path);
      
      if (error) throw error;
      
      return {
        success: true,
        files: data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(bucket, paths) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .remove(paths);
      
      if (error) throw error;
      
      return {
        success: true,
        deleted: data
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPublicUrl(bucket, path) {
    try {
      const { data } = this.client.storage
        .from(bucket)
        .getPublicUrl(path);
      
      return {
        success: true,
        publicUrl: data.publicUrl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSignedUrl(bucket, path, expiresIn = 3600) {
    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      
      if (error) throw error;
      
      return {
        success: true,
        signedUrl: data.signedUrl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Realtime Subscriptions
  subscribeToTable(table, callback) {
    try {
      const subscription = this.client
        .channel(`public:${table}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table }, 
          callback
        )
        .subscribe();
      
      return {
        success: true,
        subscription
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  unsubscribe(subscription) {
    try {
      this.client.removeChannel(subscription);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = SupabaseFreeIntegration;
