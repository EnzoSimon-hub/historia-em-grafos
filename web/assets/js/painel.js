/* ==========================================================================
   História em Grafos — painel.js (Etapa 04)
   --------------------------------------------------------------------------
   Funcionalidade 3 — Painel do curador com dados dinâmicos e remoção em
   cascata.

   - Indicadores "Acervo em números" calculados a partir dos arrays.
   - Tabela de entidades montada pelo script, com filtro por tipo.
   - Botão "Remover" de cada linha abre um modal (<dialog>) que lista as
     relações que serão desfeitas junto com a entidade.
   - Formulário "Remover entidade" validado: exige a entidade e a caixa de
     confirmação, e mostra o impacto antes da remoção.
   - "Restaurar acervo de exemplo" desfaz cadastros e remoções de teste.

   Toda alteração segue o mesmo caminho:
     alterar o array  →  Acervo.salvar()  →  renderizarTudo()
   ========================================================================== */

(function () {
  'use strict';

  let acervo = Acervo.carregar();

  const indicadores   = document.querySelectorAll('[data-contagem]');
  const corpoTabela   = document.getElementById('tabela-entidades');
  const filtroTipo    = document.getElementById('filtro-tipo');
  const status        = document.getElementById('status-painel');
  const botaoRestaurar = document.getElementById('restaurar-acervo');

  const formRemocao   = document.getElementById('form-remocao');
  const campoEntidade = document.getElementById('entidade-remover');
  const campoConfirmar = document.getElementById('confirmar');
  const impacto       = document.getElementById('impacto-remocao');
  const erroEntidade  = document.getElementById('erro-entidade');
  const erroConfirmar = document.getElementById('erro-confirmar');

  const modal         = document.getElementById('modal-remocao');
  const modalTexto    = document.getElementById('modal-texto');
  const modalRelacoes = document.getElementById('modal-relacoes');

  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
                 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  /* Em que array do acervo mora cada tipo de entidade. */
  const LISTA_DO_TIPO = { Personagem: 'personagens', Evento: 'eventos', Local: 'locais' };

  /* ── Formatação ──────────────────────────────────────────────────────── */

  /* "1485-08-22" → "22 de agosto de 1485"; "1534" → "1534". */
  function formatarData(data) {
    const partes = data.split('-').map(Number);
    if (partes.length !== 3) return data;
    return partes[2] + ' de ' + MESES[partes[1] - 1] + ' de ' + partes[0];
  }

  function nomeDe(id) {
    const entidade = Acervo.buscarEntidade(acervo, id);
    return entidade ? entidade.nome : id;
  }

  function detalheDe(entidade) {
    if (entidade.tipo === 'Personagem') {
      return [entidade.dinastia, Acervo.formatarPeriodo(entidade)]
        .filter(function (parte) { return parte; })
        .join(' · ');
    }
    if (entidade.tipo === 'Evento') return formatarData(entidade.data);

    const contidos = acervo.relacoes
      .filter(function (r) { return r.origem === entidade.id && r.tipo === 'CONTEM'; })
      .map(function (r) { return nomeDe(r.destino); });
    return contidos.length ? entidade.tipoLocal + ' · contém ' + contidos.join(', ') : entidade.tipoLocal;
  }

  /* "Henrique VII — PAI_DE → Henrique VIII" */
  function descreverRelacao(relacao) {
    return nomeDe(relacao.origem) + ' — ' + relacao.tipo + ' → ' + nomeDe(relacao.destino);
  }

  /* ── Renderização ────────────────────────────────────────────────────── */

  function renderizarIndicadores() {
    indicadores.forEach(function (elemento) {
      elemento.textContent = acervo[elemento.dataset.contagem].length;
    });
  }

  function celula(tag, conteudo) {
    const elemento = document.createElement(tag);
    if (typeof conteudo === 'string') elemento.textContent = conteudo;
    else if (conteudo) elemento.appendChild(conteudo);
    return elemento;
  }

  function criarLinha(entidade) {
    const linha = document.createElement('tr');

    const identificador = celula('th', celula('small', entidade.id));
    identificador.scope = 'row';

    const link = document.createElement('a');
    link.href = entidade.tipo === 'Personagem' ? 'personagem.html' : 'grafo.html';
    link.textContent = entidade.nome;

    let detalhe = detalheDe(entidade);
    if (entidade.tipo === 'Evento') {
      const time = document.createElement('time');
      time.dateTime = entidade.data;
      time.textContent = detalhe;
      detalhe = time;
    }

    const editar = document.createElement('a');
    editar.className = 'botao';
    editar.href = 'cadastro-personagem.html';
    editar.textContent = 'Editar';

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'botao-perigo';
    remover.textContent = 'Remover';
    remover.dataset.remover = entidade.id;
    remover.setAttribute('aria-label', 'Remover ' + entidade.nome);

    const acoes = document.createElement('td');
    acoes.append(editar, ' ', remover);

    linha.append(
      identificador,
      celula('td', entidade.tipo),
      celula('td', link),
      celula('td', detalhe),
      celula('td', String(Acervo.relacoesDe(acervo, entidade.id).length)),
      acoes
    );
    return linha;
  }

  function renderizarTabela() {
    const tipo = filtroTipo.value;
    const entidades = Acervo.todasAsEntidades(acervo)
      .filter(function (e) { return tipo === '' || e.tipo === tipo; });

    if (entidades.length === 0) {
      const vazia = celula('td', tipo
        ? 'Nenhuma entidade do tipo ' + tipo.toLowerCase() + ' no acervo.'
        : 'O acervo está vazio. Use "Restaurar acervo de exemplo" para recomeçar.');
      vazia.colSpan = 6;
      const linha = document.createElement('tr');
      linha.appendChild(vazia);
      corpoTabela.replaceChildren(linha);
      return;
    }
    corpoTabela.replaceChildren.apply(corpoTabela, entidades.map(criarLinha));
  }

  /* O <select> do formulário de remoção é agrupado por tipo (<optgroup>). */
  function renderizarOpcoesDeRemocao() {
    const selecionada = campoEntidade.value;
    const opcoes = [new Option('— selecione —', '')];

    Object.keys(LISTA_DO_TIPO).forEach(function (tipo) {
      const lista = acervo[LISTA_DO_TIPO[tipo]];
      if (lista.length === 0) return;
      const grupo = document.createElement('optgroup');
      grupo.label = tipo === 'Local' ? 'Locais' : tipo + 's';
      lista.forEach(function (entidade) { grupo.appendChild(new Option(entidade.nome, entidade.id)); });
      opcoes.push(grupo);
    });

    campoEntidade.replaceChildren.apply(campoEntidade, opcoes);
    /* Mantém a escolha, se a entidade ainda existir. */
    campoEntidade.value = Acervo.buscarEntidade(acervo, selecionada) ? selecionada : '';
    mostrarImpacto();
  }

  function renderizarTudo() {
    renderizarIndicadores();
    renderizarTabela();
    renderizarOpcoesDeRemocao();
  }

  /* ── Mensagens ───────────────────────────────────────────────────────── */

  function mostrarStatus(mensagem, tipo) {
    status.textContent = mensagem;
    status.className = 'status status-' + tipo;
    status.hidden = false;
  }

  function mostrarErro(saida, campo, mensagem) {
    saida.textContent = mensagem;
    saida.hidden = mensagem === '';
    if (mensagem) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
  }

  /* Antes de remover, o curador vê quantas relações vão junto. */
  function mostrarImpacto() {
    const id = campoEntidade.value;
    if (id === '') {
      impacto.textContent = '';
      return;
    }
    const quantidade = Acervo.relacoesDe(acervo, id).length;
    impacto.textContent = quantidade === 0
      ? 'Esta entidade não tem relações: nenhuma outra será afetada.'
      : 'Esta remoção desfará ' + Acervo.plural(quantidade, 'relação', 'relações') + '.';
  }

  /* ── Remoção em cascata ──────────────────────────────────────────────── */

  function remover(id) {
    /* Relê o acervo: a entidade pode ter sido removida em outra aba. */
    acervo = Acervo.carregar();
    const entidade = Acervo.buscarEntidade(acervo, id);

    /* Situação inválida tratada: remover algo que já não existe. */
    if (!entidade) {
      renderizarTudo();
      mostrarStatus('A entidade ' + id + ' não existe mais no acervo. A lista foi atualizada.', 'erro');
      return;
    }

    const lista = LISTA_DO_TIPO[entidade.tipo];
    const relacoesAntes = acervo.relacoes.length;

    acervo[lista] = acervo[lista].filter(function (e) { return e.id !== id; });
    acervo.relacoes = acervo.relacoes.filter(function (r) { return r.origem !== id && r.destino !== id; });

    const desfeitas = relacoesAntes - acervo.relacoes.length;
    const gravou = Acervo.salvar(acervo);

    renderizarTudo();
    mostrarStatus(
      '"' + entidade.nome + '" foi removido(a) com ' + Acervo.plural(desfeitas, 'relação desfeita', 'relações desfeitas') + '.' +
      (gravou ? '' : ' Atenção: o navegador bloqueou o armazenamento, então a remoção vale só até recarregar a página.'),
      gravou ? 'sucesso' : 'aviso'
    );
  }

  /* Abre o modal de confirmação com a lista das relações afetadas. */
  function abrirConfirmacao(id) {
    const entidade = Acervo.buscarEntidade(acervo, id);
    if (!entidade) {
      remover(id); // cai no tratamento de "não existe mais"
      return;
    }
    const relacoes = Acervo.relacoesDe(acervo, id);

    modalTexto.textContent = relacoes.length === 0
      ? '"' + entidade.nome + '" não tem relações. Apenas a entidade será removida.'
      : 'Remover "' + entidade.nome + '" também desfará ' +
        Acervo.plural(relacoes.length, 'relação', 'relações') + ':';

    modalRelacoes.replaceChildren.apply(modalRelacoes, relacoes.map(function (relacao) {
      const item = document.createElement('li');
      item.textContent = descreverRelacao(relacao);
      return item;
    }));
    modalRelacoes.hidden = relacoes.length === 0;

    modal.dataset.id = id;

    /* Navegadores antigos sem <dialog>: cai para a confirmação nativa. */
    if (typeof modal.showModal !== 'function') {
      if (window.confirm(modalTexto.textContent)) remover(id);
      return;
    }
    modal.returnValue = '';
    modal.showModal();
  }

  /* ── Eventos ─────────────────────────────────────────────────────────── */

  /* Delegação de eventos: um único ouvinte no <tbody> atende os botões de
     todas as linhas — inclusive as que forem recriadas depois. */
  corpoTabela.addEventListener('click', function (evento) {
    const botao = evento.target.closest('[data-remover]');
    if (botao) abrirConfirmacao(botao.dataset.remover);
  });

  /* O modal fecha por Esc, por "Cancelar" ou por "Remover definitivamente";
     só o último tem returnValue "confirmar". */
  modal.addEventListener('close', function () {
    if (modal.returnValue === 'confirmar') remover(modal.dataset.id);
    delete modal.dataset.id;
  });

  document.getElementById('modal-cancelar').addEventListener('click', function () {
    modal.close('cancelar');
  });

  /* Clique no fundo escurecido, fora da caixa, também cancela. */
  modal.addEventListener('click', function (evento) {
    if (evento.target === modal) modal.close('cancelar');
  });

  filtroTipo.addEventListener('change', renderizarTabela);

  campoEntidade.addEventListener('change', function () {
    mostrarImpacto();
    if (campoEntidade.value !== '') mostrarErro(erroEntidade, campoEntidade, '');
  });

  campoConfirmar.addEventListener('change', function () {
    if (campoConfirmar.checked) mostrarErro(erroConfirmar, campoConfirmar, '');
  });

  formRemocao.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const id = campoEntidade.value;
    const erroDaEntidade = id === '' ? 'Selecione a entidade que será removida.' : '';
    const erroDaConfirmacao = campoConfirmar.checked ? '' : 'Marque a confirmação para prosseguir.';

    mostrarErro(erroEntidade, campoEntidade, erroDaEntidade);
    mostrarErro(erroConfirmar, campoConfirmar, erroDaConfirmacao);

    if (erroDaEntidade) { campoEntidade.focus(); return; }
    if (erroDaConfirmacao) { campoConfirmar.focus(); return; }

    /* A caixa marcada já é a confirmação: aqui não se abre o modal. */
    remover(id);
    formRemocao.reset();
    impacto.textContent = '';
  });

  formRemocao.addEventListener('reset', function () {
    mostrarErro(erroEntidade, campoEntidade, '');
    mostrarErro(erroConfirmar, campoConfirmar, '');
    impacto.textContent = '';
  });

  /* Restaurar exige dois cliques: o primeiro arma o botão por 4 segundos,
     o segundo executa. Evita apagar os testes do curador por engano, sem
     precisar de mais um modal. */
  let restauracaoArmada = null;

  botaoRestaurar.addEventListener('click', function () {
    if (restauracaoArmada === null) {
      botaoRestaurar.textContent = 'Clique de novo para confirmar';
      botaoRestaurar.classList.add('botao-perigo');
      restauracaoArmada = setTimeout(desarmarRestauracao, 4000);
      return;
    }
    desarmarRestauracao();
    acervo = Acervo.restaurar();
    renderizarTudo();
    mostrarStatus('Acervo de exemplo restaurado: cadastros e remoções de teste foram desfeitos.', 'sucesso');
  });

  function desarmarRestauracao() {
    clearTimeout(restauracaoArmada);
    restauracaoArmada = null;
    botaoRestaurar.textContent = 'Restaurar acervo de exemplo';
    botaoRestaurar.classList.remove('botao-perigo');
  }

  renderizarTudo();

  if (!Acervo.armazenamentoDisponivel()) {
    mostrarStatus('O navegador bloqueou o armazenamento local: as alterações valem só até recarregar a página.', 'aviso');
  }
})();
