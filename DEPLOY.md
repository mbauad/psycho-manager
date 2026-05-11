# Guia de Deploy - Psycho Manager

Deploy do sistema na VPS Hostgator usando **PM2 + Nginx**.

---

## 1. Acessar a VPS

Conecte-se via SSH (use o Terminal/PowerShell no seu computador):

```bash
ssh usuario@IP_DA_VPS
```

> Substitua `usuario` e `IP_DA_VPS` pelos dados da sua VPS.

---

## 2. Instalar Node.js 20 (LTS)

Na VPS, execute:

```bash
# Instalar NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recarregar o shell
source ~/.bashrc

# Instalar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node -v  # Deve mostrar v20.x.x
npm -v
```

---

## 3. Instalar PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
```

---

## 4. Clonar o Repositório

```bash
cd ~
git clone git@github.com:mbauad/psycho-manager.git
```

> Se você não configurou chave SSH no GitHub, use HTTPS:
> `git clone https://github.com/mbauad/psycho-manager.git`

---

## 5. Configurar o Ambiente

```bash
cd ~/psycho-manager
```

### 5.1 Criar o arquivo `.env`

```bash
nano .env
```

Cole o seguinte conteúdo (AJUSTE OS VALORES!):

```env
# Banco de dados SQLite
DATABASE_URL="file:./dev.db"

# Chave secreta para autenticação (gere uma aleatória!)
# Comando para gerar: openssl rand -base64 32
AUTH_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"

# URL do seu domínio
NEXTAUTH_URL="https://seudominio.com.br"

# Ambiente
NODE_ENV="production"
```

> **IMPORTANTE:** Gere uma chave secreta forte:
> ```bash
> openssl rand -base64 32
> ```
> Cole o resultado no lugar de `sua-chave-secreta-aqui`.

Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 6. Instalar Dependências e Buildar

```bash
cd ~/psycho-manager

# Instalar dependências
npm ci

# Gerar o Prisma Client
npx prisma generate

# Criar o banco de dados
npx prisma db push

# Build de produção
npm run build
```

> O build pode levar alguns minutos na primeira vez.

---

## 7. Iniciar com PM2

```bash
cd ~/psycho-manager

# Iniciar a aplicação
pm2 start npm --name "psycho-manager" -- start

# Salvar a configuração para reiniciar automaticamente
pm2 save

# Configurar para iniciar automaticamente no boot
pm2 startup
# Execute o comando que o PM2 mostrar na tela
```

---

## 8. Instalar e Configurar Nginx

### 8.1 Instalar Nginx

```bash
# CentOS/RHEL/AlmaLinux/Rocky Linux
sudo dnf install nginx -y

# Ubuntu/Debian
sudo apt update && sudo apt install nginx -y
```

### 8.2 Configurar o Nginx

```bash
sudo nano /etc/nginx/conf.d/psycho-manager.conf
```

Cole a configuração (AJUSTE o `server_name`):

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
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

### 8.3 Testar e Reiniciar Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 9. Configurar SSL (HTTPS) - Recomendado!

### 9.1 Instalar Certbot

**CentOS/RHEL/AlmaLinux/Rocky Linux:**
```bash
sudo dnf install certbot python3-certbot-nginx -y
```

**Ubuntu/Debian:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 9.2 Gerar Certificado

```bash
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

> Siga as instruções na tela. O Certbot vai configurar automaticamente o HTTPS no Nginx.

### 9.3 Renovação automática

```bash
sudo systemctl enable certbot-renew.timer
```

---

## 10. Verificar Status

```bash
# Ver se a aplicação está rodando
pm2 status

# Ver logs
pm2 logs psycho-manager

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 11. Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pm2 status` | Ver status da aplicação |
| `pm2 logs psycho-manager` | Ver logs em tempo real |
| `pm2 restart psycho-manager` | Reiniciar a aplicação |
| `pm2 stop psycho-manager` | Parar a aplicação |
| `pm2 delete psycho-manager` | Remover do PM2 |
| `pm2 monit` | Monitor interativo |

---

## 12. Atualizar o Sistema (Futuro)

Quando houver atualizações no código:

```bash
cd ~/psycho-manager
git pull
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart psycho-manager
```

---

## Solução de Problemas

### Erro "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm ci
npm run build
pm2 restart psycho-manager
```

### Permissão negada no banco SQLite
```bash
chmod 644 ~/psycho-manager/prisma/dev.db
```

### Porta 3000 já em uso
```bash
# Ver o que está usando a porta 3000
sudo lsof -i :3000
# Mate o processo ou mude a porta no .env com PORT=3001
```

---

## Checklist Final

- [ ] Node.js 20 instalado
- [ ] Repositório clonado na VPS
- [ ] Arquivo `.env` configurado com chaves secretas
- [ ] Build executado com sucesso (`npm run build`)
- [ ] PM2 rodando a aplicação
- [ ] Nginx configurado e funcionando
- [ ] SSL/HTTPS ativo (Certbot)
- [ ] Domínio apontando para o IP da VPS

---

**Pronto!** Seu sistema estará acessível em `https://seudominio.com.br`
