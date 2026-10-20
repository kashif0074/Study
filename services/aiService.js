// src/services/aiService.js
import apiService from './apiService';
import { Alert } from 'react-native';

class AIService {
  constructor() {
    this.isModelReady = false;
  }

  async initialize() {
    try {
      const status = await apiService.getModelStatus();
      this.isModelReady = status.ready;
      console.log('AI Model status:', status);
      return this.isModelReady;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      this.isModelReady = false;
      return false;
    }
  }

  async summarize(text) {
    if (!text || text.trim().length < 20) {
      throw new Error('Text too short. Minimum 20 characters required.');
    }

    if (!this.isModelReady) {
      await this.initialize();
      if (!this.isModelReady) {
        throw new Error('AI Model is not ready. Please try again.');
      }
    }

    try {
      const result = await apiService.summarize(text);
      return result.summary;
    } catch (error) {
      console.error('Summarization failed:', error);
      throw new Error('Failed to generate summary. Please check your connection.');
    }
  }

  async checkStatus() {
    try {
      const health = await apiService.checkHealth();
      return health.status === 'OK';
    } catch {
      return false;
    }
  }
}

export default new AIService();