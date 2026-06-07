# 🚀 BlogBubble — Deployment Guide

> Complete guide to deploying the BlogBubble MERN stack application.
> Choose from **3 deployment modes** depending on your needs.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [File Reference Table](#file-reference-table)
- [MODE 1: Local Development (Docker)](#mode-1-local-development-docker)
- [MODE 2: VPS Production (Self-Hosted)](#mode-2-vps-production-self-hosted)
- [MODE 3: Cloud Services (Atlas + Redis Cloud)](#mode-3-cloud-services-atlas--redis-cloud)
- [CORS Configuration (Cross-Domain Deployments)](#cors-configuration-cross-domain-deployments)
- [Deployment Comparison](#deployment-comparison)
- [Recommended Mode for Portfolio Projects](#recommended-mode-for-portfolio-projects)
- [Common Commands Reference](#common-commands-reference)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

BlogBubble is a **MERN monorepo** with the following structure:

```
blogApp/
├── index.js              # Express API entry point (backend root)
├── config/               # Redis client config
├── controllers/          # Route controllers
├── middlewares/           # Auth middleware
├── models/               # Mongoose models
├── routes/               # Express routes (/api/auth, /api/blogs, /api/users)
├── services/             # Business logic (file storage, etc.)
├── validators/           # Request validators
├── public/               # Static uploads (images, profiles)
├── client/               # React + Vite frontend (Tailwind CSS)
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── Dockerfile            # Backend Docker image
├── docker-compose.yml    # Mode 1 — Local development
├── nginx/                # Nginx reverse proxy configs
└── package.json          # Backend dependencies
```

```mermaid
graph LR
    A["Client (React + Vite)"] -->|API Requests| B["Nginx Reverse Proxy"]
    B --> C["Express API (:3000)"]
    C --> D["MongoDB"]
    C --> E["Redis Cache"]
    C --> F["File Storage (/public)"]
```

---

## Prerequisites

| Requirement | Mode 1 (Local) | Mode 2 (VPS) | Mode 3 (Cloud) |
|---|:---:|:---:|:---:|
| Docker & Docker Compose | ✅ Required | ✅ Required | ✅ Required |
| Node.js 20+ | Optional* | Optional* | Optional* |
| A domain name | ❌ | ✅ Required | ✅ Required |
| MongoDB Atlas account | ❌ | ❌ | ✅ Required |
| Redis Cloud account | ❌ | ❌ | ✅ Required |
| Vercel account | ❌ | ✅ Recommended | ✅ Recommended |
| VPS (Ubuntu 22.04+) | ❌ | ✅ Required | ✅ Required |

> [!NOTE]
> *Node.js 20+ is only needed if you want to run the backend or frontend **outside** of Docker (e.g., bare-metal local dev). All Docker-based modes bundle Node.js inside the container.

### Install Docker (on VPS)

```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in, then verify:
docker --version
docker compose version
```

---

## File Reference Table

The table below shows which configuration files are used by each deployment mode. Files marked ✅ are **required** for that mode. Files marked ❌ are **not used**.

| File | Purpose | Mode 1 (Local) | Mode 2 (VPS) | Mode 3 (Cloud) |
|---|---|:---:|:---:|:---:|
| `Dockerfile` | Backend container image | ✅ | ✅ | ✅ |
| `client/Dockerfile` | Frontend container image | ✅ | ❌ | ❌ |
| `docker-compose.yml` | Local dev orchestration | ✅ | ❌ | ❌ |
| `docker-compose.production.yml` | VPS production orchestration | ❌ | ✅ | ❌ |
| `docker-compose.cloud.yml` | Cloud services orchestration | ❌ | ❌ | ✅ |
| `.env.docker` | Environment vars (local) | ✅ | ❌ | ❌ |
| `.env.production` | Environment vars (VPS) | ❌ | ✅ | ❌ |
| `.env.cloud` | Environment vars (cloud) | ❌ | ❌ | ✅ |
| `nginx/nginx.conf` | Nginx config (production) | ❌ | ✅ | ✅ |
| `nginx/nginx.local.conf` | Nginx config (local dev) | ✅ | ❌ | ❌ |

> [!TIP]
> Each mode is **fully independent**. You only need the files listed for your chosen mode. The `.env.*.example` files are provided as templates — copy them and fill in your values.

---

## MODE 1: Local Development (Docker)

> **Best for:** Day-to-day development on your machine. Everything runs in Docker with hot reloading.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ishaansaxena25/BlogApp.git
cd BlogApp
```

### Step 2 — Configure Environment Variables

A `.env.docker` file should already exist in the repo (or use the example as a reference). If it doesn't exist, create one:

```bash
# Copy from the example template
cp .env.docker.example .env.docker
```

The local `.env.docker` should look like this:

```ini
# .env.docker
PORT=3000
NODE_ENV=development

# MongoDB — uses the Docker service name as the hostname
MONGODB_URI=mongodb://mongodb:27017/blogbubble

# JWT
JWT_SECRET=local_dev_secret_change_in_production
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_DIR=public/uploads
PROFILE_UPLOAD_DIR=public/profile
MAX_FILE_SIZE=5242880

# Redis — uses the Docker service name as the hostname
REDIS_URL=redis://redis:6379
CACHE_TTL_SECONDS=60
```

> [!IMPORTANT]
> In Docker Compose, services communicate using **service names** as hostnames. Use `mongodb` (not `localhost`) for MongoDB and `redis` (not `localhost`) for Redis. These names are defined in `docker-compose.yml`.

### Step 3 — Build and Start All Containers

```bash
docker-compose up --build
```

This starts **4 containers**:
1. **backend** — Express API on port `3000`
2. **client** — React + Vite dev server on port `5173`
3. **mongodb** — MongoDB on port `27017`
4. **redis** — Redis on port `6379`

### Step 4 — Access the Application

| Service | URL |
|---|---|
| Frontend (React) | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:3000](http://localhost:3000) |
| API Documentation | [http://localhost:3000/api](http://localhost:3000/api) |
| MongoDB | `mongodb://localhost:27017` (via Compass) |

### Step 5 — Hot Reloading

- **Backend:** The backend container uses `nodemon` (via `npm run dev`). Any changes to `.js` files in the project root are reflected immediately via Docker volume mounts.
- **Frontend:** The Vite dev server supports HMR (Hot Module Replacement) out of the box. Changes to files in `client/src/` update instantly in the browser.

> [!NOTE]
> Volume mounts in `docker-compose.yml` bind your local source code into the containers. You edit files locally with your IDE, and the running containers pick up changes automatically.

### Step 6 — Stopping the Application

```bash
# Stop containers (preserves data volumes)
docker-compose down

# Stop containers AND remove data volumes (fresh start)
docker-compose down -v
```

> [!CAUTION]
> Using `-v` removes all Docker volumes, including your **MongoDB data**. Only use this when you want a completely clean slate.

---

## MODE 2: VPS Production (Self-Hosted)

> **Best for:** Portfolio projects, small production apps. Everything runs on a single VPS with Docker. Frontend is deployed to Vercel for best performance.

### Step 1 — Provision and Access Your VPS

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y
```

Install Docker using the commands from the [Prerequisites](#install-docker-on-vps) section.

### Step 2 — Clone the Repository

```bash
git clone https://github.com/ishaansaxena25/BlogApp.git
cd BlogApp
```

### Step 3 — Configure Environment Variables

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in the values:

```ini
# .env.production
PORT=3000
NODE_ENV=production

# MongoDB — uses Docker service name, with authentication
MONGODB_URI=mongodb://blogbubble_admin:YOUR_STRONG_MONGO_PASSWORD@mongodb:27017/blogbubble?authSource=admin
MONGO_INITDB_ROOT_USERNAME=blogbubble_admin
MONGO_INITDB_ROOT_PASSWORD=YOUR_STRONG_MONGO_PASSWORD

# JWT — generate a strong secret (see Step 4)
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_DIR=public/uploads
PROFILE_UPLOAD_DIR=public/profile
MAX_FILE_SIZE=5242880

# Redis — with password authentication
REDIS_URL=redis://:YOUR_STRONG_REDIS_PASSWORD@redis:6379
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD

# CORS — your Vercel frontend domain
CORS_ORIGIN=https://yourdomain.com

# Cookie settings for cross-domain
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

### Step 4 — Generate Secure Secrets

```bash
# Generate a strong JWT secret
openssl rand -base64 64
# Copy the output and paste it as JWT_SECRET

# Generate a strong MongoDB password
openssl rand -base64 32
# Copy the output and paste it as MONGO_INITDB_ROOT_PASSWORD
# (also update it in MONGODB_URI)

# Generate a strong Redis password
openssl rand -base64 32
# Copy the output and paste it as REDIS_PASSWORD
# (also update it in REDIS_URL)
```

> [!WARNING]
> **Never** use default or weak passwords in production. Each secret above should be unique and randomly generated. Never commit `.env.production` to version control.

### Step 5 — Set CORS_ORIGIN

Set `CORS_ORIGIN` to the exact domain where your frontend will be hosted:

```ini
# If your frontend is on Vercel:
CORS_ORIGIN=https://blogbubble.vercel.app

# If you have a custom domain:
CORS_ORIGIN=https://www.yourdomain.com
```

### Step 6 — SSL/HTTPS Setup

#### Option A: Certbot (Let's Encrypt — Free, Recommended)

```bash
# Install Certbot
sudo apt install certbot -y

# Obtain certificates (make sure your domain's DNS A record points to this VPS)
sudo certbot certonly --standalone -d api.yourdomain.com

# Certificates are saved to:
#   /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
#   /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

Copy certificates to the project:

```bash
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*.pem
```

#### Option B: Manual Certificates

If you have certificates from another provider, place them in `nginx/ssl/`:

```bash
mkdir -p nginx/ssl
cp /path/to/your/fullchain.pem nginx/ssl/fullchain.pem
cp /path/to/your/privkey.pem nginx/ssl/privkey.pem
```

### Step 7 — Enable HTTPS in Nginx

Open `nginx/nginx.conf` and uncomment the HTTPS server block:

```nginx
# Uncomment this entire block for SSL/HTTPS:
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /app/public/uploads/;
    }

    location /profile/ {
        alias /app/public/profile/;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### Step 8 — Build and Deploy

```bash
docker-compose -f docker-compose.production.yml up -d --build
```

> [!NOTE]
> The `-d` flag runs containers in **detached mode** (background). The `--build` flag ensures images are rebuilt with the latest code.

Verify everything is running:

```bash
docker-compose -f docker-compose.production.yml ps
```

### Step 9 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and import the `BlogApp` repository
2. Set the **Root Directory** to `client`
3. Set the **Framework Preset** to `Vite`
4. Add the following **Environment Variable**:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://api.yourdomain.com` |

5. Click **Deploy**

> [!IMPORTANT]
> `VITE_API_URL` is baked into the frontend at **build time** (all `VITE_` prefixed variables are). If you change the backend URL later, you must **redeploy** the frontend on Vercel.

### Step 10 — Monitoring & Logs

```bash
# Follow logs for all containers
docker-compose -f docker-compose.production.yml logs -f

# Follow logs for a specific service
docker-compose -f docker-compose.production.yml logs -f backend

# Check container resource usage
docker stats
```

### Step 11 — MongoDB Backup Strategy

```bash
# Create a backup
docker-compose -f docker-compose.production.yml exec mongodb \
  mongodump --db blogbubble --archive=/data/backup/blogbubble-$(date +%F).archive

# Restore from backup
docker-compose -f docker-compose.production.yml exec mongodb \
  mongorestore --archive=/data/backup/blogbubble-2025-01-15.archive
```

Set up a **cron job** for automated daily backups:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2:00 AM):
0 2 * * * cd /path/to/BlogApp && docker-compose -f docker-compose.production.yml exec -T mongodb mongodump --db blogbubble --archive=/data/backup/blogbubble-$(date +\%F).archive
```

---

## MODE 3: Cloud Services (Atlas + Redis Cloud)

> **Best for:** Production apps that need to scale. Database and cache are managed by cloud providers with automatic backups, monitoring, and scaling.

### Step 1 — Create a MongoDB Atlas Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a new **Shared Cluster** (free tier — M0)
3. Choose a region close to your VPS
4. Create a **database user** with a strong password
5. Under **Network Access**, add your VPS IP address (or `0.0.0.0/0` for testing — **not recommended for production**)
6. Click **Connect** → **Connect your application** → Copy the connection string

Your connection string will look like:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/blogbubble?retryWrites=true&w=majority
```

> [!WARNING]
> **Never** whitelist `0.0.0.0/0` (all IPs) in production. Always restrict access to your VPS's public IP address only.

### Step 2 — Create a Redis Cloud Instance

1. Go to [redis.com/cloud](https://redis.com/try-free/) and create a free account
2. Create a new **Free database** (30MB)
3. Choose a region close to your VPS
4. Once created, go to the database details and copy:
   - **Public endpoint** (e.g., `redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345`)
   - **Default user password**

Your Redis URL will look like:

```
redis://default:YOUR_PASSWORD@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345
```

### Step 3 — Configure Environment Variables

```bash
cp .env.cloud.example .env.cloud
nano .env.cloud
```

```ini
# .env.cloud
PORT=3000
NODE_ENV=production

# MongoDB Atlas — paste your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/blogbubble?retryWrites=true&w=majority

# JWT
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_DIR=public/uploads
PROFILE_UPLOAD_DIR=public/profile
MAX_FILE_SIZE=5242880

# Redis Cloud — paste your Redis Cloud URL
REDIS_URL=redis://default:YOUR_PASSWORD@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345
CACHE_TTL_SECONDS=60

# CORS — your Vercel frontend domain
CORS_ORIGIN=https://blogbubble.vercel.app

# Cookie settings for cross-domain
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

### Step 4 — Deploy on Your VPS

```bash
# SSH into your VPS
ssh root@your-server-ip
cd BlogApp

# Build and start (only the backend + nginx containers — no local DB or Redis)
docker-compose -f docker-compose.cloud.yml up -d --build
```

> [!NOTE]
> In cloud mode, `docker-compose.cloud.yml` only starts the **backend** and **nginx** containers. MongoDB and Redis are hosted externally by Atlas and Redis Cloud, so no database containers are needed on your VPS.

### Step 5 — Deploy Frontend to Vercel

Follow the same steps as [Mode 2 → Step 9](#step-9--deploy-frontend-to-vercel).

Set `VITE_API_URL` to your backend's public URL:

```
VITE_API_URL=https://api.yourdomain.com
```

### Step 6 — Security Hardening

1. **MongoDB Atlas — Whitelist your VPS IP:**
   - Go to Atlas → Network Access → Add IP Address
   - Enter your VPS's public IP (e.g., `203.0.113.42/32`)
   - Remove any `0.0.0.0/0` entries

2. **Redis Cloud — Use a strong password:**
   - Redis Cloud generates a default password — use it or set a stronger one
   - Ensure TLS is enabled (Redis Cloud free tier supports TLS)

3. **Generate strong JWT secret:**
   ```bash
   openssl rand -base64 64
   ```

4. **Firewall on VPS:**
   ```bash
   # Allow only SSH, HTTP, and HTTPS
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

---

## CORS Configuration (Cross-Domain Deployments)

> [!IMPORTANT]
> When your frontend (e.g., on Vercel at `blogbubble.vercel.app`) and backend (e.g., on a VPS at `api.yourdomain.com`) are on **different domains**, you **must** configure CORS properly. This applies to **Mode 2** and **Mode 3**.

### Why CORS Is Needed

Browsers block cross-origin requests by default. If your frontend at `https://blogbubble.vercel.app` tries to call `https://api.yourdomain.com/api/blogs`, the browser will reject it unless the backend explicitly allows that origin.

### Backend CORS Setup

Install the `cors` package:

```bash
npm install cors
```

Add CORS middleware to `index.js` **before** your routes:

```js
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

The full updated section of `index.js` should look like:

```diff
 const express = require("express");
 const path = require("path");
 const cookieParser = require("cookie-parser");
+const cors = require("cors");

 const app = express();

 app.use(express.json());
 app.use(express.urlencoded({ extended: false }));
 app.use(cookieParser());
+app.use(cors({
+  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
+  credentials: true,
+}));
 app.use(optionalAuth);
```

### Cookie Configuration for Cross-Domain

When using cookies (e.g., JWT tokens in `httpOnly` cookies) across different domains, cookies require specific attributes:

```js
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',      // true in production (HTTPS)
  sameSite: process.env.COOKIE_SAMESITE || 'lax',     // 'none' for cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000,                    // 7 days
});
```

| Environment | `secure` | `sameSite` | Notes |
|---|---|---|---|
| Local development | `false` | `lax` | Same origin, no HTTPS needed |
| Production (cross-domain) | `true` | `none` | **Both** `secure` and `sameSite: 'none'` are required |

> [!CAUTION]
> Setting `sameSite: 'none'` without `secure: true` will cause browsers to **reject** the cookie entirely. Always use HTTPS in production.

---

## Deployment Comparison

| Feature | Mode 1 (Local) | Mode 2 (VPS) | Mode 3 (Cloud) |
|---|---|---|---|
| **Cost** | Free | $5–20/mo VPS | $0–50/mo (pay as you go) |
| **Setup Complexity** | Easy | Medium | Medium |
| **Scalability** | None | Limited (vertical) | High (horizontal) |
| **Data Backups** | Manual | Manual (cron + mongodump) | Automatic (Atlas) |
| **SSL/HTTPS** | Not needed | Manual (Certbot) | Manual (Certbot) |
| **Database Management** | Docker container | Docker container | Atlas (managed) |
| **Redis Management** | Docker container | Docker container | Redis Cloud (managed) |
| **Frontend Hosting** | Docker (Vite dev) | Vercel (CDN) | Vercel (CDN) |
| **Monitoring** | Docker logs | Docker logs | Atlas dashboard + logs |
| **Uptime Guarantee** | None | Depends on VPS | 99.95% (Atlas SLA) |
| **Best For** | Development | Portfolio / Small prod | Scaling apps |

---

## Recommended Mode for Portfolio Projects

> **TL;DR — Use Mode 2 (VPS Production) for portfolio projects.**

### Why Mode 2?

1. **Lowest cost** — A basic VPS from DigitalOcean, Hetzner, or Linode costs **$4–6/month**. Combined with Vercel's free tier for the frontend, your total monthly cost is under $10.

2. **Full stack control** — You manage the entire infrastructure: Docker, Nginx, SSL, MongoDB, Redis. This is exactly what interviewers want to see.

3. **Demonstrates real deployment skills** — Showing you can SSH into a server, configure Nginx, set up SSL, and orchestrate containers with Docker Compose is far more impressive than clicking "Deploy" on a PaaS.

4. **Everything self-contained** — Your entire application stack lives on one server. No external dependencies, no surprise bills, no service tier limits.

5. **Easy to maintain** — Updates are a simple `git pull && docker-compose up -d --build`.

### When to Choose Mode 3 Instead

Mode 3 (Cloud Services) is the better choice when:

- Your app has **real users** and needs **99.9%+ uptime**
- You need **automatic database backups** and point-in-time recovery
- Your database may grow beyond what a single VPS can handle
- You want **managed monitoring and alerts** (Atlas provides these)
- You're willing to pay more for operational peace of mind

---

## Common Commands Reference

### Mode 1 — Local Development

| Command | Description |
|---|---|
| `docker-compose up --build` | Build and start all containers |
| `docker-compose up` | Start containers (without rebuilding) |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop, remove containers **and** volumes |
| `docker-compose logs -f` | Follow logs for all services |
| `docker-compose logs -f backend` | Follow logs for backend only |
| `docker-compose ps` | List running containers |
| `docker-compose exec backend sh` | Open a shell inside the backend container |
| `docker-compose exec mongodb mongosh` | Open MongoDB shell |
| `docker-compose restart backend` | Restart a specific service |

### Mode 2 — VPS Production

| Command | Description |
|---|---|
| `docker-compose -f docker-compose.production.yml up -d --build` | Build and start in background |
| `docker-compose -f docker-compose.production.yml down` | Stop all containers |
| `docker-compose -f docker-compose.production.yml logs -f` | Follow all logs |
| `docker-compose -f docker-compose.production.yml logs -f backend` | Follow backend logs |
| `docker-compose -f docker-compose.production.yml ps` | List containers and status |
| `docker-compose -f docker-compose.production.yml pull` | Pull latest images |
| `docker-compose -f docker-compose.production.yml restart nginx` | Restart Nginx only |
| `docker stats` | Monitor container CPU/memory usage |

### Mode 3 — Cloud Services

| Command | Description |
|---|---|
| `docker-compose -f docker-compose.cloud.yml up -d --build` | Build and start in background |
| `docker-compose -f docker-compose.cloud.yml down` | Stop all containers |
| `docker-compose -f docker-compose.cloud.yml logs -f` | Follow all logs |
| `docker-compose -f docker-compose.cloud.yml ps` | List containers and status |
| `docker-compose -f docker-compose.cloud.yml restart backend` | Restart backend only |

### Updating the Application (All Production Modes)

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (replace <compose-file> with your mode's file)
docker-compose -f <compose-file> up -d --build

# Verify
docker-compose -f <compose-file> ps
docker-compose -f <compose-file> logs -f backend
```

---

## Troubleshooting

### Container won't start

```bash
# Check container logs for error messages
docker-compose -f <compose-file> logs backend

# Check if the container exited with an error
docker-compose -f <compose-file> ps

# Common fix: rebuild the image
docker-compose -f <compose-file> up -d --build backend
```

---

### MongoDB connection refused

**Symptoms:** `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Cause:** The backend is trying to connect to `localhost` instead of the Docker service name.

**Fix:** Ensure `MONGODB_URI` in your `.env.*` file uses the **Docker service name**:

```diff
# ❌ Wrong — localhost doesn't work inside Docker
-MONGODB_URI=mongodb://localhost:27017/blogbubble

# ✅ Correct — use the service name from docker-compose
+MONGODB_URI=mongodb://mongodb:27017/blogbubble
```

> [!NOTE]
> For **Mode 3** (Cloud Services), `MONGODB_URI` should be your **Atlas connection string** (`mongodb+srv://...`), not a Docker service name.

---

### CORS errors in the browser

**Symptoms:** `Access to fetch at 'https://api.example.com' from origin 'https://app.vercel.app' has been blocked by CORS policy`

**Fix checklist:**

1. ✅ Verify `CORS_ORIGIN` in your `.env.*` file matches **exactly** the frontend URL (including `https://`, no trailing slash)
2. ✅ Ensure the `cors` package is installed: `npm install cors`
3. ✅ Ensure CORS middleware is added to `index.js` **before** route definitions
4. ✅ Restart the backend container after changing environment variables

```bash
docker-compose -f <compose-file> restart backend
```

---

### Images / uploaded files not loading

**Symptoms:** Profile pictures or blog images return 404.

**Fix:** Check that Docker volume mounts are correctly mapping the `public/` directory:

```yaml
# In your docker-compose file, the backend service should have:
volumes:
  - ./public/uploads:/app/public/uploads
  - ./public/profile:/app/public/profile
```

Also verify that the Nginx configuration proxies static file requests correctly:

```nginx
location /uploads/ {
    alias /app/public/uploads/;
}

location /profile/ {
    alias /app/public/profile/;
}
```

---

### SSL / HTTPS errors

**Symptoms:** `ERR_SSL_PROTOCOL_ERROR` or `SSL_ERROR_RX_RECORD_TOO_LONG`

**Fix checklist:**

1. ✅ Verify certificate files exist in `nginx/ssl/`:
   ```bash
   ls -la nginx/ssl/
   # Should see: fullchain.pem  privkey.pem
   ```

2. ✅ Ensure the HTTPS server block in `nginx/nginx.conf` is **uncommented**

3. ✅ Verify the certificate paths in `nginx.conf` match the actual file locations

4. ✅ Check that ports 80 and 443 are open on your VPS firewall:
   ```bash
   sudo ufw status
   ```

5. ✅ Ensure your domain's DNS A record points to your VPS IP:
   ```bash
   dig api.yourdomain.com
   ```

---

### Redis connection errors

**Symptoms:** `Redis unavailable; continuing without cache` (warning, not fatal)

**Cause:** BlogBubble's Redis client is designed to be **resilient** — the app works without Redis, but caching is disabled.

**Fix (if you want caching):**

```bash
# Check if Redis container is running
docker-compose -f <compose-file> ps redis

# Check Redis logs
docker-compose -f <compose-file> logs redis

# Verify REDIS_URL in your .env file
# Mode 1/2: redis://redis:6379
# Mode 3:   redis://default:PASSWORD@your-redis-cloud-host:PORT
```

---

### Vercel frontend can't reach the backend

**Symptoms:** API calls fail with `ERR_CONNECTION_REFUSED` or `fetch failed`

**Fix checklist:**

1. ✅ Verify `VITE_API_URL` is set correctly in Vercel's Environment Variables
2. ✅ Ensure the backend is running and accessible from the internet:
   ```bash
   curl https://api.yourdomain.com/
   # Should return: {"name":"BlogBubble API","status":"ok",...}
   ```
3. ✅ Check that DNS is configured and propagated:
   ```bash
   nslookup api.yourdomain.com
   ```
4. ✅ **Redeploy** the frontend on Vercel after changing `VITE_API_URL` (it's a build-time variable)

---

### Container running out of disk space

```bash
# Check disk usage
df -h

# Remove unused Docker images, containers, and volumes
docker system prune -a --volumes

# Check Docker-specific disk usage
docker system df
```

> [!WARNING]
> `docker system prune -a --volumes` removes **all** unused images, containers, networks, and volumes. Make sure you have backups before running this on a production server.

---

<p align="center">
  <strong>BlogBubble</strong> — Built with Express · React · MongoDB · Redis · Docker
</p>
