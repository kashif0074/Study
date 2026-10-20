// src/config/apiConfig.js
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

// For Android emulator: 10.0.2.2, for iOS: localhost
// For physical device: Your computer's IP address
const getApiUrl = () => {
  if (__DEV__) {
    return API_BASE_URL;
  }
  // Production
  return 'https://your-production-server.com/api';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds
  endpoints: {
    summarize: '/ai/summarize',
    modelStatus: '/ai/status',
    health: '/health'
  }
};