# ETAPA 02 — Protótipo Estrutural com HTML Semântico

**Aplicação:** História em Grafos
**Aluno:** Enzo Simon
**Disciplina:** Tecnologia de Construção de Software 1
**Professor:** Jaderson
**Data:** 30/08/2026

---

## Sumário da entrega

| Exigência do enunciado | Onde é atendida |
|---|---|
| Pelo menos **3 interfaces** representativas | **8 páginas** em `/web` — item 2 deste documento |
| Uso de HTML semântico (`header`, `nav`, `main`, `section`, `article`, `footer`, `form`, `label`, `button`, entre outros) | item 3 deste documento |
| Estrutura organizada de arquivos | item 1 deste documento |
| Formulários com `label` associado aos campos | item 3.4 — **19 rótulos, todos associados** |
| Interface representa o domínio da Etapa 01 | item 4 deste documento |
| Documentação com funcionalidades, páginas e decisões de HTML | este documento |

O protótipo é **estático**: HTML e CSS apenas, **sem uma linha de JavaScript**, sem banco de
dados, sem API e sem persistência — conforme o enunciado, que dispensa esses itens nesta etapa.
Todas as páginas se abrem diretamente no navegador, sem instalação e sem servidor.

---

## 1. Estrutura de arquivos

```
historia-em-grafos/
├── README.md                          → porta de entrada do repositório
├── docs/
│   ├── proposta.md                    → proposta do projeto (Etapa 01)
│   └── etapa-02.md                    → este documento
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

**Decisões de organização:**

- **Separação entre documentação e interface.** `docs/` guarda os documentos da disciplina;
  `web/` guarda o protótipo. Um não polui o outro, e o `README.md` da raiz aponta para ambos.
- **`web/` em vez de `src/`.** Nas próximas etapas o projeto ganha um servidor Java, que traz
  o seu próprio `src/main/java`. Reservar `web/` para o cliente evita a colisão de nomes agora,
  em vez de exigir uma reorganização depois.
- **`assets/css/` em vez de CSS na raiz de `web/`.** Deixa lugar previsto para `assets/img/`
  e `assets/js/` sem reorganizar nada quando eles chegarem.
- **Folha de estilo única e externa.** Nenhuma página tem `<style>` próprio. A aparência é
  definida em um só lugar; as páginas contêm apenas estrutura.
- **Nomes de arquivo em minúsculas, sem acento e sem espaço.** Evita problemas de URL e de
  diferença entre sistemas que distinguem maiúsculas de minúsculas.

---

## 2. Páginas criadas

O enunciado pede no mínimo 3 interfaces e sugere seis exemplos. **As oito páginas cobrem os
seis exemplos sugeridos**, mais uma página específica do domínio.

| # | Arquivo | Interface | Exemplo do enunciado que atende |
|---|---|---|---|
| 1 | `index.html` | Página inicial | **página inicial** |
| 2 | `grafo.html` | Grafo de conexões | — (tela característica do domínio) |
| 3 | `personagens.html` | Listagem de personagens | **listagem** |
| 4 | `personagem.html` | Ficha de uma entidade | **detalhes** |
| 5 | `cadastro-personagem.html` | Formulário de cadastro de entidade | **formulário de cadastro** |
| 6 | `cadastro-relacao.html` | Formulário de vínculo entre entidades | **formulário de cadastro** |
| 7 | `painel.html` | Painel do curador | **painel administrativo** |
| 8 | `login.html` | Autenticação | **autenticação** |

### 2.1 `index.html` — Página inicial

Apresenta o problema que a aplicação resolve, oferece três portas de entrada (grafo, listagem,
painel) e descreve as quatro entidades do domínio. É a única página que explica *por que* o
acervo existe.

### 2.2 `grafo.html` — Grafo de conexões

Tela característica do sistema. A rede é desenhada em **SVG embutido no próprio HTML**: seis
personagens, um evento e um local, ligados por oito relações tipadas e direcionadas.
Acompanha legenda de cores e um formulário lateral de filtros (tipo de entidade, dinastia,
tipo de relação).

### 2.3 `personagens.html` — Listagem

Grade de fichas resumidas, cada uma em seu próprio `<article>`. Acima, um bloco de busca por
nome com filtro por dinastia. Abaixo, navegação de páginas de resultado.

### 2.4 `personagem.html` — Detalhes

Ficha completa de Henrique VII: bloco de atributos e, em seguida, as conexões **agrupadas por
tipo de vínculo** (parentesco, conflito, participação em eventos). Cada conexão é um link para
a entidade vizinha — é assim que se percorre o acervo.

### 2.5 `cadastro-personagem.html` — Formulário de cadastro

Cadastro e edição de personagem, dividido em três grupos: identificação, período de vida e
observações. Inclui sugestão de dinastias já existentes por meio de `<datalist>`.

### 2.6 `cadastro-relacao.html` — Formulário de vínculo

Criação de uma relação entre duas entidades. Três grupos que refletem a natureza direcionada
do vínculo: **origem → tipo de relação → destino**. O catálogo de tipos é apresentado em
`<optgroup>`, agrupado pelo par de entidades a que cada tipo se aplica.

### 2.7 `painel.html` — Painel administrativo

Contagens do acervo, tabela de entidades cadastradas com as ações de manutenção, e o
formulário de confirmação de remoção com aviso do efeito em cascata sobre as relações.

### 2.8 `login.html` — Autenticação

Formulário de usuário e senha. A tela deixa explícito que a leitura do acervo é pública e que
a autenticação existe apenas para as operações de escrita.

---

## 3. Funcionalidades implementadas

Nesta etapa “implementado” significa **estrutura e navegação**, não comportamento: não há
processamento de dados, validação no servidor nem persistência.

### 3.1 Navegação

- **Menu principal** repetido nas oito páginas, com a página corrente marcada por
  `aria-current="page"` — indicação visual e para leitores de tela ao mesmo tempo.
- **Trilha de navegação** (*breadcrumb*) nas páginas internas, em um `<nav>` próprio e rotulado.
- **Navegação entre resultados** na listagem.
- Todos os links são reais: as oito páginas se alcançam umas às outras, sem link morto.

### 3.2 Consulta

- Listagem de personagens em fichas, com dinastia, anos de vida e contagem de relações.
- Ficha completa de entidade, com atributos e conexões agrupadas por tipo.
- Visualização do acervo como rede, em SVG.
- Tabela administrativa de todas as entidades cadastradas.

### 3.3 Busca e filtro

- Busca por nome, com filtro por dinastia, na listagem.
- Filtro da rede por tipo de entidade, dinastia e tipo de relação, na tela do grafo.

> Ambos os formulários usam `method="get"`, que é o método correto para consulta: o resultado
> é uma leitura, não uma alteração, e a URL resultante pode ser copiada e compartilhada.

### 3.4 Entrada de dados

São **seis formulários**: dois de consulta (busca na listagem e filtros do grafo) e quatro de
entrada (cadastro de entidade, criação de relação, confirmação de remoção e autenticação).
Somados, apresentam **19 campos** — texto, número, senha, busca, seleção, área de texto e
caixa de marcação.

**Todos os 19 campos têm rótulo associado.** A associação é feita pelo par `for`/`id`, que é
a forma explícita: o `for` do `<label>` repete exatamente o `id` do campo. Clicar no rótulo
move o foco para o campo correspondente, e o leitor de tela anuncia o rótulo ao chegar nele.

```html
<label for="ano-nascimento">Ano de nascimento</label>
<input type="number" id="ano-nascimento" name="anoNascimento"
       min="-3000" max="2100" step="1" aria-describedby="ajuda-anos">
