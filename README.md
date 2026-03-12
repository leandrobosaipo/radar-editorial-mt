# Radar Editorial MT

Painel editorial com três interfaces:
- `/` Dashboard operacional padrão
- `/tv` Wallboard (modo telão / redação)
- `/agenda-wall` Painel humanizado de metas por hora e por dia

## Rodar no Mac (teste local)

```bash
cd /Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Acesse:
- Dashboard normal: `http://localhost:4173/`
- Modo TV: `http://localhost:4173/tv`
- Agenda Wall: `http://localhost:4173/agenda-wall`

## Dados usados

1) Prioridade: feeds por site (tempo real)
- `https://perrenguematogrosso.com.br/wp-json/radar/v1/feed`
- `https://afolhalivre.com/wp-json/radar/v1/feed`
- `https://omatogrossense.com/wp-json/radar/v1/feed`
- `https://portalnortemt.com/wp-json/radar/v1/feed`
- `https://portalpantanalmt.com/wp-json/radar/v1/feed`
- `https://roonoticias.com/wp-json/radar/v1/feed`

2) Fallback:
- `latest.json` público

## Modo TV (/tv)

Características:
- layout 16:9 em tema dark
- cards KPI grandes
- gráficos por portal/categoria/jornalista
- status por portal com top 5 categorias críticas
- ticker dos últimos posts
- auditoria crítica ordenada por severidade
- atualização automática dos dados (intervalo padrão do app)

## Publicação e URL para TV

URL pública do app:
- `https://leandrobosaipo.github.io/radar-editorial-mt/`

URL do modo TV (usar a mesma na TV Android):
- `https://leandrobosaipo.github.io/radar-editorial-mt/tv`

### Uso na TV
1. Abra o navegador da TV
2. Acesse a URL `/tv`
3. Coloque em tela cheia
4. Desative suspensão de tela (economia de energia)

## Pastas oficiais do projeto (source of truth)
- Frontend Radar (este repositório):
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt`
- Automação/sincronização de dados:
  - `/Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/automation/editorial-monitor`

## Rotina segura de deploy (evitar rota/projeto errado)
1. **Entrar no repositório correto**:
   - `cd /Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt`
2. **Validar remoto e branch antes de alterar**:
   - `git remote -v` (deve apontar para `leandrobosaipo/radar-editorial-mt`)
   - `git branch --show-current` (deve ser `main`, salvo orientação contrária)
3. **Rodar local e validar tela alterada**:
   - `npm run dev -- --host 0.0.0.0 --port 4173`
4. **Build obrigatório**:
   - `npm run build`
5. **Commit + push**:
   - `git add ... && git commit -m "..." && git push origin main`
6. **Confirmar GitHub Actions** (`Deploy dashboard to GitHub Pages`) com status success.

### Regra operacional para futuros agentes
- Nunca assumir caminho de memória antiga.
- Sempre pedir/confirmar e depois validar com `git remote -v` + `pwd` antes do deploy.
- Se existirem múltiplos projetos parecidos, tratar este caminho como padrão oficial do Radar.

Guia completo: `docs/DEPLOY_SAFE_ROUTINE.md`
