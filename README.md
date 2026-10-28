# Apresentações

Motor de apresentações para os vídeos do canal: o versículo, a citação e a
referência aparecem na tela, animados, enquanto a narração acontece. Cada
vídeo é um **deck** escrito num arquivo `.js` simples; o motor cuida do
desenho, das animações, do roteiro e da gravação.

- HTML, CSS e JavaScript puros. Sem build e sem npm para rodar.
- Abre com dois cliques (`index.html`, por `file://`) ou por qualquer servidor estático.
- Palco fixo de **1920×1080** escalado para a janela, com tarjas quando a proporção não é 16:9.
- Identidade do app APPologética: navy, ouro e creme, títulos em Cormorant Garamond.
- Referências tiradas do próprio app (`../apologetica-app/src/data/references.js`).

## Abrir

Dois cliques em `index.html` abre a galeria. Cada deck abre em
`deck.html?d=<id>` (o demo: `deck.html?d=demo`).

Para abrir por http (útil para o apresentador em outra janela):

```bash
node scripts/serve.mjs
```

e acesse `http://localhost:8090/`.

## Atalhos

| Tecla | O que faz |
|---|---|
| `→` `Espaço` `PageDown` `↓` ou clique | Próximo passo (passadores de slide mandam PageDown) |
| `←` `PageUp` `↑` `Backspace` | Passo anterior |
| `Home` / `End` | Primeiro slide (entra animado) / último slide |
| número + `Enter` | Vai para o slide (ex.: `7` `Enter`) |
| `R` | Repete o slide atual desde o começo, animado |
| `F` | Tela cheia |
| `H` | Modo gravação: esconde toda a interface; o cursor some quando para |
| `B` ou `.` | Tela escura (qualquer avanço volta) |
| `O` | Visão geral em grade para pular de slide |
| `P` | Abre a janela do apresentador |
| `C` | Painel de personalização |
| `T` | Alterna o tema (Clássica, Pergaminho, Vitral, Minimal) |
| `?` | Lista de atalhos |
| `Esc` | Fecha visão geral, ajuda ou painel |

O endereço guarda a posição: `deck.html?d=demo#/3/1` é o slide 3 no passo 1
(o passo 0 é o estado em que o slide entra). Recarregar a página volta ao
mesmo ponto.

## Gravar no OBS

1. Abra o deck e aperte **P**. Leve a janela do apresentador para o outro
   monitor: ela mostra o roteiro do slide, o slide atual, o próximo, o
   cronômetro e o relógio, e as setas dela também passam os slides.
2. Na janela do deck, aperte **F** (tela cheia) e **H** (modo gravação).
3. No OBS, crie a cena em **1920×1080** (Configurações, Vídeo: resolução base e
   de saída 1920×1080, 30 ou 60 fps) e capture o monitor ou a janela do
   navegador em tela cheia.
4. Aperte **Home** para o primeiro slide entrar animado, comece a gravar e vá
   avançando com a seta, o Espaço ou o passador.
5. Para refazer um trecho, **R** repete o slide desde o começo. **B** escurece
   a tela entre um bloco e outro.

Dica: deixe a janela do navegador visível durante a gravação. Com a janela
minimizada ou coberta, o navegador para de desenhar quadros e as animações
congelam.

## Personalizar (tecla C)

O painel guarda as escolhas neste navegador (localStorage):

- **Tema**: vale só para o deck aberto (T faz o mesmo pelo teclado).
- **Fonte**: a do tema, Cormorant, serifa do sistema ou sans do sistema.
- **Tamanho do texto**: de 80% a 130%. Os blocos longos continuam cabendo.
- **Velocidade das animações**: de 0,5× a 2×.
- **Movimento**: *Do sistema* respeita o "reduzir movimento" do sistema
  operacional; *Sempre animar* força as animações; *Reduzido* troca os
  deslocamentos por esmaecimento e desliga o Ken Burns.
- **Assinatura**: o texto do canto (padrão `@RMovitz`), se aparece e em que canto.
- **Barra de progresso** no rodapé.