```

Os textos de apoio não ficam soltos: cada um é ligado ao seu campo por `aria-describedby`,
de modo que a explicação também é lida em voz alta, depois do rótulo.

### 3.5 Estados de acesso

O cabeçalho do painel mostra o curador autenticado e troca *Entrar* por *Sair*. Botões de
edição e remoção aparecem apenas nas telas de curador, refletindo a regra da proposta:
leitura pública, escrita restrita.

---

## 4. Aderência ao domínio da Etapa 01

| Definido na Etapa 01 | Como aparece no protótipo |
|---|---|
| Entidade **Personagem** (nome, dinastia, anos) | fichas da listagem, tela de detalhe e formulário de cadastro |
| Entidade **Evento** | nó circular no grafo; linha na tabela do painel |
| Entidade **Local** | nó em elipse no grafo; linha na tabela, com a hierarquia (“contém York”) |
| Entidade **Relação** (tipo, direção, descrição) | tela própria de cadastro; rótulos nas arestas do grafo; agrupamento na ficha |
| Catálogo de tipos de relação | `<optgroup>` do formulário de vínculo, agrupado por par de entidades |
| Cor do nó conforme a dinastia | legenda do grafo e etiqueta colorida nas fichas |
| Leitura pública / escrita restrita | tela de login, painel e visibilidade dos botões de ação |
| Remoção desfaz as relações ligadas | aviso e confirmação obrigatória no painel |

---

## 5. Decisões relacionadas à estrutura HTML

### 5.1 Um só `<main>`, um só `<h1>`

Cada página tem exatamente um `<main>`, contendo apenas o conteúdo específico daquela página —
cabeçalho, menu e rodapé ficam fora dele. O `<h1>` é o nome da aplicação, no `<header>`, e não
se repete; o título da página é `<h2>`. A hierarquia de títulos desce sem pular nível
(`h1` → `h2` → `h3` → `h4`), o que permite navegar o documento pelos títulos.

### 5.2 `<section>` com nome, não `<div>` genérica

Cada `<section>` recebe um título e é ligada a ele por `aria-labelledby`. Uma `<section>`
sem nome não é melhor que uma `<div>` — é o rótulo que a torna localizável.

```html
<section aria-labelledby="titulo-conexoes">
  <h3 id="titulo-conexoes">Conexões</h3>
  …
