# Projeto Radar Editorial — Memória Operacional e Skillbook

## 1) Arquivos obrigatórios de continuidade
- `docs/PRD_RADAR_EDITORIAL.md` → produto e funcionamento consolidado
- `docs/CHANGELOG_EDITORIAL.md` → histórico de mudanças
- `docs/OPEN_ITEMS.md` → backlog objetivo
- `../automation/editorial-monitor/RULES_EDITORIAIS_OFICIAIS.md` → regra editorial oficial

## 1.1) Caminhos oficiais (absolutos)
- Frontend Radar (deploy GitHub/Lovable):
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt`
- Automação e sync de dados:
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/automation/editorial-monitor`

## 2) Arquitetura de dados (plugin ↔ painel)
## Feed por portal
Endpoint: `/wp-json/radar/v1/feed`

Campos mandatórios para consistência:
- `site`, `generated_at`, `totals`
- `site_status`, `compliance_status`, `compliance.checks[]`
- `editorial_rules[]` (regra única)
- `latest_posts[]`
- `history.daily[]`, `history.hourly[]`, `history.posts[]`, `history.meta[]`

## Regras para consumo no front
1. Sempre consumir `editorial_rules` antes de qualquer regra local.
2. Usar fallback local apenas quando `editorial_rules` vier vazio.
3. Nunca duplicar regra em páginas diferentes.

## 3) Skill de Agenda (regra visual)
### Comportamento padrão
- Exibir apenas dia atual por portal.
- “Comparar outros dias” abre visão histórica.

### Semântica de cores
#### Horária
- `N/I` (hora futura) = cinza
- `OK` (1) = verde
- `OK 2+` = azul
- hora atual sem post = laranja (`NO PRAZO`)
- hora passada sem post = vermelho (`FORA PRAZO`)

#### Meta diária
- meta concluída = verde
- em andamento (janela aberta) = laranja
- não concluída após janela = vermelho
- sem dados = cinza

### Regras especiais
- PMT/OMT (regra mista hora+meta): metas diárias ocultas por padrão
- ROO/PNMT/PPMT/AFL (meta-only): metas abertas por padrão

## 4) Skill de decisão rápida (UX)
- Topbar fina sticky com legenda em dropdown
- filtros no dropdown (turno + só problemas)
- ranking de risco no dropdown
- faixa “Situação do dia” por portal
- drill-down clicável com link + jornalista + copiar resumo

## 5) Ritual obrigatório de mudança
Antes:
1. Conferir regra oficial
2. Validar impacto nas telas (`/`, `/tv`, `/agenda`, `/agenda-wall`)
3. Validar que está no repo certo (`pwd`, `git remote -v`, `git branch --show-current`)

Depois:
1. Build local OK (`npm run build`)
2. Commit/push no repo correto
3. Confirmar workflow `Deploy dashboard to GitHub Pages` em success
4. Atualizar changelog/open items
5. Validar visual nas telas alteradas

## 6) Não fazer
- Não criar regra nova só no front sem refletir no plugin.
- Não usar nomes/slug de categoria sem normalização.
- Não alterar semântica de cor sem atualizar legenda/topbar.
