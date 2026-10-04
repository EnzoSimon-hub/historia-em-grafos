/* ==========================================================================
   História em Grafos — grafo.js
   --------------------------------------------------------------------------
   Desenha a rede do acervo a partir dos dados de acervo.js, usando a
   biblioteca Cytoscape.js (cópia local em assets/js/vendor/, para continuar
   abrindo com duplo clique e sem internet).

   Este arquivo só traduz o acervo para o formato da biblioteca e decide a
   aparência. Desenho, zoom, arraste e layout ficam com o Cytoscape.

   Layout: os nós partem de uma elipse, agrupados por tipo, e o algoritmo de
   forças "cose" refina as posições — nós se repelem, arestas puxam como
   molas. Partir sempre da mesma elipse faz o desenho sair igual a cada
   abertura da página, em vez de mudar a cada recarga.

   Fluxo:  Acervo.carregar()  →  montarElementos()  →  cytoscape({ ... })
           →  destacar vizinhança ao clicar  →  listarEmTexto()
   ========================================================================== */

(function () {
  'use strict';

  const area  = document.getElementById('grafo');
  const lista = document.getElementById('grafo-lista');

  /* As cores vêm das variáveis do estilo.css: o Cytoscape desenha em
     <canvas> e não enxerga o CSS, mas assim a fonte única continua sendo
     a folha de estilo. */
  const css = getComputedStyle(document.documentElement);
  function cor(variavel) {
    return css.getPropertyValue(variavel).trim();
  }

  const COR_DA_DINASTIA = {
    'Casa Tudor':        cor('--tudor'),
    'Casa York':         cor('--york'),
    'Casa Plantageneta': cor('--plantageneta'),
    'Casa Stuart':       cor('--stuart')
  };

  /* ── Situações em que não há o que desenhar ──────────────────────────── */

  function mostrarAviso(mensagem) {
    const aviso = document.createElement('p');
    aviso.className = 'grafo-aviso';
    aviso.textContent = mensagem;
    area.replaceChildren(aviso);
  }

  /* ── Dados → elementos do Cytoscape ──────────────────────────────────── */

  /* Posição inicial: elipse com os tipos agrupados (a ordem do array é
     personagens, eventos, locais). O "cose" parte daqui. */
  function posicaoInicial(i, total) {
    const angulo = -Math.PI / 2 + i * (2 * Math.PI / total);
    return { x: 400 * Math.cos(angulo), y: 260 * Math.sin(angulo) };
  }

  /* Quebra um nome em linhas de até `limite` caracteres, sem cortar palavras:
     "Maria, Rainha dos Escoceses" → ["Maria, Rainha dos", "Escoceses"]. */
  function quebrarLinhas(texto, limite) {
    return texto.split(' ').reduce(function (linhas, palavra) {
      const ultima = linhas[linhas.length - 1];
      if (ultima !== undefined && (ultima + ' ' + palavra).length <= limite) {
        linhas[linhas.length - 1] = ultima + ' ' + palavra;
      } else {
        linhas.push(palavra);
      }
      return linhas;
    }, []);
  }

  /* Tamanho aproximado do texto: a forma do nó é calculada aqui para caber
     o rótulo, já que a biblioteca não mede o texto sozinha. */
  const LARGURA_DO_CARACTERE = 7;
  const ALTURA_DA_LINHA = 16;

  function montarNo(entidade, i, total) {
    let linhas;
    let corDaBorda;
    if (entidade.tipo === 'Personagem') {
      linhas = quebrarLinhas(entidade.nome, 18).concat(Acervo.formatarPeriodo(entidade));
      corDaBorda = COR_DA_DINASTIA[entidade.dinastia] || cor('--text-dim');
    } else if (entidade.tipo === 'Evento') {
      linhas = quebrarLinhas(entidade.nome, 12).concat(entidade.data.slice(0, 4));
      corDaBorda = cor('--evento');
    } else {
      linhas = quebrarLinhas(entidade.nome, 14).concat(entidade.tipoLocal);
      corDaBorda = cor('--local');
    }

    const maisLonga = Math.max.apply(null, linhas.map(function (l) { return l.length; }));
    let largura = maisLonga * LARGURA_DO_CARACTERE + 24;
    let altura = linhas.length * ALTURA_DA_LINHA + 14;
    if (entidade.tipo === 'Evento') {
      largura = altura = Math.max(largura, altura) + 10;   // círculo: diâmetro único
    } else if (entidade.tipo === 'Local') {
      largura += 20;                                       // a elipse perde espaço nas pontas
    }

    return {
      group: 'nodes',
      data: {
        id: entidade.id,
        rotulo: linhas.join('\n'),
        cor: corDaBorda,
        tipo: entidade.tipo,
        largura: largura,
        altura: altura
      },
      position: posicaoInicial(i, total)
    };
  }

  function montarElementos(acervo) {
    const entidades = Acervo.todasAsEntidades(acervo);
    const existe = {};
    entidades.forEach(function (e) { existe[e.id] = true; });

    /* Situação inválida tratada: uma relação que aponta para uma entidade
       inexistente (dado antigo ou editado à mão) é ignorada, em vez de
       interromper o desenho inteiro. */
    const relacoes = acervo.relacoes.filter(function (r) {
      return existe[r.origem] && existe[r.destino];
    });
    if (relacoes.length < acervo.relacoes.length) {
      console.warn('[grafo] ' + (acervo.relacoes.length - relacoes.length) +
                   ' relação(ões) apontam para entidades inexistentes e foram ignoradas.');
    }

    const nos = entidades.map(function (entidade, i) {
      return montarNo(entidade, i, entidades.length);
    });
    const arestas = relacoes.map(function (r, i) {
      return { group: 'edges', data: { id: 'R' + i, source: r.origem, target: r.destino, tipo: r.tipo } };
    });
    return { nos: nos, arestas: arestas, relacoes: relacoes };
  }

  /* ── Aparência ───────────────────────────────────────────────────────── */

  function estilos() {
    return [
      {
        selector: 'node',
        style: {
          'label': 'data(rotulo)',
          'text-wrap': 'wrap',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-family': 'Inter, sans-serif',
          'font-size': '13px',
          'line-height': 1.2,
          'color': cor('--text'),
          'background-color': cor('--surface'),
          'border-width': 1.6,
          'border-color': 'data(cor)',
          'width': 'data(largura)',
          'height': 'data(altura)'
        }
      },
      { selector: 'node[tipo = "Personagem"]', style: { 'shape': 'round-rectangle' } },
      { selector: 'node[tipo = "Evento"], node[tipo = "Local"]', style: { 'shape': 'ellipse' } },
      {
        selector: 'edge',
        style: {
          'width': 1.4,
          'line-color': cor('--text-dim'),
          'target-arrow-color': cor('--text-dim'),
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(tipo)',
          'font-family': 'Consolas, monospace',
          'font-size': '10px',
          'color': cor('--gold-dim'),
          'text-rotation': 'autorotate',
          'text-background-color': cor('--surface'),
          'text-background-opacity': 1,
          'text-background-padding': '2px'
        }
      },
      /* Destaque ao clicar: o nó escolhido e os vizinhos ficam acesos,
         o resto do grafo apaga. */
      { selector: '.apagado', style: { 'opacity': 0.12 } },
      { selector: 'node.escolhido', style: { 'border-width': 3 } },
      { selector: 'edge.aceso', style: { 'line-color': cor('--gold'), 'target-arrow-color': cor('--gold'), 'color': cor('--gold'), 'width': 2 } }
    ];
  }

  /* ── Interação ───────────────────────────────────────────────────────── */

  function destacarVizinhanca(cy, no) {
    limparDestaque(cy);
    cy.elements().addClass('apagado');
    no.closedNeighborhood().removeClass('apagado');
    no.connectedEdges().addClass('aceso');
    no.addClass('escolhido');
  }

  function limparDestaque(cy) {
    cy.elements().removeClass('apagado aceso escolhido');
  }

  /* ── Alternativa em texto ────────────────────────────────────────────── */

  /* O <canvas> é só uma imagem para o leitor de tela. A mesma rede, em
     forma de lista, fica no <details> abaixo do desenho. */
  function listarEmTexto(acervo, relacoes) {
    const nomes = {};
    Acervo.todasAsEntidades(acervo).forEach(function (e) { nomes[e.id] = e.nome; });
    lista.replaceChildren.apply(lista, relacoes.map(function (r) {
      const tipo = document.createElement('span');
      tipo.className = 'tipo-relacao';
      tipo.textContent = r.tipo;
      const item = document.createElement('li');
      item.append(nomes[r.origem], tipo, '→ ' + nomes[r.destino]);
      return item;
    }));
  }

  /* ── Montagem ────────────────────────────────────────────────────────── */

  const acervo = Acervo.carregar();
  const elementos = montarElementos(acervo);
  listarEmTexto(acervo, elementos.relacoes);

  /* Situação inválida tratada: a biblioteca não carregou (arquivo da pasta
     vendor/ ausente ou bloqueado). A lista em texto continua disponível. */
  if (typeof cytoscape !== 'function') {
    mostrarAviso('Não foi possível carregar a biblioteca de desenho do grafo. As relações continuam listadas abaixo.');
    return;
  }

  /* Situação inválida tratada: acervo vazio (tudo removido no painel). */
  if (elementos.nos.length === 0) {
    mostrarAviso('O acervo está vazio. Restaure o acervo de exemplo no Painel do Curador.');
    return;
  }

  const cy = cytoscape({
    container: area,
    elements: elementos.nos.concat(elementos.arestas),
    style: estilos(),
    layout: { name: 'preset' },   // começa nas posições da elipse
    minZoom: 0.3,
    maxZoom: 2.5,
    boxSelectionEnabled: false
  });

  cy.layout({
    name: 'cose',
    randomize: false,      // parte da elipse: o resultado não muda entre recargas
    animate: false,
    fit: false,
    nodeRepulsion: 12000,
    idealEdgeLength: 110,
    nodeOverlap: 20,
    gravity: 0.3,
    numIter: 2000
  }).run();

  /* A área de desenho é larga. Se as forças deixaram o grafo mais alto que
     largo, gira as posições em 90° (troca x por y) para aproveitar a
     largura; senão, o enquadramento reduziria o zoom e os textos sumiriam. */
  const caixa = cy.nodes().boundingBox();
  if (caixa.h > caixa.w) {
    cy.nodes().positions(function (no) {
      return { x: no.position('y'), y: -no.position('x') };
    });
  }
  cy.fit(undefined, 24);

  cy.on('tap', 'node', function (evento) { destacarVizinhanca(cy, evento.target); });
  cy.on('tap', function (evento) {
    if (evento.target === cy) limparDestaque(cy);   // clique no fundo desfaz o destaque
  });
})();
