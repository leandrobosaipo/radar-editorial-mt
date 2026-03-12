# Open Items — Radar Editorial MT (Atual)

## Alta prioridade
- [ ] Criar guardrail para feed sem `editorial_rules` (alerta por portal).
- [ ] Garantir `editorial_rules` e `history.posts` consistentes no ROO em 100% das respostas.
- [ ] Validar em produção mobile/desktop a regra de visibilidade de metas:
  - PMT/OMT (oculta por padrão)
  - ROO/PNMT/PPMT/AFL (aberta por padrão)

## Média prioridade
- [ ] Extrair engine de regras visuais da Agenda para módulo dedicado (`agendaRules.ts`).
- [ ] Adicionar testes de regressão:
  - hora atual = NO PRAZO
  - hora passada = FORA PRAZO
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
