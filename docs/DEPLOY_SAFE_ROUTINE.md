# Deploy Seguro — Radar Editorial MT

Objetivo: evitar deploy no projeto/rota errada em sessões futuras.

## 1) Caminhos oficiais
- Frontend (este repo):
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt`
- Automação de dados:
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/automation/editorial-monitor`

## 2) Pré-check obrigatório (sempre)
```bash
pwd
git remote -v
git branch --show-current
```
Esperado:
- diretório termina com `radar-editorial-mt`
- remote aponta para `https://github.com/leandrobosaipo/radar-editorial-mt.git`
- branch `main` (salvo ordem explícita)

## 3) Teste local antes de subir
```bash
npm run dev -- --host 0.0.0.0 --port 4173
npm run build
```
URLs locais:
- `http://localhost:4173/`
- `http://localhost:4173/tv`
- `http://localhost:4173/agenda`
- `http://localhost:4173/agenda-wall`

## 4) Deploy
```bash
git add ...
git commit -m "mensagem objetiva"
git push origin main
```
Depois confirmar no GitHub Actions:
- workflow: `Deploy dashboard to GitHub Pages`
- status: `success`

## 5) Regra de ouro para agentes
Se houver mais de um projeto parecido na máquina, **não presumir caminho**. Confirmar o caminho oficial acima + remote antes de qualquer push.