## Criar um deck novo

1. Crie `decks/<id>.js` (o id em minúsculas, com hífen: `papado`, `eucaristia`).
2. Acrescente o id em `decks/index.js` para ele aparecer na galeria.
3. Rode `node scripts/sync-refs.mjs` para trazer do app as referências e as imagens que o deck usa.
4. Rode `node scripts/check-decks.mjs` e corrija o que ele apontar.
5. Abra `deck.html?d=<id>` e confira slide a slide (O mostra todos de uma vez).

Esqueleto:

```js
deck({
  id: 'papado',                 // igual ao nome do arquivo
  title: 'O Papa e Pedro',      // aparece na galeria e na aba
  description: 'Uma frase para a galeria.',
  theme: 'classica',            // classica, pergaminho, vitral ou minimal
  article: 19,                  // artigo do app ligado ao deck (opcional)
  slides: [
    { type: 'title', kicker: 'Primado de Pedro', title: 'Tu és Pedro', image: 'article' },
    { type: 'verse', ref: 'mt-16-18', highlight: ['tu és Pedro'], notes: 'Roteiro da narração.' },
    { type: 'sources' },
  ],
});
```

Campos do deck:

| Campo | Para que serve |
|---|---|
| `id`, `title`, `slides` | Obrigatórios. |
| `description` | Linha da galeria. |
| `theme` | Tema padrão do deck (o painel pode trocar). |
| `article` | Id numérico do artigo do app. Libera `image: 'article'` (a obra do artigo, com crédito) e a linha "Artigo completo no app" no slide de fontes. |
| `cover` | Imagem da galeria, se não quiser a do primeiro slide. |
| `lang` | `'pt'` (padrão) ou `'en'`: usa os textos em inglês das referências (Douay-Rheims). |
| `translation` | Nome da tradução bíblica no selo do versículo. Padrão: "Bíblia Ave Maria" (`''` esconde). |
| `sources` | Lista de fontes extras (texto) para o slide de fontes. |

Campos que **todo slide** aceita:

- `notes`: o roteiro da narração, que aparece na janela do apresentador. Texto
  simples, ou uma lista com um texto por passo (o apresentador destaca o do
  passo atual).
- `refs`: ids de referências usadas na fala sem aparecer no slide (entram no slide de fontes).
- `steps`: muda como o slide se divide em passos (ver cada tipo).

Imagens: guarde em `assets/art/` e use o caminho relativo
(`image: 'assets/art/80-vaticano.jpg'`). Se o arquivo tiver o mesmo nome de
uma imagem de `assets/articles/` do app, o `sync-refs` copia sozinho.

## Catálogo dos tipos de slide

Os exemplos usam ids reais de `src/data/references.js` do app.

### `title`: abertura

Título grande que sobe palavra por palavra, chamada, subtítulo e uma obra de
arte de fundo com Ken Burns (zoom lento).

```js
{ type: 'title', kicker: 'Primado de Pedro', title: 'Tu és Pedro',
  subtitle: 'A rocha, as chaves e a Igreja em Mateus 16',
  image: 'article' }          // ou 'assets/art/arquivo.jpg', com credit: '...'
```

Sem `image`, o fundo mostra a cruz da marca em traço fino.

### `hook`: a objeção

A frase que o vídeo vai responder, grande, com aspa de ouro.

```js
{ type: 'hook', who: 'A objeção',
  text: 'Pedro era só uma pedrinha. A rocha é o próprio Cristo.',
  attribution: 'Comentário comum em debates' }   // opcional
```

### `verse`: versículo

Selo com a referência e a tradução, texto palavra por palavra e, num passo
próprio, o sublinhado de ouro que se desenha sob as expressões destacadas.

```js
{ type: 'verse', ref: 'mt-16-18',
  highlight: ['tu és Pedro', 'sobre esta pedra', 'as chaves do Reino dos Céus'] }
```

