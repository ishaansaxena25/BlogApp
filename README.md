# BlogBubble

A full-stack blog platform with JWT-based authentication, content management, Redis caching, local image uploads, and a modern, responsive React frontend.

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
- **Auth:** JWT via HTTP-only cookie or Bearer token
- **Caching:** Redis with graceful fallback when unavailable
- **File Uploads:** Multer (covers blog cover photos and profile images)
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

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Yes | Get the current profile and authored blogs |
| PATCH | `/api/users/me` | Yes | Update the current profile |
| PATCH | `/api/users/me/password` | Yes | Change the current password |
| GET | `/api/users/me/bookmarks` | Yes | List bookmarked blogs |

### File Uploads

- Send blog cover images as `coverImage` in `multipart/form-data`.
- Send profile images as `profileImage` in `multipart/form-data`.
- Replaced and deleted images are automatically removed from storage (Max file size: 5 MB; Accepted: JPEG, PNG, WebP).

---

## 🏗️ Architecture

```text
React Client (Vite) [inside /client] -> JSON REST API -> Controllers -> Mongoose -> MongoDB
                                                          |
                                                          +-> Redis blog cache
                                                          +-> Local image storage
```

Routes handle HTTP concerns, controllers coordinate application behavior, and services contain reusable authentication and file-management logic.
