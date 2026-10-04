/* ==========================================================================
   História em Grafos — grafo.js
   --------------------------------------------------------------------------
   Desenha a rede do acervo a partir dos dados de acervo.js, no lugar da
   ilustração escrita à mão nas Etapas 02 e 03. O grafo passa a mostrar as
   mesmas entidades e relações que a listagem e o painel.

   Layout: os nós ficam distribuídos numa elipse, em ângulos iguais e
   agrupados por tipo (personagens, eventos, locais):
     x = centroX + RAIO_X · cos(ângulo)      y = centroY + RAIO_Y · sen(ângulo)

   Fluxo:  Acervo.carregar()  →  montarNo()  →  posicionar()
           →  desenharArestas()  →  desenharNos()  →  descrever()
   ========================================================================== */

(function () {
  'use strict';

  /* Elementos SVG precisam ser criados no namespace do SVG: com o
     createElement comum, o navegador cria a tag mas não a desenha. */
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* Área de desenho: os mesmos valores do viewBox do <svg> em grafo.html. */
  const LARGURA = 900;
  const ALTURA = 600;

  /* Raios da elipse. Ela é mais larga que alta porque os retângulos dos
     personagens também são: num círculo, os do topo se encostariam. */
  const RAIO_X = 370;
  const RAIO_Y = 230;

  const ALTURA_DA_LINHA = 15;

  /* Espaço entre a ponta da seta e a borda do nó de destino. */
  const FOLGA_SETA = 3;

  /* Onde o rótulo fica ao longo da aresta (0 = origem, 1 = destino). No meio
     (0.5), as arestas longas cruzam o centro da elipse e os rótulos se
     amontoam lá; mais perto do destino, eles se espalham em volta. */
  const POSICAO_DO_ROTULO = 0.65;

  const camadaArestas = document.getElementById('grafo-arestas');
  const camadaNos     = document.getElementById('grafo-nos');
  const descricao     = document.getElementById('svg-desc');

  /* ── Utilitários ─────────────────────────────────────────────────────── */

  function criarSvg(tag, atributos, texto) {
    const elemento = document.createElementNS(SVG_NS, tag);
    Object.entries(atributos || {}).forEach(function (par) {
      elemento.setAttribute(par[0], par[1]);
    });
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  /* Uma casa decimal basta para o desenho e deixa o SVG gerado legível. */
  function arredondar(numero) {
    return Math.round(numero * 10) / 10;
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

  /* ── Nós ─────────────────────────────────────────────────────────────── */

  /* Cada entidade vira um nó com forma, tamanho e textos já decididos.
     meiaLargura e meiaAltura medem a forma a partir do centro: no
     retângulo, metade dos lados; no círculo e na elipse, os raios. */
  function montarNo(entidade) {
    if (entidade.tipo === 'Personagem') {
      const linhas = quebrarLinhas(entidade.nome, 18);
      return {
        entidade: entidade,
        forma: 'rect',
        linhas: linhas,
        detalhe: Acervo.formatarPeriodo(entidade),
        meiaLargura: 65,
        meiaAltura: ((linhas.length + 1) * ALTURA_DA_LINHA + 14) / 2
      };
    }
    if (entidade.tipo === 'Evento') {
      return {
        entidade: entidade,
        forma: 'circle',
        linhas: quebrarLinhas(entidade.nome, 12),
        detalhe: entidade.data.slice(0, 4),
        meiaLargura: 46,
        meiaAltura: 46
      };
    }
    return {
      entidade: entidade,
      forma: 'ellipse',
      linhas: quebrarLinhas(entidade.nome, 14),
      detalhe: entidade.tipoLocal,
      meiaLargura: 64,
      meiaAltura: 26
    };
  }

  /* Distribui os nós na elipse em ângulos iguais, começando no topo (-90°)
     e seguindo no sentido horário. A ordem do array — personagens, eventos,
     locais — mantém os tipos agrupados. */
  function posicionar(nos) {
    const passo = (2 * Math.PI) / nos.length;
    nos.forEach(function (no, i) {
      const angulo = -Math.PI / 2 + i * passo;
      no.x = LARGURA / 2 + RAIO_X * Math.cos(angulo);
      no.y = ALTURA / 2 + RAIO_Y * Math.sin(angulo);
    });
  }

  function criarForma(no) {
    const atributos = { 'class': 'no no-' + no.entidade.tipo.toLowerCase() };
    if (no.entidade.tipo === 'Personagem') atributos['data-dinastia'] = no.entidade.dinastia;

    if (no.forma === 'rect') {
      atributos.x = arredondar(no.x - no.meiaLargura);
      atributos.y = arredondar(no.y - no.meiaAltura);
      atributos.width = no.meiaLargura * 2;
      atributos.height = no.meiaAltura * 2;
      atributos.rx = 3;
    } else if (no.forma === 'circle') {
      atributos.cx = arredondar(no.x);
      atributos.cy = arredondar(no.y);
      atributos.r = no.meiaLargura;
    } else {
      atributos.cx = arredondar(no.x);
      atributos.cy = arredondar(no.y);
      atributos.rx = no.meiaLargura;
      atributos.ry = no.meiaAltura;
    }
    return criarSvg(no.forma, atributos);
  }

  /* Nome (uma ou mais linhas) e detalhe, centralizados verticalmente no nó. */
  function criarTextos(no) {
    const total = no.linhas.length + (no.detalhe ? 1 : 0);
    const primeiraLinha = no.y - ((total - 1) * ALTURA_DA_LINHA) / 2 + 4;

    const textos = no.linhas.map(function (linha, i) {
      return criarSvg('text', {
        'class': 'nome',
        x: arredondar(no.x),
        y: arredondar(primeiraLinha + i * ALTURA_DA_LINHA)
      }, linha);
    });
    if (no.detalhe) {
      textos.push(criarSvg('text', {
        'class': 'miudo',
        x: arredondar(no.x),
        y: arredondar(primeiraLinha + no.linhas.length * ALTURA_DA_LINHA)
      }, no.detalhe));
    }
    return textos;
  }

  function desenharNos(nos) {
    nos.forEach(function (no) {
      const grupo = criarSvg('g');
      grupo.append.apply(grupo, [criarForma(no)].concat(criarTextos(no)));
      camadaNos.appendChild(grupo);
    });
  }

  /* ── Arestas ─────────────────────────────────────────────────────────── */

  /* Ponto da borda do nó na direção (dx, dy), um vetor de tamanho 1. Sem
     isto, a linha iria até o centro e a ponta da seta ficaria escondida
     atrás do nó. */
  function bordaNaDirecao(no, dx, dy) {
    const a = no.meiaLargura;
    const b = no.meiaAltura;
    const distancia = no.forma === 'rect'
      ? Math.min(a / Math.abs(dx), b / Math.abs(dy))
      : 1 / Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b));
    return { x: no.x + dx * distancia, y: no.y + dy * distancia };
  }

  /* Devolve as relações efetivamente desenhadas. */
  function desenharArestas(relacoes, porId) {
    /* Situação inválida tratada: uma relação que aponta para uma entidade
       inexistente (dado antigo ou editado à mão) é ignorada, em vez de
       interromper o desenho inteiro. */
    const validas = relacoes.filter(function (r) {
      return porId[r.origem] && porId[r.destino] && r.origem !== r.destino;
    });
    if (validas.length < relacoes.length) {
      console.warn('[grafo] ' + (relacoes.length - validas.length) + ' relação(ões) apontam para entidades inexistentes e foram ignoradas.');
    }

    validas.forEach(function (relacao) {
      const origem = porId[relacao.origem];
      const destino = porId[relacao.destino];

      const comprimento = Math.hypot(destino.x - origem.x, destino.y - origem.y);
      const dx = (destino.x - origem.x) / comprimento;
      const dy = (destino.y - origem.y) / comprimento;

      const inicio = bordaNaDirecao(origem, dx, dy);
      const chegada = bordaNaDirecao(destino, -dx, -dy);
      const fim = { x: chegada.x - dx * FOLGA_SETA, y: chegada.y - dy * FOLGA_SETA };

      /* marker-end vai como atributo, e não no CSS: em folha de estilo
         externa, url(#seta) seria procurado dentro do arquivo .css. */
      camadaArestas.append(
        criarSvg('line', {
          'class': 'aresta',
          x1: arredondar(inicio.x), y1: arredondar(inicio.y),
          x2: arredondar(fim.x),    y2: arredondar(fim.y),
          'marker-end': 'url(#seta)'
        }),
        criarSvg('text', {
          'class': 'rotulo',
          x: arredondar(inicio.x + (fim.x - inicio.x) * POSICAO_DO_ROTULO),
          y: arredondar(inicio.y + (fim.y - inicio.y) * POSICAO_DO_ROTULO - 3)
        }, relacao.tipo)
      );
    });
    return validas;
  }

  /* ── Descrição em texto ──────────────────────────────────────────────── */

  /* O <desc> é o que o leitor de tela lê no lugar do desenho: passa a
     descrever a rede real, relação por relação. */
  function descrever(nos, relacoes, porId) {
    const frases = relacoes.map(function (r) {
      return porId[r.origem].entidade.nome + ' ' + r.tipo + ' ' + porId[r.destino].entidade.nome;
    });
    descricao.textContent =
      Acervo.plural(nos.length, 'entidade', 'entidades') + ' e ' +
      Acervo.plural(relacoes.length, 'relação', 'relações') + '. ' +
      frases.join('; ') + '.';
  }

  /* ── Montagem ────────────────────────────────────────────────────────── */

  const acervo = Acervo.carregar();
  const nos = Acervo.todasAsEntidades(acervo).map(montarNo);

  /* Situação inválida tratada: acervo vazio (tudo removido no painel). */
  if (nos.length === 0) {
    camadaNos.appendChild(criarSvg('text', {
      'class': 'nome', x: LARGURA / 2, y: ALTURA / 2
    }, 'O acervo está vazio. Restaure o acervo de exemplo no Painel do Curador.'));
    descricao.textContent = 'O acervo está vazio.';
    return;
  }

  const porId = {};
  nos.forEach(function (no) { porId[no.entidade.id] = no; });

  posicionar(nos);
  const desenhadas = desenharArestas(acervo.relacoes, porId);
  desenharNos(nos);
  descrever(nos, desenhadas, porId);
})();
