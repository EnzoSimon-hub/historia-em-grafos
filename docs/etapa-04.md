# ETAPA 04 — Interatividade com JavaScript

**Aplicação:** História em Grafos
**Aluno:** Enzo Simon
**Disciplina:** Tecnologia de Construção de Software 1
**Professor:** Jaderson
**Data:** 30/09/2026

---

## Sumário da entrega

| Exigência do enunciado | Onde é atendida |
|---|---|
| 1. Código-fonte com os arquivos JavaScript | `web/assets/js/` — 4 arquivos, item 2 |
| 2. Tag `etapa-04` | tag Git `etapa-04` neste repositório |
| 3. `/docs/etapa-04.md` | este documento |
| — descrição das funcionalidades interativas (pelo menos 3) | item 3 — **três** funcionalidades |
| — como cada funcionalidade funciona | itens 3.1, 3.2 e 3.3 |
| — arquivos envolvidos em cada funcionalidade | quadro "Arquivos" de cada funcionalidade |
| — principais conceitos de programação utilizados | item 4 |
| — validações implementadas | item 5 |
| — situações inválidas tratadas | item 6 |
| — instruções para testar | item 8 |
| 4. Matriz de evidências | item 7 |
| 5. Evidências do funcionamento | item 9 — 14 capturas em `/docs/evidencias/etapa-04/` |
| 6. Instruções de execução e teste | item 8 (e `README.md`) |
| Funcionalidade que não se obtém só com HTML e CSS | as três — ver o fim do item 3 |

Até a Etapa 03 o protótipo era estático: a listagem mostrava sempre os mesmos seis cartões, os
formulários enviavam para lugar nenhum e os números do painel estavam escritos à mão. Nesta
etapa o protótipo passa a ter **dados de verdade em memória** — arrays de personagens, eventos,
locais e relações — e três telas passam a **ler, alterar e redesenhar** esses dados.

---

## 1. Decisões gerais

**JavaScript puro, sem framework e sem etapa de build.** A stack pretendida (item 8 da proposta)
usa React, mas nesta etapa o objetivo é demonstrar manipulação do DOM, eventos e validação. Com
React, essas operações ficariam escondidas atrás da biblioteca. Com `document.createElement`,
`addEventListener` e `setAttribute` escritos à mão, cada requisito aparece no código de forma
direta e verificável.

**Continua abrindo com duplo clique.** Os scripts são clássicos (`<script src>`), e não módulos
ES (`type="module"`), porque o navegador bloqueia módulos em páginas abertas pelo protocolo
`file://`. Não é preciso instalar nada nem subir servidor.

**Estado compartilhado entre páginas.** Os dados ficam no `localStorage` do navegador. Um
personagem cadastrado no formulário aparece na listagem e no painel, e uma remoção feita no
painel continua valendo depois de recarregar a página. O botão **"Restaurar acervo de exemplo"**
do painel volta ao estado inicial a qualquer momento.

**HTML e CSS das etapas anteriores preservados.** As páginas continuam semânticas e
responsivas. O JavaScript preenche a estrutura que já existia e acrescenta só o necessário: um
`<dialog>`, um `<select>` de ordenação, os espaços para mensagens de erro e as regras visuais
desses estados novos, reunidas na seção 12 do CSS.

---

## 2. Arquivos JavaScript

```
web/assets/js/
├── acervo.js               ← dados + funções compartilhadas (197 linhas)
├── personagens.js          ← Funcionalidade 1: pesquisa, filtro e ordenação (296 linhas)
├── cadastro-personagem.js  ← Funcionalidade 2: validação e inclusão (327 linhas)
└── painel.js               ← Funcionalidade 3: painel dinâmico e remoção em cascata (365 linhas)
```

| Arquivo | Carregado por | Responsabilidade |
|---|---|---|
| `acervo.js` | as três páginas interativas | os quatro arrays do acervo de exemplo; leitura e gravação no `localStorage` com tratamento de falha; consultas (`relacoesDe`, `buscarEntidade`, `proximoId`); normalização de texto |
| `personagens.js` | `web/personagens.html` | monta a grade de cartões e a refaz a cada busca, filtro ou ordenação |
| `cadastro-personagem.js` | `web/cadastro-personagem.html` | valida o formulário e inclui o personagem no acervo |
| `painel.js` | `web/painel.html` | indicadores, tabela, modal de remoção, formulário de remoção e restauração |

