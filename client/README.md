# BlogBubble — React Frontend

Welcome to the frontend application for **BlogBubble**, a modern, full-stack blog platform. This is a clean, custom React client built on top of the BlogBubble REST API.

---

## 🚀 Tech Stack

- **React (Vite)**: Core framework for fast, hot-module-reloaded development.
- **TanStack React Query v5**: Handles all caching, fetching, state synchronization, and mutations.
- **React Router v6**: Manages public and protected page navigation.
- **Tailwind CSS v3**: Clean, custom styling with an elegant, responsive dark-slate design system.
- **Lucide React**: Clean and modern vector icon library.

---

## 🎨 Implemented Pages & Features

1. **`/` — Blog Dashboard**: Lists all blogs in a card grid with title, excerpt, publication date, and author. Includes real-time search filtering and custom skeleton loader states.
2. **`/blogs/:id` — Single Post Reader**: Displays the full article body, comments feed, and bookmark controls. Shows Edit/Delete controls (with confirmation prompts) for owners/admins.
3. **`/login` & `/register`**: Sign in and registration pages with custom circle avatar attachments, fully validating fields and displaying express-validator errors inline.
4. **`/blogs/new`**: Protected view to author a new post with a drag-and-drop cover image preview.
5. **`/blogs/:id/edit`**: Protected editor prefilled with existing database values (enforces client-side ownership validation).
6. **`/profile`**: Account settings panel. Allows users to edit their profile information (name, avatar) or change passwords with live success alerts, and lists their authored posts.
7. **`/bookmarks`**: Custom reading list showing saved posts. Allows removing bookmarks directly from the card deck.

---

## ⚙️ Project Setup

### 1. Prerequisite
Ensure that your backend REST API server is running (normally on port `3000`).

### 2. Configure Environment Variables
Copy the configuration template to create your local `.env` file:
```bash
cp .env.example .env
```
Inside the new `.env` file, configure the backend address:
- **Local Dev**: `VITE_API_URL=http://localhost:3000`
- **Single-Domain Cloud Hosting** (Recommended): Leave it empty (`VITE_API_URL=`) to default to relative path `/api` requests, which prevents CORS issues.
- **Multi-Domain Cloud Hosting**: Set it to your remote URL (`VITE_API_URL=https://api.yourdomain.com`). Make sure CORS is configured on your server.

### 3. Install Dependencies
Run the install command inside the `/client` directory:
```bash
npm install
```

---

## 🛠️ Development & Production Commands

### Start Frontend Dev Server
Run the local dev server (usually launches on `http://localhost:5173`):
```bash
npm run dev
```
Requests made to `/api` are automatically proxied to the backend server (defaulting to `http://localhost:3000`) using the Vite proxy server configuration to bypass local CORS policies.

### Run Production Build
Verify the build correctness and compile the optimized static assets:
```bash
npm run build
```
The output files will be bundled into the `/dist` directory, ready to be served by any static host or your backend node public folder.
