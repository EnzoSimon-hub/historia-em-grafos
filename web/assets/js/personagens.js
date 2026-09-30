/* ==========================================================================
   História em Grafos — personagens.js (Etapa 04)
   --------------------------------------------------------------------------
   Funcionalidade 1 — Pesquisa, filtragem e ordenação da listagem.

   A grade de cartões deixou de estar escrita no HTML: ela é montada aqui, a
   partir do array acervo.personagens, e remontada a cada tecla digitada na
   busca, a cada troca de dinastia e a cada troca de ordenação.

   Fluxo:  evento (input / change)  →  lerFiltros()  →  aplicarFiltros()
           →  ordenar()  →  renderizar()  →  atualizarUrl()
   ========================================================================== */

(function () {
  'use strict';

  const acervo = Acervo.carregar();

  /* Personagem recém-cadastrado (?novo=PER-0007), lido uma única vez: a URL
     é reescrita pelos filtros, mas o destaque do cartão deve continuar. */
  const idNovo = new URLSearchParams(location.search).get('novo');

  /* Distingue o aviso sobre o termo digitado dos outros avisos, para que
     corrigir o termo não apague, por exemplo, o aviso de dinastia inválida. */
  let avisoDoTermoVisivel = false;

  /* ── Referências aos elementos da página ─────────────────────────────── */

  const formBusca      = document.getElementById('form-busca');
  const campoNome      = document.getElementById('busca-nome');
  const campoDinastia  = document.getElementById('busca-dinastia');
  const campoOrdem     = document.getElementById('busca-ordem');
  const botaoLimpar    = document.getElementById('limpar-filtros');
  const botaoVazio     = document.getElementById('vazio-limpar');
  const lista          = document.getElementById('lista-personagens');
  const listaVazia     = document.getElementById('lista-vazia');
  const titulo         = document.getElementById('titulo-resultados');
  const status         = document.getElementById('status-busca');

  /* Critérios de ordenação: cada chave do <select> aponta para uma função
     de comparação. Acrescentar um critério é acrescentar uma linha aqui. */
  const COMPARADORES = {
    'nome':            function (a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); },
    'nascimento':      function (a, b) { return anoOuInfinito(a.nascimento) - anoOuInfinito(b.nascimento); },
    'nascimento-desc': function (a, b) { return anoOuInfinito(b.nascimento, -1) - anoOuInfinito(a.nascimento, -1); },
    'relacoes':        function (a, b) { return contarRelacoes(b) - contarRelacoes(a) || a.nome.localeCompare(b.nome, 'pt-BR'); }
  };

  /* Personagem sem ano conhecido vai para o fim da lista, em qualquer sentido. */
  function anoOuInfinito(ano, sinal) {
    return ano === null ? (sinal || 1) * Infinity : ano;
  }

  function contarRelacoes(personagem) {
    return Acervo.relacoesDe(acervo, personagem.id).length;
  }

  function contarEventos(personagem) {
    return Acervo.relacoesDe(acervo, personagem.id)
      .filter(function (r) { return r.tipo === 'PARTICIPOU_DA'; })
      .length;
  }

  /* ── Filtro de dinastia montado a partir dos dados ───────────────────── */
  /* As opções do <select> vêm do próprio acervo (Set elimina repetições).
     Uma dinastia nova, digitada no cadastro, passa a aparecer no filtro. */
  function montarOpcoesDeDinastia() {
    const dinastias = Array.from(new Set(
      acervo.personagens
        .map(function (p) { return p.dinastia; })
        .filter(function (d) { return d !== ''; })
    )).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

    campoDinastia.replaceChildren(new Option('Todas', ''));
    dinastias.forEach(function (dinastia) {
      campoDinastia.add(new Option(dinastia, Acervo.slugDinastia(dinastia)));
    });
  }

  /* ── Leitura dos filtros ─────────────────────────────────────────────── */

  function lerFiltros() {
    return {
      termo: campoNome.value.trim(),
      dinastia: campoDinastia.value,
      ordem: campoOrdem.value
    };
  }

  /* Situação inválida tratada: um termo feito só de símbolos ("%%%", "---")
     nunca vai casar com um nome. Em vez de mostrar "nenhum resultado" — que
     sugere que o acervo não tem o personagem —, o termo é ignorado e o
     usuário é avisado do porquê. */
  function termoValido(termo) {
    return termo === '' || /[\p{L}\p{N}]/u.test(termo);
  }

  function aplicarFiltros(filtros) {
    const termo = Acervo.normalizar(filtros.termo);
    return acervo.personagens.filter(function (p) {
      const casaNome = termo === '' || Acervo.normalizar(p.nome).includes(termo);
      const casaDinastia = filtros.dinastia === '' || Acervo.slugDinastia(p.dinastia) === filtros.dinastia;
      return casaNome && casaDinastia;
    });
  }

  function ordenar(personagens, criterio) {
    const comparador = COMPARADORES[criterio] || COMPARADORES.nome;
    return personagens.slice().sort(comparador);
  }

  /* ── Construção dos cartões (manipulação do DOM) ─────────────────────── */

  function criarElemento(tag, atributos, texto) {
    const elemento = document.createElement(tag);
    Object.entries(atributos || {}).forEach(function (par) {
      elemento.setAttribute(par[0], par[1]);
    });
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  function criarAno(rotulo, ano) {
    const fragmento = document.createDocumentFragment();
    const dd = criarElemento('dd');
    if (ano === null) {
      dd.textContent = 'desconhecido';
    } else {
      dd.appendChild(criarElemento('time', { datetime: String(ano) }, String(ano)));
    }
    fragmento.append(criarElemento('dt', {}, rotulo), dd);
    return fragmento;
  }

  function criarCartao(personagem) {
    const article = criarElemento('article');
    if (personagem.id === idNovo) article.classList.add('novo');

    const header = criarElemento('header');
    if (personagem.dinastia) {
      header.appendChild(criarElemento('span',
        { 'class': 'etiqueta', 'data-dinastia': personagem.dinastia }, personagem.dinastia));
    } else {
      header.appendChild(criarElemento('span', { 'class': 'etiqueta' }, 'Sem dinastia'));
    }
    const h3 = criarElemento('h3');
    h3.appendChild(criarElemento('a', { href: 'personagem.html' }, personagem.nome));
    header.appendChild(h3);

    const atributos = criarElemento('dl', { 'class': 'atributos' });
    atributos.append(criarAno('Nascimento', personagem.nascimento), criarAno('Morte', personagem.morte));

    const footer = criarElemento('footer');
    const selos = [
      Acervo.plural(contarRelacoes(personagem), 'relação', 'relações'),
      Acervo.plural(contarEventos(personagem), 'evento', 'eventos'),
      personagem.regiao
    ];
    selos
      .filter(function (texto) { return texto; })
      .forEach(function (texto) { footer.appendChild(criarElemento('span', { 'class': 'selo' }, texto)); });

    article.append(header, atributos, footer);

    const li = criarElemento('li');
    li.appendChild(article);
    return li;
  }

  /* ── Atualização da interface ────────────────────────────────────────── */

  function renderizar(personagens, filtros) {
    lista.replaceChildren.apply(lista, personagens.map(criarCartao));

    const total = acervo.personagens.length;
    const filtrando = filtros.termo !== '' || filtros.dinastia !== '';

    titulo.textContent = filtrando
      ? Acervo.plural(personagens.length, 'personagem encontrado', 'personagens encontrados') + ' de ' + total
      : Acervo.plural(total, 'personagem no acervo', 'personagens no acervo');

    listaVazia.hidden = personagens.length > 0;
    lista.hidden = personagens.length === 0;
    botaoLimpar.hidden = !filtrando;
  }

  function mostrarStatus(mensagem, tipo) {
    status.textContent = mensagem;
    status.className = 'status status-' + tipo;
    status.hidden = false;
  }

  function esconderStatus() {
    avisoDoTermoVisivel = false;
    status.hidden = true;
    status.textContent = '';
  }

  /* Mantém a URL em sincronia com os filtros: recarregar a página ou
     compartilhar o endereço devolve a mesma listagem. */
  function atualizarUrl(filtros) {
    const parametros = new URLSearchParams();
    if (filtros.termo) parametros.set('q', filtros.termo);
    if (filtros.dinastia) parametros.set('dinastia', filtros.dinastia);
    if (filtros.ordem !== 'nome') parametros.set('ordem', filtros.ordem);
    const busca = parametros.toString();
    history.replaceState(null, '', busca ? '?' + busca : location.pathname);
  }

  function atualizar() {
    const filtros = lerFiltros();

    if (!termoValido(filtros.termo)) {
      mostrarStatus('O termo "' + filtros.termo + '" não contém letras nem números e foi ignorado.', 'aviso');
      campoNome.setAttribute('aria-invalid', 'true');
      avisoDoTermoVisivel = true;
      filtros.termo = '';
    } else {
      campoNome.removeAttribute('aria-invalid');
      if (avisoDoTermoVisivel) esconderStatus();
      avisoDoTermoVisivel = false;
    }

    renderizar(ordenar(aplicarFiltros(filtros), filtros.ordem), filtros);
    atualizarUrl(filtros);
  }

  function limparFiltros() {
    campoNome.value = '';
    campoDinastia.value = '';
    campoOrdem.value = 'nome';
    esconderStatus();
    atualizar();
    campoNome.focus();
  }

  /* ── Estado inicial vindo da URL ─────────────────────────────────────── */

  function aplicarParametrosDaUrl() {
    const parametros = new URLSearchParams(location.search);

    campoNome.value = (parametros.get('q') || '').slice(0, 60);

    /* Situação inválida tratada: uma dinastia inexistente na URL (link
       antigo, endereço digitado à mão) não pode zerar a listagem sem
       explicação. O filtro volta para "Todas" e o usuário é avisado. */
    const dinastia = parametros.get('dinastia') || '';
    const existe = Array.from(campoDinastia.options).some(function (opcao) { return opcao.value === dinastia; });
    if (existe) {
      campoDinastia.value = dinastia;
    } else {
      mostrarStatus('A dinastia "' + dinastia + '" não existe no acervo. Mostrando todas.', 'aviso');
    }

    const ordem = parametros.get('ordem');
    if (ordem && COMPARADORES[ordem]) campoOrdem.value = ordem;

    /* Retorno do cadastro: destaca o personagem recém-criado. */
    if (idNovo) {
      const novo = acervo.personagens.find(function (p) { return p.id === idNovo; });
      if (novo) {
        mostrarStatus('"' + novo.nome + '" foi cadastrado com o identificador ' + novo.id + '.', 'sucesso');
      } else {
        mostrarStatus('O personagem ' + idNovo + ' não foi encontrado no acervo.', 'erro');
      }
    }
  }

  /* ── Eventos ─────────────────────────────────────────────────────────── */

  campoNome.addEventListener('input', atualizar);
  campoDinastia.addEventListener('change', atualizar);
  campoOrdem.addEventListener('change', atualizar);
  botaoLimpar.addEventListener('click', limparFiltros);
  botaoVazio.addEventListener('click', limparFiltros);

  /* O botão "Buscar" continua existindo para quem prefere confirmar a busca
     com Enter, mas não recarrega mais a página. */
  formBusca.addEventListener('submit', function (evento) {
    evento.preventDefault();
    atualizar();
  });

  /* Esc dentro da busca limpa o termo. */
  campoNome.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && campoNome.value !== '') {
      evento.preventDefault();
      campoNome.value = '';
      atualizar();
    }
  });

  montarOpcoesDeDinastia();
  aplicarParametrosDaUrl();
  atualizar();
})();
