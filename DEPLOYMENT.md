# 🚀 Deployment Guide — RuralCare (Health Insight Hub)

> A step-by-step guide to **safely** deploy this project using **GitHub** + **Render** (recommended) or **Vercel**.

---

## ✅ Project Is Deployment-Ready

All security and production-readiness changes have already been applied:

| What | Status |
|------|--------|
| Hardcoded API keys removed | ✅ Done — reads from env vars only |
| Hardcoded SMTP credentials removed | ✅ Done — reads from env vars only |
| Session secret from env var | ✅ Done — `SESSION_SECRET` env var |
| Secure cookies in production | ✅ Done — `secure: true` when `NODE_ENV=production` |
| dotenv installed & wired | ✅ Done — auto-loads `.env` on startup |
| `.env.example` template created | ✅ Done — copy to `.env` and fill values |
| `.gitignore` updated | ✅ Done — excludes `.env`, `health-data.db`, logs |
| Replit-specific plugins removed | ✅ Done — clean Vite config |
| Cross-platform npm scripts | ✅ Done — works on Windows, Linux, macOS |
| DB path configurable | ✅ Done — `DB_PATH` env var supported |
| Production build verified | ✅ Done — `npm run build` succeeds |

### Environment Variables

All config is driven by environment variables. See `.env.example` for the full list:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Google Gemini AI API key |
| `SESSION_SECRET` | **Yes** (production) | Random string for session signing |
| `SMTP_USER` | No | Gmail address for email alerts |
| `SMTP_PASS` | No | Gmail app password for email alerts |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | Auto | Set to `production` by the build; `development` in `.env` |
| `DB_PATH` | No | Custom SQLite path (default: `./health-data.db`) |

### Local Development

```powershell
# 1. Copy the env template and fill in your keys
cp .env.example .env
# Edit .env with your values

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:5000
```

---

## 📦 Step 1: Push to GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `Health-Insight-Hub`
3. **Visibility:** `Private` (recommended — keeps code safe)
4. Do NOT initialize with README (we already have code)
5. Click **Create repository**

### 1.2 Push Your Code

Open a terminal in VS Code (`Ctrl + ~`) and run:

```powershell
cd "c:\Users\karth\Downloads\ReplitExport-thousip683\Health-Insight-Hub"

# Initialize git (skip if already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RuralCare Health Dashboard"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Health-Insight-Hub.git

# Push
git branch -M main
git push -u origin main
```

> 💡 If prompted for credentials, use your GitHub username and a **Personal Access Token** (not password).  
> Create one at: **GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token**

---

## 🟢 Option A: Deploy on Render (RECOMMENDED)

**Best for this project** — Render supports Node.js + Express + SQLite natively.

### Why Render?
- ✅ Free tier available
- ✅ Supports full-stack Node.js apps
- ✅ SQLite works out of the box
- ✅ Auto-deploys when you push to GitHub
- ✅ Environment variables UI
- ✅ Custom domains supported

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Click **Get Started for Free**
3. Sign up with your **GitHub account** (easiest)

### 2.2 Create a New Web Service

1. Click **New +** → **Web Service**
2. Click **Connect a repository** → Select `Health-Insight-Hub`
3. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `health-insight-hub` |
| **Region** | `Singapore` (closest to India) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### 2.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable** for each:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` | Render uses port 10000 |
| `GEMINI_API_KEY` | `your-gemini-api-key` | Google AI key |
| `SESSION_SECRET` | `random-string-here` | Session signing secret |
| `SMTP_USER` | `your-email@gmail.com` | Gmail for alerts (optional) |
| `SMTP_PASS` | `your-app-password` | Gmail app password (optional) |

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait 3–5 minutes for the build
3. Your app will be live at: `https://health-insight-hub.onrender.com`

### 2.5 (Optional) Add Persistent Storage

> Without this, your SQLite database resets on every deploy.

1. Go to your service dashboard → **Disks** tab
2. Click **Add Disk**:
   - **Name:** `data`
   - **Mount Path:** `/data`
   - **Size:** `1` GB
3. Add environment variable: `DB_PATH` = `/data/health-data.db`
4. Redeploy — the app already reads `DB_PATH` from the environment

### 2.6 Auto-Deploy on Git Push

Render auto-deploys whenever you push to `main`:

```powershell
# Make changes, then:
git add .
git commit -m "update feature"
git push
# → Render automatically rebuilds and deploys!
```

---

## 🔺 Option B: Deploy on Vercel

> ⚠️ **Important Limitation:** Vercel is designed for **frontend/serverless** apps. Your project uses **Express + SQLite** which has limitations on Vercel:
> - SQLite does NOT persist on Vercel (serverless = no filesystem)
> - Express needs to be wrapped as a serverless function
> - **Recommended only if you switch to a cloud database (e.g., Turso, PlanetScale)**

