# Deployment Guide

This guide covers how to deploy the Community Task Runner App to different platforms.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project**: Set up and configured with the database schema
2. **Environment Variables**: Required for all deployments
3. **Resend API Key**: For email notifications (optional)

### Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_sender_email
```

## Replit Deployment

### Method 1: Fork from GitHub

1. **Fork the Repository**: Go to [https://github.com/ashrithps/runner-claude-app](https://github.com/ashrithps/runner-claude-app) and fork it to your account

2. **Create Replit Project**:
   - Go to [replit.com](https://replit.com)
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Paste your forked repository URL
   - Choose "Next.js" as the template

3. **Configure Environment Variables**:
   - In your Repl, go to "Tools" → "Secrets"
   - Add the following secrets:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     RESEND_API_KEY
     FROM_EMAIL
     ```

4. **Install Dependencies**:
   ```bash
   npm install
   ```

5. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```

### Method 2: Direct Upload

1. **Create New Repl**:
   - Go to replit.com
   - Create a new "Next.js" Repl

2. **Upload Project Files**:
   - Download the project from GitHub as ZIP
   - Extract and upload all files to your Repl

3. **Follow steps 3-5 from Method 1**

### Replit Configuration Tips

- **Custom Domain**: Upgrade to Replit Pro to use a custom domain
- **Always On**: Enable "Always On" for production apps (paid feature)
- **Database**: Ensure your Supabase project is accessible from Replit
- **HTTPS**: Replit automatically provides HTTPS for all deployments

## Coolify Deployment

### Prerequisites for Coolify

- Self-hosted Coolify instance or Coolify Cloud account
- Docker support enabled
- Domain name (optional but recommended)

### Deployment Steps

1. **Connect Repository**:
   - In Coolify dashboard, go to "Projects"
   - Create new project or select existing
   - Add new "Application"
   - Choose "Public Repository"
   - Enter: `https://github.com/ashrithps/runner-claude-app`

2. **Configure Build Settings**:
   - **Build Pack**: Choose "nixpacks" or "dockerfile"
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`

3. **Environment Variables**:
   - In the application settings, go to "Environment Variables"
   - Add all required environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_value
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
     RESEND_API_KEY=your_value
     FROM_EMAIL=your_value
     ```

4. **Domain Configuration**:
   - Go to "Domains" section
   - Add your custom domain or use provided subdomain
   - Enable SSL/TLS (automatically handled by Coolify)

5. **Deploy**:
   - Click "Deploy" button
   - Monitor the build logs
   - Once deployed, your app will be available at the configured domain

### Coolify Advanced Configuration

#### Resource Limits
```yaml
# In coolify.yml (optional)
resources:
  limits:
    memory: 512Mi
    cpu: 500m
  requests:
    memory: 256Mi
    cpu: 250m
```

#### Health Checks
- **Health Check URL**: `/api/health` (you may need to create this endpoint)
- **Health Check Interval**: 30 seconds
- **Health Check Timeout**: 10 seconds

#### Auto-deployment
- Enable "Auto Deploy" to automatically deploy when you push to main branch
- Configure webhooks for GitHub integration

## General Production Considerations

### Database Setup

1. **Run the SQL Schema**: Execute the `supabase-schema.sql` file in your Supabase SQL editor

2. **Enable RLS**: Ensure Row Level Security is enabled for all tables

3. **Configure Auth**: Set up email authentication in Supabase Auth settings

### Performance Optimization

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Build Optimization**: The app is configured for optimal builds
3. **Static Assets**: Ensure all static assets are properly served
4. **Caching**: Configure appropriate caching headers

### Security Checklist

- [ ] Environment variables are properly set
- [ ] Supabase RLS policies are active
- [ ] HTTPS is enabled
- [ ] No sensitive data in client-side code
- [ ] API routes are protected where necessary

### Monitoring

- **Logs**: Monitor application logs through your platform's logging system
- **Error Tracking**: Consider integrating Sentry or similar services
- **Performance**: Monitor Core Web Vitals and user experience
- **Database**: Monitor Supabase performance and usage

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Runtime Errors**:
   - Verify environment variables are set correctly
   - Check Supabase connection and permissions
   - Monitor browser console for client-side errors

3. **Database Issues**:
   - Verify Supabase URL and API key
   - Check RLS policies
   - Ensure database schema is properly applied

### Platform-Specific Issues

#### Replit
- **Memory Limits**: Free tier has limited memory
- **Sleep Mode**: Free repls go to sleep after inactivity
- **Network**: Some external services may be blocked

#### Coolify
- **Build Context**: Ensure Dockerfile is in the root directory
- **Port Binding**: Verify the app listens on the correct port
- **Resource Limits**: Adjust if the app is being killed due to resource constraints

## Support

For deployment-specific issues:
- **Replit**: Check [Replit Docs](https://docs.replit.com)
- **Coolify**: Check [Coolify Documentation](https://coolify.io/docs)
- **Next.js**: Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

For app-specific issues, refer to the main README.md or create an issue on GitHub.