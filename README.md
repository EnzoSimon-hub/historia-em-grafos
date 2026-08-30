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

O protótipo desta etapa é composto apenas por HTML e CSS, sem JavaScript.

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

---

## Estrutura do repositório

```
historia-em-grafos/
├── README.md                          → este arquivo
├── docs/
│   ├── proposta.md                    → proposta do projeto (Etapa 01)
│   └── etapa-02.md                    → documentação do protótipo (Etapa 02)
└── web/                               → protótipo estrutural (Etapa 02)
    ├── index.html                     → página inicial
    ├── grafo.html                     → grafo de conexões
    ├── personagens.html               → listagem
    ├── personagem.html                → detalhes
    ├── cadastro-personagem.html       → formulário de cadastro
    ├── cadastro-relacao.html          → formulário de vínculo
    ├── painel.html                    → painel administrativo
    ├── login.html                     → autenticação
    └── assets/
        └── css/
            └── estilo.css             → folha de estilo única, compartilhada
```

---

## Entregas por etapa

| Etapa | Descrição | Tag | Status |
|---|---|---|---|
| **01** | Proposta e especificação do projeto | `etapa-01` | ✅ Entregue |
| **02** | Protótipo estrutural com HTML semântico | `etapa-02` | ✅ Entregue |
| 03 | — | — | ⏳ A definir |

---

## Status do projeto

O repositório encontra-se na **fase de prototipação da interface**. A Etapa 01 entregou a
definição do problema e a especificação funcional; a Etapa 02 entrega a primeira interface
Web, construída com HTML semântico e sem comportamento dinâmico.

O código do cliente e do servidor descritos na *Stack pretendida* será incorporado nas etapas
seguintes, conforme o desenvolvimento incremental previsto no plano de ensino.
