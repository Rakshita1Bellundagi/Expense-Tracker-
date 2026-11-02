# Expense Tracker API - Render.com Deployment

## Important Notes

- **Runtime**: Node.js 18+  
- **Root Directory**: `api/`  
- **Build Command**: `npm install`  
- **Start Command**: `node index.js`  
- **Health Check Path**: `/api/health`

## Environment Variables (set in Render dashboard)

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DB_PATH` | `./data` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |

> **Note**: The `api/` folder uses a file-based SQLite + JSON store.  
> Render's free tier **ephemeral filesystem** means data resets on each deploy/restart.  
> For persistent data, upgrade to a paid plan with a persistent disk, or migrate to PostgreSQL.

