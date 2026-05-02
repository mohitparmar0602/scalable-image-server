# Scalable Image Upload Server (Production-Ready)

This repository contains a stateless, highly available backend system for uploading, processing, and storing images. It utilizes a containerized architecture with **NGINX** load balancing traffic across multiple **Node.js** instances, optimizing images on the fly with **Sharp**, and securely uploading them to **AWS S3**.

---

## 🏗 System Architecture
*   **Load Balancer:** NGINX (Round-Robin strategy).
*   **Backend:** Node.js (Multiple Dockerized instances).
*   **Image Processing:** Sharp (Auto-resizing to 800px width and 80% JPEG compression).
*   **Storage:** AWS S3 (`ap-south-1` region) generating secure Signed URLs.
*   **CI/CD:** GitHub Actions for automated linting and health checks.

---

## 🚀 Local Setup Steps

### 1. Prerequisites
*   Docker and Docker Compose installed locally.
*   An AWS Account with an active S3 Bucket and IAM User credentials.

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=mohit-image-upload-bucket


3. Booting the Infrastructure
To spin up the entire infrastructure (NGINX + 2 App Instances) locally:

Bash
docker compose up -d --build
☁️ AWS EC2 Deployment Guide
To deploy this system to a live production server, follow these steps:

1. Provision the EC2 Instance
Launch an Ubuntu EC2 instance (e.g., t2.micro).

CRITICAL: Under the Security Group settings, ensure you add an Inbound Rule to allow HTTP traffic on Port 80 from 0.0.0.0/0. Without this, NGINX cannot receive requests.

2. Connect and Install Dependencies
SSH into your instance using your .pem key and run:

Bash
sudo apt update -y
sudo apt install docker.io docker-compose-v2 git -y
3. Clone and Configure
Bash
git clone [https://github.com/mohitparmar0602/scalable-image-server.git](https://github.com/mohitparmar0602/scalable-image-server.git)
cd scalable-image-server
nano .env # Paste your AWS credentials here
4. Launch Production Containers
Bash
sudo docker compose up -d --build
5. Pulling Future Code Updates
To update your live server when you push new code to GitHub, pull the changes and restart the containers:

Bash
git pull origin main
sudo docker compose down
sudo docker compose up -d --build
⚖️ How to Run Multiple Instances
The system is designed for high availability via docker-compose.yml, which spins up two identical backend services: app1 and app2. Both containers map to internal port 3000. NGINX acts as a reverse proxy on public port 80, distributing incoming traffic evenly between the two instances.

To view the load balancer distributing requests in real-time, check the logs:

Bash
docker compose logs -f
🛠 NGINX Configuration
NGINX uses the Round-Robin method and enforces a strict 3MB body size limit to accommodate the required 2MB maximum image upload size plus HTTP overhead.

nginx.conf

Nginx
events { worker_connections 1024; }
http {
    upstream node_backend {
        server app1:3000;
        server app2:3000;
    }

    server {
        listen 80;
        client_max_body_size 3M; 
        
        location / {
            proxy_pass http://node_backend;
        }
    }
}
🤖 GitHub Actions CI Pipeline
The Continuous Integration (CI) pipeline (.github/workflows/ci.yml) triggers automatically on every push to the main branch. It ensures stability by:

Setting up modern Node.js environments (v22.x and v24.x).

Installing dependencies via npm install.

Running syntax checks (node --check server.js).

Health Check: Booting the server using dummy environment variables to verify the application starts without crashing.

📬 Sample API Request & Response
Endpoint: POST /upload

Headers: Content-Type: multipart/form-data

Body Payload: image (File type, multiple files supported)

Successful Response (200 OK)
Note: The URLs returned are secure AWS Signed URLs that automatically expire after 1 hour.

JSON
{
    "uploaded": [
        {
            "originalName": "supermarket.jpg",
            "signedUrl": "[https://mohit-image-upload-bucket.s3.ap-south-1.amazonaws.com/1777732060110-bda2c04-25fa-46f0-a709-e1c963ca3c90.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=](https://mohit-image-upload-bucket.s3.ap-south-1.amazonaws.com/1777732060110-bda2c04-25fa-46f0-a709-e1c963ca3c90.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=)..."
        },
        {
            "originalName": "img1.png",
            "signedUrl": "[https://mohit-image-upload-bucket.s3.ap-south-1.amazonaws.com/1777732060116-ad6e0b3d-3007-47a3-aebf-9a1c0d1002d0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=](https://mohit-image-upload-bucket.s3.ap-south-1.amazonaws.com/1777732060116-ad6e0b3d-3007-47a3-aebf-9a1c0d1002d0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=)..."
        }
    ]
}
