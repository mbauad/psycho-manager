FROM node:20

WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm ci

# Gerar Prisma antes do build do Next.js
COPY prisma ./prisma
ARG DATABASE_URL="file:./dev.db"
ARG AUTH_SECRET="build-time-secret-build-time-secret"
ARG NEXTAUTH_URL="http://localhost:3000"
ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate

# Copiar projeto
COPY . .

# Buildar aplicacao
RUN npm run build

# Expor porta
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]
