FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- 2-bosqich: production runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache wget

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Kompilyatsiya qilingan kod
COPY --from=builder /app/dist ./dist

# Migratsiyalarni ishga tushirish uchun kerak (typeorm-ts-node-commonjs
# src/config/typeorm.config.ts faylini to'g'ridan-to'g'ri, ts-node orqali o'qiydi)
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${APP_PORT:-3000}/api-json || exit 1

CMD ["node", "dist/main"]