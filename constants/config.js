// constants/config.js
import { Platform } from 'react-native';

// ✅ CORRECT IP - Your actual WiFi IP from ipconfig
// IPv4 Address. . . . . . . . . . . : 10.10.30.219
const YOUR_WIFI_IP = '192.168.238.1';

export const API_URL = "https://your-service-name.onrender.com";

console.log(`🔧 API URL: ${API_BASE_URL}`);

export const CONFIG = {
    API_URLS: {
        NOTES: `${API_BASE_URL}/notes`,
        AUTH: `${API_BASE_URL}/auth`,
        STUDY_PLANS: `${API_BASE_URL}/study-plans`,
        AI_HISTORY: `${API_BASE_URL}/ai-history`,
        COMMUNITIES: `${API_BASE_URL}/communities`,
        ADMIN: `${API_BASE_URL}/admin`,
        UTILS: `${API_BASE_URL}/utils`,
        HEALTH: `${API_BASE_URL}/health`
    }
};

export default CONFIG;