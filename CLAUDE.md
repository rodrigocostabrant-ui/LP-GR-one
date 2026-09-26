# GR One — Landing Page

Site institucional da própria GR One (estúdio de landing pages premium dos sócios
Rodrigo e Gustavo). Convertido do design em `Lp design/GR One landing page design.zip`
(export `.dc.html`) para Next.js, com deploy futuro na Vercel.

**Este projeto é uma exceção deliberada** às regras padrão de projetos de cliente da
GR One: é a vitrine de capacidade máxima do próprio estúdio, então usa fidelidade
total ao design (WebGL, GSAP, cursor customizado) em vez do design system "seguro"
de baixo risco usado em projetos de cliente.

## Fonte da verdade do design

- **v2 (atual)** — `Lp design/v2/GR One Landing v2.dc.html` + `support.js`, importados do
  projeto `GR One landing page design` em claude.ai/design em 2026-09-25. Substitui a v1
  como fonte de verdade para estrutura de seções e copy.
- v1 (histórica, só para contexto do que mudou) — `Lp design/GR One landing page design.zip`:
  `GR One Especificacao.dc.html` (especificação de cores/tipografia/grid/movimento/objeto 3D,
  ainda válida) e `GR One Landing.dc.html` (protótipo v1, copy superada pela v2).

Ao ficar em dúvida sobre um valor (cor, espaçamento, curva de animação), a especificação v1
ainda vale. Para estrutura de seções e todo o copy em pt-BR, usar o `.dc.html` da v2.

## Decisões já tomadas (não reabrir sem o usuário pedir)

