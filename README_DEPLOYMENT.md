# Deployment Guide for KingsHMS

This project is configured with GitHub Actions for automated CI/CD.

## 🚀 Deployment Targets

- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Railway](https://railway.app)

## 🛠️ GitHub Actions Setup

To enable automated deployments, you must add the following **Secrets** to your GitHub repository:

### 1. Vercel (Frontend)

Go to **Settings > Secrets and variables > Actions** in your GitHub repo and add:

- `VERCEL_TOKEN`: Your Vercel Personal Access Token.
- `VERCEL_ORG_ID`: Your Vercel Team ID (or User ID if personal).
- `VERCEL_PROJECT_ID`: Your Vercel Project ID.

> You can find Org/Project IDs in your `.vercel/project.json` after running `vercel link` locally, or in the Project Settings on Vercel dashboard.

### 2. Railway (Backend)

Add:

- `RAILWAY_TOKEN`: Your Railway API Token.

## 🔄 Workflow Logic

- **On Push/PR to `main`**:
  - Builds the Frontend (root) using Node 20.
  - Builds the Backend (`functions` folder).
  - Runs any available lint/test scripts.
- **On Merge to `main`**:
  - Automatically deploys the Frontend to Vercel production.
  - Automatically deploys the Backend to Railway.

## 📦 Local Deployment

If you prefer manual deployments, you can still use:

- **Frontend**: `npm run deploy` (currently configured for gh-pages in package.json) or `vercel --prod`.
- **Backend**: `cd functions && npm run deploy` (for Firebase) or `railway up`.

## ⚙️ Configuration Files

- `.github/workflows/main.yml`: The CI/CD pipeline definition.
- `vercel.json`: Vercel-specific build configuration.
- `functions/package.json`: Backend build and deploy scripts.
