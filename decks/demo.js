// Vitrine do motor: um slide de cada tipo, com referências reais do app.
// Serve de modelo para escrever decks novos e de teste visual dos temas.
deck({
  id: 'demo',
  title: 'Vitrine: tu és Pedro',
  description: 'Um slide de cada tipo, com referências reais do app.',
  theme: 'classica',
  article: 19,
  slides: [
    {
      type: 'title',
      kicker: 'Primado de Pedro',
      title: 'Tu és Pedro',
      subtitle: 'A rocha, as chaves e a Igreja em Mateus 16',
      image: 'article',
      notes: 'Abertura. Diga em uma frase a pergunta do vídeo: Jesus deu ou não deu a Pedro um lugar único na Igreja?',
    },
    {
      type: 'hook',
      who: 'A objeção',
      text: 'Pedro era só uma pedrinha. A rocha sobre a qual a Igreja foi construída é o próprio Cristo.',
      notes: 'Leia a objeção com honestidade, do jeito que um protestante a faria. Não responda ainda.',
    },
    {
      type: 'verse',
      ref: 'mt-16-18',
      highlight: ['tu és Pedro', 'sobre esta pedra', 'as chaves do Reino dos Céus'],
      notes: [
        'Leia o texto inteiro, devagar, enquanto as palavras aparecem.',
        'Volte às três expressões sublinhadas: o nome novo, a pedra e as chaves.',
      ],
    },
    {
      type: 'word',
      ref: 'mt-16-18',
      notes: [
        'O texto grego usa duas formas da mesma palavra.',
        'Pétros é masculino porque é nome de homem. Pétra é a palavra comum para rocha.',
        'O ponto decisivo: em aramaico, a língua de Jesus, é Kepha nas duas vezes. Por isso João 1,42 chama Pedro de Cefas.',
      ],
    },
    {
      type: 'compare',
      title: 'Pedrinha ou rocha?',
      left: {
        title: 'A objeção',
        items: [
          'Pétros, o nome de Pedro, seria uma pedra pequena.',
          'A rocha da frase seria outra coisa: a fé de Pedro, ou o próprio Cristo.',
        ],
      },
      right: {
        title: 'A resposta',
        items: [
          'Jesus falava aramaico, e a palavra é Kepha nas duas vezes.',
          'O grego só muda a terminação porque um homem não recebe nome feminino.',
        ],
      },
      notes: ['Primeiro a objeção, nas palavras de quem a faz.', 'Agora a resposta, ponto por ponto.'],
    },
    {
      type: 'quote',
      ref: 'cic-816',
      author: 'Catecismo da Igreja Católica',
      note: 'promulgado por São João Paulo II',
      work: 'parágrafo 816',
      highlight: ['sucessor de Pedro'],
      notes: 'O que a Igreja ensina hoje sobre o papel do sucessor de Pedro.',
    },
    {
      type: 'points',
      title: 'Três sinais do primado nos Evangelhos',
      items: [
        { text: 'Recebe as chaves do Reino', sub: 'Mateus 16,19' },
        { text: 'Confirma os irmãos na fé', sub: 'Lucas 22,32' },
        { text: 'Apascenta as ovelhas de Cristo', sub: 'João 21,15-17' },
      ],
      notes: ['Três passagens, uma de cada evangelista.', 'As chaves.', 'Confirmar os irmãos.', 'Apascentar o rebanho.'],
    },
    {
      type: 'timeline',
      title: 'A sucessão na história',
      events: [
        { year: 'c. 96', label: 'Clemente de Roma escreve aos coríntios' },
        { year: 'c. 107', label: 'Inácio de Antioquia fala da Igreja católica' },
        { year: 'c. 180', label: 'Irineu lista os bispos de Roma desde Pedro' },
        { year: '1870', label: 'O Vaticano I define a infalibilidade', ref: 'pastor-aeternus' },
        { year: '1964', label: 'A Lumen Gentium sobre o sucessor de Pedro', ref: 'lumen-gentium-8' },
      ],
      notes: 'Cada marco aparece num passo. Dê uma frase para cada um.',
    },
    {
      type: 'image',
      image: 'assets/art/80-vaticano.jpg',
      caption: 'A basílica construída sobre o túmulo de Pedro',
      credit: 'Giovanni Paolo Panini, Interior da Basílica de São Pedro (1731). Domínio público.',
      notes: 'Pausa visual. Deixe a imagem respirar por alguns segundos.',
    },
    {
      type: 'stat',
      value: 5800,
      prefix: 'mais de',
      label: 'manuscritos gregos do Novo Testamento',
      ref: 'ms-bibliografico',
      notes: 'Exemplo do tipo stat: o número conta até o valor final.',
    },
    {
      type: 'questions',
      items: [
        'Por que Jesus mudou o nome de Simão, e para qual nome?',
        'O que as chaves significavam para um judeu que conhecia Isaías 22?',
        'Quem os primeiros cristãos reconheciam como sucessor de Pedro?',
      ],
      notes: 'Deixe as perguntas para o espectador responder nos comentários.',
    },
    {
      type: 'sources',
      notes: 'Gerado sozinho com as referências usadas no deck.',
    },
  ],
});