- `text`: troca o texto da referência por um trecho (ex.: só o versículo 18), e `refLabel` troca o selo ("Mateus 16,18").
- `steps`: `'highlight'` (padrão: texto, depois todos os destaques), `'each'` (um passo por destaque, na ordem da lista) ou `'with'` (destaques logo depois do texto, sem passo extra).
- A aspa que sobra de uma fala começada antes do trecho é fechada sozinha; `tidyQuotes: false` desliga.

### `word`: palavra original

A palavra em grego ou hebraico em destaque, a transliteração, o número de
Strong e o sentido, tirados de `originalLanguage` da referência.

```js
{ type: 'word', ref: 'mt-16-18' }
// ou sem referência:
{ type: 'word', word: 'Κηφᾶς', transliteration: 'Kēphâs', language: 'Grego',
  strongs: 'G2786', meaning: 'Forma grega do aramaico Kepha, rocha.' }
```

Passos: palavra, depois transliteração e Strong, depois o sentido.
`steps: 'together'` mostra tudo de uma vez.

### `quote`: citação (Padre da Igreja, Catecismo, documento)

Texto palavra por palavra com aspa grande ao fundo e atribuição: autor, nota,
obra e ano. Aceita `highlight` e os mesmos `steps` do versículo.

```js
{ type: 'quote', ref: 'cic-816', author: 'Catecismo da Igreja Católica',
  note: 'promulgado por São João Paulo II', work: 'parágrafo 816',
  highlight: ['sucessor de Pedro'] }
// ou sem referência:
{ type: 'quote', text: '...', author: 'Santo Agostinho', work: 'Sermão 131', year: 'c. 417' }
```

Sem `author`, o autor vem da referência (o que está entre parênteses vira a nota).

### `points`: lista

Um item por passo. Cada item é texto ou `{ text, sub }` (ou `{ text, ref }`,
que mostra a referência como subtítulo).

```js
{ type: 'points', title: 'Três sinais do primado nos Evangelhos',
  items: [
    { text: 'Recebe as chaves do Reino', sub: 'Mateus 16,19' },
    { text: 'Confirma os irmãos na fé', sub: 'Lucas 22,32' },
    'Apascenta as ovelhas de Cristo',
  ],
  numbered: false,   // true numera os itens
  focus: false }     // true apaga os itens anteriores a cada passo
```

`steps: 'together'` mostra todos em cascata no mesmo passo.

### `compare`: duas colunas

Objeção × resposta (ou qualquer par). A coluna da esquerda entra com o slide e
a da direita no passo seguinte; `steps: 'together'` mostra as duas juntas.

```js
{ type: 'compare', title: 'Pedrinha ou rocha?',
  left: { title: 'A objeção', items: ['...', '...'] },
  right: { title: 'A resposta', items: ['...', '...'] } }
```

### `timeline`: linha do tempo

O eixo se desenha e cada marco aparece num passo, com o trecho do eixo em
ouro avançando até ele. Até 7 marcos. `steps: 'together'` mostra todos.

```js
{ type: 'timeline', title: 'A sucessão na história',
  events: [
    { year: 'c. 96', label: 'Clemente de Roma escreve aos coríntios' },
    { year: '1870', label: 'O Vaticano I define a infalibilidade', ref: 'pastor-aeternus' },
  ] }
```

### `image`: obra de arte

A obra emoldurada, com zoom bem lento, legenda e crédito. `fit: 'full'` ocupa
a tela inteira com a legenda por cima.

```js
{ type: 'image', image: 'assets/art/80-vaticano.jpg',
  caption: 'A basílica construída sobre o túmulo de Pedro',
  credit: 'Giovanni Paolo Panini, Interior da Basílica de São Pedro (1731). Domínio público.' }
```

### `stat`: número

Número grande que conta até o valor, com rótulo e fonte.

```js
{ type: 'stat', value: 5800, prefix: 'mais de',
  label: 'manuscritos gregos do Novo Testamento', ref: 'ms-bibliografico' }
```

`value` e `from` são números; `prefix`, `suffix` e `decimals` completam.
`source` troca a linha de fonte gerada pela `ref`.

