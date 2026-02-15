# Kerio News Website - Deployment Guide

## Overview

This is a Next.js application that replaces the Pantheon-hosted Drupal site for Kerio news feeds.

## Features Implemented

✅ **IP Helper Tool** - `/scripts/PublicIpHelper` returns visitor's IP address
✅ **Three News Feed Pages** (editable HTML files):
  - `/newstile/interface/kerioconnect/all`
  - `/newstile/interface/kerioconnect/linux`
  - `/newstile/interface/keriocontrol/linux`
✅ **Redirect Management System** - API-based with database storage
✅ **Docker Containerization** - Ready for ECS deployment
✅ **MySQL Database** - For storing redirects

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
# Option A: Use Docker Compose (includes MySQL)
docker-compose up -d db

# Option B: Use existing MySQL
# Create database and run schema
mysql -u root -p < database/schema.sql
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## Testing the Features

### Test IP Helper
```bash
curl http://localhost:3000/scripts/PublicIpHelper
# Should return your IP address
```

### Test News Feeds
- http://localhost:3000/newstile/interface/kerioconnect/all
- http://localhost:3000/newstile/interface/kerioconnect/linux
- http://localhost:3000/newstile/interface/keriocontrol/linux

### Test Redirect API
```bash
# Create a redirect
curl -X POST http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{"source_path":"/test","destination_url":"https://www.kerio.com","redirect_type":301}'

# Get all redirects
curl http://localhost:3000/api/redirects

# Test redirect (visit /test in browser, should redirect)
```

---

## Docker Deployment

### Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Build Docker Image Only
```bash
docker build -t kerio-news-app .
```

### Run Docker Container
```bash
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=kerio_news \
  kerio-news-app
```

---

## AWS ECS Deployment

### Prerequisites
- AWS CLI configured
- ECR repository created
- ECS cluster created
- RDS MySQL database provisioned
- S3 bucket for static files (optional)

### 1. Push to ECR
```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_REPO

# Build and tag
docker build -t kerio-news-app .
docker tag kerio-news-app:latest YOUR_ECR_REPO/kerio-news-app:latest

# Push
docker push YOUR_ECR_REPO/kerio-news-app:latest
```

### 2. Create ECS Task Definition
Use the provided `ecs-task-definition.json` (create this based on your requirements)

### 3. Deploy to ECS
```bash
aws ecs update-service \
  --cluster your-cluster-name \
  --service kerio-news-service \
  --force-new-deployment
```

### 4. Environment Variables for ECS
Set these in your ECS task definition:
- `DB_HOST` - RDS endpoint
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password (use Secrets Manager)
- `DB_NAME` - Database name
- `NODE_ENV=production`

---

## Editing News Feed Content

### Current Approach
News feed pages are static HTML files located in:
- `app/newstile/interface/kerioconnect/all.html`
- `app/newstile/interface/kerioconnect/linux.html`
- `app/newstile/interface/keriocontrol/linux.html`

### How Marketing Can Update Content

**Option 1: Direct HTML Editing (Current Workflow)**
1. Edit the HTML files directly in the repository
2. Commit changes to Git
3. Deploy the changes (triggers rebuild)

**Option 2: Use Admin Panel (Future Enhancement)**
- Build a simple admin UI for content management
- Not implemented yet (as per requirements - keep it simple)

---

## Managing Redirects

### Via API

#### Create Redirect
```bash
curl -X POST http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{
    "source_path": "/old-page",
    "destination_url": "https://www.kerio.com/new-page",
    "redirect_type": 301,
    "notes": "Page moved"
  }'
```

#### Get All Redirects
```bash
curl http://localhost:3000/api/redirects
```

#### Update Redirect
```bash
curl -X PUT http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "destination_url": "https://www.kerio.com/updated-page",
    "is_active": true
  }'
```

#### Delete Redirect
```bash
curl -X DELETE "http://localhost:3000/api/redirects?id=1"
```

### Import Redirects from Google Sheets

See `scripts/import-redirects.js` for a helper script to import redirects from the Google Sheets spreadsheet.

---

## Database Schema

### Redirects Table
```sql
CREATE TABLE redirects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_path VARCHAR(500) NOT NULL UNIQUE,
  destination_url VARCHAR(1000) NOT NULL,
  redirect_type INT DEFAULT 301,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT
);
```

---

## File Structure
```
kerio-news-app/
├── app/
│   ├── api/
│   │   └── redirects/          # Redirect API endpoints
│   ├── newstile/
│   │   └── interface/          # News feed HTML pages
│   ├── scripts/
│   │   └── PublicIpHelper/     # IP helper endpoint
│   └── page.tsx                # Home page
├── lib/
│   └── db.ts                   # Database connection
├── database/
│   └── schema.sql              # Database schema
├── public/                     # Static files
├── middleware.ts               # Redirect middleware
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Local development stack
└── .env.example                # Environment variables template
```

---

## Next Steps

### Infrastructure Setup Needed
1. **Database**: Provision RDS MySQL instance
2. **S3**: Upload static files (PDFs, images) from export
3. **ECS**: Set up cluster, task definition, service
4. **Domain**: Point kerio.com to ECS load balancer
5. **SSL**: Configure HTTPS certificate

### Import Existing Data
1. Import redirects from Google Sheets
2. Upload static files to S3 (from the 1.2GB archive)

### Optional Enhancements
- Build admin UI for redirect management
- Add authentication for admin routes
- Implement S3 integration for file serving
- Set up CDN (CloudFront) for better performance

---

## Support

For issues or questions, contact:
- Vladimir Chernyshkov (technical lead)
- Sarthak Gupta (developer)

---

**Status**: ✅ Core functionality implemented and ready for deployment
