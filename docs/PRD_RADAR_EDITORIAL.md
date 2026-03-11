# PRD — Radar Editorial MT (Consolidado)

## 1) Objetivo
Centralizar monitoramento editorial dos portais em 3 visões sincronizadas:
- `/` Dashboard operacional (gestão diária)
- `/tv` Painel TV (leitura rápida em telão)
- `/agenda` Agenda operacional (execução por hora + metas por dia)

## 2) Problema que resolve
- Elimina inconsistência entre regras por portal/categoria.
- Separa claramente status de site (atividade global) vs status de regra editorial.
- Permite decisão rápida para coordenação (atrasos, metas pendentes, risco do dia).

## 3) Fonte única de regra (single source of truth)
## Backend (plugin nos portais)
O feed do plugin (`/wp-json/radar/v1/feed`) é a fonte oficial.
Campos críticos:
- `compliance_status`
- `compliance.checks[]`
- `editorial_rules[]` ✅ (regra unificada usada pelo front)
- `history.daily[]`
- `history.hourly[]`
- `history.posts[]` (drill-down com título/link/autor)
- `history.meta[]`

## Frontend
- Agenda, Dashboard e cards devem priorizar `editorial_rules`.
- Fallback local só quando `editorial_rules` vier vazio.

## 4) Regras editoriais consolidadas
- Fuso oficial: `America/Cuiaba`
- PMT/OMT: regras mistas (hora + meta em fim de semana)
- ROO/PNMT/PPMT/AFL: foco em meta diária
- Memes: sob demanda (não entra em atraso por janela horária)

## 5) Escopo funcional atual

### 5.1 Dashboard (`/`)
- Cards por portal com:
  - `SITE` (atividade global)
  - `REGRA` (compliance editorial)
- Tabela por categoria com regra/janela/status
- Auditoria de atrasos
- Metas com `x/y`

### 5.2 TV (`/tv`)
- Cenas rotativas (gráficos, sites, auditoria)
- Ordem de portais fixa
- Leitura sintética para operação

### 5.3 Agenda (`/agenda`)
- Janela: dia atual + 6 anteriores
- Acordeão por portal:
  - padrão: foco no hoje
  - ação: “Comparar outros dias”
- Heatmap horário com semântica:
  - `N/I` (hora futura)
  - `OK` / `OK 2+`
  - `EM PRAZO` (hora atual sem post)
  - `FORA PRAZO` (hora passada sem post)
- Metas diárias em tabela com colunas por dia:
  - PMT/OMT: ocultas por padrão (regra mista)
  - ROO/PNMT/PPMT/AFL: abertas por padrão (meta-only)
- Aderência:
  - por site (hora/meta) no dia
  - por categoria na linha
- Drill-down por célula:
  - título, link, jornalista, horário
  - botão “Copiar resumo”

## 6) Critérios de aceite (atualizados)
1. PMT/OMT não exibem metas diárias abertas por padrão.
2. Portais de meta-only mantêm meta visível no modo padrão.
3. Hora atual sem post aparece como `EM PRAZO` (não fora do prazo).
4. Hora passada sem post aparece como `FORA PRAZO`.
5. Não há duplicação de categoria horária (ex.: OMT MT Notícias).
6. Regras usadas nas telas vêm de `editorial_rules` do plugin.

## 7) Operação e deploy
- Deploy front: `radar-editorial-mt` (GitHub Pages)
- Deploy plugin: SSH/SCP + WP-CLI nos 6 portais
- Pós deploy obrigatório:
  - `cache flush`
  - `transient delete --all`
  - cron due-now
  - purge Cloudflare

## 8) Próximos incrementos
- Guardrail: alerta automático quando feed de portal vier sem `editorial_rules`.
- Testes de regressão para regras de hora atual/atraso/meta.
- Cena executiva no `/tv` com “semáforo do dia”.
