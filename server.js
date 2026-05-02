require('dotenv').config(); // Load environment variables
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize AWS S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();

// File Validation: Only image files allowed (JPG/PNG)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type for ${file.originalname}. Only JPG and PNG are allowed.`), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Max file size: 2MB per file
    fileFilter
});

// Expose the endpoint: POST /upload
app.post('/upload', upload.any(), async (req, res) => {
    // Check if any files were successfully uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images provided or invalid file types.' });
    }

    try {
        // Process and upload all received files to S3
        const uploadPromises = req.files.map(async (file) => {
            // File naming should be unique (timestamp/UUID)
            const fileExtension = path.extname(file.originalname);
            const uniqueFileName = `${Date.now()}-${uuidv4()}${fileExtension}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: uniqueFileName,
                Body: file.buffer,
                ContentType: file.mimetype
            });

            // Use AWS SDK to upload images to an S3 bucket
            await s3Client.send(command);

            // Construct the response format[cite: 1]
            return {
                url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${uniqueFileName}`
            };
        });

        // Wait for all S3 uploads to finish
        const uploadedFiles = await Promise.all(uploadPromises);

        // If it's a single file upload, return the exact object requested by the assignment
        if (uploadedFiles.length === 1) {
            return res.status(200).json(uploadedFiles[0]);
        }

        // If multiple files, return an array of those objects
        res.status(200).json({ uploaded: uploadedFiles });

    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: 'Failed to upload image(s) to S3.' });
    }
});

// Error handling middleware for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port number: ${PORT}`);
});