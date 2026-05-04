import { askGemini } from './constants/gemini.js';
askGemini('Return a simple JSON array with 1 object: [{"id": 1}]', [], true).then(console.log).catch(console.error);
