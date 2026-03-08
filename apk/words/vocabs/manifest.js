// Browser-compatible vocabulary manifest
window.vocabManifest = window.vocabManifest || { version: '2.4.0', packs: [] };

// ========================================
// 幼儿园 (Kindergarten)
// ========================================

// 幼儿园（不分等级，使用完整词库）
window.vocabManifest.packs.push({
  id: 'vocab.kindergarten.full',
  title: '幼儿园',
  stage: 'kindergarten',
  difficulty: 'full',
  level: 'full',
  weight: 1,
  mode: 'english',
  type: 'merged',
  file: 'words/vocabs/01_幼儿园/幼儿园完整词库.js',
  globals: ['MERGED_KINDERGARTEN_VOCAB']
});

// ========================================
// 小学 (Elementary)
// ========================================

// 小学-初级（低年级基础）
window.vocabManifest.packs.push({
  id: 'vocab.elementary.basic',
  title: '小学-初级',
  stage: 'elementary',
  difficulty: 'basic',
  level: 'basic',
  weight: 1,
  mode: 'english',
  type: 'basic',
  file: 'words/vocabs/03_小学_高年级/小学低年级基础.js',
  globals: ['STAGE_ELEMENTARY_LOWER']
});

// 小学-中级（高年级基础）
window.vocabManifest.packs.push({
  id: 'vocab.elementary.intermediate',
  title: '小学-中级',
  stage: 'elementary',
  difficulty: 'intermediate',
  level: 'intermediate',
  weight: 1,
  mode: 'english',
  type: 'intermediate',
  file: 'words/vocabs/03_小学_高年级/小学高年级基础.js',
  globals: ['STAGE_ELEMENTARY_UPPER']
});

// 小学-完整
window.vocabManifest.packs.push({
  id: 'vocab.elementary.full',
  title: '小学-完整',
  stage: 'elementary',
  difficulty: 'full',
  level: 'full',
  weight: 1,
  mode: 'english',
  type: 'merged',
  file: 'words/vocabs/03_小学_高年级/小学全阶段合并词库.js',
  globals: ['MERGED_VOCABULARY']
});

// ========================================
// 初中 (Junior High)
// ========================================

// 初中-初级
window.vocabManifest.packs.push({
  id: 'vocab.junior_high.basic',
  title: '初中-初级',
  stage: 'junior_high',
  difficulty: 'basic',
  level: 'basic',
  weight: 1,
  mode: 'english',
  type: 'basic',
  file: 'words/vocabs/05_初中/junior_high_basic.js',
  globals: ['STAGE_JUNIOR_HIGH_BASIC']
});

// 初中-中级
window.vocabManifest.packs.push({
  id: 'vocab.junior_high.intermediate',
  title: '初中-中级',
  stage: 'junior_high',
  difficulty: 'intermediate',
  level: 'intermediate',
  weight: 1,
  mode: 'english',
  type: 'intermediate',
  file: 'words/vocabs/05_初中/junior_high_intermediate.js',
  globals: ['STAGE_JUNIOR_HIGH_INTERMEDIATE']
});

// 初中-完整
window.vocabManifest.packs.push({
  id: 'vocab.junior_high.full',
  title: '初中-完整',
  stage: 'junior_high',
  difficulty: 'full',
  level: 'full',
  weight: 1,
  mode: 'english',
  type: 'merged',
  file: 'words/vocabs/05_初中/junior_high_full.js',
  globals: ['STAGE_JUNIOR_HIGH']
});

// ========================================
// 我的世界 (Minecraft)
// ========================================

// Minecraft-初级
window.vocabManifest.packs.push({
  id: 'vocab.minecraft.basic',
  title: 'Minecraft-初级',
  stage: 'minecraft',
  difficulty: 'basic',
  level: 'basic',
  weight: 1,
  mode: 'english',
  type: 'minecraft',
  file: 'words/vocabs/04_我的世界/minecraft_basic.js',
  globals: ['VOCAB_1_MINECRAFT____BASIC']
});

// Minecraft-中级
window.vocabManifest.packs.push({
  id: 'vocab.minecraft.intermediate',
  title: 'Minecraft-中级',
  stage: 'minecraft',
  difficulty: 'intermediate',
  level: 'intermediate',
  weight: 1,
  mode: 'english',
  type: 'minecraft',
  file: 'words/vocabs/04_我的世界/minecraft_intermediate.js',
  globals: ['VOCAB_2_MINECRAFT____INTERMEDIATE']
});

// Minecraft-完整
window.vocabManifest.packs.push({
  id: 'vocab.minecraft.full',
  title: 'Minecraft-完整',
  stage: 'minecraft',
  difficulty: 'full',
  level: 'full',
  weight: 1,
  mode: 'english',
  type: 'minecraft',
  file: 'words/vocabs/04_我的世界/minecraft_words_full.js',
  globals: ['MINECRAFT_WORDS_FULL']
});

// ========================================
// 汉字 (Chinese Characters)
// ========================================

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

// ========================================
// Add getRaw() method to each pack
// ========================================
function resolveManifestGlobalArray(globalName) {
  if (!globalName) return [];
  const direct = window[globalName];
  if (Array.isArray(direct)) return direct;
  try {
    const lexical = Function(`return (typeof ${globalName} !== 'undefined') ? ${globalName} : undefined;`)();
    return Array.isArray(lexical) ? lexical : [];
  } catch (_) {
    return [];
  }
}

window.vocabManifest.packs.forEach(pack => {
  if (!pack.getRaw) {
    pack.getRaw = function() {
      const words = [];
      if (Array.isArray(pack.globals)) {
        pack.globals.forEach(globalName => {
          words.push(...resolveManifestGlobalArray(globalName));
        });
      }
      return words;
    };
  }
});

// Create byId index
const byId = Object.create(null);
window.vocabManifest.packs.forEach(p => { byId[p.id] = p; });
window.vocabManifest.byId = byId;

// Expose as MMWG_VOCAB_MANIFEST for compatibility
window.MMWG_VOCAB_MANIFEST = window.vocabManifest;

// Node.js compatibility (for build tools)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.vocabManifest.packs;
}
