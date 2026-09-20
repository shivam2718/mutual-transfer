# RailMutual

RailMutual is a full-stack web application for mutual transfer matching of Indian Railway employees.

This repository contains two main folders:
- `backend` — Express + MongoDB API
- `frontend` — React + Vite client

## Local development

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Start MongoDB locally and set the required environment variables before running the app.

Example:

```bash
export MONGO_URI="mongodb://127.0.0.1:27017/railmutual"
export JWT_ACCESS_SECRET="your-access-secret"
export JWT_REFRESH_SECRET="your-refresh-secret"
export PORT="4000"
```

3. Run the app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:4000`.
