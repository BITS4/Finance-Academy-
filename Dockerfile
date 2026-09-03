# syntax=docker/dockerfile:1.7
FROM node:24.16.0-alpine3.23@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS dependencies

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts && npm cache clean --force

FROM node:24.16.0-alpine3.23@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS runtime

ENV NODE_ENV=production \
    PORT=8787 \
    LOG_LEVEL=info
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./
COPY server ./server
USER node
EXPOSE 8787
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8787/health >/dev/null || exit 1
CMD ["node", "--import", "tsx", "server/index.ts"]
