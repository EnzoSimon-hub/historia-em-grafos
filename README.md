# História em Grafos

> Aplicação Web para registro, organização e exploração visual de conhecimento histórico representado como uma rede de conexões entre personagens, eventos e locais.

---

## Identificação

| | |
|---|---|
| **Aluno** | Enzo Simon |
| **Disciplina** | Tecnologia de Construção de Software 1 |
| **Professor** | Jaderson |
| **Semestre** | 2026/2 |
| **Repositório** | https://github.com/EnzoSimon-hub/historia-em-grafos |

---

## O problema

O conhecimento histórico é registrado e ensinado de forma **linear** — linhas do tempo, textos corridos, planilhas —, formato que esconde o que dá sentido à História: a **teia de relações** entre pessoas, acontecimentos e lugares. Perguntas naturalmente relacionais ("quais eventos foram causados por esta batalha?", "quem são os descendentes deste governante?") só podem ser respondidas hoje com leitura manual de várias fontes e cruzamento mental das informações.

**História em Grafos** ataca esse problema permitindo que o usuário cadastre não apenas os fatos, mas as **relações tipadas** entre eles, e navegue todo o acervo como um grafo interativo — substituindo o cruzamento manual por exploração visual.

---

## Objetivo

Permitir que um **curador** cadastre entidades históricas e as relações entre elas, e que qualquer **visitante** explore esse acervo como um grafo navegável, transformando consultas relacionais complexas em navegação visual.

---

## Como abrir o protótipo

Não é necessário instalar nada nem executar servidor:

1. Baixe ou clone o repositório.
2. Abra **`web/index.html`** no navegador — duplo clique já basta.
3. Navegue pelo menu superior.

Desde a Etapa 04 o protótipo é interativo (JavaScript puro, sem build). As telas com
comportamento dinâmico são:

| Tela | O que experimentar |
|---|---|
| `web/personagens.html` | busca enquanto digita, filtro por dinastia, ordenação |
| `web/cadastro-personagem.html` | validação do formulário e inclusão de um personagem no acervo |
| `web/painel.html` | indicadores calculados, remoção com modal e efeito em cascata |

Os dados ficam no `localStorage` do navegador. **Painel do Curador → Restaurar acervo de
exemplo** volta ao estado inicial. O roteiro completo de teste está em
[`docs/etapa-04.md`](docs/etapa-04.md#8-como-executar-e-testar).

---

## Stack pretendida

| Camada | Tecnologia |
|---|---|
| **Cliente** | React 19 · Vite · Tailwind CSS v4 · vis-network |
| **Servidor** | Java 21 · Spring Boot 4 · Spring Web MVC · Spring Security · Spring Data Neo4j |
| **Autenticação** | JSON Web Token (JJWT) |
| **Persistência** | Neo4j — banco de dados de grafos nativo (protocolo Bolt) |
| **Build** | Maven (servidor) · npm/Vite (cliente) |

As tecnologias podem ser ajustadas ao longo do semestre, mantida a coerência da solução: cliente Web em componentes, servidor com API REST e persistência orientada a grafos.

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/proposta.md`](docs/proposta.md) | **Etapa 01 — Proposta e especificação do projeto.** Os 12 itens exigidos: problema, público-alvo, objetivo, funcionalidades, entidades do domínio, telas, operações, tecnologias, persistência e diagramas da solução. |
| [`docs/etapa-02.md`](docs/etapa-02.md) | **Etapa 02 — Protótipo estrutural com HTML semântico.** Funcionalidades implementadas, páginas criadas e decisões relacionadas à estrutura HTML. |
| [`docs/etapa-03.md`](docs/etapa-03.md) | **Etapa 03 — Interface responsiva com CSS.** Breakpoints, uso de Flexbox e Grid, escala de espaçamentos, decisões de responsividade e as 9 evidências em três viewports. |
| [`docs/etapa-04.md`](docs/etapa-04.md) | **Etapa 04 — Interatividade com JavaScript.** Três funcionalidades interativas, validações, situações inválidas tratadas, matriz de evidências, roteiro de teste e 14 capturas. |

---

## Estrutura do repositório

```
historia-em-grafos/
├── README.md                          → este arquivo
├── docs/
│   ├── proposta.md                    → proposta do projeto (Etapa 01)
│   ├── etapa-02.md                    → documentação do protótipo (Etapa 02)
│   ├── etapa-03.md                    → documentação da responsividade (Etapa 03)
│   ├── etapa-04.md                    → documentação da interatividade (Etapa 04)
│   └── evidencias/
│       ├── etapa-03/                  → 9 capturas: 3 telas x 3 viewports
│       └── etapa-04/                  → 14 capturas das funcionalidades interativas
└── web/                               → protótipo da interface (Etapas 02, 03 e 04)
    ├── index.html                     → página inicial
    ├── grafo.html                     → grafo de conexões
    ├── personagens.html               → listagem
    ├── personagem.html                → detalhes
    ├── cadastro-personagem.html       → formulário de cadastro
    ├── cadastro-relacao.html          → formulário de vínculo
    ├── painel.html                    → painel administrativo
    ├── login.html                     → autenticação
    └── assets/
        ├── css/
        │   └── estilo.css             → folha de estilo única — layout, responsividade e estados
        └── js/
            ├── acervo.js              → dados do acervo e funções compartilhadas
            ├── personagens.js         → pesquisa, filtro e ordenação
            ├── cadastro-personagem.js → validação e inclusão
            ├── painel.js              → painel dinâmico e remoção em cascata
            ├── grafo.js               → grafo de conexões desenhado a partir do acervo
            └── vendor/
                └── cytoscape.min.js   → biblioteca Cytoscape.js 3.34.3 (MIT), cópia local
```

---

## Entregas por etapa

| Etapa | Descrição | Tag | Status |
|---|---|---|---|
| **01** | Proposta e especificação do projeto | `etapa-01` | ✅ Entregue |
| **02** | Protótipo estrutural com HTML semântico | `etapa-02` | ✅ Entregue |
| **03** | Interface responsiva com CSS | `etapa-03` | ✅ Entregue |
| **04** | Interatividade com JavaScript | `etapa-04` | ✅ Entregue |

---

## Status do projeto

O repositório encontra-se na **fase de prototipação da interface**. A Etapa 01 entregou a
definição do problema e a especificação funcional; a Etapa 02 entregou a primeira interface
Web, construída com HTML semântico e sem comportamento dinâmico; a Etapa 03 torna essa
interface responsiva — mesma estrutura HTML, adaptada de 1440px a 390px apenas com CSS; a
Etapa 04 acrescenta comportamento com JavaScript: busca, validação, inclusão e remoção sobre
dados mantidos no navegador.

O código do cliente e do servidor descritos na *Stack pretendida* será incorporado nas etapas
seguintes, conforme o desenvolvimento incremental previsto no plano de ensino.
