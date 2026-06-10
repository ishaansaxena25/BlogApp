# BlogBubble

A full-stack publishing platform with Editor.js content, drafts, discovery, engagement, Redis caching, Cloudflare R2-compatible image storage, and a responsive React frontend.

---

## 📁 Repository Structure

This repository is organized as a monorepo containing both the backend service and the frontend client:

- **Root Directory (`/`)**: Node.js and Express REST API backend service.
- **[/client](file:///d:/Courses/Web%20Dev%28repository%29/blogApp/client/)**: React + Vite frontend client application.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, JavaScript
- **Frontend:** React, Vite, React Query, React Router v6, Tailwind CSS v3
- **Database:** MongoDB with Mongoose
- **Auth:** JWT via HTTP-only cookie or Bearer token, bcrypt passwords
- **Caching:** Redis with graceful fallback when unavailable
- **File Uploads:** Multer memory uploads routed to local development storage or Cloudflare R2
- **Validation:** express-validator

---

## 🚀 Getting Started

To run the application locally, you will need to start both the backend API server and the frontend client.

### 1. Set Up and Run the Backend API

1. From the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *Configure your MongoDB and Redis connection strings inside the new `.env` file.*
3. Ensure **MongoDB** (and optionally **Redis**) is running on your machine.
4. Launch the backend API server:
   ```bash
   npm run dev
   ```
   The API will start at `http://localhost:3000` by default.

### 2. Set Up and Run the Frontend Client

1. Navigate to the client folder and install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *By default, the client is configured to connect to `http://localhost:3000` via Vite development proxy.*
3. Launch the React development server:
   ```bash
   npm run dev
   ```
   The client application will start at `http://localhost:5173` in your browser.

---

## 📊 API Reference

All endpoints return JSON. Protected routes accept an HTTP-only `token` cookie or an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account and receive a JWT |
| POST | `/api/auth/login` | No | Log in and receive a JWT |
| POST | `/api/auth/logout` | Yes | Revoke the current JWT |

### Blogs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/blogs` | No | List all blogs |
| GET | `/api/blogs/:id` | No | Get a blog with its comments |
| POST | `/api/blogs` | Yes | Create a blog |
| PATCH | `/api/blogs/:id` | Owner/Admin | Update a blog |
| DELETE | `/api/blogs/:id` | Owner/Admin | Delete a blog and its comments |
| POST | `/api/blogs/:id/comments` | Yes | Add a comment |
| PUT | `/api/blogs/:id/bookmark` | Yes | Bookmark a blog |
| DELETE | `/api/blogs/:id/bookmark` | Yes | Remove a bookmark |
| PUT | `/api/blogs/:id/like` | Yes | Like a blog |
| DELETE | `/api/blogs/:id/like` | Yes | Remove a like |
| POST | `/api/blogs/:id/view` | No | Increment views |
| GET | `/api/blogs/trending` | No | List top blogs by views |
| PATCH | `/api/blogs/:blogId/comments/:commentId` | Owner | Edit a comment |
| DELETE | `/api/blogs/:blogId/comments/:commentId` | Owner/Admin | Delete a comment |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Yes | Get the current profile and authored blogs |
| PATCH | `/api/users/me` | Yes | Update the current profile |
| PATCH | `/api/users/me/password` | Yes | Change the current password |
| GET | `/api/users/me/bookmarks` | Yes | List bookmarked blogs |

### Content and Uploads

- Send Editor.js JSON as a stringified `content` field in `multipart/form-data`.
- Send blog cover images as `coverImage`.
- Send profile images as `profileImage` in `multipart/form-data`.
- Upload Editor.js images to `POST /api/uploads/editor-image` using the `image` field.
- Replaced and deleted images are automatically removed from storage.

Blog listing supports `?search=term`, `?tag=react`, and authenticated `?status=draft`.
Blog detail accepts either a MongoDB ID or slug.

---

## 🏗️ Architecture

```text
React Client (Vite) [inside /client] -> JSON REST API -> Controllers -> Mongoose -> MongoDB
                                                          |
                                                          +-> Redis cache
                                                          +-> Local/R2 storage
```

Routes handle HTTP concerns, controllers coordinate application behavior, and services contain reusable authentication and file-management logic.

---

## 🐳 Docker Deployment

This project supports **three deployment modes** via Docker Compose:

| Mode | Description | Compose File |
|------|-------------|-------------|
| **Mode 1** — Local Development | All services containerized (backend, frontend, MongoDB, Redis) | `docker-compose.yml` |
| **Mode 2** — VPS Production | Backend + DB on your VPS, frontend on Vercel | `docker-compose.production.yml` |
| **Mode 3** — Cloud Services | Backend only (uses MongoDB Atlas + Redis Cloud), frontend on Vercel | `docker-compose.cloud.yml` |

### Quick Start (Local Development)

```bash
# Start all containers
docker compose up --build

# Access the app
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

### Key Docker Files

```text
├── Dockerfile                       # Backend multi-stage build
├── client/Dockerfile                # Frontend multi-stage build (Vite → Nginx)
├── docker-compose.yml               # Mode 1: Local development
├── docker-compose.production.yml    # Mode 2: VPS production
├── docker-compose.cloud.yml         # Mode 3: Cloud services
├── .env.docker                      # Env for local Docker dev
├── .env.production.example          # Env template for VPS
├── .env.cloud.example               # Env template for cloud
└── nginx/
    ├── nginx.conf                   # Production reverse proxy
    └── nginx.local.conf             # Local SPA routing
```

📖 **For complete step-by-step deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).**

---

## 📄 License

This project is for educational and portfolio purposes.
