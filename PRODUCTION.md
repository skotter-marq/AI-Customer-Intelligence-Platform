# Production Deployment Guide

This guide covers the deployment and operation of the AI Customer Intelligence Platform in production environments.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- SSL certificates (for HTTPS)
- Environment variables configured

### One-Command Deployment
```bash
./scripts/deploy.sh
```

## 📋 Environment Configuration

### Required Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Database
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Integrations
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_WEBHOOK_URL=your-slack-webhook-url

# Security
WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-jwt-secret

# Monitoring
MONITORING_ENABLED=true
LOG_LEVEL=info

# Performance
REDIS_URL=redis://redis:6379
CACHE_TTL=3600
```

### Optional Environment Variables

```env
# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update to latest version
docker-compose pull && docker-compose up -d
```

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| app | 3000 | Next.js application |
| nginx | 80, 443 | Reverse proxy with SSL |
| redis | 6379 | Caching layer |

## 🔧 Configuration

### Nginx Configuration

The included `nginx.conf` provides:
- SSL termination
- Rate limiting
- Security headers
- Gzip compression
- Static file caching

### SSL Certificates

Place your SSL certificates in the `ssl/` directory:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - Private key

For development, the deployment script will create self-signed certificates.

## 📊 Monitoring

### Health Checks

The application provides several health check endpoints:

```bash
# Basic health check
curl http://localhost:3000/api/health

# Detailed monitoring
curl http://localhost:3000/api/monitoring?type=metrics

# System alerts
curl http://localhost:3000/api/monitoring?type=alerts
```

### Monitoring Dashboard

Access the monitoring dashboard at: `http://localhost:3000/monitoring`

Features:
- Real-time metrics
- System health status
- Performance monitoring
- Alert management
- Auto-refresh capabilities

### Key Metrics

- **Memory Usage**: Heap memory utilization
- **Database Performance**: Query response times
- **API Response Times**: Average endpoint latency
- **Error Rates**: Request failure percentages
- **Cache Performance**: Hit/miss ratios

## 🔐 Security

### Security Headers

The application includes comprehensive security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)
- `Content-Security-Policy`

### Rate Limiting

API endpoints are protected with rate limiting:
- API routes: 10 requests/second
- General routes: 30 requests/second
- Configurable burst limits

### Authentication

The application uses JWT tokens for authentication. Configure the `JWT_SECRET` environment variable with a secure random string.

## 🔍 Testing

### End-to-End Testing

Access the testing dashboard at: `http://localhost:3000/testing`

Run tests programmatically:
```bash
curl -X POST http://localhost:3000/api/testing \
  -H "Content-Type: application/json" \
  -d '{"action": "run_tests", "parallel": true}'
```

### Test Suites

1. **API Tests**: Endpoint functionality
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Load and response times
5. **Security Tests**: Vulnerability scanning

## 📈 Performance Optimization

### Caching Strategy

- **Redis**: API response caching
- **CDN**: Static asset delivery
- **Browser**: Client-side caching headers

### Database Optimization

- Connection pooling
- Query optimization
- Index management
- Regular maintenance

### Asset Optimization

- Image compression (WebP/AVIF)
- JavaScript bundling
- CSS minification
- Gzip compression

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose exec app printenv

# Check dependencies
docker-compose exec app npm list
```

#### Database Connection Issues
```bash
# Test database connectivity
curl http://localhost:3000/api/health

# Check Supabase configuration
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### High Memory Usage
```bash
# Monitor memory usage
curl http://localhost:3000/api/monitoring?type=health

# Check for memory leaks
docker stats
```

### Log Analysis

View application logs:
```bash
# All logs
docker-compose logs -f

# Application only
docker-compose logs -f app

# Nginx only
docker-compose logs -f nginx
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup (adjust for your database)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_file.sql
```

### Application Data

```bash
# Export generated content
curl http://localhost:3000/api/changelog > content_backup.json

# Export user configurations
curl http://localhost:3000/api/notifications?type=config > config_backup.json
```

## 🔧 Maintenance

### Regular Tasks

1. **Monitor disk usage**
2. **Update dependencies**
3. **Review security alerts**
4. **Optimize database queries**
5. **Clean up old logs**

### Update Process

```bash
# 1. Backup data
./scripts/backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Update dependencies
npm ci

# 4. Run tests
npm test

# 5. Deploy
./scripts/deploy.sh
```

## 🆘 Support

### Getting Help

1. Check the monitoring dashboard
2. Review application logs
3. Run diagnostic tests
4. Contact system administrator

### Emergency Procedures

#### Complete System Failure
```bash
# 1. Stop all services
docker-compose down

# 2. Check system resources
df -h && free -h

# 3. Restart with fresh deployment
./scripts/deploy.sh
```

#### Data Corruption
```bash
# 1. Stop application
docker-compose stop app

# 2. Restore from backup
./scripts/restore.sh

# 3. Verify integrity
curl http://localhost:3000/api/health
```

## 📝 Changelog

### Version 1.0.0
- Initial production release
- Complete CI/CD pipeline
- Comprehensive monitoring
- Security hardening
- Performance optimization

---

For additional support, please refer to the main README.md or contact the development team.