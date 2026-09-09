# ETAPA 03 — Interface Responsiva com CSS

**Aplicação:** História em Grafos
**Aluno:** Enzo Simon
**Disciplina:** Tecnologia de Construção de Software 1
**Professor:** Jaderson
**Data:** 09/09/2026

---

## Sumário da entrega

| Exigência do enunciado | Onde é atendida |
|---|---|
| Utilizar **CSS organizado** | item 1 — folha única em 11 seções numeradas |
| Utilizar **Flexbox** | item 3.1 |
| Utilizar **Grid** ou solução equivalente | item 3.2 |
| **Media queries** | item 2 — três breakpoints |
| **Organização consistente de espaçamentos** | item 3.3 — escala de variáveis `--e-1` … `--e-7` |
| **Tratamento de diferentes tamanhos de tela** | itens 4 e 5 |
| Pelo menos **dois breakpoints** | item 2 — são **três** (1024px, 820px, 560px) |
| Adaptar **menus, formulários, listas ou cards** para telas menores | item 4 — os quatro casos |
| Evidências em desktop, tablet e smartphone | item 5 — 9 capturas |
| `/docs/etapa-03.md` e `/docs/evidencias/etapa-03/` | este documento e o diretório ao lado dele |

Continua valendo o que foi dito na Etapa 02: o protótipo é **estático**, feito de HTML e CSS,
**sem uma linha de JavaScript**. Toda a responsividade desta etapa é obtida com CSS puro —
inclusive a adaptação do menu, que em muitos projetos depende de script.

---

## 1. Localização do CSS responsável pela responsividade

```
historia-em-grafos/
└── web/
    └── assets/
        └── css/
            └── estilo.css      ← arquivo ÚNICO, 785 linhas
```

**Não há um segundo arquivo de CSS, nem `<style>` em nenhuma página.** Todas as oito páginas
do protótipo carregam a mesma folha:

```html
<link rel="stylesheet" href="assets/css/estilo.css">
```

A folha é organizada em **11 seções numeradas**, na mesma ordem em que os elementos aparecem
no documento HTML. Um cabeçalho no topo do arquivo repete o índice e explica a estratégia:

| Seção | Conteúdo | Linha |
|---|---|---|
| 1 | Variáveis (cores, fontes, escala de espaçamento) | 28 |
| 2 | Reset | 75 |
| 3 | Tipografia | 101 |
| 4 | Cabeçalho e navegação | 141 |
| 5 | Layout principal (Grid) | 200 |
| 6 | Artigos e listagens | 288 |
| 7 | Tabelas | 381 |
| 8 | Formulários | 434 |
| 9 | Botões | 528 |
| 10 | Figura do grafo, legenda e rodapé | 573 |
| **11** | **Responsividade — todas as media queries** | **656** |

**A decisão de organização mais importante é a seção 11.** Todas as media queries do projeto
estão reunidas nela, agrupadas por breakpoint e ordenadas do mais largo para o mais estreito.
Não existe nenhum `@media` espalhado pelo resto do arquivo. Assim, para saber o que muda em
uma determinada largura basta ler um bloco contínuo, em vez de caçar regras pelas 650 linhas
anteriores.

| Bloco | Breakpoint | Linha |
|---|---|---|
| 11.1 | `@media (max-width: 1024px)` | 665 |
| 11.2 | `@media (max-width: 820px)` | 678 |
| 11.3 | `@media (max-width: 560px)` | 703 |
| 11.4 | `@media (prefers-reduced-motion: reduce)` | 783 |

---

## 2. Breakpoints utilizados

São **três** breakpoints, escolhidos para cair **entre** os viewports de referência da entrega,
e nunca em cima deles — um breakpoint exatamente em 768px deixaria o tablet de 768px na
fronteira, onde qualquer arredondamento do navegador muda o resultado.

| Breakpoint | Regra | Faixa que atende | Viewport da evidência que cai aqui |
|---|---|---|---|
| — | (layout base) | acima de 1024px | **1440 × 900** (desktop) |
| largo | `max-width: 1024px` | 821px – 1024px | — (notebook estreito, tablet em paisagem) |
| médio | `max-width: 820px` | 561px – 820px | **768 × 1024** (tablet) |
| estreito | `max-width: 560px` | até 560px | **390 × 844** (smartphone) |