Cada página carrega **dois** scripts, nesta ordem, no fim do `<body>`:

```html
<script src="assets/js/acervo.js"></script>
<script src="assets/js/personagens.js"></script>
```

`acervo.js` expõe um único objeto global, `window.Acervo`. Os outros três arquivos ficam
isolados dentro de uma função auto-executável (`(function () { … })();`) e não criam nenhuma
variável global.

---

## 3. Funcionalidades interativas

### 3.1 Funcionalidade 1 — Pesquisa, filtragem e ordenação de personagens

**Tela:** `web/personagens.html` · **Exemplos do enunciado atendidos:** pesquisa, filtragem,
ordenação, atualização dinâmica de dados.

**O que o usuário vê.** Ao digitar na busca, a grade de cartões é refeita a cada tecla, sem
recarregar a página. O título passa a mostrar a contagem ("2 personagens encontrados de 6"). O
filtro de dinastia e o novo seletor **Ordenar por** (nome, nascimento crescente ou decrescente,
mais relações) agem na mesma hora. Com algum filtro ativo, aparece o botão **Limpar filtros**.
Quando nada é encontrado, a grade dá lugar a uma mensagem com o botão **Mostrar todos**.

**Como funciona.**

1. Os cartões **não estão mais escritos no HTML**. O `<ul class="grade">` chega vazio, e
   `criarCartao()` monta cada `<article>` com `document.createElement` a partir de um objeto do
   array `acervo.personagens`.
2. Os eventos `input` (busca), `change` (dinastia e ordem), `click` (limpar) e `keydown` (Esc)
   chamam a mesma função, `atualizar()`, que executa sempre este caminho:
   `lerFiltros()` → `aplicarFiltros()` (**`filter`**) → `ordenar()` (**`sort`** com uma função
   de comparação escolhida no objeto `COMPARADORES`) → `renderizar()` (**`map`** +
   `replaceChildren`) → `atualizarUrl()`.
3. A comparação de nomes passa por `Acervo.normalizar()`, que remove acentos e ignora
   maiúsculas: "elizabeth", "ELIZABETH" e "Élizabeth" encontram **Elizabeth I**.
4. As opções do filtro de dinastia saem dos próprios dados (`map` + `new Set` + `sort`). Uma
   dinastia nova, digitada no cadastro — como **Casa Valois** —, passa a aparecer no filtro.
5. Os selos "N relações" e "N eventos" de cada cartão são **calculados** percorrendo o array de
   relações (`filter`), e não mais escritos à mão.
6. A URL acompanha os filtros (`?q=henr&dinastia=tudor&ordem=nascimento`). Recarregar a página
   ou compartilhar o endereço devolve a mesma listagem.
7. O botão **Buscar** continua existindo para quem prefere confirmar com Enter, mas o `submit`
   é interceptado com `preventDefault()` e não recarrega a página.

| Arquivos | Papel |
|---|---|
| `web/personagens.html` | estrutura: busca, filtro, novo `<select id="busca-ordem">`, `<ul id="lista-personagens">` vazio, bloco `#lista-vazia`, parágrafo de status `role="status"` |
| `web/assets/js/personagens.js` | toda a lógica da funcionalidade |
| `web/assets/js/acervo.js` | `carregar()`, `relacoesDe()`, `normalizar()`, `slugDinastia()`, `plural()` |
| `web/assets/css/estilo.css` | seção 12: `.status`, `.vazio`, `.novo`, `[hidden]` |

### 3.2 Funcionalidade 2 — Validação do cadastro e inclusão no acervo

**Tela:** `web/cadastro-personagem.html` · **Exemplos do enunciado atendidos:** validação,
inclusão de itens, atualização dinâmica de dados.

**O que o usuário vê.** Ao clicar em **Salvar personagem** com dados inválidos, aparece no topo
um quadro "Corrija N campos antes de salvar", com um link para cada campo problemático. Embaixo
de cada campo aparece a mensagem específica, e a borda do campo fica vermelha. Enquanto o
usuário corrige, a mensagem some no instante em que o erro deixa de existir. O campo de notas
tem um contador "0 / 800", que muda de cor perto do limite. Com tudo válido, o personagem é
gravado e o navegador vai para a listagem, onde o novo cartão aparece **destacado em dourado**,
junto com a mensagem "Francisco I foi cadastrado com o identificador PER-0007".

