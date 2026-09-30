/* ==========================================================================
   História em Grafos — cadastro-personagem.js (Etapa 04)
   --------------------------------------------------------------------------
   Funcionalidade 2 — Validação do formulário e inclusão no acervo.

   O formulário recebe `novalidate` no HTML: as mensagens nativas do
   navegador são substituídas por mensagens próprias, escritas em português,
   exibidas embaixo de cada campo e repetidas num resumo no topo.

   Cada campo tem uma função de validação que devolve '' (válido) ou o texto
   do erro. As regras que envolvem dois campos — morte antes do nascimento,
   período de vida implausível — ficam na validação do ano de morte.

   Quando tudo está válido, o personagem entra no array acervo.personagens,
   o acervo é gravado e o navegador vai para a listagem, que destaca o novo
   cartão.
   ========================================================================== */

(function () {
  'use strict';

  const ANO_MINIMO = -3000;
  const ANO_ATUAL = new Date().getFullYear();
  const VIDA_MAXIMA = 130;
  const LIMITE_NOTAS = 800;

  const form      = document.getElementById('form-personagem');
  const resumo    = document.getElementById('resumo-erros');
  const contador  = document.getElementById('contador-notas');
  const botaoSalvar = form.querySelector('button[type="submit"]');
  const areaDeAcoes = form.querySelector('.acoes');

  const campos = {
    nome:       document.getElementById('nome'),
    dinastia:   document.getElementById('dinastia'),
    nascimento: document.getElementById('ano-nascimento'),
    morte:      document.getElementById('ano-morte'),
    notas:      document.getElementById('notas')
  };

  /* Nome de cada campo como aparece para o usuário, usado no resumo. */
  const ROTULOS = {
    nome: 'Nome',
    dinastia: 'Dinastia',
    nascimento: 'Ano de nascimento',
    morte: 'Ano de morte',
    notas: 'Notas do curador'
  };

  /* Onde fica a mensagem de erro de cada campo. */
  const ERROS = {
    nome:       document.getElementById('erro-nome'),
    dinastia:   document.getElementById('erro-dinastia'),
    nascimento: document.getElementById('erro-ano-nascimento'),
    morte:      document.getElementById('erro-ano-morte'),
    notas:      document.getElementById('erro-notas')
  };

  /* ── Leitura dos valores ─────────────────────────────────────────────── */

  /* Junta espaços repetidos: "Henrique   VII " → "Henrique VII". */
  function textoLimpo(campo) {
    return campo.value.replace(/\s+/g, ' ').trim();
  }

  /* Devolve { vazio, numero, invalido } para um campo de ano.
     `validity.badInput` pega o caso em que o navegador aceitou algo que não
     é número (ex.: "1e") e, por isso, `value` chega vazio. */
  function lerAno(campo) {
    if (campo.validity.badInput) return { vazio: false, invalido: true, numero: NaN };
    if (campo.value.trim() === '') return { vazio: true, invalido: false, numero: null };
    const numero = Number(campo.value);
    return { vazio: false, invalido: !Number.isInteger(numero), numero: numero };
  }

  function contemLetra(texto) {
    return /\p{L}/u.test(texto);
  }

  /* ── Regras de validação ─────────────────────────────────────────────── */

  function validarNome() {
    const nome = textoLimpo(campos.nome);
    if (nome === '') return 'Informe o nome do personagem.';
    if (nome.length < 2) return 'O nome precisa ter pelo menos 2 caracteres.';
    if (nome.length > 120) return 'O nome pode ter no máximo 120 caracteres.';
    if (!contemLetra(nome)) return 'O nome precisa conter letras.';

    /* O acervo é relido aqui, e não só no carregamento da página, para
       enxergar personagens cadastrados em outra aba nesse meio-tempo. */
    const alvo = Acervo.normalizar(nome);
    const repetido = Acervo.carregar().personagens.find(function (p) {
      return Acervo.normalizar(p.nome) === alvo;
    });
    if (repetido) return 'Já existe um personagem chamado "' + repetido.nome + '" (' + repetido.id + ').';
    return '';
  }

  function validarDinastia() {
    const dinastia = textoLimpo(campos.dinastia);
    if (dinastia === '') return '';
    if (dinastia.length > 80) return 'A dinastia pode ter no máximo 80 caracteres.';
    if (!contemLetra(dinastia)) return 'A dinastia precisa conter letras.';
    return '';
  }

  function validarAno(campo, oQue) {
    const ano = lerAno(campo);
    if (ano.vazio) return '';
    if (ano.invalido) return 'O ano de ' + oQue + ' deve ser um número inteiro, sem letras nem casas decimais.';
    if (ano.numero === 0) return 'Não existe ano 0 no calendário: use 1 (d.C.) ou -1 (a.C.).';
    if (ano.numero < ANO_MINIMO) return 'O ano de ' + oQue + ' não pode ser anterior a ' + ANO_MINIMO + '.';
    if (ano.numero > ANO_ATUAL) return 'O ano de ' + oQue + ' não pode estar no futuro (depois de ' + ANO_ATUAL + ').';
    return '';
  }

  function validarNascimento() {
    return validarAno(campos.nascimento, 'nascimento');
  }

  /* Regras que cruzam os dois anos ficam aqui, e o erro aparece no campo
     de morte: é nele que o usuário normalmente digita por último. */
  function validarMorte() {
    const erroProprio = validarAno(campos.morte, 'morte');
    if (erroProprio) return erroProprio;

    const nascimento = lerAno(campos.nascimento);
    const morte = lerAno(campos.morte);
    const ambosValidos = !nascimento.vazio && !morte.vazio && !validarNascimento();
    if (!ambosValidos) return '';

    if (morte.numero < nascimento.numero) {
      return 'O ano de morte (' + morte.numero + ') é anterior ao de nascimento (' + nascimento.numero + ').';
    }
    const vida = morte.numero - nascimento.numero;
    if (vida > VIDA_MAXIMA) {
      return 'Um período de vida de ' + vida + ' anos não é plausível. Confira os dois anos.';
    }
    return '';
  }

  function validarNotas() {
    const tamanho = campos.notas.value.length;
    if (tamanho > LIMITE_NOTAS) return 'As notas passaram do limite em ' + (tamanho - LIMITE_NOTAS) + ' caracteres.';
    return '';
  }

  const VALIDADORES = {
    nome: validarNome,
    dinastia: validarDinastia,
    nascimento: validarNascimento,
    morte: validarMorte,
    notas: validarNotas
  };

  /* ── Exibição dos erros ──────────────────────────────────────────────── */

  /* Liga (ou desliga) a mensagem de erro ao campo: texto visível, borda
     vermelha via aria-invalid, e o id da mensagem em aria-describedby para
     que o leitor de tela anuncie o erro junto com o rótulo. */
  function mostrarErro(chave, mensagem) {
    const campo = campos[chave];
    const saida = ERROS[chave];
    const descritores = (campo.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(function (id) { return id && id !== saida.id; });

    if (mensagem) {
      saida.textContent = mensagem;
      saida.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      descritores.push(saida.id);
    } else {
      saida.textContent = '';
      saida.hidden = true;
      campo.removeAttribute('aria-invalid');
    }
    campo.setAttribute('aria-describedby', descritores.join(' '));
  }

  function validarCampo(chave) {
    const mensagem = VALIDADORES[chave]();
    mostrarErro(chave, mensagem);
    return mensagem;
  }

  /* Valida tudo e devolve a lista de erros: [{ chave, mensagem }, …]. */
  function validarTudo() {
    return Object.keys(VALIDADORES)
      .map(function (chave) { return { chave: chave, mensagem: validarCampo(chave) }; })
      .filter(function (resultado) { return resultado.mensagem !== ''; });
  }

  /* Resumo no topo do formulário, com um link para cada campo com erro. */
  function mostrarResumo(titulo, erros) {
    const lista = document.createElement('ul');
    erros.forEach(function (erro) {
      const link = document.createElement('a');
      link.href = '#' + campos[erro.chave].id;
      link.textContent = ROTULOS[erro.chave] + ': ' + erro.mensagem;
      link.addEventListener('click', function (evento) {
        evento.preventDefault();
        campos[erro.chave].focus();
      });
      const item = document.createElement('li');
      item.appendChild(link);
      lista.appendChild(item);
    });

    const cabecalho = document.createElement('strong');
    cabecalho.textContent = titulo;

    resumo.replaceChildren(cabecalho, lista);
    resumo.hidden = false;
    resumo.focus();
  }

  function esconderResumo() {
    resumo.hidden = true;
    resumo.replaceChildren();
  }

  /* ── Contador de caracteres das notas ────────────────────────────────── */

  function atualizarContador() {
    const tamanho = campos.notas.value.length;
    contador.textContent = tamanho + ' / ' + LIMITE_NOTAS;
    contador.classList.toggle('contador-alerta', tamanho > LIMITE_NOTAS * 0.9);
  }

  /* ── Gravação ────────────────────────────────────────────────────────── */

  function montarPersonagem(acervo) {
    const nascimento = lerAno(campos.nascimento);
    const morte = lerAno(campos.morte);
    return {
      id: Acervo.proximoId(acervo.personagens, 'PER'),
      nome: textoLimpo(campos.nome),
      dinastia: textoLimpo(campos.dinastia),
      nascimento: nascimento.vazio ? null : nascimento.numero,
      morte: morte.vazio ? null : morte.numero,
      regiao: '',
      notas: campos.notas.value.trim()
    };
  }

  function salvar() {
    const acervo = Acervo.carregar();
    const personagem = montarPersonagem(acervo);
    acervo.personagens.push(personagem);

    /* Situação inválida tratada: navegador com armazenamento bloqueado.
       Os dados digitados continuam no formulário, nada é perdido. */
    if (!Acervo.salvar(acervo)) {
      mostrarResumo('Não foi possível salvar.', [{
        chave: 'nome',
        mensagem: 'o navegador bloqueou o armazenamento local (janela privativa ou cookies desativados). ' +
                  'Os dados digitados foram mantidos.'
      }]);
      return;
    }

    location.href = 'personagens.html?novo=' + encodeURIComponent(personagem.id);
  }

  /* ── Eventos ─────────────────────────────────────────────────────────── */

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const erros = validarTudo();
    if (erros.length > 0) {
      const titulo = erros.length === 1
        ? 'Corrija 1 campo antes de salvar:'
        : 'Corrija ' + erros.length + ' campos antes de salvar:';
      mostrarResumo(titulo, erros);
      return;
    }

    /* Evita dois cadastros iguais por duplo clique. */
    botaoSalvar.disabled = true;
    esconderResumo();
    salvar();
    botaoSalvar.disabled = false;
  });

  /* Ao sair de um campo, ele é validado. Enquanto o usuário corrige um
     campo já marcado como inválido, a validação acontece a cada tecla —
     assim o erro some no instante em que deixa de existir. */
  Object.keys(campos).forEach(function (chave) {
    const campo = campos[chave];

    /* Exceção: se o foco está indo para um dos botões ("Salvar", "Limpar
       campos"), não valida aqui. A mensagem de erro inserida neste instante
       empurraria o botão para baixo entre o mousedown e o mouseup, e o
       clique se perderia. Salvar valida tudo; Limpar apaga tudo. */
    campo.addEventListener('blur', function (evento) {
      if (evento.relatedTarget && areaDeAcoes.contains(evento.relatedTarget)) return;
      if (campo.value !== '' || campo.hasAttribute('aria-invalid')) validarCampo(chave);
    });

    campo.addEventListener('input', function () {
      if (campo.hasAttribute('aria-invalid')) validarCampo(chave);
    });
  });

  /* Alterar o nascimento pode criar ou desfazer o erro do ano de morte. */
  campos.nascimento.addEventListener('input', function () {
    if (campos.morte.value !== '') validarCampo('morte');
  });

  campos.notas.addEventListener('input', atualizarContador);

  /* "Limpar campos" também apaga as mensagens de erro e zera o contador.
     O evento reset dispara antes de os valores serem apagados, por isso o
     trabalho é adiado para o próximo ciclo. */
  form.addEventListener('reset', function () {
    setTimeout(function () {
      Object.keys(campos).forEach(function (chave) { mostrarErro(chave, ''); });
      esconderResumo();
      atualizarContador();
      campos.nome.focus();
    }, 0);
  });

  atualizarContador();
})();
