# Coolify Deployment Guide (Without Docker)

## Overview

This guide will help you deploy your Runner Claude App on Coolify using the native build system (no Docker required).

## Prerequisites

1. **Coolify Instance**: Self-hosted or Coolify Cloud
2. **GitHub Repository**: Your code should be on GitHub
3. **Environment Variables**: Resend API key for email functionality

## Deployment Steps

### 1. Create New Application in Coolify

1. **Login to Coolify Dashboard**
2. **Click "New Application"**
3. **Select "GitHub"** as source
4. **Choose your repository**: `ashrithps/runner-claude-app`
5. **Select "No Docker"** deployment method

### 2. Configure Build Settings

**Build Pack**: `nixpacks` (automatic detection)
**Port**: `3000`
**Install Command**: `npm install`
**Build Command**: `npm run build`
**Start Command**: `npm start`

### 3. Set Environment Variables

In Coolify dashboard, add these environment variables:

```
NODE_ENV=production
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_sender_email
```

### 4. Configure Persistent Storage

**This is crucial for SQLite database persistence!**

1. **Go to "Volumes" section** in your app configuration
2. **Add a new volume**:
   - **Source**: `/app/data` (container path)
   - **Destination**: Choose a persistent storage location on your server
   - **Permissions**: Read/Write

### 5. Resource Configuration

**Memory**: 512Mi (minimum)
**CPU**: 0.5 cores (minimum)
**Storage**: At least 1GB for database

### 6. Health Check

**Path**: `/`
**Port**: `3000`
**Interval**: 30s
**Timeout**: 10s
**Retries**: 3

## Database Persistence

### Why Persistent Storage is Important

- **SQLite database** is stored in `/app/data/database.sqlite`
- **Without persistence**, data will be lost on container restarts
- **With persistence**, your data survives deployments and restarts

### Volume Configuration

```yaml
volumes:
  - /app/data:/app/data
```

This maps the container's `/app/data` directory to a persistent location on your server.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `RESEND_API_KEY` | Your Resend API key | Yes |
| `FROM_EMAIL` | Sender email address | Yes |

## Troubleshooting

### Database Issues

**Problem**: Database not persisting between restarts
**Solution**: Ensure volume is properly mounted to `/app/data`

**Problem**: Permission denied on database file
**Solution**: Check volume permissions in Coolify dashboard

### Build Issues

**Problem**: Build fails
**Solution**: 
1. Check Node.js version (18+ required)
2. Ensure all dependencies are in package.json
3. Check build logs in Coolify

### Runtime Issues

**Problem**: App crashes on start
**Solution**:
1. Check environment variables are set
2. Verify port 3000 is available
3. Check application logs

## Monitoring

### Health Checks

- **Path**: `/` (root endpoint)
- **Expected**: 200 OK response
- **Frequency**: Every 30 seconds

### Logs

Access logs through Coolify dashboard:
1. **Go to your application**
2. **Click "Logs" tab**
3. **Monitor for errors**

## Backup Strategy

### Database Backup

Since you're using SQLite, the database file is in `/app/data/database.sqlite`. To backup:

1. **Access your server**
2. **Copy the database file** from the persistent volume
3. **Store it securely**

### Automated Backups

Consider setting up automated backups:
- **Daily database dumps**
- **Volume snapshots** (if available)
- **Git repository** for code backup

## Scaling

### Vertical Scaling

Increase resources in Coolify:
- **Memory**: Up to 2GB for larger datasets
- **CPU**: Up to 2 cores for better performance

### Horizontal Scaling

For high traffic:
1. **Use load balancer**
2. **Deploy multiple instances**
3. **Consider migrating to PostgreSQL** for multi-instance support

## Security

### Environment Variables

- **Never commit** API keys to Git
- **Use Coolify's** environment variable management
- **Rotate keys** regularly

### Database Security

- **SQLite file** is only accessible to the application
- **Volume permissions** are managed by Coolify
- **No external database** connections needed

## Performance Tips

1. **Enable caching** for static assets
2. **Optimize images** before deployment
3. **Monitor memory usage** and scale accordingly
4. **Use CDN** for static files if needed

## Support

If you encounter issues:

1. **Check Coolify logs** first
2. **Verify environment variables**
3. **Test locally** before deploying
4. **Check Coolify documentation** for platform-specific issues 