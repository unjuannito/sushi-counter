# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/backend

RUN apk add --no-cache python3 make g++ linux-headers
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache dumb-init su-exec font-dejavu
RUN apk add --no-cache --virtual .build-deps python3 make g++ linux-headers

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production && npm cache clean --force
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --omit=dev && npm cache clean --force
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/build ./frontend/build
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN apk del .build-deps \
    && mkdir -p /app/data \
    && chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown -R node:node /app
VOLUME ["/app/data"]
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "backend/dist/server.js"]
