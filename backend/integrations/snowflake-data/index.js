/**
 * Snowflake Data Warehouse Integration
 * Save $2000+/month - Cloud data warehouse
 */

const snowflake = require('snowflake-sdk');

class SnowflakeDataIntegration {
  constructor(config) {
    this.account = config.account || process.env.SNOWFLAKE_ACCOUNT;
    this.username = config.username || process.env.SNOWFLAKE_USERNAME;
    this.password = config.password || process.env.SNOWFLAKE_PASSWORD;
    this.database = config.database || process.env.SNOWFLAKE_DATABASE;
    this.schema = config.schema || process.env.SNOWFLAKE_SCHEMA;
    this.warehouse = config.warehouse || process.env.SNOWFLAKE_WAREHOUSE;
    
    if (!this.account || !this.username || !this.password) {
      throw new Error('Snowflake credentials required');
    }
    
    this.connection = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.connection = snowflake.createConnection({
        account: this.account,
        username: this.username,
        password: this.password,
        database: this.database,
        schema: this.schema,
        warehouse: this.warehouse
      });
      
      this.connection.connect((err, conn) => {
        if (err) {
          reject({ success: false, error: err.message });
        } else {
          resolve({ success: true, connectionId: conn.getId() });
        }
      });
    });
  }

  async executeQuery(sqlText, binds = []) {
    try {
      if (!this.connection) {
        await this.connect();
      }
      
      return new Promise((resolve, reject) => {
        this.connection.execute({
          sqlText,
          binds,
          complete: (err, stmt, rows) => {
            if (err) {
              reject({ success: false, error: err.message });
            } else {
              resolve({
                success: true,
                rows,
                rowCount: rows.length
              });
            }
          }
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTable(tableName, columns) {
    const columnDefs = columns.map(col => `${col.name} ${col.type}`).join(', ');
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    return await this.executeQuery(sql);
  }

  async insertData(tableName, data) {
    const columns = Object.keys(data[0]).join(', ');
    const placeholders = Object.keys(data[0]).map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
    const results = [];
    for (const row of data) {
      const values = Object.values(row);
      const result = await this.executeQuery(sql, values);
      results.push(result);
    }
    
    return {
      success: true,
      inserted: results.length
    };
  }

  async selectData(tableName, where = '', limit = 100) {
    const sql = `SELECT * FROM ${tableName} ${where ? 'WHERE ' + where : ''} LIMIT ${limit}`;
    return await this.executeQuery(sql);
  }

  async updateData(tableName, updates, where) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
    const values = Object.values(updates);
    return await this.executeQuery(sql, values);
  }

  async deleteData(tableName, where) {
    const sql = `DELETE FROM ${tableName} WHERE ${where}`;
    return await this.executeQuery(sql);
  }

  async createDatabase(databaseName) {
    const sql = `CREATE DATABASE IF NOT EXISTS ${databaseName}`;
    return await this.executeQuery(sql);
  }

  async createSchema(schemaName) {
    const sql = `CREATE SCHEMA IF NOT EXISTS ${schemaName}`;
    return await this.executeQuery(sql);
  }

  async createWarehouse(warehouseName, size = 'XSMALL') {
    const sql = `CREATE WAREHOUSE IF NOT EXISTS ${warehouseName} WITH WAREHOUSE_SIZE = '${size}'`;
    return await this.executeQuery(sql);
  }

  async listTables() {
    const sql = 'SHOW TABLES';
    return await this.executeQuery(sql);
  }

  async listDatabases() {
    const sql = 'SHOW DATABASES';
    return await this.executeQuery(sql);
  }

  async listWarehouses() {
    const sql = 'SHOW WAREHOUSES';
    return await this.executeQuery(sql);
  }

  async getTableInfo(tableName) {
    const sql = `DESCRIBE TABLE ${tableName}`;
    return await this.executeQuery(sql);
  }

  async copyIntoTable(tableName, stageName, fileFormat = 'CSV') {
    const sql = `COPY INTO ${tableName} FROM @${stageName} FILE_FORMAT = (TYPE = ${fileFormat})`;
    return await this.executeQuery(sql);
  }

  async createStage(stageName, url) {
    const sql = `CREATE STAGE IF NOT EXISTS ${stageName} URL = '${url}'`;
    return await this.executeQuery(sql);
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.connection) {
        this.connection.destroy((err) => {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        });
      } else {
        resolve({ success: true });
      }
    });
  }
}

module.exports = SnowflakeDataIntegration;
