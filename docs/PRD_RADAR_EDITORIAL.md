# PRD — Radar Editorial MT

## 1) Objetivo
Centralizar a operação editorial dos portais em um único sistema com 3 visões:
- `/` Dashboard operacional
- `/tv` Painel TV (wallboard)
- `/agenda` Agenda semanal de execução/plano

## 2) Problema que resolve
- Reduzir ambiguidade de status (site global x regra editorial)
- Mostrar atraso real por regra correta de cada portal
- Padronizar leitura para redação e gestão

## 3) Fonte de verdade de regras
Arquivo oficial:
- `../automation/editorial-monitor/RULES_EDITORIAIS_OFICIAIS.md`

O front deve sempre consumir o payload de compliance do feed plugin quando disponível (`compliance_status`, `compliance.checks`).

## 4) Escopo funcional

### 4.1 Dashboard (`/`)
- Cards por portal com:
  - Status SITE
  - Status REGRA
  - Regras por categoria (janela/dias)
- Auditoria de atrasos
- Metas diárias com progresso `x/y`
- Badges claros por tipo (HORA / META / ATUAL)
- Memes como `SOB DEMANDA` (nunca em atraso por hora)

### 4.2 TV (`/tv`)
- Visão de telão com rotação de cenas
- Prioridade de leitura rápida
- Status sintético por portal

### 4.3 Agenda (`/agenda`)
- Semana completa (Seg–Dom)
- **Hoje**: execução real (OK/PEND e progresso real)
- **Demais dias**: PLANO (não replica execução de hoje)
- Cabeçalho padrão TV em linha fina com:
  - Nome do sistema
  - Subtítulo do painel
  - Período da agenda (início/fim)
  - Data/hora de atualização

## 5) Regras de negócio aprovadas (resumo)
- PMT/OMT: grade horária + exceções de fim de semana
- ROO: metas diárias por editoria, sem grade horária
- AFL/PNMT/PPMT: atualização global simplificada
- Fuso oficial: America/Cuiaba
- Memes: sob demanda

## 6) Critérios de aceite
1. Nenhum portal de meta diária exibe semântica de atraso horário indevido.
2. Agenda não replica “resultado de hoje” para outros dias.
3. Cabeçalho da agenda segue padrão TV com período e atualização.
4. Dashboard/TV/Agenda são coerentes com a regra oficial.

## 7) Fora de escopo (agora)
- Histórico retroativo detalhado por dia da semana na agenda
- Simulador de cenário futuro com dados históricos

## 8) Próximos incrementos sugeridos
- Toggle na agenda: `Plano` x `Execução (hoje)`
- Cena dedicada de compliance no `/tv`
- Legenda global padronizada de cores e estados
