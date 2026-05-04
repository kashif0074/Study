// constants/gemini.js
export const GEMINI_API_KEY = "AIzaSyBr1_dawV7jabjQY2S2ReUKgA7ImZVrsGk";

/**
 * Sends a prompt to the Google Gemini API.
 * @param {string} prompt - The text prompt to send.
 * @param {boolean} expectJson - If true, enforces JSON output and parses the response.
 * @returns {Promise<any>} - Returns parsed JSON object if expectJson is true, otherwise a string.
 */
export const askGemini = async (prompt, files = [], expectJson = false) => {
    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
    let lastError = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            
            const parts = [{ text: prompt }];

            // Append any files (PDF, images, audio) as inline data
            if (files && files.length > 0) {
                files.forEach(file => {
                    if (file.base64 && file.mimeType) {
                        parts.push({
                            inlineData: {
                                mimeType: file.mimeType,
                                data: file.base64
                            }
                        });
                    }
                });
            }

            const requestBody = {
                contents: [{ parts }],
            };

            // We rely on the prompt to request JSON, and extract it manually to avoid generationConfig errors.

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                // If high demand (503/429), try next model in the list
                if (response.status === 503 || response.status === 429 || data.error?.message?.includes("demand")) {
                    console.warn(`Model ${model} busy, trying next...`);
                    lastError = data.error?.message;
                    continue;
                }
                throw new Error(data.error?.message || "Gemini API Error");
            }

            let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (expectJson) {
                resultText = resultText.trim();
                if (resultText.startsWith("```json")) {
                    resultText = resultText.replace(/^```json\n/, "").replace(/\n```$/, "");
                } else if (resultText.startsWith("```")) {
                    resultText = resultText.replace(/^```\n/, "").replace(/\n```$/, "");
                }
                return JSON.parse(resultText);
            }

            return resultText;
        } catch (error) {
            lastError = error.message;
            console.error(`Error with ${model}:`, error.message);
            // If it's a parse error or something not demand-related, we might want to stop, 
            // but for safety let's try the next model.
        }
    }

    throw new Error(`AI Tools are temporarily busy. Last error: ${lastError}. Please try again in a moment.`);
};
