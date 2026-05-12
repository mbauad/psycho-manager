# Estágio 1: Builder
FROM node:20-slim AS builder

# Forçar rebuild sem cache
ARG CACHEBUST=2

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Instalar dependências do projeto
COPY package*.json ./
RUN npm ci

# Copiar arquivos do projeto
COPY . .

# Variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Buildar (sem gerar Prisma ainda)
RUN npm run build

# Estágio 2: Produção
FROM node:20-slim AS runner

WORKDIR /app

# Instalar openssl (necessário para Prisma)
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Não rodar como root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma

# Instalar apenas dependências de produção e gerar Prisma para DEBIAN
RUN npm ci --omit=dev && npx prisma generate

# Criar diretório do banco e dar permissões
RUN mkdir -p prisma
RUN chown -R nextjs:nodejs /app

USER nextjs

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["npm", "start"]
