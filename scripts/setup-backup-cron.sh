#!/bin/bash

# ============================================
# Instalador de Backup Automático (Cron)
# ============================================
# Este script instala o backup automático no cron
# do seu VPS para rodar semanalmente.
# ============================================

echo "🛠️  Instalando backup automático do Supabase..."

SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/backup-supabase.sh"

# Verificar se o script de backup existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ ERRO: Script backup-supabase.sh não encontrado!"
    echo "   Esperado em: $SCRIPT_PATH"
    exit 1
fi

# Dar permissão de execução
chmod +x "$SCRIPT_PATH"

# Criar pasta de logs
mkdir -p /root/backups/logs

# Perguntar frequência
echo ""
echo "Qual frequência de backup você quer?"
echo "  1) Diário (todo dia às 3h da manhã)"
echo "  2) Semanal (toda segunda às 3h da manhã)"
echo "  3) Manual (não instalar no cron)"
echo ""
read -p "Escolha (1, 2 ou 3): " choice

case $choice in
    1)
        # Diário: 3h da manhã
        CRON_JOB="0 3 * * * $SCRIPT_PATH >> /root/backups/logs/backup.log 2>&1"
        echo "📅 Backup configurado: TODO DIA às 03:00"
        ;;
    2)
        # Semanal: segunda-feira 3h da manhã
        CRON_JOB="0 3 * * 1 $SCRIPT_PATH >> /root/backups/logs/backup.log 2>&1"
        echo "📅 Backup configurado: TODA SEGUNDA-FEIRA às 03:00"
        ;;
    3)
        echo "📝 Ok! Backup manual."
        echo "   Para rodar manualmente execute:"
        echo "   $SCRIPT_PATH"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida."
        exit 1
        ;;
esac

# Remover entrada antiga do cron se existir
(crontab -l 2>/dev/null | grep -v "backup-supabase.sh") | crontab -

# Adicionar nova entrada
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo ""
echo "✅ Cron instalado com sucesso!"
echo ""
echo "📋 Para ver os backups agendados:"
echo "   crontab -l"
echo ""
echo "📋 Para ver os logs de execução:"
echo "   tail -f /root/backups/logs/backup.log"
echo ""
echo "📁 Os backups serão salvos em:"
echo "   /root/backups/supabase/"
