/**
 * Filter Node - Filter data based on conditions
 */

class FilterNode {
  constructor() {
    this.type = 'data.filter';
    this.name = 'Filter';
    this.description = 'Filter data based on conditions';
    this.category = 'data';
    this.icon = '🔍';
    this.color = '#FF9800';

    this.inputs = [
      {
        name: 'data',
        type: 'array',
        required: true
      }
    ];

    this.outputs = [
      {
        name: 'matched',
        type: 'array'
      },
      {
        name: 'unmatched',
        type: 'array'
      }
    ];

    this.parameters = [
      {
        name: 'conditions',
        type: 'array',
        items: {
          field: { type: 'string', required: true },
          operator: {
            type: 'select',
            options: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'greaterOrEqual', 'lessOrEqual', 'exists', 'notExists'],
            required: true
          },
          value: { type: 'any' }
        },
        default: []
      },
      {
        name: 'logic',
        type: 'select',
        options: ['AND', 'OR'],
        default: 'AND'
      }
    ];
  }

  /**
   * Execute the node
   */
  async execute(inputs, parameters, context) {
    const { data } = inputs;
    const { conditions, logic } = parameters;

    if (!Array.isArray(data)) {
      throw new Error('Input data must be an array');
    }

    const matched = [];
    const unmatched = [];

    for (const item of data) {
      if (this.evaluateConditions(item, conditions, logic)) {
        matched.push(item);
      } else {
        unmatched.push(item);
      }
    }

    return { matched, unmatched };
  }

  /**
   * Evaluate conditions for an item
   */
  evaluateConditions(item, conditions, logic) {
    if (conditions.length === 0) {
      return true;
    }

    const results = conditions.map(condition =>
      this.evaluateCondition(item, condition)
    );

    return logic === 'AND'
      ? results.every(r => r)
      : results.some(r => r);
  }

  /**
   * Evaluate a single condition
   */
  evaluateCondition(item, condition) {
    const { field, operator, value } = condition;
    const itemValue = this.getNestedValue(item, field);

    switch (operator) {
      case 'equals':
        return itemValue === value;
      case 'notEquals':
        return itemValue !== value;
      case 'contains':
        return String(itemValue).includes(String(value));
      case 'notContains':
        return !String(itemValue).includes(String(value));
      case 'greaterThan':
        return Number(itemValue) > Number(value);
      case 'lessThan':
        return Number(itemValue) < Number(value);
      case 'greaterOrEqual':
        return Number(itemValue) >= Number(value);
      case 'lessOrEqual':
        return Number(itemValue) <= Number(value);
      case 'exists':
        return itemValue !== undefined && itemValue !== null;
      case 'notExists':
        return itemValue === undefined || itemValue === null;
      default:
        return false;
    }
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) =>
      current?.[key], obj
    );
  }
}

module.exports = FilterNode;
