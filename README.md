# Radar Editorial MT

Painel editorial com duas interfaces:
- `/` Dashboard operacional padrão
- `/tv` Wallboard (modo telão / redação)

## Rodar no Mac (teste local)

```bash
cd /Users/leandrobosaipo/.openclaw/workspace-openrouter-free/projects/codigo5-manutencao/radar-editorial-mt
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Acesse:
- Dashboard normal: `http://localhost:4173/`
- Modo TV: `http://localhost:4173/tv`

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
