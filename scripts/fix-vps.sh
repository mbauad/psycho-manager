#!/bin/bash
set -e

echo "========================================"
echo "🔧 Diagnóstico Psycho Manager (VPS)"
echo "========================================"

echo ""
echo "1️⃣  Verificando containers Docker..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "psycho|traefik|easypanel" || true

echo ""
echo "2️⃣  Verificando redes Docker..."
docker network ls | grep -E "easypanel|psycho" || true

echo ""
echo "3️⃣  Verificando se o container está na rede 'easypanel'..."
docker network inspect easypanel --format '{{json .Containers}}' 2>/dev/null | python3 -m json.tool 2>/dev/null || docker network inspect easypanel | grep -A 5 "Containers" || true

echo ""
echo "4️⃣  Testando healthcheck interno do container..."
docker exec psycho-manager wget --spider -q http://localhost:3000/login 2>/dev/null && echo "✅ Healthcheck OK" || echo "❌ Healthcheck FALHOU"

echo ""
echo "5️⃣  Logs recentes do container psycho-manager..."
docker logs --tail 20 psycho-manager 2>/dev/null || echo "❌ Container não encontrado"

echo ""
echo "6️⃣  Logs recentes do Traefik (proxy)..."
docker logs --tail 30 traefik 2>/dev/null || docker logs --tail 30 easypanel-traefik 2>/dev/null || echo "⚠️  Container Traefik não encontrado com nome padrão"

echo ""
echo "========================================"
echo "🛠️  TENTANDO REPARO AUTOMÁTICO..."
echo "========================================"

echo ""
echo "7️⃣  Reiniciando container psycho-manager..."
docker restart psycho-manager 2>/dev/null && echo "✅ Container reiniciado" || echo "❌ Falha ao reiniciar"

echo ""
echo "8️⃣  Aguardando 10s para a app inicializar..."
sleep 10

echo ""
echo "9️⃣  Verificando se a app responde na porta 3000..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login || true

echo ""
echo "🔟  Se ainda houver erro 502, forçando recriação do container..."
read -p "Deseja forçar recriação do container? (s/N): " confirm
if [[ "$confirm" =~ ^[Ss]$ ]]; then
    cd ~/psycho-manager || cd /root/psycho-manager || cd /home/*/psycho-manager || true
    if [ -f docker-compose.prod.yml ]; then
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --build
        echo "✅ Container recriado com docker-compose.prod.yml"
    elif [ -f docker-compose.yml ]; then
        docker-compose down
        docker-compose up -d --build
        echo "✅ Container recriado com docker-compose.yml"
    else
        echo "⚠️  docker-compose não encontrado. Procure o projeto manualmente."
    fi
fi

echo ""
echo "========================================"
echo "✅ Diagnóstico finalizado!"
echo "========================================"
echo ""
echo "📋 Resumo do que verificar no Easypanel:"
echo "   - O serviço 'psycho-manager' deve estar Running"
echo "   - O domínio 'psycho-manager.site' deve estar vinculado ao serviço"
echo "   - Se o Traefik estiver com regras antigas, remova e readicione o domínio"
