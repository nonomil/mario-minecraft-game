(() => {
  const packs = [
    {
      id: "kindergarten.basic",
      title: "幼儿园 / 基础 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_1_basic.js",
      getRaw() { return typeof VOCAB_1__________ !== "undefined" ? VOCAB_1__________ : []; }
    },
    {
      id: "kindergarten.study",
      title: "幼儿园 / 学习 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_2_study.js",
      getRaw() { return typeof VOCAB_2__________ !== "undefined" ? VOCAB_2__________ : []; }
    },
    {
      id: "kindergarten.nature",
      title: "幼儿园 / 自然 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_3_nature.js",
      getRaw() { return typeof VOCAB_3__________ !== "undefined" ? VOCAB_3__________ : []; }
    },
    {
      id: "kindergarten.communication",
      title: "幼儿园 / 交流 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_4_communication.js",
      getRaw() { return typeof VOCAB_4_____ !== "undefined" ? VOCAB_4_____ : []; }
    },
    {
      id: "kindergarten.daily",
      title: "幼儿园 / 日常 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_5_daily.js",
      getRaw() { return typeof VOCAB_5_____ !== "undefined" ? VOCAB_5_____ : []; }
    },
    {
      id: "kindergarten.general",
      title: "幼儿园 / 综合 / 常用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/kindergarten/kindergarten_6_general.js",
      getRaw() { return typeof VOCAB_6______ !== "undefined" ? VOCAB_6______ : []; }
    },
    {
      id: "elementary.lower",
      title: "小学 / 低年级 / 常用",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/elementary/stage_elementary_lower.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []; }
    },
    {
      id: "elementary.upper",
      title: "小学 / 高年级 / 常用",
      stage: "elementary_upper",
      difficulty: "intermediate",
      weight: 0.8,
      file: "words/vocabs/elementary/stage_elementary_upper.js",
      getRaw() { return typeof STAGE_ELEMENTARY_UPPER !== "undefined" ? STAGE_ELEMENTARY_UPPER : []; }
    },
    {
      id: "minecraft.basic",
      title: "Minecraft / 基础 / 方块与物品",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/minecraft/minecraft_basic.js",
      getRaw() { return typeof VOCAB_1_MINECRAFT____BASIC !== "undefined" ? VOCAB_1_MINECRAFT____BASIC : []; }
    },
    {
      id: "stage.kindergarten.full",
      title: "幼儿园词库（全集）",
      stage: "kindergarten",
      difficulty: "mixed",
      weight: 1,
      file: "words/vocabs/html/kindergarten_complete.js",
      getRaw() { return typeof MERGED_KINDERGARTEN_VOCAB !== "undefined" ? MERGED_KINDERGARTEN_VOCAB : []; }
    },
    {
      id: "stage.elementary.full",
      title: "小学全阶段词库",
      stage: "mixed",
      difficulty: "mixed",
      weight: 0.85,
      file: "words/vocabs/html/elementary_full.js",
      getRaw() { return typeof MERGED_VOCABULARY !== "undefined" ? MERGED_VOCABULARY : []; }
    },
    {
      id: "stage.general.common",
      title: "常用词汇",
      stage: "general",
      difficulty: "basic",
      weight: 0.7,
      file: "words/vocabs/html/common_general.js",
      getRaw() { return typeof VOCAB_1____COMMON !== "undefined" ? VOCAB_1____COMMON : []; }
    },
    // EXTERNAL_PACKS_START
    {
      id: "external.kindergarten.all",
      title: "幼儿园 / 全部合并",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/merged/kindergarten_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_KINDERGARTEN_ALL !== "undefined" ? VOCAB_EXTERNAL_KINDERGARTEN_ALL : []; }
    },
    {
      id: "external.elementary_lower.all",
      title: "小学低年级 / 全部合并",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/merged/elementary_lower_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_ELEMENTARY_LOWER_ALL !== "undefined" ? VOCAB_EXTERNAL_ELEMENTARY_LOWER_ALL : []; }
    },
    {
      id: "external.elementary_upper.all",
      title: "小学高年级 / 全部合并",
      stage: "elementary_upper",
      difficulty: "advanced",
      weight: 0.7,
      file: "words/vocabs/external/merged/elementary_upper_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_ELEMENTARY_UPPER_ALL !== "undefined" ? VOCAB_EXTERNAL_ELEMENTARY_UPPER_ALL : []; }
    },
    {
      id: "external.general.all",
      title: "通用主题 / 全部合并",
      stage: "general",
      difficulty: "intermediate",
      weight: 0.8,
      file: "words/vocabs/external/merged/general_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_GENERAL_ALL !== "undefined" ? VOCAB_EXTERNAL_GENERAL_ALL : []; }
    },
    {
      id: "external.minecraft.all",
      title: "Minecraft / 全部合并",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.85,
      file: "words/vocabs/external/merged/minecraft_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_MINECRAFT_ALL !== "undefined" ? VOCAB_EXTERNAL_MINECRAFT_ALL : []; }
    },
    {
      id: "external.game.all",
      title: "游戏专题 / 全部合并",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.6,
      file: "words/vocabs/external/merged/game_all.js",
      getRaw() { return typeof VOCAB_EXTERNAL_GAME_ALL !== "undefined" ? VOCAB_EXTERNAL_GAME_ALL : []; }
    }
    // EXTERNAL_PACKS_END
  ];

  const byId = Object.create(null);
  packs.forEach(p => { byId[p.id] = p; });

  window.MMWG_VOCAB_MANIFEST = {
    version: "2026-02-03.1",
    packs,
    byId
  };
})();