### `questions`: Perguntas-chave

Uma pergunta por passo; as anteriores ficam mais apagadas (`focus: false`
desliga). O título padrão é "Perguntas-chave".

```js
{ type: 'questions', items: [
  'Por que Jesus mudou o nome de Simão?',
  'Quem os primeiros cristãos reconheciam como sucessor de Pedro?',
] }
```

### `sources`: fontes

Gerado sozinho com todas as referências do deck, na ordem em que aparecem,
agrupadas como no app (Sagrada Escritura, Catecismo, Documentos da Igreja,
Padres, teólogos e autores...). O texto encolhe para caber.

```js
{ type: 'sources' }                      // ou { type: 'sources', title: 'Para ler mais', extra: ['Livro X, 2020'] }
```

## Referências e checagem

```bash
node scripts/sync-refs.mjs      # traz do app as refs, os artigos e as imagens que os decks usam
node scripts/check-decks.mjs    # valida tudo; sai com código 1 se houver erro
```

O `sync-refs` lê `../apologetica-app` (ou o caminho em `APG_APP_DIR`) e grava
`data/refs.js` só com os ids usados nos decks, com `text`, `ref`, `author`,
`year`, `fullSource`, `url`, `originalLanguage`, `bibleNav` e a tradução
inglesa em `en`. Rode de novo sempre que um deck ganhar referência nova ou o
texto mudar no app. `data/refs.js` e `data/articles.js` são gerados: não
edite à mão.

O `check-decks` confere tipos de slide, campos obrigatórios, campos com erro de
digitação (aviso), valores de `steps`, ids de referência, destaques que não
aparecem no texto e imagens que não existem.

## Estrutura

```
index.html            galeria dos decks
deck.html             player (?d=<id>) e janela do apresentador (&view=presenter)
engine/
  core.js             registro de decks, esquema dos tipos e utilitários de texto (roda no Node também)
  stage.js            palco escalado, passos, hash, teclado, visão geral, gravação
  render.js           tipos de slide -> DOM e ajuste de texto ao espaço
  anim.js             animações (Web Animations API)
  presenter.js        janela do apresentador e o canal entre as janelas
  customize.js        preferências e o painel da tecla C
  deck.css, ui.css    estilos do palco e da interface
themes/               classica, pergaminho, vitral, minimal (variáveis CSS)
decks/                index.js (lista da galeria) e um arquivo por deck
data/                 refs.js e articles.js (gerados pelo sync-refs)
assets/fonts/         Cormorant Garamond SemiBold (SIL OFL 1.1) e cormorant.css embutida
assets/art/           obras de arte usadas nos decks
scripts/              sync-refs, check-decks, serve (servidor local) e embed-font
```

## Limitações conhecidas

- As obras vindas do app têm 1000 px de largura; num vídeo 1080p em tela
  cheia ficam um pouco moles. Para a abertura e para `fit: 'full'`, vale salvar
  a versão grande (o `imageHd` do artigo no app, Wikimedia Commons) em
  `assets/art/` com o mesmo nome.
- A Cormorant embarcada só tem o alfabeto latino. Palavras em grego e hebraico
  usam a melhor serifa do sistema que tenha esses alfabetos (Times New Roman ou
  Georgia no Windows).
- Com a janela minimizada ou coberta, o navegador não desenha quadros e as
  animações param. Para gravar, mantenha a janela do deck à vista.
- O apresentador abre como pop-up: se o navegador bloquear, permita pop-ups
  para a página. Aberto por `file://`, ele conversa com o deck pela própria
  janela que o abriu; para abrir o apresentador por conta própria (sem P),
  use o servidor local.
- Tela cheia (F) só funciona com uma tecla de verdade, não por automação.

## Licenças

A fonte Cormorant Garamond é distribuída sob a SIL Open Font License 1.1
(`assets/fonts/OFL-CormorantGaramond.txt`). As obras em `assets/art/` são de
domínio público, com o crédito em cada deck.
