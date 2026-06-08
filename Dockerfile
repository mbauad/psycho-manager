FROM node:22-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.js && node .next/standalone/server.js"]
