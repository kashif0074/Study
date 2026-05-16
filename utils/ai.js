// utils/ai.js
import CONFIG from '../constants/config';

/**
 * Extracts text from an office document (DOCX, PPTX, etc.) via the backend utility endpoint.
 * @param {object} file - The file object containing uri, name, and mimeType.
 * @returns {Promise<string|null>} - The extracted text or null if failed.
 */
export const extractTextFromFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
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
            return data.text;
        } else {
            console.warn("Extraction backend returned error:", data.error);
            return null;
        }
    } catch (error) {
        console.error("Text extraction failed:", error);
        return null;
    }
};
