# Quick Setup Guide

## ✅ Already Done

1. ✅ `.env` file created (with defaults)
2. ✅ Dependencies installed
3. ✅ Development server running

## What You See Now

### Home Page (http://localhost:3000)
- Shows links to all news feed pages
- Shows link to IP Helper tool
- Lists available API endpoints

### Database Warning
The "Database error: ECONNREFUSED" is **normal** - it means the database isn't configured yet. This won't break the site.

**What still works without database:**
- ✅ IP Helper tool (`/scripts/PublicIpHelper`)
- ✅ All three news feed pages
- ❌ Redirect management (needs database)

---

## Next Steps

### Option 1: Test Without Database (Recommended First)

Just test the core features:

```bash
# 1. IP Helper
curl http://localhost:3000/scripts/PublicIpHelper
# Should return your IP: 127.0.0.1

# 2. News Feeds (open in browser)
open http://localhost:3000/newstile/interface/kerioconnect/all
open http://localhost:3000/newstile/interface/kerioconnect/linux
open http://localhost:3000/newstile/interface/keriocontrol/linux
```

### Option 2: Set Up Database (For Redirect Management)

#### Quick: Use Docker Compose
```bash
# Start MySQL in Docker
docker-compose up -d db

# Check it's running
docker-compose ps

# Database is now available at localhost:3306
# Credentials in docker-compose.yml:
#   - User: kerio_user
#   - Password: kerio_password
#   - Database: kerio_news
```

#### OR: Use Your Own MySQL

1. **Create database**:
```sql
CREATE DATABASE kerio_news;
```

2. **Run schema**:
```bash
mysql -u root -p kerio_news < database/schema.sql
```

3. **Update .env file**:
```bash
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=kerio_news
```

4. **Restart dev server**:
```bash
# Ctrl+C to stop
npm run dev
```

---

## Verify Everything Works

### 1. Home Page
```bash
curl http://localhost:3000
# Should return HTML (not errors)
```

### 2. IP Helper
```bash
curl http://localhost:3000/scripts/PublicIpHelper
# Should return your IP
```

### 3. News Feeds (open in browser)
- http://localhost:3000/newstile/interface/kerioconnect/all
- http://localhost:3000/newstile/interface/kerioconnect/linux
- http://localhost:3000/newstile/interface/keriocontrol/linux

### 4. Redirect API (if database configured)
```bash
# List redirects
curl http://localhost:3000/api/redirects

# Create redirect
curl -X POST http://localhost:3000/api/redirects \
  -H "Content-Type: application/json" \
  -d '{"source_path":"/test","destination_url":"https://www.kerio.com","redirect_type":301}'

# Test redirect (visit in browser)
open http://localhost:3000/test
# Should redirect to kerio.com
```

---

## File Locations

### Edit News Feed Content
- `app/newstile/interface/kerioconnect/all.html`
- `app/newstile/interface/kerioconnect/linux.html`
- `app/newstile/interface/keriocontrol/linux.html`

### Environment Variables
- `.env` - Current config
- `.env.example` - Template

### Database
- `database/schema.sql` - Table definitions
- `lib/db.ts` - Connection config

---

## Common Issues

### "Database error: ECONNREFUSED"
**Solution**: This is normal if database isn't configured. The site will work fine for news feeds and IP helper.

### "Cannot connect to database"
**Check**:
1. Is MySQL running? `docker-compose ps` or `mysql -u root -p`
2. Are credentials correct in `.env`?
3. Does database exist? `mysql -u root -p -e "SHOW DATABASES;"`

### News feed pages show empty
**Check**: HTML files exist in `app/newstile/interface/`

---

## Production Deployment

When ready for production:

1. ✅ Code is ready
2. ⏳ Set up RDS MySQL (or Central MySQL)
3. ⏳ Update `.env` with production DB credentials
4. ⏳ Build Docker image: `docker build -t kerio-news-app .`
5. ⏳ Push to ECR and deploy to ECS

See **DEPLOYMENT.md** for complete production setup.

---

**Status**: Development environment ready! ✅

**No database?** That's OK - you can still test the news feeds and IP helper.
**Need redirects?** Set up database (Option 2 above).
