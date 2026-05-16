// constants/gemini.js
export const GEMINI_API_KEY = "AIzaSyDA34fH6iDlt4_wHZ81md6nstGZcLuCCtE";

/**
 * Sends a prompt to the Google Gemini API.
 * @param {string} prompt - The text prompt to send.
 * @param {boolean} expectJson - If true, enforces JSON output and parses the response.
 * @returns {Promise<any>} - Returns parsed JSON object if expectJson is true, otherwise a string.
 */
export const askGemini = async (
  prompt,
  files = [],
  expectJson = false
) => {

  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
  ];

  let lastError = null;

  for (const model of models) {

    try {

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      console.log("Calling Gemini API:", model);

      const parts = [{ text: prompt }];

      // Files
      if (files?.length > 0) {
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

      const body = {
        contents: [
          {
            parts
          }
        ]
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      console.log("Gemini Response:", data);

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Gemini API Error"
        );
      }

      let text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (expectJson) {

        text = text.trim();

        if (text.startsWith("```json")) {
          text = text.replace(/^```json/, "").replace(/```$/, "");
        }

        if (text.startsWith("```")) {
          text = text.replace(/^```/, "").replace(/```$/, "");
        }

        return JSON.parse(text);
      }

      return text;

    } catch (error) {

      console.log("Model failed:", model);
      console.log(error);

      lastError = error.message;
    }
  }

  throw new Error(lastError);
};
