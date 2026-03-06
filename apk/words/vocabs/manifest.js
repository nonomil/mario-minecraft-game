// Browser-compatible vocabulary manifest
window.vocabManifest = window.vocabManifest || { version: '2.2.0', packs: [] };

// Add Chinese vocabulary pack
window.vocabManifest.packs.push({
  id: 'vocab.kindergarten.hanzi',
  title: '幼儿园汉字',
  stage: 'kindergarten',
  difficulty: 'basic',
  level: 'full',
  weight: 1,
  mode: 'chinese',
  type: 'hanzi',
  file: 'words/vocabs/06_汉字/幼儿园汉字.js',
  globals: ['kindergartenHanzi']
});

// Node.js compatibility (for build tools)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.vocabManifest.packs;
}