- **Fidelidade total**: objeto 3D "GR" em WebGL real (Three.js puro — ver "Sistema de
  motion"), Lenis (scroll suave) + GSAP ScrollTrigger para as seções fixas, e cursor
  customizado — como especificado. (A versão em React Three Fiber foi substituída em
  2026-09-25: 3 canvases/loops, texto chapado com fonte da CDN em vez de Archivo.)
- **Seção "Criação — vitrine conceitual" removida** desde a v1 (as 4 marcas fictícias
  Morada Nove, Lume, Atelier Traço, Rota Serena não entram). Confirmado pela v2 (o
  runtime da v2 ainda carrega esses dados mas nenhuma seção do HTML os renderiza).
- **Seção "Assinatura 3D" (5 estados, scroll dedicado) removida na v2.** O objeto 3D
  "GR" continua na página, mas só como marca decorativa pontual (Hero, Processo,
  Contato) — não mais como seção própria de 440vh.
- **Mensagens sem citar "Rodrigo e Gustavo" por nome.** A v2 generaliza toda a
  comunicação para "atendimento personalizado" / "começar uma conversa", em vez de
  nomear os sócios nos CTAs e no rodapé do Contato — mudança de tom deliberada da v2,
  não um esquecimento.
- **"Condições" (50/50, 3 revisões) virou "Investimento".** A v2 troca os termos
  comerciais explícitos por uma explicação do processo de atendimento
  (Primeiro contato → Reunião de diagnóstico → Proposta sob medida), mantendo
  "investimento sob consulta".
- **WhatsApp**: número real ainda não definido. Usar um placeholder óbvio
  (`5500000000000`) em `content/site.ts`, marcado com `// TODO: número real do
  WhatsApp` — nunca publicar em produção sem substituir.
- **Deploy/GitHub/Vercel**: fica para depois. Não criar repositório nem tentar
  publicar sem o usuário pedir explicitamente.

## Ordem de seções da página (v2)

1. Hero (`#inicio`) — título "TRANSFORMA visitante em cliente", marca 3D decorativa
2. Manifesto — "SUA EMPRESA NÃO É COMUM." (seção fixa, 340vh, fragmentação de texto)
3. Método (`#metodo`) — "Anatomia de uma página que converte": maquete interativa +
   lista de 6 partes (Promessa, Identificação, Método, Objeções, Diferenciais, Chamada)
4. Processo (`#processo`) — trilho horizontal fixo, 560vh, 5 etapas, marca 3D decorativa
5. Manifesto tipográfico — duas faixas de texto em marquee + 2 diferenciais
6. Antes e depois — slider de comparação (Vale Advocacia, fictício e sinalizado)
7. Investimento — "sob consulta" + como funciona o atendimento (3 passos)
8. CTA final / Contato (`#contato`) — marca 3D decorativa
9. Footer

Os componentes v1 substituídos (`Assinatura.tsx`, `Condicoes.tsx`) foram movidos para
`_removido-v2/` (extensão `.bak`, fora do build) em vez de apagados — apague-os de vez
só se o usuário pedir.

## Arquitetura

```
app/
  layout.tsx          # fontes via next/font (Archivo, Instrument Serif, JetBrains Mono), metadata, JSON-LD
  page.tsx            # composição das seções, sem markup solto
  globals.css         # tokens de design (--bg, --ink, --blue etc.) + base Tailwind
  actions.ts          # Server Action do formulário/lead, se houver
components/
  sections/           # um arquivo por seção (Hero, Manifesto, Metodo, Processo, ...)
  ui/                 # botão magnético, cápsula de navegação, cursor customizado
  three/               # palco WebGL (Three.js), marcas GRMark, geometria do "GR" + fallback
  motion/              # MotionProvider (liga o motor de lib/motion)
  Analytics.tsx
content/
  site.ts             # todo o copy real (extraído do .dc.html), tipado, um lugar só
public/
  imagens otimizadas, textura de granulação SVG
```

Texto nunca hardcoded em componente — sempre via `content/site.ts`.

## Sistema de motion (reconstruído em 2026-09-25)

- **Um relógio só**: `lib/motion/engine.ts` usa o `gsap.ticker` (que também move o
  Lenis) e roda três fases por quadro, nesta ordem: `measure` (só leituras de layout) →
  `update` (escritas no DOM, cálculo de estados) → `render` (WebGL, cursor). Nunca
  criar `requestAnimationFrame`, listener de `scroll`/`mousemove`/`resize` próprio —
  usar `useTick(fase, fn)` e `useScrollProgress(ref, start, end)` de `lib/motion/hooks.ts`.
- **Progresso de scroll**: um ScrollTrigger por seção que só grava `p` (0–1); a escrita
  acontece na fase `update`. As fórmulas das seções seguem o script do protótipo v2.
- **Objeto 3D**: `components/three/stage.ts` — um renderer, um canvas fixo
  (`.gr-stage`, z-index 2), recorte por marca (`<GRMark>` define a caixa). Texto que deve
  ficar à frente do objeto precisa de `position: relative; z-index: 3`. Geometria real
  gerada por `npm run build:glyph` (Archivo 800/wdth 112, 4 fatias) em
  `components/three/gr-glyph.json`. Estúdio de luz gerado em código (sem HDR externo).
- **Tokens**: curvas em `lib/motion/tokens.ts` espelham `--ease-entrada`/`--ease-transicao`.
- **CSS**: estilos de componente em `@layer components`, base de `a` em `@layer base`
  (fora de camada vence os utilitários do Tailwind v4). Sem `scroll-behavior: smooth` —
  briga com o Lenis (quebrava a navegação por âncora).
- `@react-three/fiber` e `@react-three/drei` ficaram no `package.json` sem uso (remover
  dependências exige confirmação do usuário).

## Design tokens (da especificação)

```css
--bg: #04060A;        --bg2: #080C14;      --surf: #0D1320;
--ink: #EEF1F5;        --silver: #B9C1CE;   --mute: #7D8697;
--blue: #3D6DFF;       --ice: #AFC4FF;      --deep: #0A1C4A;
--sans: 'Archivo', sans-serif;       /* variável: peso + largura (wdth) */
--serif: 'Instrument Serif', serif;  /* só itálica, no máximo 1x por bloco */
--mono: 'JetBrains Mono', monospace; /* legendas, índices, caixa alta */
```

Azul `#3D6DFF` nunca carrega texto corrido — só ícones, linhas, fundo de botão.
Gradientes só dentro da família prata/azul, nunca neon ou multicor.

Curvas de movimento (as únicas três permitidas):
- Entrada: `cubic-bezier(.16,1,.3,1)`, 1100–1300ms
- Transição: `cubic-bezier(.77,0,.18,1)`, 650–1200ms
- Acompanhamento (cursor/3D/paralaxe): interpolação 0.06–0.2 por quadro

Sempre respeitar `prefers-reduced-motion`: desligar fragmentação, paralaxe e troca
automática; manter só opacidade em 400ms.

## Regras de construção (herdadas da skill landing-premium:construir-landing)

- Server Components por padrão; `"use client"` só em componentes com estado, scroll
  listener, canvas 3D ou formulário.
- Nenhuma cor literal fora dos tokens CSS.
- `next/image` em toda imagem (exceto o canvas WebGL); `priority` só no hero.
- Mobile primeiro: variantes mobile já estão especificadas (renders estáticos no
  lugar do WebGL, listas verticais no lugar de trilhos horizontais).
- Rodar `npm run build` a cada 2–3 seções construídas, não só no fim.
- Cursor customizado e ímã de botão só com `(pointer: fine)` — desligados no toque.
- WebGL do objeto 3D: detectar GPU fraca/`prefers-reduced-data`/mobile e trocar por
  imagem estática pré-renderizada.

## Checklist antes de considerar pronto

- [ ] Todas as seções do protótipo implementadas (exceto a vitrine, removida)
- [ ] Copy 100% fiel ao `GR One Landing.dc.html` (nenhum texto inventado)
- [ ] `prefers-reduced-motion` testado
- [ ] Testado em 375px, 768px, 1440px sem scroll horizontal
- [ ] `npm run build` sem erro/warning relevante
- [ ] WhatsApp com placeholder sinalizado como TODO
- [ ] Nenhuma menção a métricas/números inventados (o design já evita isso)

## Nota sobre AGENTS.md

O `AGENTS.md` na raiz é gerado automaticamente pelo `next dev`/`next build` (Next.js
15+) e é reescrito sozinho — não editar manualmente, não remover do commit.
