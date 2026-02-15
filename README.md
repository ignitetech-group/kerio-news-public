# Kerio News Website

Next.js application for hosting Kerio product news feeds (KerioConnect, KerioControl, AppManager).

## What This Replaces

This application replaces the Pantheon-hosted Drupal website that was vulnerable to security issues. The migration includes:

- ✅ IP Helper tool (`/scripts/PublicIpHelper`)
- ✅ Three news feed pages with editable content
- ✅ Configurable redirect management system
- ✅ Docker containerization for ECS deployment
- ✅ MySQL database for redirects

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run development server
npm run dev
```

Visit http://localhost:3000

## Key Endpoints

- **IP Helper**: `/scripts/PublicIpHelper` - Returns visitor's IP address
- **News Feeds**:
  - `/newstile/interface/kerioconnect/all`
  - `/newstile/interface/kerioconnect/linux`
  - `/newstile/interface/keriocontrol/linux`
- **Redirect API**: `/api/redirects` - Manage URL redirects

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[MIGRATION_ANALYSIS.md](../MIGRATION_ANALYSIS.md)** - Migration analysis and decisions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL
- **Deployment**: Docker + AWS ECS
- **Static Files**: AWS S3

## Project Structure

```
kerio-news-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (redirects)
│   ├── newstile/          # News feed pages
│   └── scripts/           # IP helper endpoint
├── lib/                   # Shared utilities (database)
├── database/              # Database schema
├── scripts/               # Helper scripts (import redirects)
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Local development stack
```

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run with Docker
docker-compose up
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions including:
- Docker deployment
- AWS ECS deployment
- Database setup
- Environment configuration

## Content Management

News feed content is stored in HTML files that can be edited directly:
- `app/newstile/interface/kerioconnect/all.html`
- `app/newstile/interface/kerioconnect/linux.html`
- `app/newstile/interface/keriocontrol/linux.html`

Marketing team can update these files and commit changes to Git for deployment.

## Managing Redirects

Redirects can be managed via the REST API:

```bash
# Create redirect
curl -X POST http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{"source_path":"/old","destination_url":"https://kerio.com/new","redirect_type":301}'

# List all redirects
curl http://localhost:3000/api/redirects
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.

## Team

- **Technical Lead**: Vladimir Chernyshkov
- **Developer**: Sarthak Gupta
- **Marketing**: Regina Nogueira, Angelo Antoline

## License

Proprietary - GFI Software / IgniteTech
