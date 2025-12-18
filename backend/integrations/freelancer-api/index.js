const axios = require('axios');

class FreelancerAPIIntegration {
  constructor(accessToken) {
    this.accessToken = accessToken || 'YOUR_FREELANCER_ACCESS_TOKEN';
    this.baseURL = 'https://www.freelancer.com/api';
  }

  // Search Projects
  async searchProjects(query = null, skills = null, minBudget = null, maxBudget = null, limit = 10, offset = 0) {
    try {
      const params = {
        limit,
        offset,
        ...(query && { query }),
        ...(skills && { jobs: skills }),
        ...(minBudget && { min_avg_price: minBudget }),
        ...(maxBudget && { max_avg_price: maxBudget })
      };

      const response = await axios.get(`${this.baseURL}/projects/0.1/projects/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params
      });

      return {
        success: true,
        data: response.data,
        projects: response.data.result.projects,
        count: response.data.result.projects.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Project Details
  async getProjectDetails(projectId) {
    try {
      const response = await axios.get(`${this.baseURL}/projects/0.1/projects/${projectId}/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        }
      });

      return {
        success: true,
        data: response.data,
        project: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Profile
  async getUserProfile(userId = 'self') {
    try {
      const response = await axios.get(`${this.baseURL}/users/0.1/users/${userId}/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        }
      });

      return {
        success: true,
        data: response.data,
        user: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search Users/Freelancers
  async searchFreelancers(query = null, skills = null, countries = null, limit = 10, offset = 0) {
    try {
      const params = {
        limit,
        offset,
        ...(query && { query }),
        ...(skills && { jobs: skills }),
        ...(countries && { countries })
      };

      const response = await axios.get(`${this.baseURL}/users/0.1/users/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params
      });

      return {
        success: true,
        data: response.data,
        freelancers: response.data.result.users,
        count: response.data.result.users.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Job Categories/Skills
  async getJobCategories() {
    try {
      const response = await axios.get(`${this.baseURL}/projects/0.1/jobs/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        }
      });

      return {
        success: true,
        data: response.data,
        categories: response.data.result.jobs
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Place Bid on Project
  async placeBid(projectId, amount, period, description, milestonePercentage = 100) {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/0.1/bids/`,
        {
          project_id: projectId,
          bidder_id: 'self',
          amount,
          period,
          description,
          milestone_percentage: milestonePercentage
        },
        {
          headers: {
            'Freelancer-OAuth-V1': this.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        bid: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Project Bids
  async getProjectBids(projectId, limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/projects/0.1/projects/${projectId}/bids/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params: { limit, offset }
      });

      return {
        success: true,
        data: response.data,
        bids: response.data.result.bids
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Bids
  async getUserBids(userId = 'self', limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/projects/0.1/bids/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params: {
          bids: userId,
          limit,
          offset
        }
      });

      return {
        success: true,
        data: response.data,
        bids: response.data.result.bids
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Post a Project
  async postProject(title, description, skills, budget, currency = 'USD', type = 'fixed') {
    try {
      const response = await axios.post(
        `${this.baseURL}/projects/0.1/projects/`,
        {
          title,
          description,
          currency: { code: currency },
          budget: { minimum: budget.min, maximum: budget.max },
          jobs: skills,
          type
        },
        {
          headers: {
            'Freelancer-OAuth-V1': this.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        project: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get Messages
  async getMessages(threadId = null, limit = 10, offset = 0) {
    try {
      const endpoint = threadId 
        ? `${this.baseURL}/messages/0.1/threads/${threadId}/messages/`
        : `${this.baseURL}/messages/0.1/threads/`;

      const response = await axios.get(endpoint, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params: { limit, offset }
      });

      return {
        success: true,
        data: response.data,
        messages: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send Message
  async sendMessage(threadId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages/0.1/threads/${threadId}/messages/`,
        { message },
        {
          headers: {
            'Freelancer-OAuth-V1': this.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: response.data.result
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Portfolio
  async getUserPortfolio(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/users/0.1/portfolios/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params: { users: [userId] }
      });

      return {
        success: true,
        data: response.data,
        portfolio: response.data.result.portfolios
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get User Reviews
  async getUserReviews(userId, limit = 10, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/users/0.1/reviews/`, {
        headers: {
          'Freelancer-OAuth-V1': this.accessToken
        },
        params: {
          to_users: [userId],
          limit,
          offset
        }
      });

      return {
        success: true,
        data: response.data,
        reviews: response.data.result.reviews
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = FreelancerAPIIntegration;
