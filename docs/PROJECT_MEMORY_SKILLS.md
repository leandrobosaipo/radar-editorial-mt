# Memória e Skills do Projeto

## Memória operacional (persistência)
Use estes arquivos como memória viva do projeto:
- `docs/PRD_RADAR_EDITORIAL.md` → visão de produto e escopo
- `docs/CHANGELOG_EDITORIAL.md` → evolução funcional
- `docs/OPEN_ITEMS.md` → pendências

Fonte externa obrigatória para regras:
- `../automation/editorial-monitor/RULES_EDITORIAIS_OFICIAIS.md`

## Skillbook do projeto (prático)

### Skill: Regras Editoriais
Sempre que houver solicitação da editora:
1. Ler `RULES_EDITORIAIS_OFICIAIS.md`
2. Validar impacto em `/`, `/tv`, `/agenda`
3. Evitar regra duplicada no front (usar compliance do feed plugin)

### Skill: Agenda
- Hoje = execução real (visível por padrão)
- Outros dias = comparação sob demanda (acordeão por portal)
- Nunca replicar resultado de hoje em outros dias
- Cabeçalho padrão TV em topbar fina/sticky, com legenda em dropdown
- Heatmap horário:
  - N/I (hora futura) = cinza
  - OK (1) = verde
  - OK 2+ = azul
  - sem post em hora ativa = laranja (em prazo)
- Heatmap de metas:
  - meta concluída = verde
  - meta em andamento com janela aberta = laranja
  - meta não concluída com janela encerrada = vermelho
- Drill-down por célula: listar título + link + jornalista
- Aderência:
  - por site (hora/meta) no dia atual
  - por categoria na linha da tabela

### Skill: Status
- Separar `SITE` de `REGRA`
- Para meta diária: usar `x/y` e semáforo
- `Memes` sempre `SOB DEMANDA`

## Ritual de mudança
Antes de codar:
1. Atualizar/confirmar regra oficial
2. Registrar objetivo no PRD (se alterar produto)

Depois de codar:
1. Atualizar changelog
2. Atualizar open items
3. Validar UI nas 3 rotas
