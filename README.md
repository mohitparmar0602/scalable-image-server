# Scalable Image Upload Server (Production-Ready)

This repository contains a stateless, containerized backend system designed for high-availability image processing and storage. It utilizes **NGINX** as a load balancer to distribute traffic across multiple **Node.js** instances, which optimize images using **Sharp** before uploading them to **AWS S3**.

---

## 🏗 System Architecture
*   **Load Balancer:** NGINX (Round-Robin strategy).
*   **Backend:** Node.js (Multiple Dockerized instances).
*   **Image Processing:** Sharp (Auto-resizing to 800px width and 80% JPEG quality).
*   **Storage:** AWS S3 (Mumbai `ap-south-1` region).
*   **CI/CD:** GitHub Actions (Automated build, lint, and health checks).

---

## 🚀 Setup Steps

### 1. Prerequisites
*   Git and Docker installed (if running locally).
*   AWS Account with an S3 Bucket and IAM User credentials.

### 2. Environment Configuration
Create a `.env` file in the root directory and populate it with your credentials:
```env
PORT=3000
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=mohit-image-upload-bucket