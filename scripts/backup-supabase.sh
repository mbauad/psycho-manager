#!/bin/bash

# ============================================
# Script de Backup Automático - Supabase PostgreSQL
# ============================================

# --- Configurações ---
BACKUP_DIR="/root/backups/supabase"
DB_NAME="postgres"
DB_USER="supabase_admin"
RETENTION_DAYS=30
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql"

# --- Criar pasta de backup se não existir ---
mkdir -p "$BACKUP_DIR"

# --- Encontrar o container do PostgreSQL ---
# Estratégia: procura imagens postgres, excluindo outros serviços do Supabase
CONTAINER_NAME=$(docker ps --format "{{.Names}}" --filter "ancestor=postgres" | head -n 1)

# Se não encontrou por imagem, tenta por nome excluindo kong, studio, rest, etc.
if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -E "(postgres|_db|db_)" | grep -viE "(kong|studio|rest|storage|analytics|edge|imgproxy|functions|meta)" | head -n 1)
fi

# Se ainda não encontrou, lista todos e pede confirmação
if [ -z "$CONTAINER_NAME" ]; then
    echo "⚠️  Container PostgreSQL não detectado automaticamente."
    echo ""
    echo "Containers Docker ativos:"
    docker ps --format "  - {{.Names}} ({{.Image}})"
    echo ""
    read -p "Digite o nome exato do container do PostgreSQL: " CONTAINER_NAME
fi

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ ERRO: Nenhum container informado. Abortando."
    exit 1
fi

echo "✅ Container encontrado: $CONTAINER_NAME"
echo "📦 Iniciando backup do banco: $DB_NAME"
echo "💾 Destino: $BACKUP_FILE"

# --- Executar o backup ---
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# --- Verificar se deu certo ---
if [ $? -eq 0 ]; then
    gzip "$BACKUP_FILE"
    echo "✅ Backup concluído com sucesso!"
    echo "📁 Arquivo: ${BACKUP_FILE}.gz"
    echo "📊 Tamanho: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
else
    echo "❌ ERRO: Falha ao criar o backup!"
    echo "💡 Dica: Verifique se o container '$CONTAINER_NAME' está rodando o PostgreSQL."
    rm -f "$BACKUP_FILE"
    exit 1
fi

# --- Limpar backups antigos ---
echo "🧹 Removendo backups com mais de $RETENTION_DAYS dias..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Pronto!"
