FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend ./
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 4000

CMD ["node", "src/index.js"]