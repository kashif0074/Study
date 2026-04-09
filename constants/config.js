// constants/config.js
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
// For Physical devices, use your computer's local IP address (e.g., 192.168.1.XX)
export const API_BASE_URL = Platform.OS === 'android' 
    ? 'http://10.0.2.2:5000/api' 
    : 'http://localhost:5000/api';

export const CONFIG = {
    API_URLS: {
        NOTES: `${API_BASE_URL}/notes`,
        AUTH: `${API_BASE_URL}/auth`,
    }
};

export default CONFIG;
