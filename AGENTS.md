# Psycho-Manager — Contexto do Projeto (Agent Reference)

> Arquivo mantido para continuidade entre sessões de desenvolvimento.
> Atualizado em: 2026-06-09

---

## 📋 Visão Geral

- **Stack:** Next.js 15.5.18 + Prisma 5.22 + PostgreSQL + NextAuth v5 beta
- **Deploy:** Docker standalone em VPS (2.24.110.64) via EasyPanel + Traefik
- **Banco:** Supabase PostgreSQL (`db:5432` via rede `psycho_supabase_default`)
- **Storage:** Uploads persistidos via Docker volume `uploads-data`
- **URL:** https://psycho-manager.site
- **SSL:** Let's Encrypt válido até 18/08/2026

---

## 🏗️ Arquitetura de Deploy

### Dockerfile (standalone)
- `output: "standalone"` no `next.config.ts`
- Build copia `.next/static` para `.next/standalone/.next/static`
- CMD: `npx prisma db push --accept-data-loss && node prisma/seed.js && node .next/standalone/server.js`

### docker-compose.yml (produção)
- Sem `ports`, usa apenas `expose: ["3000"]`
- Traefik labels para roteamento HTTPS
- Volumes:
  - `uploads-data:/app/.next/standalone/public/uploads`
  - `uploads-data:/app/public/uploads`
- Networks: `psycho_supabase_default` (banco) + `easypanel` (Traefik)
- Healthcheck: `wget --spider -q http://127.0.0.1:3000/login` ⚠️ usar `127.0.0.1`, não `localhost`

### Variáveis de ambiente (`.env` — NÃO versionar no Git)
```env
DATABASE_URL="postgresql://supabase_admin:your-super-secret-and-long-postgres-password@db:5432/postgres?schema=public"
AUTH_SECRET="qxlvaXCLp1Bs5VI8MqQp0i+2sE0yMWkAg/ZY16gTRU0="
NEXTAUTH_URL="https://psycho-manager.site"
SETUP_TOKEN="19fd59bd122241a3165183c45f25d742"
ADMIN_EMAIL="admin@psychomanager.com"
ADMIN_PASSWORD="Admin@1234"
ADMIN_NAME="Administrador"
NODE_ENV="production"
```

> **IMPORTANTE:** O arquivo `.env` foi removido do tracking do Git em 2026-06-09. No servidor, usar `.env.production` como base.

---

## 🔐 Autenticação (NextAuth v5)

- Estratégia: **JWT** (`session: { strategy: "jwt" }`)
- **Sem `PrismaAdapter`** — foi removido porque conflitava com JWT strategy
- Middleware (`src/middleware.ts`) protege rotas e exclui:
  - `_next/static`, `_next/image`, `favicon.ico`
  - Arquivos estáticos: `.*\.(?:svg|png|jpg|jpeg|gif|webp|pdf|txt)$`
  - Uploads: `uploads/.*`
- Roles: `ADMIN` e `USER` (padrão)
- `mustChangePassword` força redirect para `/alterar-senha`

---

## 📁 Upload de Arquivos

### Decisão arquitetural crucial
**Problema:** Next.js standalone cacheia 404s de arquivos estáticos. Se uma imagem/PDF em `/uploads/` for acessada antes de existir, o 404 fica em cache e nunca é servido depois.

**Solução:** Criamos uma **API route dedicada**:
- `GET /api/uploads/[...path]/route.ts` lê do disco e serve com `Content-Type` correto
- Componentes usam `/api/uploads/...` nas URLs
- Actions salvam `caminho = /api/uploads/{userId}/{nomeArquivo}` no banco
- Arquivos físicos continuam em `.next/standalone/public/uploads/` e `public/uploads/`
- Compatibilidade: componente `getArquivoUrl()` converte `/uploads/` antigo para `/api/uploads/`

### Componentes
- `FileUploadPreview` — drag-and-drop, preview, modal fullscreen (usado em `/pacientes/novo`)
- `ArquivosPaciente` — lista imagens + documentos, upload e delete (usado na página do paciente)

### Actions de arquivo
- `uploadArquivo(pacienteId, formData)` — salva em disco + banco
- `deleteArquivo(arquivoId, pacienteId)` — remove do disco (standalone + public) + banco
- `listarArquivos(pacienteId)` — lista arquivos do paciente

---

## 👥 Pacientes

### Funcionalidades implementadas
- ✅ Cadastro (`/pacientes/novo`) com upload múltiplo de arquivos
- ✅ Listagem com busca (`/pacientes`)
- ✅ Edição (`/pacientes/[id]/editar`)
- ✅ Visualização (`/pacientes/[id]`)
- ✅ Prontuário (`/pacientes/[id]/prontuario`)
- ✅ **Exclusão** (`deletePaciente`) — remove paciente, prontuário, sessões, pagamentos, arquivos do disco e do banco (com confirmação)

