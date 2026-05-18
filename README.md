# RailMutual

RailMutual is a full-stack production-ready web application scaffold for mutual transfer matching of Indian Railway employees.

This repository contains two main folders:
- `backend` — Express + TypeScript + MongoDB API
- `frontend` — React + Vite + TypeScript client

See each folder README for setup and deployment instructions.

## Docker

Build the app as a single container image from the repository root:

```bash
docker build -t railmutual .
docker run --rm -p 4000:4000 \
	-e MONGO_URI="your-mongodb-uri" \
	-e JWT_ACCESS_SECRET="your-access-secret" \
	-e JWT_REFRESH_SECRET="your-refresh-secret" \
	-e GOOGLE_CLIENT_ID="your-google-client-id" \
	-e GOOGLE_CLIENT_SECRET="your-google-client-secret" \
	-e GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback" \
	-e FRONTEND_URL="http://localhost:4000" \
	railmutual
```

The container serves the React frontend and the API from the same origin, so browser requests can use relative `/api` paths.

## Local Compose

If you want the quickest local setup, start the app with MongoDB using Docker Compose:

```bash
docker compose up --build
```

The app will be available at `http://localhost:4000` and MongoDB will run on `localhost:27017`.
