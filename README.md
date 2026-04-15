# AnimeVerse

AnimeVerse is a full-stack anime web application built with the MERN stack. It combines anime discovery, search, watchlist management, JWT authentication, and a polished responsive UI inspired by platforms like MyAnimeList and anime streaming dashboards.

## Features

- JWT authentication with bcrypt password hashing
- Protected dashboard and user profile flow
- Home page with featured banner, trending anime, top rated anime, and latest releases
- Anime list page with search, pagination, and filter controls
- Anime details page with trailer embed, metadata, and watchlist actions
- Debounced search suggestions
- MongoDB-backed watchlist/bookmark system
- Tailwind-powered responsive UI with dark/light toggle
- Loading skeletons, toast notifications, and custom 404 page
- REST API with modular routes, controllers, models, middleware, and error handling

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, React Hot Toast
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs
- Database: MongoDB Atlas
- External Anime API: Jikan API

## Project Structure

```text
AnimeVerse/
  client/
  server/
    controllers/
    middleware/
    models/
    routes/
    config/
```

## Setup

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/animeverse
JWT_SECRET=animeverse_local_jwt_secret_change_me
CLIENT_URL=http://localhost:5173
JIKAN_API_BASE_URL=https://api.jikan.moe/v4
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Demo credentials

- Admin: `admin@animeverse.demo` / `Admin@123`
- User: `user@animeverse.demo` / `User@123`

These demo accounts are auto-seeded when the backend starts and MongoDB is available locally.

### 4. Run in development

From the project root:

```bash
npm run dev
```

This starts:

- Vite frontend at `http://localhost:5173`
- Express backend at `http://localhost:5000`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/anime/home`
- `GET /api/anime`
- `GET /api/anime/search/suggestions`
- `GET /api/anime/:id`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:animeId`

## Deployment

### Frontend on Vercel

- Set root directory to `client`
- Add `VITE_API_BASE_URL` pointing to your deployed backend URL plus `/api`
- Run build command: `npm run build`

### Backend on Render or Railway

- Set root directory to `server`
- Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `PORT`
- Start command: `npm start`

### MongoDB Atlas

- Create a cluster and database named `animeverse`
- Add the backend deployment IP or allow appropriate network access
- Create a database user and use that connection string as `MONGO_URI`

## Bonus-ready areas

- Recommendation engine block on the details page for future expansion
- Reviews/comments area placeholder in the details page
- Episode streaming UI placeholder for platform-style presentation

## Notes

- Anime metadata is fetched from the Jikan API, which has rate limits. For production scale, add caching.
- Image cards and character panels now include UI fallbacks when Jikan is missing media.
- Trailer embeds use the Jikan YouTube metadata when available, but some anime genuinely do not have a public trailer.
- The dashboard acts as the user profile page and watchlist control center.
