#!/bin/bash
set -e

echo "🚀 Iniciando deploy do PsychoManager..."

# Puxar últimas mudanças
git pull origin main

# Instalar dependências
npm install

# Banco de dados
npx prisma generate
npx prisma db push

# Seed (só cria admin se não existir — seguro rodar toda vez)
npx prisma db seed || true

# Build
npm run build

# Reiniciar com PM2 (se estiver usando)
if command -v pm2 &> /dev/null; then
    pm2 restart psycho-manager || pm2 start npm --name "psycho-manager" -- start
    echo "✅ Aplicação reiniciada com PM2"
else
    echo "⚠️ PM2 não encontrado. Inicie manualmente: npm start"
fi

echo "🎉 Deploy finalizado!"
