# Scalable Image Upload Server

This is a highly scalable backend system built with Node.js that uploads images directly to AWS S3. It operates without a database and utilizes NGINX as a load balancer to distribute traffic across multiple instances.

## Setup Steps
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory with the following variables:
   - `PORT=3000`
   - `AWS_REGION=ap-south-1`
   - `AWS_ACCESS_KEY_ID=your_key`
   - `AWS_SECRET_ACCESS_KEY=your_secret`
   - `AWS_S3_BUCKET_NAME=mohit-image-upload-bucket`

## How to run multiple instances
To run multiple instances, open separate terminal windows and specify different ports:
- Terminal 1: `$env:PORT=3001; node server.js` (Windows) or `PORT=3001 node server.js` (Mac/Linux)
- Terminal 2: `$env:PORT=3002; node server.js` (Windows) or `PORT=3002 node server.js` (Mac/Linux)

## NGINX configuration
NGINX is configured to listen on port 80 and use round-robin load balancing to route traffic to the backend instances running on ports 3001 and 3002. 
*(Include a snippet of your `nginx.conf` upstream block here).*

## GitHub Actions explanation
The CI pipeline is defined in `.github/workflows/ci.yml`. It triggers on every `push` and `pull_request` to the main branch. The pipeline automatically sets up a Node environment, installs all dependencies, performs a syntax check, and boots the server to ensure it runs without crashing.

## Sample request/response
**Request:**
`POST http://localhost/upload`
(Headers: `multipart/form-data`, Body: `image` = file)

**Response:**
```json
{
  "uploaded": [
    {
      "url": "[https://mohit-image-upload-bucket.s3.amazonaws.com/1715000000000-uuid.png](https://mohit-image-upload-bucket.s3.amazonaws.com/1715000000000-uuid.png)"
    }
  ]
}