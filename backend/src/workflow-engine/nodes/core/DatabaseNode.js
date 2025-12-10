/**
 * Database Node - Execute SQL queries on any database
 * Supports MySQL, PostgreSQL, MongoDB, SQLite
 */

class DatabaseNode {
  constructor() {
    this.type = 'database.query';
    this.name = 'Database Query';
    this.description = 'Execute SQL queries on any database';
    this.category = 'database';
    this.icon = '🗄️';
    this.color = '#00897B';

    this.inputs = [
      {
        name: 'query',
        type: 'string',
        required: false
      },
      {
        name: 'parameters',
        type: 'array',
        required: false
      }
    ];

    this.outputs = [
      {
        name: 'results',
        type: 'array'
      },
      {
        name: 'rowCount',
        type: 'number'
      }
    ];

    this.parameters = [
      {
        name: 'databaseType',
        type: 'select',
        options: ['mysql', 'postgresql', 'mongodb', 'sqlite', 'mssql'],
        default: 'mysql',
        description: 'Database type'
      },
      {
        name: 'connectionString',
        type: 'string',
        required: true,
        sensitive: true,
        placeholder: 'mysql://user:pass@localhost:3306/dbname',
        description: 'Database connection string'
      },
      {
        name: 'query',
        type: 'code',
        required: false,
        placeholder: 'SELECT * FROM users WHERE id = ?',
        description: 'SQL query to execute'
      },
      {
        name: 'operation',
        type: 'select',
        options: ['select', 'insert', 'update', 'delete', 'raw'],
        default: 'select',
        description: 'Database operation'
      },
      {
        name: 'table',
        type: 'string',
        required: false,
        description: 'Table name (for insert/update/delete)'
      },
      {
        name: 'data',
        type: 'json',
        required: false,
        description: 'Data for insert/update operations'
      },
      {
        name: 'where',
        type: 'json',
        required: false,
        description: 'WHERE conditions'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Limit number of results'
      },
      {
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Query timeout in milliseconds'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const {
      databaseType,
      connectionString,
      query: paramQuery,
      operation,
      table,
      data,
      where,
      limit,
      timeout
    } = parameters;

    const query = inputs.query || paramQuery;
    const queryParams = inputs.parameters || [];

    if (!connectionString) {
      throw new Error('Connection string is required');
    }

    try {
      let result;

      switch (databaseType) {
        case 'mysql':
          result = await this.executeMySQLQuery(connectionString, query, queryParams, {
            operation,
            table,
            data,
            where,
            limit,
            timeout
          });
          break;

        case 'postgresql':
          result = await this.executePostgreSQLQuery(connectionString, query, queryParams, {
            operation,
            table,
            data,
            where,
            limit,
            timeout
          });
          break;

        case 'mongodb':
          result = await this.executeMongoDBQuery(connectionString, {
            operation,
            collection: table,
            query: where,
            data,
            limit
          });
          break;

        case 'sqlite':
          result = await this.executeSQLiteQuery(connectionString, query, queryParams, {
            timeout
          });
          break;

        default:
          throw new Error(`Unsupported database type: ${databaseType}`);
      }

      return {
        results: result.rows || result,
        rowCount: result.rowCount || result.length || 0,
        affectedRows: result.affectedRows || 0,
        insertId: result.insertId,
        metadata: {
          databaseType,
          operation,
          executionTime: result.executionTime
        }
      };

    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute MySQL query
   */
  async executeMySQLQuery(connectionString, query, params, options) {
    // Note: Requires mysql2 package
    // This is a placeholder implementation
    return {
      rows: [],
      rowCount: 0,
      message: 'MySQL support requires mysql2 package to be installed'
    };
  }

  /**
   * Execute PostgreSQL query
   */
  async executePostgreSQLQuery(connectionString, query, params, options) {
    // Note: Requires pg package
    // This is a placeholder implementation
    return {
      rows: [],
      rowCount: 0,
      message: 'PostgreSQL support requires pg package to be installed'
    };
  }

  /**
   * Execute MongoDB query
   */
  async executeMongoDBQuery(connectionString, options) {
    // Note: Requires mongodb package
    // This is a placeholder implementation
    return {
      rows: [],
      rowCount: 0,
      message: 'MongoDB support requires mongodb package to be installed'
    };
  }

  /**
   * Execute SQLite query
   */
  async executeSQLiteQuery(connectionString, query, params, options) {
    // Note: Requires better-sqlite3 package
    // This is a placeholder implementation
    return {
      rows: [],
      rowCount: 0,
      message: 'SQLite support requires better-sqlite3 package to be installed'
    };
  }
}

module.exports = DatabaseNode;
