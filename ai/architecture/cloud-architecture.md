# Cloud Architecture

## Overview

This document describes the cloud infrastructure architecture for the Best Picks Dashboard project hosted on AWS.

## Architecture Diagram

```
                                    +------------------+
                                    |                  |
                                    |    S3 Bucket     |
                                    |  (Static Files)  |
                                    |                  |
                                    +--------+---------+
                                             |
                                             | reads compiled files
                                             v
+----------+       +-------------------+     |
|          |       |                   |<----+
|  Users   +------>|    CloudFront     |
|          |       |   (CDN/Frontend)  |
+----------+       |                   |
                   +--------+----------+
                            |
                            | /api/* requests
                            v
                   +-------------------+
                   |                   |
                   |   API Gateway     |
                   |                   |
                   +--------+----------+
                            |
                            | routes to backend
                            v
                   +-------------------+
                   |                   |
                   |       EC2         |
                   |  (Golang Backend) |
                   |                   |
                   +-------------------+
```

## Components

### 1. Amazon CloudFront (CDN)

- **Purpose**: Content delivery and frontend hosting
- **Configuration**:
  - Origin: S3 bucket containing compiled frontend assets
  - Caching: Static assets cached at edge locations
  - Routing: All `/api/*` requests are forwarded to API Gateway

### 2. Amazon S3 Bucket

- **Purpose**: Storage for compiled frontend files
- **Contents**:
  - Compiled React application (HTML, CSS, JS)
  - Static assets (images, fonts, etc.)
- **Access**: Private bucket, accessible only through CloudFront OAI (Origin Access Identity)

### 3. Amazon API Gateway

- **Purpose**: API routing and management
- **Configuration**:
  - Receives all `/api/*` requests from CloudFront
  - Routes requests to the EC2 backend instance
  - Handles request/response transformation if needed

### 4. Amazon EC2

- **Purpose**: Backend application hosting
- **Application**: Golang backend service
- **Responsibilities**:
  - Business logic processing
  - Database interactions
  - API response handling

## Request Flow

1. User accesses the application via CloudFront URL
2. CloudFront serves static files (HTML, CSS, JS) from S3 bucket
3. Frontend application makes API calls to `/api/*` endpoints
4. CloudFront routes `/api/*` requests to API Gateway
5. API Gateway forwards requests to EC2 instance
6. Golang backend processes the request and returns response
7. Response flows back through API Gateway -> CloudFront -> User

## Deployment

### Frontend Deployment

1. Build the React application: `npm run build`
2. Upload compiled files to S3 bucket
3. Invalidate CloudFront cache if necessary

### Backend Deployment

1. Build Golang application
2. Deploy to EC2 instance
3. Restart the application service
