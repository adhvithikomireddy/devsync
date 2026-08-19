# DevSync — Production Deployment Guide

This guide covers 4 easy ways to deploy DevSync to production:

1. **[Option 1: Free 1-Click Deployment on Render](#option-1-free-deployment-on-render)** (Easiest)
2. **[Option 2: Railway / Fly.io](#option-2-railway--flyio)**
3. **[Option 3: 1-Command Docker Deployment (VPS, AWS, DigitalOcean)](#option-3-docker--docker-compose)**
4. **[Option 4: Decoupled Deployment (Vercel Frontend + Render Backend)](#option-4-decoupled-deployment-vercel--render)**

---

## Prerequisites: MongoDB Atlas Database (Free)

DevSync includes an automatic in-memory MongoDB fallback for local development, but for persistent production data:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a **Free M0 Cluster**.
2. Click **Database Access** -> Add Database User (e.g. `admin`, create password).
3. Click **Network Access** -> Add IP Address -> Select `0.0.0.0/0` (Allow Access from Anywhere).
4. Click **Database** -> **Connect** -> Drivers (Node.js) -> Copy connection string:
   ```env
   mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/devsync?retryWrites=true&w=majority
   ```

---

## Option 1: Free Deployment on Render (Recommended)

Render hosts full Node.js web services with WebSockets and builds static frontends.

### Steps:
1. Push your DevSync code to a **GitHub** or **GitLab** repository.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name:** `devsync-app`
   - **Environment:** `Node`
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** `Free`
6. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables client static bundle serving |
   | `PORT` | `5000` | Port for Express & WebSockets |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_secret_key_here` | Any long random string for auth tokens |
   | `GEMINI_API_KEY` | `AIzaSy...` | *(Optional)* Google Gemini API key |
7. Click **Create Web Service**.
8. Once deployed, Render will provide a live URL like `https://devsync-app.onrender.com`!

---

## Option 2: Railway / Fly.io

Railway supports zero-configuration Node.js and MongoDB out of the box.

### Steps:
1. Go to [Railway.app](https://railway.app) and create a new project.
2. Click **Deploy from GitHub repo** and select your repository.
3. Add a **MongoDB plugin** or provide your MongoDB Atlas `MONGO_URI`.
4. In Project Settings, set Build Command to:
   ```bash
   npm run install:all && npm run build
   ```
5. Set Start Command to:
   ```bash
   node server/index.js
   ```
6. Add environment variables: `NODE_ENV=production`, `PORT=5000`, `JWT_SECRET=supersecret`, `MONGO_URI=...`.
7. Generate a public domain under **Networking**.

---

## Option 3: Docker & Docker Compose (VPS / AWS EC2 / DigitalOcean)

If you have a Linux VPS (Ubuntu/Debian) or cloud VM:

### 1-Command Startup:
```bash
# Clone repository
git clone https://github.com/your-username/devsync.git
cd devsync

# Launch complete stack with MongoDB container
docker-compose up -d --build
```

DevSync is now live on `http://YOUR_SERVER_IP:5000`!

---

## Option 4: Decoupled Deployment (Vercel + Render)

If you prefer deploying the Vite React frontend on Vercel and the Node.js API on Render/Railway:

### 1. Deploy Backend:
- Deploy `/server` on Render with `MONGO_URI` and `JWT_SECRET`.
- Get your backend URL: e.g. `https://devsync-api.onrender.com`.
- Set `CLIENT_URL=https://your-frontend.vercel.app`.

### 2. Deploy Frontend on Vercel:
- Import repository on [Vercel.com](https://vercel.com).
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set Environment Variable: `VITE_API_URL=https://devsync-api.onrender.com`

---

## Production Checklist

- [x] Secure `JWT_SECRET` configured in environment
- [x] MongoDB Atlas connection string with whitelist IP `0.0.0.0/0`
- [x] Full-mesh WebRTC STUN servers configured (`stun.l.google.com:19302`)
- [x] Sandboxed child process execution bounded with 10s timeouts
- [x] Vite production bundle minified and served under `/client/dist`
