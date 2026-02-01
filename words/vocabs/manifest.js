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
    }
  ];

  const byId = Object.create(null);
  packs.forEach(p => { byId[p.id] = p; });

  window.MMWG_VOCAB_MANIFEST = {
    version: "2026-02-01.1",
    packs,
    byId
  };
})();