Como as media queries são cumulativas (`max-width`), em 390px valem os três blocos ao mesmo
tempo: o de 1024px, o de 820px e o de 560px. Cada bloco só redefine o que muda, sem repetir
o que já foi dito.

### 2.1 O que resolve as larguras intermediárias

Nenhuma largura fica sem tratamento, porque três mecanismos agem **sem** media query:

- **Grid fluido** — `repeat(auto-fill, minmax(255px, 1fr))` na grade de cartões (linha 241) e
  `auto-fit` nos indicadores do painel (linha 249). O próprio navegador decide quantas colunas
  cabem: 4 em 1440px, 3 em 768px, 1 em 390px — as duas primeiras transições acontecem sem que
  exista uma media query dizendo “agora são três colunas”.
- **`flex-wrap: wrap`** — presente em todos os contêineres flexíveis. Quando os itens deixam de
  caber lado a lado, eles quebram para a linha de baixo sozinhos.
- **`clamp()`** — nos títulos (linhas 112–113) e na margem lateral da página (linha 65). O valor
  acompanha a largura da tela continuamente, dentro de um mínimo e um máximo.

Os breakpoints existem para as mudanças que **não** podem ser contínuas: trocar o número de
colunas de um layout, reorganizar o menu, mudar a direção de um eixo.

---

## 3. Demonstração dos recursos exigidos

### 3.1 Flexbox

| Onde | Linha | Para quê |
|---|---|---|
| `body` | 94 | coluna vertical que empurra o rodapé para o fim da tela, mesmo em página curta |
| `body > header > div` | 160 | título à esquerda, subtítulo à direita; empilha quando não cabe |
| `nav ul` | 176 | abas do menu em linha, com quebra automática |
| `.barra` | 214 | título da seção à esquerda, botão de ação à direita |
| `article footer` | 339 | selos que quebram em várias linhas conforme a largura |
| `.conexoes > li` | 362 | tipo da relação + link da entidade, alinhados pela base |
| `search form` | 518 | campo de busca elástico ao lado do filtro de dinastia |
| `.acoes` | 531 | grupo de botões |
| `.legenda` | 607 | legenda de cores do grafo |
| `body > footer > div` | 648 | dois textos nas pontas do rodapé |

O caso mais representativo é a busca da listagem (linha 518):

```css
search form { display: flex; gap: var(--e-2); align-items: flex-end; flex-wrap: wrap; }
search .campo { flex: 1 1 200px; }
```

O `flex: 1 1 200px` diz que o campo **cresce** para ocupar a sobra, **encolhe** quando falta
espaço, mas nunca abaixo de 200px — chegando lá, ele quebra para a linha seguinte em vez de
virar uma fresta inutilizável.

### 3.2 Grid

| Onde | Linha | Para quê |
|---|---|---|
| `.grade` | 241 | grade de cartões de personagem — colunas automáticas |
| `.indicadores` | 249 | cartões de contagem do painel — colunas automáticas |
| `.com-lateral` | 282 | conteúdo principal + coluna de apoio (grafo e formulários) |
| `dl.atributos` | 322 | pares nome/valor em duas colunas |
| `.dupla` | 509 | ano de nascimento e ano de morte lado a lado |
| `body > header > nav ul` | 712 | **menu em grade de 2 colunas no smartphone** |

O caso mais representativo é a grade de cartões (linha 241):

```css
.grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
  gap: var(--e-4);
}
```

Uma única declaração cobre da tela de 1440px à de 390px: o navegador encaixa quantas colunas
de no mínimo 255px couberem, e distribui a sobra igualmente entre elas.

### 3.3 Organização consistente de espaçamentos

Todo espaço do layout — `padding`, `margin` e `gap` — sai de uma **escala de sete degraus**
declarada em `:root` (linha 55), em passos de `0.25rem`:

