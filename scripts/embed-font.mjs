// Gera assets/fonts/cormorant.css com a fonte embutida em base64.
//
//   node scripts/embed-font.mjs
//
// Por que embutir: aberto por file://, o Chrome bloqueia @font-face que aponta
// para um .ttf ao lado (origem nula). Em data: URI a fonte carrega nos dois
// jeitos. Só precisa rodar de novo se o .ttf mudar.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/load-decks.mjs';

const ttf = readFileSync(join(ROOT, 'assets/fonts/CormorantGaramond-SemiBold.ttf'));
const css = `/* Cormorant Garamond SemiBold (SIL OFL 1.1, ver OFL-CormorantGaramond.txt).
   Gerado por scripts/embed-font.mjs a partir de CormorantGaramond-SemiBold.ttf. */
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 400 700;
  font-display: block;
  src: url(data:font/ttf;base64,${ttf.toString('base64')}) format('truetype');
}
`;
writeFileSync(join(ROOT, 'assets/fonts/cormorant.css'), css);
console.log(`assets/fonts/cormorant.css: ${(css.length / 1024).toFixed(0)} KB`);