**Como funciona.**

1. O formulário recebe o atributo `novalidate`. As mensagens nativas do navegador (genéricas e
   no idioma do sistema) são substituídas pelas do script.
2. Cada campo tem uma **função de validação** que devolve `''` quando o valor é válido, ou o
   texto do erro. Elas ficam reunidas no objeto `VALIDADORES`. `validarTudo()` percorre esse
   objeto com `map` e separa os erros com `filter`.
3. `mostrarErro()` liga ou desliga a mensagem: preenche o `<small class="erro">`, marca
   `aria-invalid="true"` (que o CSS pinta de vermelho) e acrescenta o id da mensagem em
   `aria-describedby`, para o leitor de tela anunciar o erro junto com o rótulo do campo.
4. **Quando validar.** Ao sair de um campo (`blur`), ele é validado. Um campo já marcado como
   inválido é revalidado a cada tecla (`input`). Mudar o ano de nascimento revalida o ano de
   morte, porque as regras entre os dois dependem de ambos.
5. **Inclusão.** `montarPersonagem()` gera o próximo identificador livre com
   `Acervo.proximoId()` (`map` → `filter` → `reduce`). O objeto é inserido com `push` no array
   `acervo.personagens`, o acervo é gravado e o navegador vai para
   `personagens.html?novo=PER-0007`.
6. **Limpar campos** (`reset`) apaga, além dos valores, as mensagens de erro, o resumo e o
   contador.

| Arquivos | Papel |
|---|---|
| `web/cadastro-personagem.html` | `novalidate`, quadro `#resumo-erros` (`role="alert"`), um `<small class="erro">` por campo, `#contador-notas` |
| `web/assets/js/cadastro-personagem.js` | validação, exibição dos erros, contador e gravação |
| `web/assets/js/acervo.js` | `carregar()`, `salvar()`, `proximoId()`, `normalizar()` |
| `web/assets/js/personagens.js` | recebe `?novo=` e destaca o cartão (`aplicarParametrosDaUrl`) |
| `web/assets/css/estilo.css` | seção 12: `.erro`, `[aria-invalid="true"]`, `.contador`, `.status-erro` |

### 3.3 Funcionalidade 3 — Painel do curador com remoção em cascata

**Tela:** `web/painel.html` · **Exemplos do enunciado atendidos:** modal, cálculo, atualização
dinâmica de dados, controle de estado da interface, filtragem, validação.

