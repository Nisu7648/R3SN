# R3SN Deployment Guide

## Production Deployment Options

### 1. Docker Deployment

#### Quick Start
```bash
# Build image
docker build -t r3sn:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_password \
  --name r3sn \
  r3sn:latest
```

#### Docker Compose (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f r3sn

# Stop services
docker-compose down
```

**Services Included:**
- R3SN Application
- PostgreSQL Database
- Redis Cache
- Nginx Reverse Proxy

### 2. Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (v1.20+)
- kubectl configured
- Docker registry access

#### Deploy
```bash
# Create namespace
kubectl create namespace r3sn

# Apply configurations
kubectl apply -f k8s/deployment.yaml -n r3sn

# Check status
kubectl get pods -n r3sn
kubectl get services -n r3sn

# View logs
kubectl logs -f deployment/r3sn-deployment -n r3sn
```

#### Features
- Auto-scaling (3-100 pods)
- Load balancing
- Health checks
- Resource limits
- Rolling updates
- Zero-downtime deployment

#### Scale Manually
```bash
kubectl scale deployment r3sn-deployment --replicas=10 -n r3sn
```

### 3. Cloud Platform Deployment

#### AWS

**EC2:**
```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-xxxxx \
  --instance-type t3.large \
  --key-name your-key \
  --security-groups r3sn-sg

# SSH and deploy
ssh -i your-key.pem ec2-user@instance-ip
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
npm install
npm run server
```

**ECS (Elastic Container Service):**
```bash
# Create task definition
aws ecs register-task-definition --cli-input-json file://ecs-task.json

# Create service
aws ecs create-service \
  --cluster r3sn-cluster \
  --service-name r3sn-service \
  --task-definition r3sn-task \
  --desired-count 3
```

**Lambda (Serverless):**
```bash
# Package application
zip -r r3sn.zip .

# Deploy to Lambda
aws lambda create-function \
  --function-name r3sn \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://r3sn.zip
```

#### Google Cloud Platform

**Compute Engine:**
```bash
# Create instance
gcloud compute instances create r3sn-instance \
  --machine-type=n1-standard-2 \
  --image-family=ubuntu-2004-lts

# Deploy
gcloud compute ssh r3sn-instance
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
npm install
npm run server
```

**Cloud Run:**
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/r3sn

# Deploy
gcloud run deploy r3sn \
  --image gcr.io/PROJECT_ID/r3sn \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**GKE (Google Kubernetes Engine):**
```bash
# Create cluster
gcloud container clusters create r3sn-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2

# Deploy
kubectl apply -f k8s/deployment.yaml
```

#### Microsoft Azure

**App Service:**
```bash
# Create app service
az webapp create \
  --resource-group r3sn-rg \
  --plan r3sn-plan \
  --name r3sn-app \
  --runtime "NODE|18-lts"

# Deploy
az webapp deployment source config \
  --name r3sn-app \
  --resource-group r3sn-rg \
  --repo-url https://github.com/Nisu7648/R3SN \
  --branch main
```

**Container Instances:**
```bash
# Deploy container
az container create \
  --resource-group r3sn-rg \
  --name r3sn-container \
  --image r3sn:latest \
  --cpu 2 \
  --memory 4 \
  --ports 3000
```

**AKS (Azure Kubernetes Service):**
```bash
# Create cluster
az aks create \
  --resource-group r3sn-rg \
  --name r3sn-cluster \
  --node-count 3 \
  --enable-addons monitoring

# Deploy
kubectl apply -f k8s/deployment.yaml
```

### 4. Traditional Server Deployment

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Clone and setup
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
npm install

# Configure environment
cp .env.example .env
nano .env

# Start with PM2
npm install -g pm2
pm2 start backend/server-production.js --name r3sn
pm2 startup
pm2 save
```

#### CentOS/RHEL
```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql

# Install Redis
sudo yum install -y redis
sudo systemctl start redis

# Deploy application
git clone https://github.com/Nisu7648/R3SN.git
cd R3SN
npm install
pm2 start backend/server-production.js --name r3sn
```

### 5. Reverse Proxy Setup

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3000/$1 [P,L]
</VirtualHost>
```

### 6. SSL/TLS Setup

#### Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 7. Database Setup

#### PostgreSQL
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE r3sn;
CREATE USER r3sn_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE r3sn TO r3sn_user;
\q

# Run migrations (if any)
npm run db:migrate
```

#### Redis
```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Restart
sudo systemctl restart redis
```

### 8. Monitoring Setup

#### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Monitor
pm2 monit
```

#### Prometheus + Grafana
```bash
# Install Prometheus
docker run -d -p 9090:9090 prom/prometheus

# Install Grafana
docker run -d -p 3001:3000 grafana/grafana
```

### 9. Backup Strategy

#### Database Backup
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U r3sn_user r3sn > $BACKUP_DIR/r3sn_$DATE.sql
gzip $BACKUP_DIR/r3sn_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

#### Application Backup
```bash
# Backup application files
tar -czf /backups/r3sn_$(date +%Y%m%d).tar.gz /app/R3SN
```

### 10. Security Hardening

#### Firewall
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Firewalld (CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### Fail2Ban
```bash
# Install
sudo apt install fail2ban

# Configure
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 11. Performance Optimization

#### Node.js Optimization
```bash
# Increase memory limit
node --max-old-space-size=4096 backend/server-production.js

# Enable cluster mode
NODE_ENV=production node backend/server-production.js
```

#### Database Optimization
```sql
-- PostgreSQL tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
```

### 12. CI/CD Pipeline

#### GitHub Actions
```yaml
name: Deploy R3SN

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t r3sn:latest .
      - name: Push to registry
        run: docker push r3sn:latest
      - name: Deploy to production
        run: kubectl rollout restart deployment/r3sn-deployment
```

### 13. Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database health
pg_isready -h localhost -p 5432

# Redis health
redis-cli ping
```

### 14. Troubleshooting

#### View Logs
```bash
# PM2 logs
pm2 logs r3sn

# Docker logs
docker logs r3sn

# Kubernetes logs
kubectl logs -f deployment/r3sn-deployment
```

#### Common Issues
1. **Port already in use**: Change PORT in .env
2. **Database connection failed**: Check DB credentials
3. **Out of memory**: Increase memory limits
4. **High CPU usage**: Enable auto-scaling

---

**For enterprise support and custom deployment assistance:**
- Email: support@r3sn.io
- Documentation: https://docs.r3sn.io
- Community: https://community.r3sn.io