### Server Actions (`src/app/(dashboard)/pacientes/actions.ts`)
- `createPaciente(formData)` — valida com Zod, cria paciente, processa arquivos
- `updatePaciente(id, formData)` — atualiza dados do paciente
- `deletePaciente(id)` — busca arquivos, remove do disco, deleta paciente (cascade no banco)

---

## 🗄️ Banco de Dados (Prisma Schema)

### Modelos principais
- `User` — autenticação, role, `mustChangePassword`
- `Paciente` — dados pessoais, status, relacionamentos
- `Prontuario` — 1:1 com Paciente (cascade delete)
- `Sessao` — agendamentos, vinculada a Paciente e User
- `Pagamento` — vinculado a Paciente e/ou Sessao
- `Arquivo` — uploads vinculados a Paciente e User
- `Configuracao` — dados do profissional

### Relacionamentos com cascade
- `Paciente.prontuario` → `onDelete: Cascade`
- `Paciente.sessoes` → `onDelete: Cascade`
- `Paciente.arquivos` → `onDelete: Cascade`
- `Paciente.pagamentos` → `onDelete: SetNull`

---

## ⚠️ Problemas conhecidos e soluções aplicadas

| Problema | Causa | Solução |
|---|---|---|
| CSS build quebrava com `insetX: 0` | Tailwind não aceita `insetX` | Substituído por `left: 0, right: 0` |
| Erro de serialização de Date | Prisma retorna `Date`, cliente espera string | Mapear para `.toISOString()` antes de passar para componentes |
| Login com tema claro | CSS original era dark-mode | Restauradas regras `.dark .login-*` |
| Uploads retornavam 404/redirect | Middleware bloqueava `/uploads/*` | Adicionado `uploads/.*` ao `matcher` do middleware |
| Imagens 404 após upload | Next.js cacheia 404 de estáticos | API route `/api/uploads/[...path]` serve arquivos dinamicamente |
| Container `unhealthy` | `localhost` não resolve em Alpine | Healthcheck usa `127.0.0.1` |
| `.env` sobrescrito no deploy | `.env` estava versionado no Git | Removido do tracking; servidor usa `.env.production` |

---

## 🚀 Deploy

### Comando de deploy (VPS)
```bash
cd /opt/psycho-manager
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Checklist pós-deploy
- [ ] Container status: `docker ps` → `healthy`
- [ ] HTTPS acessível: `curl -I https://psycho-manager.site/login`
- [ ] Banco conectado: logs do container sem erro Prisma
- [ ] Uploads funcionando: acessar `/api/uploads/.../arquivo.jpg`

---

## 📂 Estrutura de arquivos relevante

```
src/
├── app/
│   ├── api/
│   │   └── uploads/[...path]/route.ts    ← API de arquivos
│   ├── (dashboard)/
│   │   └── pacientes/
│   │       ├── page.tsx                  ← Listagem com delete
│   │       ├── novo/page.tsx             ← Cadastro com upload
│   │       ├── actions.ts                ← CRUD paciente + arquivos
│   │       ├── arquivos-paciente.tsx     ← Componente de arquivos
│   │       ├── arquivos-actions.ts       ← Upload/delete de arquivo
│   │       └── delete-paciente-button.tsx ← Botão excluir (client)
│   └── login/page.tsx                    ← Login dark-mode
├── components/
│   └── file-upload-preview.tsx           ← Upload drag-and-drop
├── auth.ts                               ← NextAuth config (JWT)
├── middleware.ts                         ← Proteção de rotas
└── lib/db.ts                             ← Prisma client
```

---

## 📝 Tarefas pendentes / ideias futuras

- [ ] Migrar `.env` do servidor para usar `DATABASE_URL` com usuário `postgres` ao invés de `supabase_admin` (testar se funciona)
- [ ] Adicionar `.env` ao `.gitignore` e garantir que não volte ao tracking
- [ ] Implementar paginação na listagem de pacientes
- [ ] Adicionar filtros por status (ativo/inativo)
- [ ] Relatórios e exportação de dados
- [ ] Notificações de sessões próximas
- [ ] Backup automático do banco e uploads

---

## 🔗 Links úteis

- **Site:** https://psycho-manager.site
- **VPS:** 2.24.110.64 (root via SSH)
- **EasyPanel:** porta 3000 do host (acesso externo via Traefik)
- **Supabase DB:** container `psycho_supabase-db-1` na rede `psycho_supabase_default`
