# 🛡️ Backup Automático do Supabase

Este script faz backup do seu banco de dados PostgreSQL do Supabase rodando em Docker.

---

## 📦 O que está incluso

| Arquivo | Função |
|---------|--------|
| `backup-supabase.sh` | Script principal que faz o backup do banco |
| `setup-backup-cron.sh` | Instala o backup automático no cron |

---

## 🚀 Como instalar no seu VPS

### Passo 1: Copiar os arquivos para o servidor

No seu computador local, envie os arquivos pro VPS (substitua `root` pelo seu usuário se for diferente):

```bash
scp backup-supabase.sh setup-backup-cron.sh root@2.24.110.64:/root/
```

Ou, se já estiver logado no VPS, pode criar os arquivos manualmente com `nano`.

### Passo 2: Dar permissão

```bash
chmod +x /root/backup-supabase.sh
chmod +x /root/setup-backup-cron.sh
```

### Passo 3: Instalar o backup automático

```bash
./setup-backup-cron.sh
```

Escolha a frequência:
- **1) Diário** — todo dia às 3h da manhã
- **2) Semanal** — toda segunda-feira às 3h da manhã
- **3) Manual** — você roda quando quiser

---

## 📝 Como rodar manualmente

```bash
./backup-supabase.sh
```

O backup será salvo em:
```
/root/backups/supabase/backup_postgres_YYYY-MM-DD_HH-MM-SS.sql.gz
```

---

## 📋 Comandos úteis

| Ação | Comando |
|------|---------|
| Ver backups salvos | `ls -lh /root/backups/supabase/` |
| Ver tamanho dos backups | `du -sh /root/backups/supabase/*` |
| Ver logs do cron | `tail -f /root/backups/logs/backup.log` |
| Ver agendamentos | `crontab -l` |
| Remover do cron | `crontab -l \| grep -v backup-supabase \| crontab -` |

---

## ⚙️ Configurações

Se quiser mudar algo, edite o arquivo `backup-supabase.sh`:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BACKUP_DIR` | `/root/backups/supabase` | Onde salvar os backups |
| `DB_NAME` | `postgres` | Nome do banco |
| `DB_USER` | `supabase_admin` | Usuário do banco |
| `RETENTION_DAYS` | `30` | Dias para manter backups antigos |

---

## 🔄 Restaurar um backup

Se precisar restaurar, use este comando (substitua o nome do arquivo):

```bash
gunzip -c /root/backups/supabase/backup_postgres_2025-01-01_03-00-00.sql.gz | \
  docker exec -i <NOME_DO_CONTAINER_POSTGRES> psql -U supabase_admin -d postgres
```

> ⚠️ **Atenção:** A restauração apaga os dados atuais e substitui pelo backup. Faça com cuidado!

---

## 📌 Resumo

✅ Backup **automático** configurado  
✅ Arquivos **compactados** (economiza espaço)  
✅ Limpeza **automática** de backups antigos (+30 dias)  
✅ Restauração **simples** quando precisar  

---

Dúvidas? É só perguntar! 🚀
