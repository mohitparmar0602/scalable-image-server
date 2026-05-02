require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const sharp = require('sharp'); // BONUS: Image Resizing

const app = express();
const PORT = process.env.PORT || 3000;

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png'].includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only JPG and PNG are allowed.'), false);
    }
});

app.post('/upload', upload.any(), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images provided.' });

    try {
        const uploadPromises = req.files.map(async (file) => {
            const fileExtension = path.extname(file.originalname);
            const uniqueFileName = `${Date.now()}-${uuidv4()}${fileExtension}`;

            // BONUS 1: Image Resizing using Sharp
            // Compresses and limits the max width to 800px while maintaining aspect ratio
            const optimizedBuffer = await sharp(file.buffer)
                .resize({ width: 800, withoutEnlargement: true })
                .jpeg({ quality: 80 }) // Convert/compress to 80% quality JPEG
                .toBuffer();

            // Upload optimized image
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: uniqueFileName,
                Body: optimizedBuffer,
                ContentType: 'image/jpeg' 
            }));

            // BONUS 2: Generate a Signed S3 URL (Expires in 1 hour)
            const getCommand = new GetObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: uniqueFileName
            });
            const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

            return { originalName: file.originalname, signedUrl };
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        res.status(200).json({ uploaded: uploadedFiles });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: 'Failed to process and upload image.' });
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));