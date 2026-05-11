# Guia de Deploy - Psycho Manager (Docker)

Deploy do sistema na VPS Hostgator usando **Docker + Docker Compose**.

---

## 1. Acessar a VPS

```bash
ssh usuario@IP_DA_VPS
```

---

## 2. Instalar Docker e Docker Compose

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Adicionar repositório Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Instalar Docker
sudo apt update
sudo apt install docker-ce -y

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker -v
docker-compose -v

# Adicionar usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER
newgrp docker
```

> Se sua VPS usar **CentOS/RHEL**:
> ```bash
> sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
> sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
> sudo systemctl start docker
> sudo systemctl enable docker
> ```

---

## 3. Clonar o Repositório

```bash
cd ~
git clone git@github.com:mbauad/psycho-manager.git
# ou: git clone https://github.com/mbauad/psycho-manager.git
cd psycho-manager
```

---

## 4. Criar os Arquivos Docker

### 4.1 Criar `Dockerfile`

```bash
nano Dockerfile
```

Cole:

```dockerfile
# Estágio 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar arquivos do projeto
COPY . .

# Variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Gerar Prisma Client e buildar
RUN npx prisma generate
RUN npm run build

# Estágio 2: Produção
FROM node:20-alpine AS runner

WORKDIR /app

# Não rodar como root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

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

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))" || exit 1

CMD ["node", "server.js"]
```

Salve e feche.

---

### 4.2 Criar `docker-compose.yml`

```bash
nano docker-compose.yml
```

Cole:

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: psycho-manager
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./dev.db
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./prisma/dev.db:/app/prisma/dev.db
      - ./prisma/dev.db-journal:/app/prisma/dev.db-journal
    networks:
      - psycho-network

  nginx:
    image: nginx:alpine
    container_name: psycho-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - app
    networks:
      - psycho-network
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"

  certbot:
    image: certbot/certbot
    container_name: psycho-certbot
    restart: unless-stopped
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done'"

networks:
  psycho-network:
    driver: bridge
```

Salve e feche.

---

### 4.3 Criar `nginx.conf`

```bash
nano nginx.conf
```

Cole (AJUSTE `seudominio.com.br`):

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name seudominio.com.br www.seudominio.com.br;

    ssl_certificate /etc/letsencrypt/live/seudominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com.br/privkey.pem;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve e feche.

---

### 4.4 Criar `.env`

```bash
nano .env
```

Cole (AJUSTE OS VALORES!):

```env
# Banco de dados SQLite
DATABASE_URL=file:./dev.db

# Chave secreta (gere com: openssl rand -base64 32)
AUTH_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres

# URL do seu domínio
NEXTAUTH_URL=https://seudominio.com.br

# Ambiente
NODE_ENV=production
```

Salve e feche.

---

### 4.5 Criar diretórios para Certbot

```bash
mkdir -p certbot/conf certbot/www
```

---

## 5. Build e Primeira Execução

```bash
cd ~/psycho-manager

# Buildar a imagem
docker-compose build

# Iniciar (sem SSL ainda)
docker-compose up -d

# Verificar logs
docker-compose logs -f app
```

Aguarde o build completar. Pressione `Ctrl+C` para sair dos logs.

---

## 6. Configurar SSL (Certbot)

```bash
# Parar temporariamente
docker-compose stop nginx

# Gerar certificado (AJUSTE o domínio!)
docker run -it --rm \
  -v ~/psycho-manager/certbot/conf:/etc/letsencrypt \
  -v ~/psycho-manager/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  -d seudominio.com.br \
  -d www.seudominio.com.br \
  --agree-tos \
  --email seu-email@dominio.com.br \
  --no-eff-email

# Reiniciar tudo
docker-compose up -d
```

---

## 7. Verificar Status

```bash
# Containers rodando
docker-compose ps

# Logs da aplicação
docker-compose logs -f app

# Logs do Nginx
docker-compose logs -f nginx
```

---

## 8. Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `docker-compose ps` | Ver containers |
| `docker-compose logs -f app` | Logs da aplicação |
| `docker-compose restart app` | Reiniciar app |
| `docker-compose down` | Parar tudo |
| `docker-compose up -d` | Iniciar tudo |
| `docker-compose build --no-cache` | Rebuild completo |

---

## 9. Atualizar o Sistema (Futuro)

```bash
cd ~/psycho-manager
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Solução de Problemas

### Container não sobe
```bash
docker-compose logs app
# Verifique o erro específico
```

### Banco SQLite não persiste
```bash
# Verifique permissões
ls -la prisma/
chmod 666 prisma/dev.db
```

### Porta 80/443 já em uso
```bash
sudo lsof -i :80
sudo lsof -i :443
# Pare o serviço conflitante ou mude as portas no docker-compose.yml
```

---

## Checklist Final

- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] `.env` configurado com chaves secretas
- [ ] `Dockerfile`, `docker-compose.yml`, `nginx.conf` criados
- [ ] Build executado com sucesso
- [ ] Containers rodando (`docker-compose ps`)
- [ ] Certbot gerou o certificado SSL
- [ ] HTTPS funcionando
- [ ] Domínio apontando para o IP da VPS