### If you still want Vercel (frontend only + separate backend):

### 3.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your **GitHub account**

### 3.2 Import Project

1. Click **Add New...** → **Project**
2. Select your `Health-Insight-Hub` repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` |
| **Build Command** | `cd .. && npm install && npx vite build --outDir dist/public` |
| **Output Directory** | `../dist/public` |

### 3.3 Add Environment Variables

In Vercel project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com` |

### 3.4 Deploy Backend Separately

Since Vercel can't run Express + SQLite, deploy the backend on **Render** (Option A above) and point the Vercel frontend to it.

You'd need to update the frontend API calls to use the full backend URL instead of relative paths.

### 3.5 Alternative — Vercel Serverless (Advanced)

To run the full app on Vercel, you'd need to:

1. Convert Express routes to Vercel serverless functions (`api/` directory)
2. Replace SQLite with a cloud database (Turso, Neon, PlanetScale)
3. This is a significant refactor — **not recommended for this project**

---

## 🏆 Comparison Table

| Feature | Render (Recommended) | Vercel |
|---------|---------------------|--------|
| Full-stack support | ✅ Native | ❌ Frontend only |
| Express.js | ✅ Works | ⚠️ Needs serverless wrapper |
| SQLite | ✅ Works | ❌ No filesystem |
| Free tier | ✅ Yes | ✅ Yes |
| Auto-deploy | ✅ On git push | ✅ On git push |
| Custom domain | ✅ Free | ✅ Free |
| SSL (HTTPS) | ✅ Automatic | ✅ Automatic |
| Sleep on inactivity | ⚠️ After 15 min (free) | ❌ No sleep |
| Setup difficulty | Easy | Hard (for this project) |

**Verdict: Use Render. It works with your project as-is, no changes needed.**

---

## 🔑 How to Get API Keys

### Gemini API Key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy the key → Use as `GEMINI_API_KEY`

### Gmail App Password (for email alerts)
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** → **Other** → Name it "RuralCare"
3. Copy the 16-character password → Use as `SMTP_PASS`
4. Your Gmail address → Use as `SMTP_USER`

> ⚠️ You need **2-Step Verification** enabled on your Google account first.

---

## 🧪 Test Before Deploying

Build and test locally:

```powershell
# Build production bundle
npm run build

# Test production mode
$env:NODE_ENV="production"; $env:PORT="5000"; node dist/index.cjs
```

Open `http://localhost:5000` — if it works, it will work on Render.

---

## 🔄 Updating After Deployment

Whenever you make changes:

```powershell
git add .
git commit -m "describe your changes"
git push
```

Render/Vercel automatically redeploys within 2–5 minutes.

---

## 🛟 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails with `better-sqlite3` error | Add `npm rebuild better-sqlite3` to build command |
| "Cannot find module" error | Run `npm install` before `npm run build` |
| Blank white page | Check `dist/public/index.html` exists after build |
| API calls return 404 | Ensure `NODE_ENV=production` is set |
| Database empty after redeploy | Add persistent disk (Render) |
| Email not sending | Check `SMTP_USER` and `SMTP_PASS` env vars |
| Site slow to load (first visit) | Free tier sleeps after 15 min — first load takes ~30s |
| Port error on Render | Set `PORT=10000` in environment variables |

---

## 📋 Quick Checklist

- [x] Removed hardcoded API keys from code
- [x] Session secret reads from environment variable
- [x] Secure cookies enabled in production
- [x] dotenv installed and configured
- [x] `.env.example` created as template
- [x] `.gitignore` excludes `.env`, `health-data.db`, logs
- [x] Replit-specific Vite plugins removed
- [x] Cross-platform npm scripts (no Unix-only syntax)
- [x] DB path configurable via `DB_PATH` env var
- [x] Production build tested and passing
- [ ] Pushed code to GitHub (private repo)
- [ ] Created Render web service
- [ ] Set all environment variables on Render
- [ ] Tested the live URL
- [ ] (Optional) Added persistent disk for database
- [ ] (Optional) Added custom domain

---

## 💰 Cost Summary

| Service | Cost |
|---------|------|
| GitHub (private repo) | **Free** |
| Render (free tier) | **Free** |
| Render (persistent disk) | $0.25/GB/month |
| Gemini API | **Free** (generous limits) |
| Gmail SMTP | **Free** |
| Custom domain | ~$10/year (optional) |

**Total: $0/month** (without persistent disk or custom domain)

---

*Guide created for Health Insight Hub (RuralCare) — March 2026*