```css
--e-1: 0.25rem;   --e-2: 0.5rem;    --e-3: 0.75rem;   --e-4: 1rem;
--e-5: 1.5rem;    --e-6: 2rem;      --e-7: 3rem;
```

Antes desta etapa os espaçamentos eram valores soltos (`0.35rem`, `0.6rem`, `1.1rem`, `1.3rem`,
`1.4rem`, `1.8rem`), cada um escolhido no momento em que a regra foi escrita. Ao trocá-los pela
escala, os espaços passaram a ser múltiplos do mesmo passo, e o ritmo vertical da página ficou
regular. O efeito prático: **um valor solto no meio do arquivo passou a ser sinal de erro** —
se aparecer um `padding: 0.9rem`, é porque alguma regra escapou da escala.

Duas medidas ligadas ao espaçamento também viraram variáveis:

```css
--margem-lateral: clamp(1rem, 4vw, 1.5rem);   /* respiro lateral da página  */
--alvo-toque: 44px;                            /* alvo mínimo de toque       */
```

A `--margem-lateral` é usada no `<header>`, no `<main>` e no `<footer>`, garantindo que os três
tenham exatamente o mesmo recuo em qualquer largura — e que ele encolha junto com a tela.

### 3.4 Media queries

Ver o item 2. Estão todas na seção 11 do arquivo, entre as linhas 656 e 785.

---

## 4. Principais decisões de responsividade

### 4.1 Menu — de abas horizontais para grade de dois botões

**Problema.** As cinco abas do menu principal (“Início”, “Grafo de Conexões”, “Personagens”,
“Painel do Curador”, “Entrar”) ocupam cerca de 560px em linha. Em 390px elas quebravam em três
linhas irregulares, com alturas de toque de 34px — abaixo do mínimo confortável para o dedo.

**Decisão.** Abaixo de 560px o `<ul>` do menu deixa de ser Flexbox e vira **Grid de duas
colunas**, com o último item ocupando a linha inteira (linha 712):

```css
body > header > nav ul { display: grid; grid-template-columns: repeat(2, 1fr); }
body > header > nav li:last-child { grid-column: 1 / -1; }
body > header > nav a { min-height: var(--alvo-toque); justify-content: center; }
```

**Por que não um menu sanduíche.** Esconder a navegação atrás de um ícone exigiria JavaScript
para abrir e fechar, e as Etapas 02 e 03 são explicitamente sem script. A grade resolve o
mesmo problema **mostrando** os cinco destinos em vez de escondê-los, o que também é melhor
para quem navega por leitor de tela.

**Cuidado com o alcance do seletor.** As páginas internas têm outros dois `<nav>` — a trilha de
navegação e a paginação dos resultados. As regras acima são escritas como `body > header > nav`
justamente para não transformar breadcrumb e paginação em botões grandes. Um comentário na
seção 4 do CSS (linha 141) registra a armadilha.

### 4.2 Layout de duas colunas — colapso em 820px

Quatro telas usam `.com-lateral` — conteúdo principal + coluna de apoio: o grafo (desenho +
filtros), os dois formulários de cadastro (campos + instruções) e o painel do curador
(formulário de remoção + aviso de efeito em cascata). **O colapso é visível nas evidências da
tela-03**, comparando `desktop-tela-03.png` com `tablet-tela-03.png`. Ele acontece em dois
tempos:

1. **Em 1024px** a coluna de apoio **estreita** de 300px para 240px (linha 665). Ela ainda cabe,
   e é preferível estreitá-la a abandoná-la — a área principal é que precisa do espaço.
2. **Em 820px** a segunda coluna **desaparece** e o apoio passa a vir abaixo do conteúdo, na
   mesma ordem em que já estava no HTML.

O ajuste em 1024px é feito trocando o valor de uma variável, não a regra de layout:

```css
:root { --largura-lateral: 240px; }   /* .com-lateral não é reescrita */
```

### 4.3 Grafo — rolar em vez de encolher

**Problema.** O SVG do grafo tem 900 × 520 unidades. Reduzido para os ~326px úteis de um
telefone, os rótulos das arestas (`LUTOU_CONTRA`, `PARTICIPOU_DA`) ficariam com cerca de 4px de
altura: presentes na tela e ilegíveis.

