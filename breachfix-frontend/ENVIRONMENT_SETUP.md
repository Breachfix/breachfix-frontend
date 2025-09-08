# Environment Setup for Vite Frontend

This document explains how to set up environment variables for the Breachfix frontend application using Vite.

## Quick Setup

1. **Create a `.env` file** in the `breachfix-frontend` directory
2. **Copy the environment variables** from the template below
3. **Update the values** according to your setup

## Environment Variables Template

Create a `.env` file with the following content:

```bash
# Vite Frontend Environment Configuration
# All variables must be prefixed with VITE_ to be accessible in the frontend

# API Configuration
VITE_API_BASE_URL=http://localhost:7001/api/v3
VITE_API_ORIGIN=http://localhost:7001
VITE_BASE_URL=http://localhost:5173
VITE_CLIENT_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173

# Stripe Configuration (REQUIRED FOR DONATIONS)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Development Configuration
VITE_NODE_ENV=development
VITE_DEV_MODE=true

# Feature Flags
VITE_ENABLE_DONATIONS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true

# AllBibles API Configuration
VITE_ALLBIBLES_API_URL=http://localhost:7001/api/v3/allbibles
VITE_ALLBIBLES_ENABLE_PARALLEL=true
VITE_ALLBIBLES_ENABLE_CHANGES=true
VITE_ALLBIBLES_ENABLE_EDITS=true

# Media API Configuration
VITE_MEDIA_API_URL=http://localhost:7001/api/v3/media
VITE_MEDIA_UPLOAD_URL=http://localhost:7001/api/v3/media/upload

# Authentication Configuration
VITE_AUTH_API_URL=http://localhost:7001/api/v3/auth
VITE_AUTH_REDIRECT_URL=http://localhost:5173/auth

# Analytics Configuration (optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_MIXPANEL_TOKEN=

# Social Media Configuration (optional)
VITE_TWITTER_HANDLE=
VITE_FACEBOOK_PAGE=
VITE_INSTAGRAM_HANDLE=

# Contact Information
VITE_CONTACT_EMAIL=support@breachfix.com
VITE_SUPPORT_EMAIL=support@breachfix.com

# App Configuration
VITE_APP_NAME=Breachfix
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Production-grade Bible API system with comprehensive features
```

## Important Notes

### Vite Environment Variables
- **All environment variables must be prefixed with `VITE_`** to be accessible in the frontend
- Variables without the `VITE_` prefix will not be available in the browser
- This is a security feature to prevent accidentally exposing sensitive backend variables

### Security Considerations
- **Never put secret keys in frontend environment variables**
- Only put public keys and non-sensitive configuration in the frontend `.env`
- Secret keys (like `STRIPE_SECRET_KEY`, `JWT_SECRET`) should only be in your backend `.env`

### Backend Environment Variables
Your backend should have its own `.env` file with:

```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/breachfix

# Server Configuration
PORT=7001
NODE_ENV=development

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_ACCESS_SECRET=your-super-secret-access-key-here

# Stripe Configuration (REQUIRED FOR DONATIONS)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URLs
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
API_ORIGIN=http://localhost:7001

# Internal API Key for protected routes
INTERNAL_API_KEY=your-internal-api-key-here
```

## Development vs Production

### Development
- Use `http://localhost:5173` for frontend URLs
- Use `http://localhost:7001` for backend URLs
- Enable debug mode and development features

### Production
- Update URLs to your production domains
- Disable debug mode
- Use production Stripe keys
- Set `NODE_ENV=production`

## Vite Configuration

The `vite.config.ts` has been updated to include:
- **Proxy configuration** for API calls
- **Environment variable prefix** (`VITE_`)
- **Development server** on port 5173
- **CORS handling** for API requests

## Usage in Code

Environment variables are accessed through the configuration file:

```typescript
import { ENV, getApiUrl, isDevelopment } from '../config/environment';

// Use environment variables
const apiUrl = ENV.API_BASE_URL;
const isDev = isDevelopment();
const fullApiUrl = getApiUrl('/allbibles');
```

## Troubleshooting

### Environment Variables Not Working
1. Make sure variables start with `VITE_`
2. Restart the development server after changing `.env`
3. Check the browser console for validation warnings

### API Connection Issues
1. Verify backend is running on port 7001
2. Check CORS configuration in backend
3. Verify proxy settings in `vite.config.ts`

### Stripe Integration Issues
1. Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set
2. Use test keys for development
3. Check Stripe dashboard for key validity

## File Structure

```
breachfix-frontend/
├── .env                    # Your environment variables (create this)
├── .env.example           # Template (if created)
├── vite.config.ts         # Vite configuration
├── src/
│   ├── config/
│   │   └── environment.ts # Environment configuration
│   └── utils/
│       └── api.ts         # API configuration
└── ENVIRONMENT_SETUP.md   # This file
```

## Next Steps

1. Create your `.env` file with the template above
2. Update the values according to your setup
3. Start the development server: `npm run dev`
4. Verify the configuration in the browser console
