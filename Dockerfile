FROM node:20

WORKDIR /app

# Copiar e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar projeto
COPY . .

# Buildar
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Gerar Prisma para este sistema
RUN npx prisma generate

# Expor porta
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["npm", "start"]
