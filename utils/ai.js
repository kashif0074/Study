// utils/ai.js
import CONFIG from '../constants/config';

/**
 * Extracts text from an office document (DOCX, PPTX, etc.) via the backend utility endpoint.
 * @param {object} file - The file object containing uri, name, and mimeType.
 * @returns {Promise<string|null>} - The extracted text or null if failed.
 */
export const extractTextFromFile = async (file) => {
    try {
        console.log("📤 Sending file to extraction backend:", {
            name: file.name,
            mimeType: file.mimeType,
            uri: file.uri
        });

        // Safe import Platform inside the function or dynamically
        const { Platform } = require('react-native');
        const cleanUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;

        const formData = new FormData();
        formData.append('file', {
            uri: cleanUri,
            name: file.name || 'document.docx',
            type: file.mimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const response = await fetch(`${CONFIG.API_URLS.UTILS}/extract-text`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ Text extraction succeeded");
            return data.text;
        } else {
            console.warn("Extraction backend returned error:", data.error || data.details);
            return null;
        }
    } catch (error) {
        console.error("Text extraction failed:", error);
        return null;
    }
};
