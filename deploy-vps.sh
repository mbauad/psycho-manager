#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

cd /opt/psycho-manager

echo "📥 Atualizando codigo..."
git pull origin main

echo "🛑 Parando container..."
docker compose -f docker-compose.prod.yml down

echo "🔨 Rebuildando imagem..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "▶️ Subindo container..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Aguardando container iniciar..."
sleep 15

echo "📁 Copiando arquivos antigos para standalone..."
docker exec psycho-manager sh -c '
  if [ -d /app/public/uploads ]; then
    mkdir -p /app/.next/standalone/public/uploads
    cp -r /app/public/uploads/* /app/.next/standalone/public/uploads/ 2>/dev/null || true
  fi
'

echo "📁 Criando pasta uploads no standalone..."
docker exec psycho-manager mkdir -p /app/.next/standalone/public/uploads
docker exec psycho-manager chmod -R 755 /app/.next/standalone/public/uploads

echo "🔄 Reiniciando container..."
docker restart psycho-manager

echo "⏳ Aguardando..."
sleep 10

echo "✅ Status:"
docker ps | grep psycho-manager

echo ""
echo "🎉 Deploy concluido! Acesse: https://psycho-manager.site"
