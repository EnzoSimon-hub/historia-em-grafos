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
| [`docs/proposta.md`](docs/proposta.md) | **Proposta e especificação completa do projeto** — os 12 itens exigidos na Etapa 01: problema, público-alvo, objetivo, funcionalidades, entidades do domínio, telas, operações, tecnologias, persistência e diagramas da solução. |

---

## Estrutura do repositório

```
historia-em-grafos/
├── README.md          → este arquivo
└── docs/
    └── proposta.md    → proposta e especificação do projeto (Etapa 01)
```

---

## Entregas por etapa

| Etapa | Descrição | Tag | Status |
|---|---|---|---|
| **01** | Proposta e especificação do projeto | `etapa-01` | ✅ Entregue |
| 02 | — | — | ⏳ A definir |
| 03 | — | — | ⏳ A definir |

---

## Status do projeto

O repositório encontra-se na **fase de especificação**. Esta etapa entrega a definição do problema e a especificação funcional inicial da aplicação; o código-fonte do cliente e do servidor será incorporado nas etapas seguintes da disciplina, conforme o desenvolvimento incremental previsto no plano de ensino.
