# Open Items — Radar Editorial MT (Atual)

## Alta prioridade
- [ ] Validar em produção (Lovable + GitHub Pages) que os 6 cards cabem sempre na primeira dobra em 1366x768 e 1920x1080.
- [ ] Aplicar `statusTheme` também no `/tv` para 100% de consistência visual de cores.
- [ ] Revisar regra de status por jornalista (hoje derivada das categorias) com editoria para confirmar se precisa cálculo próprio.
- [ ] Criar guardrail para feed sem `editorial_rules` (alerta por portal).

## Média prioridade
- [ ] Extrair engine de regras visuais da Agenda/AgendaWall para módulo dedicado (`agendaRules.ts`).
- [ ] Adicionar testes de regressão:
  - hora atual = NO PRAZO
  - hora passada = FORA PRAZO
  - categoria meta-only: abaixo da meta e dentro do prazo = amarelo
  - categoria meta-only: abaixo da meta e fora do prazo = vermelho
  - categoria acima da meta = azul
  - portais mistos vs meta-only
- [ ] Cena executiva no `/tv` com semáforo de risco por portal.

## Baixa prioridade
- [ ] Exportar resumo diário para mensagem de operação (auto-formatado).
- [ ] KPI semanal consolidado por jornalista/categoria.

---

## DoD (Definition of Done)
Só fechar item quando:
1. Implementado e validado com dados reais
2. Build local OK
3. Commit + push em `main`
4. Changelog atualizado
5. Regra/legenda compatível com topbar da Agenda
