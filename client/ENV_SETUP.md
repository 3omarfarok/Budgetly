# Budgetly Environment Setup

This project uses Vite's environment variable system to manage different configurations for development and production.

## Quick Setup

### Option 1: Automatic (Recommended)
Run the setup script:
```powershell
npm run setup:env
```

### Option 2: Manual Setup

#### For Development (localhost):
```powershell
# In the client directory
Copy-Item .env.development.example .env.development.local
```

#### For Production (Vercel):
```powershell
# In the client directory
Copy-Item .env.production.example .env.production.local
```

## Environment Files

- **`.env.development.local`** - Used when running `npm run dev`
  - API URL: `http://localhost:5000/api`
  
- **`.env.production.local`** - Used when running `npm run build`
  - API URL: `https://budgetly-p62u.vercel.app/api`

## How It Works

Vite automatically loads the correct environment file based on the mode:
- `npm run dev` → Uses `.env.development.local`
- `npm run build` → Uses `.env.production.local`

## URLs

- **Frontend (Production)**: https://budgetly-three.vercel.app
- **Backend API (Production)**: https://budgetly-p62u.vercel.app/api
- **Backend API (Development)**: http://localhost:5000/api
