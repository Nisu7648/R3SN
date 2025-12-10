# R3SN Production Deployment Guide

Complete guide for deploying R3SN to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Deployment](#docker-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Security Hardening](#security-hardening)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 20GB minimum (SSD recommended)
- **OS**: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

### Software Requirements

- Docker 20.10+ & Docker Compose 2.0+
- Node.js 18+ (for manual deployment)
- MongoDB 6.0+
- Redis 7.0+
- Nginx (optional, for reverse proxy)

## Docker Deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

### With Nginx Reverse Proxy

```bash
# Start with Nginx profile
docker-compose --profile with-nginx up -d

# Configure SSL (optional)
mkdir -p ssl
# Copy your SSL certificates to ssl/cert.pem and ssl/key.pem
```

### Production Configuration

```bash
# Set production environment variables
export JWT_SECRET=$(openssl rand -hex 32)
export MONGO_ROOT_PASSWORD=$(openssl rand -hex 16)
export OPENAI_API_KEY=your-openai-key

# Start with production settings
docker-compose up -d

# Seed database
docker-compose exec app npm run seed
```

## Manual Deployment

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Setup Application

```bash
# Clone repository
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env

# Seed database
npm run seed
```

### 3. Configure Services

**MongoDB:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Redis:**
```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**R3SN Application (using PM2):**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/server.js --name r3sn

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### 4. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/r3sn
sudo ln -s /etc/nginx/sites-available/r3sn /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Cloud Deployment

### AWS Deployment

#### Using EC2

```bash
# Launch EC2 instance (t3.medium or larger)
# Ubuntu 22.04 LTS

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Follow manual deployment steps above

# Configure security group:
# - Port 22 (SSH)
# - Port 80 (HTTP)
# - Port 443 (HTTPS)
# - Port 3000 (Application - optional)
```

#### Using ECS (Docker)

```yaml
# task-definition.json
{
  "family": "r3sn",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "r3sn-app",
      "image": "your-ecr-repo/r3sn:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:r3sn/jwt"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform

```bash
# Using Cloud Run
gcloud run deploy r3sn \
  --image gcr.io/your-project/r3sn \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production

# Using GKE (Kubernetes)
kubectl apply -f k8s/deployment.yaml
```

### Azure

```bash
# Using Azure Container Instances
az container create \
  --resource-group r3sn-rg \
  --name r3sn-app \
  --image your-registry.azurecr.io/r3sn:latest \
  --dns-name-label r3sn \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

### DigitalOcean

```bash
# Using App Platform
doctl apps create --spec app-spec.yaml

# Using Droplet
# Follow manual deployment steps
```

## Environment Configuration

### Required Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/r3sn

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=sk-your-openai-api-key

# Security
CORS_ORIGIN=https://yourdomain.com
```

### Optional Variables

```env
# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Hardening

### 1. SSL/TLS Configuration

```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. MongoDB Security

```bash
# Enable authentication
mongosh
use admin
db.createUser({
  user: "r3sn_admin",
  pwd: "strong-password",
  roles: ["readWrite", "dbAdmin"]
})

# Update connection string
MONGODB_URI=mongodb://r3sn_admin:strong-password@localhost:27017/r3sn
```

### 4. Application Security

- Change default JWT_SECRET
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting
- Regular security updates
- Use environment variables for secrets

## Monitoring & Logging

### Application Logs

```bash
# Docker
docker-compose logs -f app

# PM2
pm2 logs r3sn

# Log files
tail -f logs/combined.log
tail -f logs/error.log
```

### Health Monitoring

```bash
# Health check endpoint
curl http://localhost:3000/health

# Stats endpoint
curl http://localhost:3000/api/stats
```

### Monitoring Tools

- **PM2 Monitoring**: `pm2 monit`
- **Docker Stats**: `docker stats`
- **Prometheus + Grafana**: For advanced metrics
- **Sentry**: For error tracking
- **New Relic**: For APM

## Backup & Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/r3sn" --out=/backup/$(date +%Y%m%d)

# Automated daily backup
crontab -e
0 2 * * * mongodump --uri="mongodb://localhost:27017/r3sn" --out=/backup/$(date +\%Y\%m\%d)
```

### Database Restore

```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/r3sn" /backup/20240101
```

### Application Backup

```bash
# Backup configuration and uploads
tar -czf r3sn-backup-$(date +%Y%m%d).tar.gz .env uploads/ logs/
```

## Scaling

### Horizontal Scaling

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml r3sn

# Kubernetes
kubectl scale deployment r3sn --replicas=3
```

### Vertical Scaling

- Increase CPU/RAM allocation
- Optimize MongoDB indexes
- Enable Redis caching
- Use CDN for static assets

### Load Balancing

```nginx
upstream r3sn_backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app
pm2 logs r3sn

# Check environment
cat .env

# Check dependencies
npm install

# Check ports
sudo netstat -tulpn | grep 3000
```

### Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh mongodb://localhost:27017/r3sn

# Check firewall
sudo ufw status
```

### High Memory Usage

```bash
# Check processes
docker stats
pm2 monit

# Restart services
docker-compose restart
pm2 restart r3sn
```

### Performance Issues

- Enable Redis caching
- Optimize database queries
- Add indexes to MongoDB
- Increase worker threads
- Use CDN for static assets

## Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@r3sn.io
- **Community**: Discord/Slack

## License

MIT License - see LICENSE file
