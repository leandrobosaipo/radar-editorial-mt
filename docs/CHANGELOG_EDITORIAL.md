# Changelog Editorial (curado)

## 2026-03-12 (agenda-wall + regras globais + plugin)
- `3015a30` — refatoração inicial da `/agenda-wall` + SEO base + OG thumb
- `84fcc4f` — SEO runtime por ambiente (Lovable/GitHub Pages)
- `650c09f` — novo visual da agenda-wall + metas sociais estáticas no `index.html`
- `320e102` — documentação de deploy seguro + linguagem humanizada
- `f7003e1` — textos humanizados em `/`, `/tv`, `/agenda`, `/agenda-wall`
- `a86a41a` — padroniza lógica meta pendente x meta em atraso
- `8d14f01` — barra de progresso/contagem da próxima atualização automática (todas as telas)
- `63cb34f` — chips compactos de categoria e jornalista nos cards
- `b3a111e` — mini legenda + compactação do first fold
- `9dd9ea7` — status de categoria orientado por regra + toggle de legenda no header
- `4cfbd0a` — uso explícito de `meta_applicable` no front + cores de meta corrigidas
- `e83d1d9` — remove métricas horárias de portais meta-only nos cards
- `3f5bd7e` — tema global de cores (`statusTheme`) + cards meta-only mais enxutos
- `0437725` — horas perdidas no heatmap em vermelho + layout em colunas mais denso
- `24e04a8` — categorias/jornalistas passam a aceitar estado `acima` (azul)
- `001593e` — troca global de texto `EM PRAZO` -> `NO PRAZO`
- `75151cb` — fallback do front atualizado para novas categorias PPMT/PNMT/ROO/AFL

### Plugin (wordpress-plugin/radar-editorial-feed)
- `b18321d` — `history.meta` passa a incluir dias/categorias com count=0
- `e1912f9` — adiciona `meta_applicable` no `history.meta.categories[]`
- `4316222` — regras explícitas por portal:
  - PPMT: `caceres`, `mt_noticia`, `brasil_mundo`, `politica`, `esporte`
  - PNMT: `sinop`, `mt_noticia`, `brasil_mundo`, `politica`, `esporte`
  - ROO: `rondonopolis`, `mt_noticia`, `brasil_mundo`, `politica`, `esporte`
  - AFL: `primavera`, `mt_noticia`, `brasil_mundo`, `politica`, `esporte`


## 2026-03-11 (consolidação final da sessão)
- `26294f2` (plugin) — adiciona `editorial_rules` no feed como fonte única entre telas
- `2c86ad8` — Dashboard/Agenda passam a consumir `editorial_rules`
- `4bbf119` — aderência, causa provável e drill-down
- `6192c6e` — heatmap horário com contagem de posts
- `09c336d` — metas em colunas por dia
- `77c553e` — destaque da coluna de hoje e resumo por linha
- `096bf8b` — acordeão por portal + today-first para meta-only
- `3baee42` — dedupe categoria horária OMT + ajustes de visibilidade
- `2d3562b` — pacote UX (filtros turno/só problemas, risco, copiar resumo)
- `f413d43` — mantém metas visíveis no modo recolhido e move filtros/risco para topbar toggle
- `dcefeb6` — PMT/OMT com metas ocultas por padrão
- `15ecb3c` — visibilidade padrão por perfil de regra (misto vs meta-only)
- `a0fa258` — hora atual tratada como "NO PRAZO"

## 2026-03-10 / 2026-03-11

### Agenda
- `d8869b8` — criou página `/agenda` (grade semanal + metas)
- `1cfe0d5` — incluiu sábado e domingo na agenda
- `f0cc280` — agenda inteligente: hoje=execução real, demais dias=PLANO
- `17b3010` — cabeçalho padrão TV + docs base de produto
- `122a9b3` — modo produtividade: hoje + 6 dias anteriores
- `66902b1` — consumo de histórico 7d com fallback SEM DADOS
- `6192c6e` — heatmap horário com contagem (OK/OK2/OK3+)
- `4bbf119` — aderência + causa provável + drill-down modal
- `09c336d` — metas diárias em tabela por colunas de data
- `77c553e` — destaque da coluna HOJE + resumo por linha
- `2c86ad8` — front passa a consumir `editorial_rules` do plugin (fonte única)
- `096bf8b` — acordeão por portal (mostrar hoje/abrir outros dias), semântica de cores revisada e aderência por categoria
- `3baee42` — metas históricas dentro do acordeão, deduplicação de categoria horária (OMT MT Notícias), e ocultação de aderência horária/meta quando não aplicável
- `2d3562b` — implementação de 5 melhorias UX: filtro só problemas, visão por turno, ranking de risco, faixa de situação diária e copiar resumo no drill-down
- `f413d43` — filtros e ranking movidos para toggle da topbar + meta do dia visível no recolhido
- `dcefeb6` — PMT/OMT com metas ocultas por padrão
- `15ecb3c` — regra de abertura por perfil (misto vs meta-only)
- `(atual)` — criação da rota `/agenda-wall` (primeira dobra comando + agenda detalhada no scroll)

### Dashboard
- `11fa79a` — separou status SITE x REGRA e adicionou checks
- `604de08` — badges explícitos por tipo de regra (HORA/META/ATUAL)
- `b5e441a` — exibiu regra/janela por categoria e estado FORA JANELA
- `8aa5b63` — metas diárias em `x/y` com semáforo

### TV
- `7633f6f` — refinou cena de gráficos por site/categoria/jornalista
- `79523d9` — ordem fixa de portais
- `e1e09d7` — memes como sob demanda no TV/dashboard

### Governança de regra
- `00f6da1` / `2af00a5` — consumo de compliance central do feed
- Documento oficial de regras criado em `automation/editorial-monitor/RULES_EDITORIAIS_OFICIAIS.md`

## Convenção
- Atualizar este arquivo a cada mudança funcional relevante para não depender de memória da sessão.
