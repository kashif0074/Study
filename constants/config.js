// constants/config.js
import { Platform } from 'react-native';

// Your computer's local IP address discovered via ipconfig: 192.168.0.100
// This allows physical devices on the same Wi-Fi to connect to the backend
export const API_BASE_URL = 'http://192.168.0.100:5000/api';

export const CONFIG = {
    API_URLS: {
        NOTES: `${API_BASE_URL}/notes`,
        AUTH: `${API_BASE_URL}/auth`,
    }
};

export default CONFIG;
