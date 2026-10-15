# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production && npm cache clean --force
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/build ./frontend/build

RUN mkdir -p /app/data && chown -R node:node /app
VOLUME ["/app/data"]
EXPOSE 3000

USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "backend/dist/server.js"]
