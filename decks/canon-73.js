// Por que a Bíblia católica tem 73 livros. Baseado no artigo 18 do app
// ("O Cânon Bíblico: Por que 73 Livros") e nas referências que ele lista.
deck({
  id: 'canon-73',
  title: 'Por que a Bíblia católica tem 73 livros?',
  description: 'A Septuaginta, os concílios antigos e o que mudou no século XVI.',
  theme: 'classica',
  lang: 'pt',
  article: 18,
  slides: [
    {
      type: 'title',
      kicker: 'Sagrada Escritura',
      title: 'Por que 73 livros?',
      subtitle: 'A Bíblia dos apóstolos, os concílios antigos e os sete livros que saíram no século XVI',
      image: 'article',
      notes: 'A Bíblia católica tem sete livros a mais que a protestante. Por quê? Quem acrescentou, ou quem tirou? Hoje a gente responde com a história. Na tela está São Jerônimo, pintado por Jacopo Bassano no século XVI. Guarde esse nome, porque ele vai voltar.',
    },
    {
      type: 'hook',
      who: 'A objeção',
      text: 'A Igreja Católica acrescentou sete livros à Bíblia no Concílio de Trento.',
      notes: 'Essa é a objeção que todo católico já ouviu. A Igreja teria colocado sete livros a mais na Bíblia lá no século XVI, no Concílio de Trento. É uma objeção séria, e merece uma resposta honesta. Então vamos olhar o que aconteceu de fato.',
    },
    {
      type: 'compare',
      title: '73 ou 66?',
      left: {
        title: 'Bíblia católica: 73 livros',
        items: ['46 no Antigo Testamento', '27 no Novo Testamento'],
      },
      right: {
        title: 'Bíblia protestante: 66 livros',
        items: [
          'Os mesmos 27 do Novo Testamento',
          'Sem Tobias, Judite, Sabedoria, Sirácida, Baruc e 1 e 2 Macabeus',
          'Sem partes de Ester e Daniel',
        ],
      },
      notes: [
        'Primeiro, os números. A Bíblia católica tem 73 livros. São 46 no Antigo Testamento e 27 no Novo.',
        'A protestante tem 66. O Novo Testamento é o mesmo. A diferença está toda no Antigo. Faltam sete livros, que a gente chama de deuterocanônicos: Tobias, Judite, Sabedoria, Sirácida, que também se chama Eclesiástico, Baruc e os dois livros dos Macabeus. E faltam ainda partes de Ester e de Daniel. A pergunta é inevitável: quem está certo?',
      ],
    },
    {
      type: 'points',
      title: 'A Bíblia dos apóstolos: a Septuaginta',
      items: [
        { text: 'Tradução grega do Antigo Testamento', sub: 'Feita em Alexandria a partir do século III a.C.' },
        { text: 'A Bíblia do judaísmo de língua grega', sub: 'Antes de Cristo, a maior parte da diáspora judaica' },
        { text: 'Já trazia os sete deuterocanônicos', sub: 'Tal como chegou aos cristãos' },
        { text: 'Os apóstolos pregaram com ela', sub: 'Em grego, no mundo greco-romano' },
      ],
      notes: [
        'A história responde com clareza. E o ponto de partida é a Bíblia que os apóstolos tinham nas mãos.',
        'A Septuaginta é a tradução grega do Antigo Testamento. Ela foi feita em Alexandria, a partir do século III antes de Cristo.',
        'Antes do nascimento de Cristo, essa era a Bíblia do judaísmo de língua grega, que era a maior parte da diáspora judaica.',
        'E essa coleção grega, do jeito que chegou aos cristãos, já incluía os sete livros deuterocanônicos.',
        'Os apóstolos pregaram em grego, no mundo greco-romano, usando a Septuaginta como Escritura. Era a Bíblia dos judeus helenistas. Era a Bíblia dos apóstolos.',
      ],
    },
    {
      type: 'stat',
      value: 300,
      prefix: 'mais de',
      label: 'citações do Antigo Testamento no Novo. Cerca de dois terços seguem a Septuaginta.',
      notes: 'E isso aparece dentro do próprio Novo Testamento. Ele cita o Antigo mais de trezentas vezes. E cerca de dois terços dessas citações seguem a versão da Septuaginta, e não o texto hebraico massorético, que é posterior.',
    },
    {
      type: 'verse',
      ref: 'hb-11-35',
      highlight: ['foram torturados', 'por recusarem ser libertados', 'uma ressurreição mais gloriosa'],
      notes: [
        'E tem mais. Veja a Carta aos Hebreus, capítulo 11, versículo 35.',
        'Gente torturada, que recusou ser libertada, porque esperava a ressurreição. Isso é uma alusão clara ao martírio contado em 2 Macabeus, capítulo 7. Então eu pergunto: se os deuterocanônicos não são inspirados, por que o autor de Hebreus alude a um deles?',
      ],
    },
    {
      type: 'quote',
      ref: 'cartago-397',
      text: 'Além das Escrituras canônicas, nada se leia na Igreja sob o nome de Escrituras divinas.',
      author: 'Concílio de Cartago',
      work: 'cânon 36, do resumo das decisões de Hipona',
      year: '397',
      highlight: ['Escrituras canônicas'],
      refs: ['hipona-393'],
      notes: [
        'As primeiras gerações cristãs receberam essa Bíblia, e os primeiros concílios a confirmaram. Em 393, o Concílio de Hipona, com a participação de Santo Agostinho, aprovou uma lista com os mesmos livros do cânon católico de hoje. As atas de Hipona se perderam. O que chegou até nós é o resumo das decisões, aprovado no Concílio de Cartago, em 397.',
        'É o cânon 36 desse resumo. Ele fala das Escrituras canônicas e logo em seguida traz a lista. São os mesmos 73 livros, com os deuterocanônicos. E por mil e cem anos a Igreja inteira, no Ocidente e no Oriente, usou essa Bíblia.',
      ],
    },
    {
      type: 'compare',
      title: 'O que mudou depois de Cristo',
      left: {
        title: 'A Bíblia grega',
        items: [
          'Em uso antes do nascimento de Cristo',
          'Recebida pelas primeiras gerações cristãs',
          'Chegou aos cristãos com os sete deuterocanônicos',
        ],
      },
      right: {
        title: 'O cânon rabínico',
        items: [
          'Consolidado depois da destruição do Templo, no ano 70',
          'A tradição liga parte das discussões a Jâmnia, por volta do ano 90',
          'Deixou de fora livros como Sirácida, Sabedoria e Macabeus',
        ],
      },
      notes: [
        'Então o que mudou? De um lado, a Bíblia grega. Já estava em uso antes de Cristo. Foi recebida pelas primeiras gerações cristãs. E chegou a elas com os sete livros.',
        'Do outro lado, depois da destruição do Templo, no ano 70, o judaísmo rabínico foi consolidando um cânon hebraico mais estreito. A tradição liga parte dessas discussões aos sábios reunidos em Jâmnia, por volta do ano 90. Mas os historiadores hoje não falam mais de um concílio formal. Ficaram de fora livros como Sirácida, Sabedoria e Macabeus, tidos como posteriores à época dos profetas ou conhecidos sobretudo em grego. E é provável que tenha pesado também o distanciamento em relação aos cristãos, que liam esses livros na Bíblia grega. Ou seja, foi um cânon judaico fixado depois de Cristo. Não é a Bíblia que Cristo e os apóstolos receberam.',
      ],
    },
    {
      type: 'points',
      title: 'Século XVI: Lutero tira os sete livros',
      items: [
        'Seguiu São Jerônimo e o cânon hebraico',
        { text: 'Tirou os sete do corpo do Antigo Testamento', sub: 'Bíblia de 1534: numa seção à parte, como "Apócrifos"' },
        { text: 'Com o tempo, as Bíblias protestantes os omitiram de vez' },
        { text: 'Contra mil e quinhentos anos de uso constante na Igreja' },
      ],
      notes: [
        'Agora o século XVI. É aqui que os sete livros saem.',
        'Martinho Lutero seguiu São Jerônimo, aquele da abertura, e o cânon hebraico.',
        'Na Bíblia dele, de 1534, os deuterocanônicos saíram do corpo do Antigo Testamento. Foram para uma seção à parte, entre os dois Testamentos, com o título de Apócrifos. A descrição era: livros não tidos como iguais à Sagrada Escritura, mas úteis e bons de ler.',
        'Com o tempo, as Bíblias protestantes deixaram esses livros de fora de vez.',
        'Foi uma decisão posterior, contra mil e quinhentos anos de uso constante na Igreja. E é justo dizer: alguns Padres tiveram reservas sobre esses livros. Mas a liturgia e os concílios sempre os acolheram.',
      ],
    },
    {
      type: 'verse',
      ref: '2mc-12-44',
      highlight: ['rezar por eles', 'para que os mortos fossem livres de suas faltas'],
      notes: [
        'E a questão tinha também peso teológico. Veja o que diz 2 Macabeus 12, do versículo 44 ao 46.',
        'O texto fala explicitamente em rezar pelos mortos, para que fiquem livres de suas faltas. É um dos apoios da doutrina católica do Purgatório. E já no debate de Leipzig, em 1519, Lutero negou a esse livro valor de prova, porque ele não estava no cânon.',
      ],
    },
    {
      type: 'quote',
      ref: 'cic-120',
      author: 'Catecismo da Igreja Católica',
      note: 'promulgado por São João Paulo II',
      work: 'parágrafo 120',
      highlight: ['Tradição Apostólica', 'discernir', 'para o Antigo Testamento, 46', 'para o Novo, 27'],
      notes: [
        'Mas então a Igreja escolheu os livros do jeito que quis? Não. Veja como o Catecismo da Igreja Católica, de 1992, resume isso no parágrafo 120.',
        'Foi a Tradição Apostólica que levou a Igreja a discernir quais escritos entravam na lista dos livros sagrados. E ela fez isso sob a guia do Espírito Santo. Discernir não é inventar. E a conta fecha: 46 no Antigo Testamento, ou 45 se contar Jeremias e Lamentações como um livro só, e 27 no Novo.',
      ],
    },
    {
      type: 'points',
      title: 'Os critérios do discernimento',
      numbered: true,
      items: [
        { text: 'Origem apostólica', sub: 'No Novo, escritos dos apóstolos ou de seus discípulos próximos. No Antigo, livros recebidos dos apóstolos como Escritura' },
        { text: 'Uso litúrgico nas igrejas', sub: 'Especialmente na liturgia eucarística' },
        { text: 'Ortodoxia', sub: 'Conformidade com a doutrina recebida' },
      ],
      notes: [
        'E esse discernimento seguiu critérios. Eram três.',
        'Primeiro, a origem apostólica. No Novo Testamento, escritos dos apóstolos ou de seus discípulos próximos. No Antigo, os livros que os apóstolos receberam como Escritura.',
        'Segundo, o uso litúrgico nas igrejas, principalmente na liturgia eucarística.',
        'Terceiro, a ortodoxia, quer dizer, a conformidade com a doutrina recebida. Os 73 livros passaram nesses três critérios.',
      ],
    },
    {
      type: 'timeline',
      title: 'Os mesmos livros, em listas e concílios',
      events: [
        { year: '382', label: 'Roma', sub: 'Lista atribuída ao papa Dâmaso' },
        { year: '393', label: 'Concílio de Hipona', sub: 'Com a participação de Santo Agostinho', ref: 'hipona-393' },
        { year: '397', label: 'Concílio de Cartago', sub: 'Aprova o resumo de Hipona', ref: 'cartago-397' },
        { year: '419', label: 'Cartago', sub: 'Reafirma a lista' },
        { year: '1442', label: 'Concílio de Florença' },
        { year: '1546', label: 'Concílio de Trento', sub: 'Reafirma solenemente o cânon de 73 livros', ref: 'concilio-trento' },
      ],
      notes: [
        'E os mesmos livros aparecem, século depois de século, em listas e concílios.',
        'Em 382, em Roma, numa lista atribuída ao papa Dâmaso.',
        'Em 393, o Concílio de Hipona.',
        'Em 397, o Concílio de Cartago.',
        'Em 419, Cartago reafirma a mesma lista.',
        'Em 1442, o Concílio de Florença.',
        'E em 1546, o Concílio de Trento reafirma solenemente o cânon de 73 livros. Trento não acrescentou nada. Formalizou o que já era prática constante desde a era apostólica.',
      ],
    },
    {
      type: 'points',
      title: 'Em resumo',
      numbered: true,
      items: [
        'Os sete livros estavam na Septuaginta, a Bíblia dos apóstolos',
        'Hipona e Cartago já listavam os 73 livros no século IV',
        'O cânon hebraico mais estreito foi fixado depois de Cristo',
        'Lutero tirou os sete do corpo do Antigo Testamento no século XVI',
        'Trento, em 1546, só reafirmou a lista antiga',
      ],
      notes: [
        'Juntando tudo.',
        'Os sete livros estavam na Septuaginta, a Bíblia que os apóstolos usavam.',
        'Os concílios de Hipona e Cartago já listavam os 73 livros no século IV.',
        'O cânon hebraico mais estreito foi fixado depois de Cristo.',
        'Lutero tirou os sete do corpo do Antigo Testamento no século XVI, e depois as Bíblias protestantes os deixaram de fora.',
        'E Trento, em 1546, só reafirmou a lista antiga. Então a Igreja não acrescentou livros à Bíblia. Foi a Reforma que tirou sete livros que os apóstolos usavam e os primeiros concílios já listavam.',
      ],
    },
    {
      type: 'questions',
      items: [
        'Se foi a Igreja que definiu o Novo Testamento, por que aceitar essa decisão e rejeitar a mesma Igreja no Antigo?',
        'Por que seguir o cânon judaico fixado depois de Cristo, e não a Bíblia dos apóstolos?',
        'Se os deuterocanônicos não são inspirados, por que Hebreus 11,35 alude ao martírio de 2 Macabeus 7?',
      ],
      notes: [
        'Para terminar, três perguntas para você pensar, e responder nos comentários.',
        'Quem decidiu quais livros entram no Novo Testamento? Foi a Igreja. Então por que aceitar essa decisão e rejeitar a mesma Igreja quando ela fala do Antigo?',
        'Por que a Bíblia de Lutero seguiu o cânon judaico fixado depois de Cristo, e não a Bíblia dos apóstolos?',
        'E se os deuterocanônicos não são inspirados, por que Hebreus 11,35 alude com tanta clareza ao martírio de 2 Macabeus 7?',
      ],
    },
    {
      type: 'sources',
      notes: 'Aqui estão as fontes que a gente usou. E o artigo completo, com todas as referências, está no app APPologética.',
    },
  ],
});
