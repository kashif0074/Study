// backend/routes/utils.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { officeTextExtractor } = require('office-text-extractor');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/utils/extract-text
 * @desc    Extract text from DOCX, PPTX, XLSX files
 * @access  Public
 */
router.post('/extract-text', upload.single('file'), async (req, res) => {
    console.log("📥 Received extraction request");
    if (!req.file) {
        console.error("❌ No file in request!");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    console.log(`📂 Processing file: ${req.file.originalname}, Path: ${filePath}, Ext: ${fileExt}`);

    try {
        let text = "";

        // Use mammoth for modern DOCX (more reliable for text extraction)
        if (fileExt === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
            console.log("✅ Mammoth extracted text successfully");
        } 
        // Fallback to office-text-extractor for PPTX and others
        else {
            const extractor = officeTextExtractor();
            text = await extractor.extractText(filePath);
            console.log("✅ Office-text-extractor extracted text successfully");
        }

        if (!text || text.trim().length === 0) {
            throw new Error("No text content could be extracted from the file.");
        }

        // Clean up: delete the temporary file
        fs.unlinkSync(filePath);

        res.json({ text });
    } catch (error) {
        console.error('❌ Extraction Error:', error);
        
        // Write to a log file for the AI to read
        const logMessage = `\n[${new Date().toISOString()}] Error extracting ${req.file.originalname}:\n${error.stack}\n`;
        fs.appendFileSync(path.join(__dirname, '../extraction_errors.log'), logMessage);
        
        // Clean up even on error
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch(e) {}
        }

        res.status(500).json({ 
            error: 'Failed to extract text from file', 
            details: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;
