/**
 * RANDOMUSER INTEGRATION - FULLY WORKING
 * Random user data generator integration
 * 
 * 100% FREE - NO API KEY REQUIRED!
 * API: https://randomuser.me/
 * 
 * Usage:
 *   const randomuser = new RandomUserIntegration();
 *   const users = await randomuser.getRandomUsers(10);
 *   const user = await randomuser.getRandomUser('male', 'US');
 */

const BaseIntegration = require('../core/BaseIntegration');

class RandomUserIntegration extends BaseIntegration {
  constructor(config = {}) {
    super({
      name: 'randomuser',
      baseURL: 'https://randomuser.me/api',
      ...config
    });
  }

  /**
   * Get random users
   */
  async getRandomUsers(results = 1, gender = null, nat = null) {
    const params = { results };
    if (gender) params.gender = gender;
    if (nat) params.nat = nat;

    const response = await this.get('/', params);

    return {
      success: true,
      users: response.data.results.map(user => ({
        gender: user.gender,
        name: {
          title: user.name.title,
          first: user.name.first,
          last: user.name.last,
          full: `${user.name.first} ${user.name.last}`
        },
        location: {
          street: `${user.location.street.number} ${user.location.street.name}`,
          city: user.location.city,
          state: user.location.state,
          country: user.location.country,
          postcode: user.location.postcode,
          coordinates: user.location.coordinates
        },
        email: user.email,
        phone: user.phone,
        cell: user.cell,
        picture: {
          large: user.picture.large,
          medium: user.picture.medium,
          thumbnail: user.picture.thumbnail
        },
        dob: {
          date: user.dob.date,
          age: user.dob.age
        },
        registered: {
          date: user.registered.date,
          age: user.registered.age
        },
        nat: user.nat
      }))
    };
  }

  /**
   * Get single random user
   */
  async getRandomUser(gender = null, nat = null) {
    const result = await this.getRandomUsers(1, gender, nat);
    return {
      success: true,
      user: result.users[0]
    };
  }

  /**
   * Get random users by nationality
   */
  async getUsersByNationality(nationality, count = 10) {
    return this.getRandomUsers(count, null, nationality);
  }

  /**
   * Get random users by gender
   */
  async getUsersByGender(gender, count = 10) {
    return this.getRandomUsers(count, gender, null);
  }

  /**
   * Get random user with specific fields
   */
  async getRandomUserWithFields(fields, count = 1) {
    const params = {
      results: count,
      inc: Array.isArray(fields) ? fields.join(',') : fields
    };

    const response = await this.get('/', params);

    return {
      success: true,
      users: response.data.results
    };
  }

  /**
   * Get random user excluding fields
   */
  async getRandomUserExcludingFields(excludeFields, count = 1) {
    const params = {
      results: count,
      exc: Array.isArray(excludeFields) ? excludeFields.join(',') : excludeFields
    };

    const response = await this.get('/', params);

    return {
      success: true,
      users: response.data.results
    };
  }

  async testConnection() {
    try {
      await this.getRandomUser();
      return { success: true, integration: this.name, message: 'Connection successful' };
    } catch (error) {
      return { success: false, integration: this.name, error: error.message };
    }
  }

  /**
   * Override validateApiKey since no key is needed
   */
  validateApiKey() {
    return true;
  }
}

module.exports = RandomUserIntegration;