</section>
```

`<div>` foi usada **apenas** como recurso de layout, onde não há significado a comunicar:
o agrupamento da barra de título, a moldura de rolagem da tabela e a divisão em duas colunas.

### 5.3 `<article>` para o que é independente

Cada ficha de personagem, cada cartão de indicador e a ficha de detalhe são `<article>`, e não
`<section>`: são unidades completas em si mesmas, que fariam sentido isoladas do restante da
página. Já as subdivisões internas de uma ficha (atributos, conexões) são `<section>`, porque
só existem dentro dela.

### 5.4 Listas para o que é lista

Grades de cartões, menus, legendas e conexões são `<ul>` com `<li>`, mesmo quando o CSS os
exibe lado a lado em vez de empilhados. A aparência é decisão do CSS; a estrutura registra que
são itens equivalentes de um mesmo conjunto — e o leitor de tela anuncia a quantidade.

### 5.5 `<dl>` para pares nome/valor

Os atributos de uma entidade não são uma tabela nem uma lista simples: são pares
descrição/valor. Por isso `<dl>` com `<dt>` e `<dd>`.

### 5.6 `<table>` só para dados tabulares

Existe uma única tabela, no painel, onde há de fato uma matriz de linhas e colunas. Ela tem
`<caption>`, `<thead>`, `<tbody>` e `scope` em todas as células de cabeçalho — inclusive
`scope="row"` na primeira coluna, que identifica a linha. Sem `scope`, a associação entre
célula e cabeçalho fica ambígua na leitura em voz alta.

### 5.7 `<search>` para o bloco de busca

O bloco de busca da listagem é envolvido pelo elemento `<search>`, introduzido no HTML para
essa finalidade exata. É mais preciso do que uma `<div class="busca">` e dispensa
`role="search"` improvisado.

### 5.8 `<fieldset>` e `<legend>` nos formulários

Campos relacionados são agrupados em `<fieldset>` com `<legend>` descritiva — “Identificação”,
“Período de vida”, “Origem”, “Vínculo”, “Destino”. Em formulários longos, a legenda é lida
antes de cada campo do grupo, dando contexto a rótulos que sozinhos seriam ambíguos: no
formulário de relação, “Entidade” aparece duas vezes, e é a legenda que distingue a origem
do destino.

### 5.9 Tipos de campo específicos

`type="number"` com `min`/`max`/`step` para os anos, `type="password"` para a senha,
`type="search"` para a busca, `type="checkbox"` para as confirmações, `<select>` para conjuntos
fechados e `<datalist>` para sugestões que admitem valor novo. O tipo correto traz validação e
teclado adequado no celular sem exigir JavaScript.

### 5.10 `<button>` e `<a>` não são intercambiáveis

`<a>` para o que **navega** para outra página — *Editar*, *Cancelar*, *Nova relação*.
`<button>` para o que **age** sobre a página corrente — *Remover*, *Buscar*, *Limpar*,
*Salvar*. Cada `<button>` declara o seu `type` (`submit`, `reset` ou `button`), sem depender
do padrão implícito. Botões estilizados como links continuam sendo botões: a diferença aparece
no teclado, no menu de contexto e na leitura em voz alta.

### 5.11 SVG embutido em vez de imagem ou biblioteca

O grafo é `<svg>` escrito diretamente no HTML, dentro de `<figure>` com `<figcaption>`.
Três razões: não depende de JavaScript, que o enunciado dispensa; não depende de arquivo
externo nem de conexão; e é acessível, porque `<title>` e `<desc>` descrevem a rede em texto
para quem não pode vê-la.

### 5.12 Semântica de texto

`<time datetime="…">` nas datas, com o valor legível por máquina no atributo e o texto formatado
para leitura; `<strong>` e `<em>` pelo significado (importância e ênfase), nunca para obter
negrito ou itálico — isso é papel do CSS.

### 5.13 Repetição de cabeçalho e rodapé

Cabeçalho, menu e rodapé estão copiados nas oito páginas. Sem JavaScript e sem linguagem de
servidor, não há como incluir um trecho comum — e ambos estão fora do escopo desta etapa.
A duplicação é consciente e temporária: quando o cliente for reescrito em componentes, esse
trecho vira um componente único.

### 5.14 Idioma e codificação

`<html lang="pt-BR">` em todas as páginas, para que a pronúncia da leitura em voz alta e a
correção ortográfica do navegador usem o idioma certo; `<meta charset="UTF-8">` como primeiro
elemento do `<head>`, garantindo os acentos; `<meta name="viewport">` para o layout em telas
pequenas.

---

## 6. Como abrir o protótipo

Não é necessário instalar nada nem executar servidor:

1. Baixar ou clonar o repositório.
2. Abrir `web/index.html` no navegador (duplo clique já basta).
3. Navegar pelo menu superior.

> As fontes *Cinzel* e *Inter* são carregadas do Google Fonts. Sem acesso à internet, o
> layout continua correto — o navegador cai nas fontes alternativas declaradas na folha
> de estilo.

---

## 7. O que fica para as próximas etapas

- Comportamento dinâmico: busca e filtros que realmente filtram.
- Renderização interativa do grafo, com zoom, arraste e organização automática.
- API REST e persistência em banco de grafos, conforme o item 11 da proposta.
- Autenticação real, substituindo o formulário sem validação.
- Eliminação da repetição de cabeçalho e rodapé por componentização.
