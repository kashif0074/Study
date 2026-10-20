// src/services/apiService.js
import { API_CONFIG } from '../config/apiConfig';

class APIService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: API_CONFIG.timeout,
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async summarize(text) {
    return this.request(API_CONFIG.endpoints.summarize, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getModelStatus() {
    return this.request(API_CONFIG.endpoints.modelStatus);
  }

  async checkHealth() {
    return this.request(API_CONFIG.endpoints.health);
  }
}

export default new APIService();