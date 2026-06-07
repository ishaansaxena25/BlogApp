# BlogBubble

A full-stack blog platform with JWT-based authentication, content management,
Redis caching, and automated image cleanup.

## Tech Stack

- **Backend:** Node.js, Express.js, JavaScript
- **Database:** MongoDB with Mongoose
- **Auth:** JWT via HTTP-only cookie or Bearer token
- **Caching:** Redis with graceful fallback when unavailable
- **File Uploads:** Multer
- **Validation:** express-validator

## Getting Started

1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in the values.
4. Start MongoDB and, optionally, Redis.
5. Run `npm start`.

The API starts at `http://localhost:3000` by default.

## API Reference

All endpoints return JSON. Protected routes accept an HTTP-only `token` cookie
or an `Authorization: Bearer <token>` header.

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
- Replaced and deleted images are automatically removed from storage.
- Maximum file size defaults to 5 MB.
- Accepted formats are JPEG, PNG, and WebP.

## Architecture

```text
Client -> JSON REST API -> Controllers -> Mongoose -> MongoDB
                              |
                              +-> Redis blog cache
                              +-> Local image storage
```

Routes handle HTTP concerns, controllers coordinate application behavior, and
services contain reusable authentication and file-management logic.
