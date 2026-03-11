# Changelog Editorial (curado)

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
- `(atual)` — acordeão por portal (mostrar hoje/abrir outros dias), semântica de cores revisada e aderência por categoria

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
