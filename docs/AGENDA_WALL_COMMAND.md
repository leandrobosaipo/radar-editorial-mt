# Agenda Wall Command (`/agenda-wall`)

## Objetivo
Tela de comando para TV que responde em 3 segundos:
1. Já faltou publicação hoje?
2. Quem está atrasando?

## Princípios
- Primeira dobra sem rolagem com os 6 portais (grid 3x2 em 1080p)
- Sem tabelas na dobra principal
- Continuidade analítica ao rolar (Agenda detalhada existente)
- Fonte única de regra: `editorial_rules` do plugin

## Dados usados
- `editorial_rules`
- `history.hourly`
- `history.meta`
- `history.posts`

## KPIs por card
- Hora (% aderência)
- Meta (% aderência)
- Janelas vencidas
- Janelas em andamento (hora atual)
- Déficit de meta
- Top 3 categorias críticas
- Mini timeline das últimas 6h

## Cores
- Verde: OK
- Azul: acima da meta / volume maior
- Laranja: em andamento
- Vermelho: vencido
- Cinza: neutro/sem dados

## Componentes futuros sugeridos
- `PortalWallCard`
- `PortalWallRiskBadge`
- `PortalWallCategoryList`
- `PortalWallKPI`
- `PortalWallMiniTimeline`

## Manutenção
- Qualquer alteração de regra editorial deve ocorrer no plugin e refletir no `editorial_rules`
- Evitar duplicação de regra no front
