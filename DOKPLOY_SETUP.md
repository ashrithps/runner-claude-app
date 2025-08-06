# Dokploy Deployment Guide

This guide shows how to deploy the Runner Claude App on Dokploy using pre-built Docker images for optimal production performance.

## Prerequisites

1. **Docker Hub Account** - Create account at https://hub.docker.com
2. **GitHub Secrets** - Set up the following secrets in your repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or access token

## Step 1: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following repository secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password/token

## Step 2: Build and Push Docker Image

The GitHub Actions workflow (`.github/workflows/docker-build.yml`) will automatically:
- Build the Docker image on every push to master
- Push to Docker Hub as `ashrithps/runner-claude-app:latest`
- Support multiple architectures (amd64, arm64)

## Step 3: Configure Dokploy Application

### Using the UI:

1. **Create New Application** in Dokploy
2. **Source Type**: Select "Docker"
3. **Docker Image**: `ashrithps/runner-claude-app:latest`
4. **Port Configuration**: 
   - Container Port: 3000
   - Published Port: 3000 (or your preferred port)

### Volume Configuration:
- **Volume Name**: `runner-sqlite-data`
- **Mount Path**: `/app/data`
- **Type**: Named Volume

### Environment Variables:
```
NODE_ENV=production
DATABASE_PATH=/app/data/database.sqlite
RESEND_API_KEY=your_resend_key_here
FROM_EMAIL=your_email@domain.com
```

### Using Configuration File:

Alternatively, you can use the included `dokploy.json` file which contains all the configuration settings.

## Step 4: Health Checks

The application includes built-in health checks at `/api/debug/test-connection` that verify:
- SQLite database connectivity
- Application startup status
- Database schema initialization

## Step 5: Volumes and Persistence

The SQLite database will be stored in the `/app/data` directory inside the container. This directory is:
- Declared as a VOLUME in the Dockerfile
- Mounted to a named volume `runner-sqlite-data`
- Persistent across deployments and container restarts

## Step 6: Deployment Process

1. Push code to the master branch
2. GitHub Actions builds and pushes Docker image
3. In Dokploy, trigger a re-deployment to pull the latest image
4. The application will start with the persistent SQLite database

## Advantages of This Approach

✅ **No build on production server** - Prevents resource exhaustion
✅ **Faster deployments** - Pre-built images deploy quickly
✅ **Consistent environments** - Same image across all deployments  
✅ **Multi-architecture support** - Works on AMD64 and ARM64
✅ **Persistent data** - SQLite database survives deployments
✅ **Health monitoring** - Built-in health checks for reliability

## Troubleshooting

- **Image pull errors**: Verify Docker Hub credentials and image name
- **Database issues**: Check volume mount path `/app/data`
- **Environment variables**: Ensure all required env vars are set
- **Health check failures**: Check `/api/debug/test-connection` endpoint

## Image Updates

To deploy updates:
1. Push to master branch (triggers new image build)
2. In Dokploy, redeploy the application to pull latest image
3. Database and volumes remain persistent