**Decisão.** Abaixo de 820px o desenho passa a **rolar lateralmente** dentro da própria moldura,
mantendo uma largura mínima em que o texto ainda se lê:

```css
.rolagem-figura svg { min-width: 660px; }
```

Foi acrescentada uma `<div class="rolagem-figura">` em volta apenas do `<svg>` em `grafo.html`.
A legenda de cores e a `<figcaption>` ficam **fora** dela, de modo que continuam visíveis
enquanto o grafo é arrastado. E, porque a rolagem é da moldura, **a página em si nunca rola de
lado** — que é o defeito mais comum em layout de celular.

> Esta decisão vale para `web/grafo.html`, que não está entre as três telas escolhidas como
> evidência (item 5). Para vê-la, basta abrir essa página e estreitar a janela abaixo de 820px.

### 4.4 Tabela do painel — continua sendo uma tabela

**Decisão.** A tabela de entidades do painel **não** é convertida em cartões empilhados nas
telas estreitas. Ela rola horizontalmente dentro da moldura `.rolagem` (linha 388).

**Por quê.** A técnica usual de transformar `<tr>` e `<td>` em `display: block` quebra a
associação entre célula e cabeçalho: um leitor de tela deixa de anunciar “Tipo: Personagem” e
passa a anunciar só “Personagem”. A Etapa 02 tomou o cuidado de declarar `scope` em todas as
células de cabeçalho, inclusive `scope="row"`; jogar isso fora em nome do visual seria uma
troca ruim. A tabela é de fato uma matriz de linhas e colunas — e continua sendo uma em
qualquer largura. Nas telas pequenas ela apenas diminui de corpo (0.82rem) e ganha rolagem.

### 4.5 Formulários — uma coluna e alvos de toque

- O par **ano de nascimento / ano de morte** (`.dupla`) deixa de dividir a linha em 820px.
- A **busca** da listagem empilha campo e filtro em 820px, cada um em largura total.
- Em 560px os campos passam a **16px** de corpo. Abaixo desse valor o Safari do iOS amplia a
  página inteira ao focar um campo, e o usuário fica preso num layout ampliado.
- Também em 560px, campos e botões recebem `min-height: 44px` e os botões ocupam a linha
  inteira — é o que torna o formulário utilizável com o polegar.

### 4.6 Cartões e listas

- A **grade de cartões** vai de **4 colunas em 1440px** para **3 em 768px** e **1 em 390px**.
  As duas primeiras transições são automáticas, do `auto-fill` — o breakpoint de 1024px apenas
  reduz o mínimo de 255px para 215px, o que preserva a terceira coluna no tablet em vez de
  deixá-la cair para duas. Só a última transição é forçada por media query: com 358px úteis, o
  `minmax` ainda tentaria manter uma coluna larga demais.
- Os **indicadores do painel** seguem o mesmo caminho, com `auto-fit`.
- A lista de **atributos** (`<dl>`) troca as duas colunas por empilhamento em 560px: lado a
  lado, o valor ficaria numa faixa estreita e quebraria em várias linhas.
- A **legenda de cores** do grafo vira coluna em 560px, para os nomes das dinastias não
  quebrarem no meio.

### 4.7 Legibilidade

- Títulos com `clamp()`: acompanham a largura da tela continuamente, sem saltos.
- `-webkit-text-size-adjust: 100%` impede o aumento automático de fonte ao girar o aparelho.
- `line-height: 1.6` no corpo do texto, mantido em todas as larguras.
- Contraste preservado: a paleta é a mesma em qualquer tela; nada é clareado para “caber”.
- `@media (prefers-reduced-motion: reduce)` desliga as transições para quem declarou essa
  preferência no sistema (linha 783).

---

## 5. Evidências

Diretório: **`/docs/evidencias/etapa-03/`**

### 5.1 Interfaces apresentadas

As **mesmas três interfaces** foram capturadas nos três viewports. São telas da Etapa 02,
escolhidas por concentrarem os problemas de responsividade mais diferentes entre si:

