# 🚀 Deployment Guide

Complete guide for deploying Czech Clubs Logos API to production.

## 📋 Table of Contents

- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Backup Strategy](#backup-strategy)
- [Monitoring](#monitoring)

## 🐳 Docker Deployment

### Docker Compose (Recommended)

1. **Clone repository on server:**
```bash
git clone <repository-url>
cd ClubLogos
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Verify deployment:**
```bash
docker-compose ps
docker-compose logs -f
```

### Standalone Docker

#### Backend
```bash
cd backend
docker build -t czech-clubs-backend .
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/logos:/root/logos \
  -v $(pwd)/data:/root \
  --name czech-backend \
  czech-clubs-backend
```

#### Frontend
```bash
cd frontend
docker build -t czech-clubs-frontend .
docker run -d \
  -p 3000:80 \
  --name czech-frontend \
  czech-clubs-frontend
```

## ☁️ Cloud Deployment

### AWS EC2

1. **Launch EC2 instance:**
   - OS: Ubuntu 22.04 LTS
   - Instance type: t2.micro or larger
   - Security groups: Open ports 80, 443, 8080

2. **Install Docker:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

3. **Deploy application:**
```bash
git clone <repository-url>
cd ClubLogos
docker-compose up -d
```

4. **Configure reverse proxy (Nginx):**
```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/czech-clubs
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Direct logo access
    location /logos/ {
        proxy_pass http://localhost:8080/logos/;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/czech-clubs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Google Cloud Run

1. **Build and push images:**
```bash
# Backend
cd backend
gcloud builds submit --tag gcr.io/PROJECT-ID/czech-backend
gcloud run deploy czech-backend \
  --image gcr.io/PROJECT-ID/czech-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Frontend
cd frontend
gcloud builds submit --tag gcr.io/PROJECT-ID/czech-frontend
gcloud run deploy czech-frontend \
  --image gcr.io/PROJECT-ID/czech-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Heroku

#### Backend
```bash
cd backend
heroku create czech-clubs-backend
heroku container:push web -a czech-clubs-backend
heroku container:release web -a czech-clubs-backend
```

#### Frontend
```bash
cd frontend
heroku create czech-clubs-frontend
heroku buildpacks:set heroku/nodejs
git push heroku main
```

### DigitalOcean App Platform

1. **Connect repository** via DigitalOcean dashboard

2. **Configure build settings:**
   - Backend: Dockerfile (`backend/Dockerfile`)
   - Frontend: Dockerfile (`frontend/Dockerfile`)

3. **Set environment variables** in dashboard

4. **Deploy** automatically on git push

## 🔧 Environment Variables

### Backend (.env)
```bash
# Server
PORT=8080

# Database
DB_PATH=/data/db.sqlite

# Storage
LOGOS_PATH=/data/logos

# CORS (optional - restrict origins in production)
ALLOWED_ORIGINS=https://yourdomain.com

# Optional: Cloud Storage
# AWS_S3_BUCKET=your-bucket
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
```

### Frontend
Update `frontend/src/main.js` before building:
```javascript
const API_BASE_URL = 'https://api.yourdomain.com'
```

Or use environment variables with Vite:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
```

`.env.production`:
```
VITE_API_URL=https://api.yourdomain.com
```

## 💾 Database Migration

### SQLite to PostgreSQL (Future)

1. **Export data from SQLite:**
```bash
sqlite3 db.sqlite .dump > dump.sql
```

2. **Import to PostgreSQL:**
```bash
psql -U username -d dbname -f dump.sql
```

3. **Update backend code** to use PostgreSQL driver

## 📦 Backup Strategy

### Automated Backups

Create backup script (`backup.sh`):
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup database
cp ./data/db.sqlite $BACKUP_DIR/db_$DATE.sqlite

# Backup logos
tar -czf $BACKUP_DIR/logos_$DATE.tar.gz ./data/logos/

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Cron job:
```bash
crontab -e
# Add: Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Cloud Storage Backup
```bash
# Sync to S3
aws s3 sync ./data/logos s3://your-bucket/logos/ --delete

# Sync to Google Cloud Storage
gsutil rsync -r ./data/logos gs://your-bucket/logos/
```

## 📊 Monitoring

### Health Checks

The API provides a health endpoint:
```bash
curl http://localhost:8080/health
```

### Docker Health Check

Add to `docker-compose.yml`:
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Logging

**View logs:**
```bash
# Docker Compose
docker-compose logs -f

# Individual services
docker logs -f czech-backend
docker logs -f czech-frontend
```

**Centralized logging (ELK Stack):**
```yaml
# Add to docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** - Free uptime monitoring
- **Pingdom** - Advanced monitoring
- **StatusCake** - Multi-location checks

Configure monitors for:
- `https://yourdomain.com` (Frontend)
- `https://api.yourdomain.com/health` (Backend)

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Configure CORS to restrict origins
- [ ] Set up firewall rules
- [ ] Regularly update dependencies
- [ ] Implement rate limiting
- [ ] Add authentication for upload endpoints
- [ ] Scan uploaded files for malware
- [ ] Use environment variables for secrets
- [ ] Enable audit logging
- [ ] Regular security updates

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer:** Use Nginx/HAProxy
2. **Multiple Backend Instances:** Scale with Docker Swarm or Kubernetes
3. **Shared Storage:** Use S3/R2 for logos instead of local filesystem

### Kubernetes Deployment

Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: czech-clubs-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: czech-backend
  template:
    metadata:
      labels:
        app: czech-backend
    spec:
      containers:
      - name: backend
        image: czech-clubs-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: PORT
          value: "8080"
        volumeMounts:
        - name: logos
          mountPath: /root/logos
      volumes:
      - name: logos
        persistentVolumeClaim:
          claimName: logos-pvc
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker-compose build
          docker-compose push
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/ClubLogos
            git pull
            docker-compose up -d --build
```

## 📝 Post-Deployment

1. **Verify all services are running**
2. **Test API endpoints**
3. **Check logs for errors**
4. **Monitor resource usage**
5. **Set up automated backups**
6. **Configure monitoring alerts**
7. **Document production URLs**

---

**🎉 Your deployment is complete!**
