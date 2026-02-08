(() => {
  const packs = [
    {
      id: "vocab.kindergarten",
      title: "幼儿园",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      files: [
        "words/vocabs/01_kindergarten/kindergarten_1_base.js",
        "words/vocabs/01_kindergarten/kindergarten_2_study.js",
        "words/vocabs/01_kindergarten/kindergarten_3_nature.js",
        "words/vocabs/01_kindergarten/kindergarten_4_communication.js",
        "words/vocabs/01_kindergarten/kindergarten_5_daily.js",
        "words/vocabs/01_kindergarten/kindergarten_6_general.js",
        "words/vocabs/01_kindergarten/kindergarten_part_01.js",
        "words/vocabs/01_kindergarten/kindergarten_part_02.js",
        "words/vocabs/01_kindergarten/kindergarten_part_03.js",
        "words/vocabs/01_kindergarten/kindergarten_part_04.js",
        "words/vocabs/01_kindergarten/kindergarten_part_05.js",
        "words/vocabs/01_kindergarten/kindergarten_part_06.js",
        "words/vocabs/01_kindergarten/kindergarten_part_07.js",
        "words/vocabs/01_kindergarten/kindergarten_part_08.js",
        "words/vocabs/01_kindergarten/kindergarten_part_09.js",
        "words/vocabs/01_kindergarten/kindergarten_part_10.js",
        "words/vocabs/01_kindergarten/kindergarten_basic.js",
        "words/vocabs/01_kindergarten/kindergarten_full.js",
      ],
      getRaw() {
        return [
          ...(typeof VOCAB_1__________ !== "undefined" ? VOCAB_1__________ : []),
          ...(typeof VOCAB_2__________ !== "undefined" ? VOCAB_2__________ : []),
          ...(typeof VOCAB_3__________ !== "undefined" ? VOCAB_3__________ : []),
          ...(typeof VOCAB_4_____ !== "undefined" ? VOCAB_4_____ : []),
          ...(typeof VOCAB_5_____ !== "undefined" ? VOCAB_5_____ : []),
          ...(typeof VOCAB_6______ !== "undefined" ? VOCAB_6______ : []),
          ...(typeof STAGE_KINDERGARTEN_PART01 !== "undefined" ? STAGE_KINDERGARTEN_PART01 : []),
          ...(typeof STAGE_KINDERGARTEN_PART02 !== "undefined" ? STAGE_KINDERGARTEN_PART02 : []),
          ...(typeof STAGE_KINDERGARTEN_PART03 !== "undefined" ? STAGE_KINDERGARTEN_PART03 : []),
          ...(typeof STAGE_KINDERGARTEN_PART04 !== "undefined" ? STAGE_KINDERGARTEN_PART04 : []),
          ...(typeof STAGE_KINDERGARTEN_PART05 !== "undefined" ? STAGE_KINDERGARTEN_PART05 : []),
          ...(typeof STAGE_KINDERGARTEN_PART06 !== "undefined" ? STAGE_KINDERGARTEN_PART06 : []),
          ...(typeof STAGE_KINDERGARTEN_PART07 !== "undefined" ? STAGE_KINDERGARTEN_PART07 : []),
          ...(typeof STAGE_KINDERGARTEN_PART08 !== "undefined" ? STAGE_KINDERGARTEN_PART08 : []),
          ...(typeof STAGE_KINDERGARTEN_PART09 !== "undefined" ? STAGE_KINDERGARTEN_PART09 : []),
          ...(typeof STAGE_KINDERGARTEN_PART10 !== "undefined" ? STAGE_KINDERGARTEN_PART10 : []),
          ...(typeof STAGE_KINDERGARTEN !== "undefined" ? STAGE_KINDERGARTEN : []),
          ...(typeof MERGED_KINDERGARTEN_VOCAB !== "undefined" ? MERGED_KINDERGARTEN_VOCAB : []),
        ];
      }
    },
    {
      id: "vocab.elementary_lower",
      title: "小学低年级",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 1,
      files: [
        "words/vocabs/02_elementary_lower/elementary_lower_part_01.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_02.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_03.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_04.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_05.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_06.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_07.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_08.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_09.js",
        "words/vocabs/02_elementary_lower/elementary_lower_part_10.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_ELEMENTARY_LOWER_PART01 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART01 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART02 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART02 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART03 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART03 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART04 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART04 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART05 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART05 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART06 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART06 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART07 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART07 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART08 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART08 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART09 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART09 : []),
          ...(typeof STAGE_ELEMENTARY_LOWER_PART10 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART10 : []),
        ];
      }
    },
    {
      id: "vocab.elementary_upper",
      title: "小学高年级",
      stage: "elementary_upper",
      difficulty: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/03_elementary_upper/elementary_lower_basic.js",
        "words/vocabs/03_elementary_upper/elementary_lower_vocab.js",
        "words/vocabs/03_elementary_upper/elementary_merged.js",
        "words/vocabs/03_elementary_upper/elementary_upper_basic.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []),
          ...(typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []),
          ...(typeof MERGED_VOCABULARY !== "undefined" ? MERGED_VOCABULARY : []),
          ...(typeof STAGE_ELEMENTARY_UPPER !== "undefined" ? STAGE_ELEMENTARY_UPPER : []),
        ];
      }
    },
    {
      id: "vocab.minecraft",
      title: "我的世界",
      stage: "minecraft",
      difficulty: "basic",
      weight: 1,
      files: [
        "words/vocabs/04_minecraft/minecraft_advanced.js",
        "words/vocabs/04_minecraft/minecraft_advancements.js",
        "words/vocabs/04_minecraft/minecraft_basic.js",
        "words/vocabs/04_minecraft/minecraft_biomes.js",
        "words/vocabs/04_minecraft/minecraft_blocks.js",
        "words/vocabs/04_minecraft/minecraft_enchantments.js",
        "words/vocabs/04_minecraft/minecraft_entities.js",
        "words/vocabs/04_minecraft/minecraft_environment.js",
        "words/vocabs/04_minecraft/minecraft_intermediate.js",
        "words/vocabs/04_minecraft/minecraft_items.js",
        "words/vocabs/04_minecraft/minecraft_items_2.js",
        "words/vocabs/04_minecraft/minecraft_status_effects.js",
        "words/vocabs/04_minecraft/minecraft_words_full.js",
      ],
      getRaw() {
        return [
          ...(typeof VOCAB_3_MINECRAFT____ADVANCED !== "undefined" ? VOCAB_3_MINECRAFT____ADVANCED : []),
          ...(typeof MINECRAFT_8_____ADVANCEMENTS_ !== "undefined" ? MINECRAFT_8_____ADVANCEMENTS_ : []),
          ...(typeof VOCAB_1_MINECRAFT____BASIC !== "undefined" ? VOCAB_1_MINECRAFT____BASIC : []),
          ...(typeof MINECRAFT_5_BIOMES_____ !== "undefined" ? MINECRAFT_5_BIOMES_____ : []),
          ...(typeof MINECRAFT_1_BLOCKS___ !== "undefined" ? MINECRAFT_1_BLOCKS___ : []),
          ...(typeof MINECRAFT_7_____ENCHANTMENTS_ !== "undefined" ? MINECRAFT_7_____ENCHANTMENTS_ : []),
          ...(typeof MINECRAFT_3_ENTITIES___ !== "undefined" ? MINECRAFT_3_ENTITIES___ : []),
          ...(typeof MINECRAFT_4_ENVIRONMENT___ !== "undefined" ? MINECRAFT_4_ENVIRONMENT___ : []),
          ...(typeof VOCAB_2_MINECRAFT____BASIC !== "undefined" ? VOCAB_2_MINECRAFT____BASIC : []),
          ...(typeof MINECRAFT_2_ITEMS___ !== "undefined" ? MINECRAFT_2_ITEMS___ : []),
          ...(typeof MINECRAFT_2_ITEMS___2 !== "undefined" ? MINECRAFT_2_ITEMS___2 : []),
          ...(typeof MINECRAFT_6_______STATUS_EFFECTS_ !== "undefined" ? MINECRAFT_6_______STATUS_EFFECTS_ : []),
          ...(typeof MINECRAFT_3_____ !== "undefined" ? MINECRAFT_3_____ : []),
        ];
      }
    },
  ];

  const byId = Object.create(null);
  packs.forEach(p => { byId[p.id] = p; });

  window.MMWG_VOCAB_MANIFEST = {
    version: "2026-02-08.1",
    packs,
    byId
  };
})();
