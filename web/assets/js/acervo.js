/* ==========================================================================
   História em Grafos — acervo.js (Etapa 04)
   --------------------------------------------------------------------------
   Dados e funções compartilhados por todas as páginas interativas.

   O acervo é um objeto com quatro ARRAYS — personagens, eventos, locais e
   relações — e fica guardado no localStorage do navegador. Assim, um
   personagem cadastrado em cadastro-personagem.html aparece em
   personagens.html e no painel, e uma remoção feita no painel continua
   valendo depois de recarregar a página.

   É um script clássico (não um módulo ES) de propósito: módulos não carregam
   quando a página é aberta com duplo clique (protocolo file://). Tudo o que
   ele expõe fica num único objeto global, window.Acervo.
   ========================================================================== */

(function () {
  'use strict';

  const CHAVE_ARMAZENAMENTO = 'historia-em-grafos:acervo:v1';

  /* ── Acervo de exemplo ────────────────────────────────────────────────── */
  /* Os mesmos dados que aparecem, estáticos, nos protótipos das Etapas 02 e
     03 — agora como estruturas de dados que o script percorre. */

  const ACERVO_INICIAL = {
    personagens: [
      { id: 'PER-0001', nome: 'Henrique VII',  dinastia: 'Casa Tudor',        nascimento: 1457, morte: 1509, regiao: 'Inglaterra' },
      { id: 'PER-0002', nome: 'Henrique VIII', dinastia: 'Casa Tudor',        nascimento: 1491, morte: 1547, regiao: 'Inglaterra' },
      { id: 'PER-0003', nome: 'Elizabeth I',   dinastia: 'Casa Tudor',        nascimento: 1533, morte: 1603, regiao: 'Inglaterra' },
      { id: 'PER-0004', nome: 'Ricardo III',   dinastia: 'Casa York',         nascimento: 1452, morte: 1485, regiao: 'York' },
      { id: 'PER-0005', nome: 'Eduardo IV',    dinastia: 'Casa Plantageneta', nascimento: 1442, morte: 1483, regiao: '' },
      { id: 'PER-0006', nome: 'Maria, Rainha dos Escoceses', dinastia: 'Casa Stuart', nascimento: 1542, morte: 1587, regiao: 'Escócia' }
    ],
    eventos: [
      { id: 'EVE-0001', nome: 'Batalha de Bosworth',         data: '1485-08-22' },
      { id: 'EVE-0002', nome: 'Reforma Inglesa',             data: '1534' },
      { id: 'EVE-0003', nome: 'Execução de Maria Stuart',    data: '1587-02-08' },
      { id: 'EVE-0004', nome: 'Derrota da Armada Espanhola', data: '1588' }
    ],
    locais: [
      { id: 'LOC-0001', nome: 'Inglaterra', tipo: 'Reino' },
      { id: 'LOC-0002', nome: 'York',       tipo: 'Cidade' },
      { id: 'LOC-0003', nome: 'Escócia',    tipo: 'Reino' }
    ],
    relacoes: [
      { origem: 'PER-0001', tipo: 'PAI_DE',        destino: 'PER-0002' },
      { origem: 'PER-0002', tipo: 'PAI_DE',        destino: 'PER-0003' },
      { origem: 'PER-0001', tipo: 'LUTOU_CONTRA',  destino: 'PER-0004' },
      { origem: 'PER-0005', tipo: 'ALIOU_SE_COM',  destino: 'PER-0004' },
      { origem: 'PER-0003', tipo: 'LUTOU_CONTRA',  destino: 'PER-0006' },
      { origem: 'PER-0001', tipo: 'PARTICIPOU_DA', destino: 'EVE-0001' },
      { origem: 'PER-0004', tipo: 'PARTICIPOU_DA', destino: 'EVE-0001' },
      { origem: 'PER-0002', tipo: 'PARTICIPOU_DA', destino: 'EVE-0002' },
      { origem: 'PER-0003', tipo: 'PARTICIPOU_DA', destino: 'EVE-0003' },
      { origem: 'PER-0006', tipo: 'PARTICIPOU_DA', destino: 'EVE-0003' },
      { origem: 'PER-0003', tipo: 'PARTICIPOU_DA', destino: 'EVE-0004' },
      { origem: 'PER-0001', tipo: 'GOVERNOU',      destino: 'LOC-0001' },
      { origem: 'PER-0002', tipo: 'GOVERNOU',      destino: 'LOC-0001' },
      { origem: 'PER-0003', tipo: 'GOVERNOU',      destino: 'LOC-0001' },
      { origem: 'PER-0005', tipo: 'GOVERNOU',      destino: 'LOC-0001' },
      { origem: 'PER-0006', tipo: 'GOVERNOU',      destino: 'LOC-0003' },
      { origem: 'LOC-0001', tipo: 'HOUVE_A',       destino: 'EVE-0001' },
      { origem: 'LOC-0001', tipo: 'CONTEM',        destino: 'LOC-0002' },
      { origem: 'PER-0004', tipo: 'NASCEU_EM',     destino: 'LOC-0002' }
    ]
  };

  /* Cópia profunda: quem recebe o acervo pode alterá-lo sem estragar o
     ACERVO_INICIAL, que precisa continuar intacto para a restauração. */
  function copiar(valor) {
    return JSON.parse(JSON.stringify(valor));
  }

  /* ── Leitura e gravação ───────────────────────────────────────────────── */

  let armazenamentoDisponivel = true;

  /* Situação inválida tratada: o conteúdo guardado pode estar corrompido
     (editado à mão, versão antiga) ou o navegador pode bloquear o
     localStorage (janela privativa, cookies desligados). Nos dois casos a
     página continua funcionando com o acervo de exemplo, em memória. */
  function carregar() {
    try {
      const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (texto === null) return copiar(ACERVO_INICIAL);

      const dados = JSON.parse(texto);
      const formatoValido = ['personagens', 'eventos', 'locais', 'relacoes']
        .every(function (lista) { return Array.isArray(dados[lista]); });

      if (!formatoValido) {
        console.warn('[acervo] Conteúdo salvo com formato inesperado; usando o acervo de exemplo.');
        return copiar(ACERVO_INICIAL);
      }
      return dados;
    } catch (erro) {
      armazenamentoDisponivel = false;
      console.warn('[acervo] Não foi possível ler o armazenamento local:', erro);
      return copiar(ACERVO_INICIAL);
    }
  }

  /* Devolve true se gravou; false se o navegador recusou. Quem chama decide
     o que dizer ao usuário. */
  function salvar(acervo) {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(acervo));
      return true;
    } catch (erro) {
      armazenamentoDisponivel = false;
      console.warn('[acervo] Não foi possível gravar no armazenamento local:', erro);
      return false;
    }
  }

  function restaurar() {
    try {
      localStorage.removeItem(CHAVE_ARMAZENAMENTO);
    } catch (erro) {
      armazenamentoDisponivel = false;
    }
    return copiar(ACERVO_INICIAL);
  }

  /* ── Consultas sobre o acervo ─────────────────────────────────────────── */

  /* Junta os três arrays de entidades num só, marcando o tipo de cada uma. */
  function todasAsEntidades(acervo) {
    return [].concat(
      acervo.personagens.map(function (p) { return Object.assign({ tipo: 'Personagem' }, p); }),
      acervo.eventos.map(function (e) { return Object.assign({ tipo: 'Evento' }, e); }),
      acervo.locais.map(function (l) { return Object.assign({ tipoLocal: l.tipo }, l, { tipo: 'Local' }); })
    );
  }

  function buscarEntidade(acervo, id) {
    return todasAsEntidades(acervo).find(function (entidade) { return entidade.id === id; });
  }

  /* Todas as relações que chegam ou saem de uma entidade. */
  function relacoesDe(acervo, id) {
    return acervo.relacoes.filter(function (r) { return r.origem === id || r.destino === id; });
  }

  /* Próximo identificador livre: PER-0006 → PER-0007. */
  function proximoId(lista, prefixo) {
    const maior = lista
      .map(function (item) { return parseInt(item.id.split('-')[1], 10); })
      .filter(function (numero) { return !Number.isNaN(numero); })
      .reduce(function (a, b) { return Math.max(a, b); }, 0);
    return prefixo + '-' + String(maior + 1).padStart(4, '0');
  }

  /* ── Utilitários de texto ─────────────────────────────────────────────── */

  /* "Élisabeth " → "elisabeth": a busca e a checagem de nome duplicado
     ignoram maiúsculas, acentos e espaços nas pontas. */
  function normalizar(texto) {
    return String(texto)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }

  /* "Casa Tudor" → "tudor". É o valor usado no filtro de dinastia e na URL,
     compatível com os valores que o formulário da Etapa 02 já enviava. */
  function slugDinastia(dinastia) {
    return normalizar(dinastia).replace(/^casa\s+/, '').replace(/\s+/g, '-');
  }

  function formatarPeriodo(personagem) {
    const inicio = personagem.nascimento === null ? '?' : personagem.nascimento;
    const fim = personagem.morte === null ? '?' : personagem.morte;
    return inicio + ' – ' + fim;
  }

  function plural(quantidade, singular, pluralTexto) {
    return quantidade + ' ' + (quantidade === 1 ? singular : pluralTexto);
  }

  window.Acervo = {
    carregar: carregar,
    salvar: salvar,
    restaurar: restaurar,
    armazenamentoDisponivel: function () { return armazenamentoDisponivel; },
    todasAsEntidades: todasAsEntidades,
    buscarEntidade: buscarEntidade,
    relacoesDe: relacoesDe,
    proximoId: proximoId,
    normalizar: normalizar,
    slugDinastia: slugDinastia,
    formatarPeriodo: formatarPeriodo,
    plural: plural
  };
})();