**O que o usuário vê.** Os quatro indicadores de **Acervo em números** mostram as contagens
reais. A tabela lista **todas** as entidades (antes eram cinco linhas fixas), com um filtro
**Mostrar** por tipo. O botão **Remover** de uma linha abre um **modal** que lista, uma a uma,
as relações que serão desfeitas junto com a entidade. Ao confirmar, a linha some, os
indicadores diminuem e uma mensagem informa quantas relações foram desfeitas. O formulário
**Remover entidade**, mais abaixo, mostra o impacto assim que uma entidade é escolhida ("Esta
remoção desfará 4 relações") e não deixa prosseguir sem a caixa de confirmação marcada.

**Como funciona.**

1. **Cálculo.** `renderizarIndicadores()` percorre os elementos marcados com `data-contagem` e
   escreve em cada um o tamanho do array correspondente. A coluna "Relações" da tabela é
   calculada por `Acervo.relacoesDe()` (`filter`).
2. **Tabela.** `renderizarTabela()` junta os três arrays de entidades
   (`Acervo.todasAsEntidades`, com `map` + `concat`), aplica o filtro de tipo (`filter`) e cria
   as linhas com `map(criarLinha)`. O `<select>` do formulário de remoção é refeito a partir dos
   mesmos dados, agrupado por tipo em `<optgroup>`.
3. **Delegação de eventos.** Não há um ouvinte por botão "Remover". Um único `click` no
   `<tbody>` descobre qual botão foi clicado com `event.target.closest('[data-remover]')`.
   Assim, as linhas recriadas depois de cada remoção continuam funcionando sem registrar os
   eventos de novo.
4. **Modal.** Um `<dialog>` nativo aberto com `showModal()`. Ele prende o foco dentro da caixa,
   escurece o fundo e fecha com **Esc**, com **Cancelar** ou com um clique no fundo. Só o botão
   **Remover definitivamente** fecha com `returnValue === 'confirmar'`, e é isso que o evento
   `close` verifica antes de remover.
5. **Remoção em cascata.** `remover(id)` retira a entidade do seu array e **todas as relações
   em que ela aparece**, como origem ou como destino, com dois `filter`. Em seguida grava o
   acervo e chama `renderizarTudo()`. É a mesma regra do banco de grafos previsto na proposta:
   apagar um nó apaga as arestas ligadas a ele.
6. **Controle de estado.** O botão **Restaurar acervo de exemplo** funciona em dois tempos. O
   primeiro clique o "arma" (o texto muda para "Clique de novo para confirmar" e ele fica
   vermelho) por 4 segundos, com `setTimeout`. Só o segundo clique, dentro desse prazo,
   restaura. Isso evita apagar os testes por engano sem abrir mais um modal.

| Arquivos | Papel |
|---|---|
| `web/painel.html` | indicadores com `data-contagem`, `<tbody id="tabela-entidades">` vazio, filtro `#filtro-tipo`, `<dialog id="modal-remocao">`, espaços de erro e de impacto no formulário |
| `web/assets/js/painel.js` | toda a lógica da funcionalidade |
| `web/assets/js/acervo.js` | `todasAsEntidades()`, `buscarEntidade()`, `relacoesDe()`, `salvar()`, `restaurar()` |
| `web/assets/css/estilo.css` | seção 12: `dialog`, `dialog::backdrop`, `button[type="submit"].botao-perigo`, `.status-sucesso` |

### Por que nenhuma das três se obtém só com HTML e CSS

HTML e CSS não guardam dados entre páginas, não filtram uma lista pelo que foi digitado, não
comparam dois campos entre si, não contam elementos de um array, não apagam as relações de uma
entidade e não abrem um modal a partir de um clique. Tudo isso depende de lógica executada no
navegador.

---

## 4. Conceitos de programação utilizados

| Conceito | Onde aparece |
|---|---|
| **Manipulação do DOM** | criação de elementos (`createElement`, `append`, `replaceChildren`, `new Option`), leitura e escrita de atributos (`setAttribute`, `dataset`, `hidden`, `classList.toggle`) e de texto (`textContent`) |
| **Eventos** | `input`, `change`, `click`, `submit`, `reset`, `blur`, `keydown`, `close`; `preventDefault()`; **delegação de eventos** no `<tbody>` do painel |
| **Funções** | funções nomeadas com uma única responsabilidade (`lerFiltros`, `aplicarFiltros`, `ordenar`, `renderizar`…); **funções como valor**, guardadas em objetos (`COMPARADORES`, `VALIDADORES`) e passadas como argumento (`map(criarCartao)`) |
| **Arrays e estruturas equivalentes** | arrays de objetos (`personagens`, `eventos`, `locais`, `relacoes`); objetos como dicionário (`LISTA_DO_TIPO`, `ROTULOS`, `ERROS`); `Set` para eliminar dinastias repetidas; `URLSearchParams` |
| **Métodos de iteração** | `filter`, `map`, `forEach`, `find`, `some`, `every`, `reduce`, `sort` |
| **Escopo e encapsulamento** | cada arquivo roda numa função auto-executável com `'use strict'`; só `window.Acervo` é global |
| **Persistência e serialização** | `localStorage` + `JSON.stringify` / `JSON.parse`, com `try/catch` |
| **Tratamento de erros** | `try/catch` na leitura e gravação; validação de formato dos dados lidos (`Array.isArray` com `every`) |
| **Expressões regulares** | `/\p{L}/u` (há letra?), `/[\p{L}\p{N}]/u` (há letra ou número?), `/\s+/g` (espaços repetidos), `/[̀-ͯ]/g` (acentos) |
| **Temporizadores** | `setTimeout` / `clearTimeout` no botão de restauração em dois tempos; `setTimeout(…, 0)` no `reset` |
| **Acessibilidade dinâmica** | `aria-invalid`, `aria-describedby`, `role="status"`, `role="alert"`, `aria-live`, foco movido para o resumo de erros |

---

## 5. Validações implementadas

### 5.1 Formulário de cadastro de personagem (`cadastro-personagem.js`)

| Campo | Regra | Mensagem exibida | Função |
|---|---|---|---|
| Nome | obrigatório | Informe o nome do personagem. | `validarNome` |
| Nome | mínimo de 2 caracteres, máximo de 120 | O nome precisa ter pelo menos 2 caracteres. | `validarNome` |
| Nome | precisa conter letras | O nome precisa conter letras. | `validarNome` |
| Nome | **não pode repetir** um nome do acervo (ignora maiúsculas, acentos e espaços extras) | Já existe um personagem chamado "Henrique VIII" (PER-0002). | `validarNome` |
| Dinastia | opcional; se preenchida, máximo de 80 caracteres e precisa conter letras | A dinastia precisa conter letras. | `validarDinastia` |
| Ano de nascimento / de morte | número inteiro, sem letras nem casas decimais | O ano de nascimento deve ser um número inteiro… | `validarAno` |
| Ano de nascimento / de morte | não existe ano 0 | Não existe ano 0 no calendário: use 1 (d.C.) ou -1 (a.C.). | `validarAno` |
| Ano de nascimento / de morte | entre -3000 e o ano corrente (não pode estar no futuro) | O ano de nascimento não pode estar no futuro (depois de 2026). | `validarAno` |
| Ano de morte | **não pode ser anterior** ao de nascimento | O ano de morte (1500) é anterior ao de nascimento (1600). | `validarMorte` |
| Ano de morte | período de vida de no máximo 130 anos | Um período de vida de 300 anos não é plausível. Confira os dois anos. | `validarMorte` |
| Notas | máximo de 800 caracteres, com contador ao vivo | As notas passaram do limite em N caracteres. | `validarNotas` |

Antes de gravar, o nome e a dinastia passam por `textoLimpo()`, que remove espaços nas pontas
e junta espaços repetidos: "  Henrique   VII " é gravado como "Henrique VII".

### 5.2 Formulário de remoção (`painel.js`)

| Campo | Regra | Mensagem exibida |
|---|---|---|
| Entidade | obrigatória | Selecione a entidade que será removida. |
| Confirmação | a caixa precisa estar marcada | Marque a confirmação para prosseguir. |
| Entidade | precisa ainda existir no acervo no momento do envio | A entidade LOC-0003 não existe mais no acervo. A lista foi atualizada. |

### 5.3 Busca da listagem (`personagens.js`)

| Entrada | Regra | Comportamento |
|---|---|---|
| Termo de busca | precisa conter ao menos uma letra ou um número | termo ignorado, campo marcado com `aria-invalid` e aviso exibido |
| Termo de busca | no máximo 60 caracteres | `maxlength` no campo; o valor vindo da URL é cortado com `slice(0, 60)` |
| Dinastia na URL | precisa existir entre as opções | filtro volta para "Todas" e aviso exibido |
| Ordem na URL | precisa ser um critério conhecido | ignorada; vale a ordem padrão (nome) |

---

## 6. Situações inválidas tratadas

| # | Situação | O que acontece | Onde |
|---|---|---|---|
| 1 | Formulário enviado vazio ou com dados inválidos | não grava; resumo no topo com link para cada campo, mensagem embaixo de cada um, foco levado ao resumo | `cadastro-personagem.js`, `submit` |
| 2 | Personagem com nome já existente | não grava; a mensagem informa o nome e o identificador do registro existente | `validarNome` |
| 3 | Ano de morte anterior ao de nascimento, vida implausível, ano 0, ano no futuro, ano com letras | mensagem específica para cada caso | `validarAno`, `validarMorte` |
| 4 | Clique em "Salvar" logo depois de sair de um campo inválido | a validação do `blur` é adiada para não empurrar o botão para baixo no meio do clique (o clique se perderia) | `cadastro-personagem.js`, ouvinte de `blur` |
| 5 | Busca feita só de símbolos (`%%%`) | termo ignorado com aviso, em vez de um "nenhum resultado" enganoso | `termoValido` |
| 6 | Busca sem resultado | mensagem e botão "Mostrar todos", no lugar da grade vazia | `renderizar` |
| 7 | Dinastia inexistente na URL (`?dinastia=valois`) | lista completa e aviso, em vez de uma lista vazia sem explicação | `aplicarParametrosDaUrl` |
| 8 | Identificador inexistente em `?novo=` | mensagem de erro | `aplicarParametrosDaUrl` |
| 9 | Remoção sem entidade escolhida ou sem confirmação marcada | não remove; mensagens nos campos | `painel.js`, `submit` |
| 10 | Remoção de uma entidade que já não existe (apagada em outra aba) | a lista é atualizada e uma mensagem explica o que houve | `remover` |
| 11 | Modal fechado por Esc, Cancelar ou clique no fundo | nada é removido | ouvinte de `close` |
| 12 | Clique acidental em "Restaurar acervo de exemplo" | não restaura; exige um segundo clique em até 4 segundos | ouvinte de `click` do botão |
| 13 | `localStorage` com conteúdo corrompido ou em formato antigo | a página funciona com o acervo de exemplo; aviso no console | `Acervo.carregar` |
| 14 | `localStorage` bloqueado (janela privativa, cookies desativados) | o cadastro não perde o que foi digitado e explica o motivo; o painel avisa que as alterações valem só até recarregar | `Acervo.salvar`, `salvar`, `remover` |
| 15 | Navegador sem suporte a `<dialog>` | a confirmação cai para `window.confirm` | `abrirConfirmacao` |
| 16 | Tabela filtrada por um tipo sem entidades | linha única com mensagem, em vez de uma tabela vazia | `renderizarTabela` |
| 17 | JavaScript desativado | `<noscript>` na listagem explica por que os cartões não aparecem | `personagens.html` |

---

## 7. Matriz de evidências

| Requisito | Funcionalidade relacionada | Arquivo(s) | Evidência |
|---|---|---|---|
| **Manipulação do DOM** | F1 — cartões criados a partir do array · F3 — linhas da tabela e itens do modal · F2 — resumo de erros | `personagens.js`, `painel.js`, `cadastro-personagem.js` | `criarCartao()` em `personagens.js:135` (`createElement`, `append`); `renderizar()` em `personagens.js:172` (`replaceChildren`); `criarLinha()` em `painel.js:95`; `mostrarResumo()` em `cadastro-personagem.js:195`. Na aplicação: `personagens.html` chega com o `<ul>` vazio e exibe 6 cartões — captura `01` |
| **Tratamento de eventos** | F1 — busca ao digitar, filtro, ordem, Esc · F2 — submit, blur, input, reset · F3 — delegação no `<tbody>`, close do modal | `personagens.js`, `cadastro-personagem.js`, `painel.js` | `personagens.js:271–291` (`input`, `change`, `click`, `submit`, `keydown`); `cadastro-personagem.js:268–325`; `painel.js:278` (delegação com `closest`) e `painel.js:285` (`close`). Capturas `02`, `03`, `11` |
| **Validação de formulários** | F2 — cadastro de personagem · F3 — formulário de remoção | `cadastro-personagem.js`, `painel.js`, `cadastro-personagem.html` | objeto `VALIDADORES` em `cadastro-personagem.js:148`; regras em `validarNome` (`:82`), `validarAno` (`:107`), `validarMorte` (`:123`); remoção em `painel.js:310`. Capturas `07`, `08`, `13` |
| **Alteração dinâmica da interface** | F1 — grade, título e botão "Limpar" mudam ao digitar · F2 — erros aparecem e somem · F3 — indicadores, tabela e modal | `personagens.js`, `cadastro-personagem.js`, `painel.js`, `estilo.css` (seção 12) | `renderizar()` em `personagens.js:172` (título, `hidden`); `mostrarErro()` em `cadastro-personagem.js:161` (`aria-invalid`); `renderizarTudo()` em `painel.js:177`; `showModal()` em `painel.js:271`. Capturas `02`→`03`, `10`→`12` (indicadores de 7/19 para 6/15) |
| **Uso de funções** | as três | todos os arquivos `.js` | funções de responsabilidade única: `lerFiltros`, `aplicarFiltros`, `ordenar`, `renderizar`, `atualizar` (`personagens.js:82–226`); funções guardadas em objetos: `COMPARADORES` (`personagens.js:42`) e `VALIDADORES` (`cadastro-personagem.js:148`); API compartilhada `window.Acervo` (`acervo.js:183`) |
| **Uso de arrays** | as três — o acervo inteiro é formado por arrays | `acervo.js` e os outros três | `ACERVO_INICIAL` com quatro arrays de objetos em `acervo.js:26`; `push` do novo personagem em `cadastro-personagem.js:250`; `new Set` das dinastias em `personagens.js:68`; `MESES` em `painel.js:41` |
| **Métodos de iteração** | F1 — `filter`, `sort`, `map`, `some` · F2 — `map`, `filter`, `forEach`, `find` · F3 — `filter`, `map`, `forEach` · acervo — `every`, `reduce` | todos os arquivos `.js` | `aplicarFiltros` (`filter`) em `personagens.js:98`; `ordenar` (`sort`) em `:107`; `validarTudo` (`map` + `filter`) em `cadastro-personagem.js:188`; cascata com dois `filter` em `painel.js:228–229`; `proximoId` (`map` → `filter` → `reduce`) em `acervo.js:147`; `every` em `acervo.js:90` |
| **Tratamento de situações inválidas** | as três — ver item 6, 17 situações | todos os arquivos `.js` | `try/catch` em `acervo.js:83–124`; `termoValido` em `personagens.js:94`; dinastia inválida na URL em `personagens.js:248`; entidade inexistente em `painel.js:213`; `blur` adiado em `cadastro-personagem.js:297`. Capturas `04`, `05`, `06`, `08`, `13` |

---

## 8. Como executar e testar

### 8.1 Execução

1. Clonar o repositório e fazer checkout da versão da etapa: `git checkout etapa-04`.
2. Abrir **`web/personagens.html`** no navegador — o duplo clique basta.
   Opcionalmente, servir a pasta `web/` (por exemplo, `python -m http.server 5500` dentro de
   `web/`) e abrir `http://127.0.0.1:5500/personagens.html`.

Nada precisa ser instalado. O acervo de exemplo é carregado automaticamente na primeira visita.
Para recomeçar do zero a qualquer momento, use **Painel do Curador → Restaurar acervo de
exemplo** (dois cliques).

### 8.2 Roteiro de teste — Funcionalidade 1 (`personagens.html`)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir a página | 6 cartões, título "6 personagens no acervo", em ordem alfabética |
| 2 | Digitar `henr` na busca, devagar | a grade se reduz a cada tecla; ao final, Henrique VII e Henrique VIII, e o título "2 personagens encontrados de 6" |
| 3 | Apagar, escolher **Casa Tudor** e **Nascimento (mais recente)** | Elizabeth I, Henrique VIII, Henrique VII — nessa ordem; aparece "Limpar filtros" |
| 4 | Clicar **Limpar filtros** | volta aos 6 cartões |
| 5 | Digitar `napoleão` | a grade some e aparece "Nenhum personagem corresponde à busca." com o botão "Mostrar todos" |
| 6 | Digitar `%%%` | os 6 cartões continuam e aparece o aviso "…não contém letras nem números e foi ignorado." |
| 7 | Pressionar **Esc** na busca | o termo e o aviso são apagados |
| 8 | Abrir `personagens.html?dinastia=valois` | 6 cartões e o aviso "A dinastia "valois" não existe no acervo. Mostrando todas." |

### 8.3 Roteiro de teste — Funcionalidade 2 (`cadastro-personagem.html`)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Clicar **Salvar personagem** sem preencher nada | quadro "Corrija 1 campo antes de salvar" e "Informe o nome do personagem." embaixo do Nome |
| 2 | Nome `henrique viii`, Dinastia `123`, nascimento `1600`, morte `1500` → Salvar | três erros: nome duplicado, dinastia sem letras, morte antes do nascimento |
| 3 | Trocar a morte para `1900` | o erro muda, na hora, para "Um período de vida de 300 anos não é plausível" |
| 4 | Digitar `0` no nascimento e sair do campo | "Não existe ano 0 no calendário…" |
| 5 | Digitar nas notas | o contador acompanha: "14 / 800" |
| 6 | Clicar **Limpar campos** | valores, erros, resumo e contador zerados |
| 7 | Nome `Francisco I`, Dinastia `Casa Valois`, `1494`, `1547` → Salvar | vai para a listagem: 7 personagens, cartão de Francisco I destacado em dourado, mensagem com o identificador PER-0007, e "Casa Valois" disponível no filtro de dinastia |

### 8.4 Roteiro de teste — Funcionalidade 3 (`painel.html`)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir o painel (depois do teste 8.3) | indicadores **7 · 4 · 3 · 19** e 14 linhas na tabela |
| 2 | Em **Mostrar**, escolher "Eventos" | só as 4 linhas de eventos |
| 3 | Clicar **Remover** na linha de Henrique VII | modal com as 4 relações que serão desfeitas |
| 4 | Pressionar **Esc** | o modal fecha e nada é removido |
| 5 | Clicar **Remover** de novo → **Remover definitivamente** | a linha some, os indicadores passam a **6 · 4 · 3 · 15** e aparece "…removido(a) com 4 relações desfeitas." |
| 6 | No formulário de baixo, clicar **Remover definitivamente** sem escolher nada | "Selecione a entidade…" e "Marque a confirmação…" |
| 7 | Escolher **Escócia** | aparece "Esta remoção desfará 1 relação." |
| 8 | Clicar **Restaurar acervo de exemplo** uma vez | o botão fica vermelho: "Clique de novo para confirmar" (volta ao normal em 4 s) |
| 9 | Clicar de novo, dentro do prazo | indicadores voltam a **6 · 4 · 3 · 19** |

### 8.5 Teste automatizado usado na preparação da entrega

Os três roteiros acima foram executados de forma automatizada, com o Google Chrome em modo
headless controlado pelo Puppeteer: **54 verificações, todas aprovadas em três execuções
seguidas, sem nenhum erro no console**. O mesmo roteiro também verificou dois casos que não se
reproduzem pela interface: o `localStorage` corrompido e a remoção de uma entidade já apagada
em outra aba. As capturas do item 9 foram geradas por essa execução.

---

## 9. Evidências

Diretório: **`/docs/evidencias/etapa-04/`** — 14 capturas, todas em **1440 × 900** exceto a
última (**390 × 844**, smartphone).

| Arquivo | Funcionalidade | O que demonstra |
|---|---|---|
| `01-listagem-inicial.png` | F1 | **funcionamento normal** — grade montada pelo JavaScript a partir do array: 6 cartões, contagem no título, selos de relações calculados |
| `02-busca-dinamica.png` | F1 | **alteração dinâmica** — busca "henr" digitada: 2 cartões, título "2 personagens encontrados de 6" |
| `03-filtro-e-ordenacao.png` | F1 | **alteração dinâmica** — Casa Tudor + nascimento decrescente; botão "Limpar filtros" visível |
| `04-busca-sem-resultado.png` | F1 | **estado apresentado ao usuário** — mensagem de lista vazia com "Mostrar todos" |
| `05-busca-termo-invalido.png` | F1 | **entrada inválida** — termo `%%%` ignorado, com aviso e campo marcado |
| `06-dinastia-invalida-na-url.png` | F1 | **entrada inválida** — `?dinastia=valois` tratada com aviso |
| `07-cadastro-campo-obrigatorio.png` | F2 | **validação** — envio vazio: resumo + mensagem no campo Nome |
| `08-cadastro-validacoes.png` | F2 | **validação e entradas inválidas** — nome duplicado, dinastia sem letras, morte antes do nascimento; resumo com 3 links |
| `09-cadastro-sucesso-na-listagem.png` | F2 | **funcionamento normal e mensagem** — Francisco I incluído (PER-0007), cartão destacado, "7 personagens no acervo" |
| `10-painel-dados-dinamicos.png` | F3 | **funcionamento normal** — indicadores calculados (7 · 4 · 3 · 19) e tabela completa com o personagem novo |
| `11-painel-modal-remocao.png` | F3 | **modal** — confirmação listando as 4 relações de Henrique VII |
| `12-painel-remocao-concluida.png` | F3 | **alteração dinâmica e mensagem** — indicadores 6 · 4 · 3 · 15, linha removida, "4 relações desfeitas" |
| `13-painel-validacao-remocao.png` | F3 | **validação** — confirmação não marcada; impacto "desfará 1 relação" |
| `14-smartphone-modal-remocao.png` | F3 | o modal na tela de 390px, sem rolagem horizontal — a responsividade da Etapa 03 preservada |

---

## 10. O que fica para as próximas etapas

- Tornar interativos os formulários que ainda são estáticos: **login** e **cadastro de
  relação**. Este último depende de validar a combinação de tipos (por exemplo, `HOUVE_A` só
  liga um Local a um Evento).
- **Edição** de entidades: o botão "Editar" ainda leva ao formulário em branco.
- Renderizar o **grafo** a partir dos mesmos arrays, com filtros que escondem nós e arestas.
- Substituir o `localStorage` pela **API REST** com persistência em Neo4j, conforme o item 11
  da proposta.