| # | Arquivo da página | Interface | Por que esta tela |
|---|---|---|---|
| **tela-01** | `web/index.html` | Página inicial | **duas grades de cartões** (Grid `auto-fill`) que vão de 4 para 3 e para 1 coluna; faixa de destaque |
| **tela-02** | `web/personagens.html` | Listagem de personagens | **grade de cartões** + **busca** em Flexbox, que passa de uma linha para campos empilhados |
| **tela-03** | `web/painel.html` | Painel do curador | **indicadores** em Grid; **tabela** com rolagem própria; **formulário + apoio lateral** que colapsa de duas colunas para uma |

Juntas, as três cobrem os quatro casos que o enunciado cita — menus, formulários, listas e
cards. E nas três aparece o **menu principal**, que é onde se vê a passagem das abas
horizontais para a grade de dois botões do smartphone.

### 5.2 Viewport de cada evidência

| Arquivo | Viewport | Dispositivo | Interface |
|---|---|---|---|
| `desktop-tela-01.png` | **1440 × 900** | Desktop | Página inicial |
| `desktop-tela-02.png` | **1440 × 900** | Desktop | Listagem de personagens |
| `desktop-tela-03.png` | **1440 × 900** | Desktop | Painel do curador |
| `tablet-tela-01.png` | **768 × 1024** | Tablet (retrato) | Página inicial |
| `tablet-tela-02.png` | **768 × 1024** | Tablet (retrato) | Listagem de personagens |
| `tablet-tela-03.png` | **768 × 1024** | Tablet (retrato) | Painel do curador |
| `smartphone-tela-01.png` | **390 × 844** | Smartphone | Página inicial |
| `smartphone-tela-02.png` | **390 × 844** | Smartphone | Listagem de personagens |
| `smartphone-tela-03.png` | **390 × 844** | Smartphone | Painel do curador |

Total: **9 evidências** (3 interfaces × 3 viewports).

### 5.3 O que cada coluna de evidências comprova

| Viewport | Breakpoints ativos | O que se observa nas capturas |
|---|---|---|
| 1440 × 900 | nenhum (layout base) | menu em abas horizontais; grade de cartões em **4 colunas**; busca e filtro de dinastia na mesma linha; no painel, tabela inteira sem rolagem e o formulário de remoção **ao lado** do aviso de efeito em cascata |
| 768 × 1024 | 1024px + 820px | menu ainda em abas; cartões em **3 colunas**; **busca empilhada**; no painel, a tabela passa a **rolar dentro da moldura** (a coluna “Ações” fica cortada, com a barra de rolagem embaixo) e o aviso de cascata desce para baixo do formulário |
| 390 × 844 | 1024px + 820px + 560px | **menu em grade de 2 colunas**, com “Entrar” ocupando a linha inteira; tudo em **coluna única**; botões em largura total e com 44px de altura; atributos das fichas empilhados |

### 5.4 Como as capturas foram feitas

Com o protótipo servido em `http://127.0.0.1:5500` e o modo de dispositivo das ferramentas de
desenvolvedor do navegador em **Responsive**, com a largura e a altura fixadas nos valores da
tabela 5.2. Cada captura mostra a área visível do viewport — é o primeiro quadro da página, que
é o que permite comparar as três larguras entre si. O conteúdo abaixo da dobra pode ser
conferido abrindo as próprias páginas, que estão no repositório.

---

## 6. Como conferir

1. Abrir `web/grafo.html`, `web/personagens.html` ou `web/painel.html` no navegador.
2. Abrir as ferramentas de desenvolvedor e ligar o modo de dispositivo.
3. Arrastar a largura de 1440px até 390px, observando as três mudanças de layout em
   **1024px**, **820px** e **560px**.

Nada precisa ser instalado e nenhum servidor precisa ser executado.

---

## 7. O que fica para as próximas etapas

- Comportamento dinâmico: busca e filtros que realmente filtram.
- Renderização interativa do grafo, com zoom e arraste — o que resolve de vez o problema do
  item 4.3, hoje contornado com rolagem.
- Eliminação da repetição de cabeçalho e rodapé por componentização.
- API REST e persistência em banco de grafos, conforme o item 11 da proposta.
