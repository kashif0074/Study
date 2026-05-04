// constants/config.js
import { Platform } from 'react-native';

// Your computer's local IP address discovered via ipconfig: 192.168.0.107
// This allows physical devices on the same Wi-Fi to connect to the backend
export const API_BASE_URL = 'http://192.168.0.107:5000/api';

export const CONFIG = {
    API_URLS: {
        NOTES: `${API_BASE_URL}/notes`,
        AUTH: `${API_BASE_URL}/auth`,
        STUDY_PLANS: `${API_BASE_URL}/study-plans`,
        AI_HISTORY: `${API_BASE_URL}/ai-history`,
        COMMUNITIES: `${API_BASE_URL}/communities`,
    }
};

export default CONFIG;
