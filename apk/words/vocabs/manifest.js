(() => {
  const packs = [
    {
      id: "vocab.kindergarten.basic",
      title: "\u5e7c\u513f\u56ed - \u521d\u7ea7",
      stage: "kindergarten",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_01.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_02.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_03.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_KINDERGARTEN_PART01 !== "undefined" ? STAGE_KINDERGARTEN_PART01 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART02 !== "undefined" ? STAGE_KINDERGARTEN_PART02 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART03 !== "undefined" ? STAGE_KINDERGARTEN_PART03 : []),
                                ];
                              }
    },
    {
      id: "vocab.kindergarten.intermediate",
      title: "\u5e7c\u513f\u56ed - \u4e2d\u7ea7",
      stage: "kindergarten",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_04.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_05.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_06.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_07.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_KINDERGARTEN_PART04 !== "undefined" ? STAGE_KINDERGARTEN_PART04 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART05 !== "undefined" ? STAGE_KINDERGARTEN_PART05 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART06 !== "undefined" ? STAGE_KINDERGARTEN_PART06 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART07 !== "undefined" ? STAGE_KINDERGARTEN_PART07 : []),
                                ];
                              }
    },
    {
      id: "vocab.kindergarten.advanced",
      title: "\u5e7c\u513f\u56ed - \u9ad8\u7ea7",
      stage: "kindergarten",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_08.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_09.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_10.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_KINDERGARTEN_PART08 !== "undefined" ? STAGE_KINDERGARTEN_PART08 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART09 !== "undefined" ? STAGE_KINDERGARTEN_PART09 : []),
                                  ...(typeof STAGE_KINDERGARTEN_PART10 !== "undefined" ? STAGE_KINDERGARTEN_PART10 : []),
                                ];
                              }
    },
    {
      id: "vocab.kindergarten",
      title: "\u5e7c\u513f\u56ed - \u5b8c\u6574",
      stage: "kindergarten",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_1_\u57fa\u7840.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_2_\u5b66\u4e60.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_3_\u81ea\u7136.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_4_\u6c9f\u901a.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_5_\u65e5\u5e38.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_6_\u901a\u7528.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_01.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_02.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_03.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_04.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_05.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_06.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_07.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_08.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_09.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed_\u5206\u5377_10.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed\u57fa\u7840.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed\u5b8c\u6574\u8bcd\u5e93.js",
        "words/vocabs/01_\u5e7c\u513f\u56ed/kindergarten_supplement_external_20260221.js",
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
                                  ...(typeof STAGE_KINDERGARTEN_SUPPLEMENT_20260221 !== "undefined" ? STAGE_KINDERGARTEN_SUPPLEMENT_20260221 : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_lower.basic",
      title: "\u5c0f\u5b66\u4f4e\u5e74\u7ea7 - \u521d\u7ea7",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_01.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_02.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_03.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART01 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART01 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART02 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART02 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART03 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART03 : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_lower.intermediate",
      title: "\u5c0f\u5b66\u4f4e\u5e74\u7ea7 - \u4e2d\u7ea7",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_04.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_05.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_06.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_07.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART04 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART04 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART05 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART05 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART06 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART06 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART07 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART07 : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_lower.advanced",
      title: "\u5c0f\u5b66\u4f4e\u5e74\u7ea7 - \u9ad8\u7ea7",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_08.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_09.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_10.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART08 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART08 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART09 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART09 : []),
                                  ...(typeof STAGE_ELEMENTARY_LOWER_PART10 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART10 : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_lower",
      title: "\u5c0f\u5b66\u4f4e\u5e74\u7ea7 - \u5b8c\u6574",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_01.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_02.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_03.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_04.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_05.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_06.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_07.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_08.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_09.js",
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7_\u5206\u5377_10.js",
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
      id: "vocab.elementary_upper.basic",
      title: "\u5c0f\u5b66\u9ad8\u5e74\u7ea7 - \u521d\u7ea7",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7\u57fa\u7840.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_upper.intermediate",
      title: "\u5c0f\u5b66\u9ad8\u5e74\u7ea7 - \u4e2d\u7ea7",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u9ad8\u5e74\u7ea7\u57fa\u7840.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_UPPER !== "undefined" ? STAGE_ELEMENTARY_UPPER : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_upper.advanced",
      title: "\u5c0f\u5b66\u9ad8\u5e74\u7ea7 - \u9ad8\u7ea7",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u5168\u9636\u6bb5\u5408\u5e76\u8bcd\u5e93.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof MERGED_VOCABULARY !== "undefined" ? MERGED_VOCABULARY : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_upper",
      title: "\u5c0f\u5b66\u9ad8\u5e74\u7ea7 - \u5b8c\u6574",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7\u57fa\u7840.js",
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u4f4e\u5e74\u7ea7\u8bcd\u6c47\u5e93.js",
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u5168\u9636\u6bb5\u5408\u5e76\u8bcd\u5e93.js",
        "words/vocabs/03_\u5c0f\u5b66_\u9ad8\u5e74\u7ea7/\u5c0f\u5b66\u9ad8\u5e74\u7ea7\u57fa\u7840.js",
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
      id: "vocab.minecraft.basic",
      title: "\u6211\u7684\u4e16\u754c - \u521d\u7ea7",
      stage: "minecraft",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_basic.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_blocks.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_items.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof VOCAB_1_MINECRAFT____BASIC !== "undefined" ? VOCAB_1_MINECRAFT____BASIC : []),
                                  ...(typeof MINECRAFT_1_BLOCKS___ !== "undefined" ? MINECRAFT_1_BLOCKS___ : []),
                                  ...(typeof MINECRAFT_2_ITEMS___ !== "undefined" ? MINECRAFT_2_ITEMS___ : []),
                                ];
                              }
    },
    {
      id: "vocab.minecraft.intermediate",
      title: "\u6211\u7684\u4e16\u754c - \u4e2d\u7ea7",
      stage: "minecraft",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_intermediate.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_entities.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_biomes.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_environment.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof VOCAB_2_MINECRAFT____BASIC !== "undefined" ? VOCAB_2_MINECRAFT____BASIC : []),
                                  ...(typeof MINECRAFT_3_ENTITIES___ !== "undefined" ? MINECRAFT_3_ENTITIES___ : []),
                                  ...(typeof MINECRAFT_5_BIOMES_____ !== "undefined" ? MINECRAFT_5_BIOMES_____ : []),
                                  ...(typeof MINECRAFT_4_ENVIRONMENT___ !== "undefined" ? MINECRAFT_4_ENVIRONMENT___ : []),
                                ];
                              }
    },
    {
      id: "vocab.minecraft.advanced",
      title: "\u6211\u7684\u4e16\u754c - \u9ad8\u7ea7",
      stage: "minecraft",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_advanced.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_enchantments.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_advancements.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_status_effects.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof VOCAB_3_MINECRAFT____ADVANCED !== "undefined" ? VOCAB_3_MINECRAFT____ADVANCED : []),
                                  ...(typeof MINECRAFT_7_____ENCHANTMENTS_ !== "undefined" ? MINECRAFT_7_____ENCHANTMENTS_ : []),
                                  ...(typeof MINECRAFT_8_____ADVANCEMENTS_ !== "undefined" ? MINECRAFT_8_____ADVANCEMENTS_ : []),
                                  ...(typeof MINECRAFT_6_______STATUS_EFFECTS_ !== "undefined" ? MINECRAFT_6_______STATUS_EFFECTS_ : []),
                                ];
                              }
    },
    {
      id: "vocab.minecraft",
      title: "\u6211\u7684\u4e16\u754c - \u5b8c\u6574",
      stage: "minecraft",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_advanced.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_advancements.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_basic.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_biomes.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_blocks.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_enchantments.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_entities.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_environment.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_intermediate.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_items.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_items_2.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_status_effects.js",
        "words/vocabs/04_\u6211\u7684\u4e16\u754c/minecraft_words_full.js",
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
    {
      id: "vocab.junior_high.basic",
      title: "\u521d\u4e2d-\u521d\u7ea7",
      stage: "junior_high",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/05_\u521d\u4e2d/junior_high_basic.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_JUNIOR_HIGH_BASIC !== "undefined" ? STAGE_JUNIOR_HIGH_BASIC : []),
                                ];
                              }
    },
    {
      id: "vocab.junior_high.intermediate",
      title: "\u521d\u4e2d-\u4e2d\u7ea7",
      stage: "junior_high",
      difficulty: "intermediate",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/05_\u521d\u4e2d/junior_high_intermediate.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_JUNIOR_HIGH_INTERMEDIATE !== "undefined" ? STAGE_JUNIOR_HIGH_INTERMEDIATE : []),
                                ];
                              }
    },
    {
      id: "vocab.junior_high.advanced",
      title: "\u521d\u4e2d-\u9ad8\u7ea7",
      stage: "junior_high",
      difficulty: "advanced",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/05_\u521d\u4e2d/junior_high_advanced.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_JUNIOR_HIGH_ADVANCED !== "undefined" ? STAGE_JUNIOR_HIGH_ADVANCED : []),
                                ];
                              }
    },
    {
      id: "vocab.junior_high",
      title: "\u521d\u4e2d-\u5b8c\u6574",
      stage: "junior_high",
      difficulty: "intermediate",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/05_\u521d\u4e2d/junior_high_full.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_JUNIOR_HIGH !== "undefined" ? STAGE_JUNIOR_HIGH : []),
                                ];
                              }
    },
    {
      id: "vocab.elementary_lower.supplement",
      title: "\u5c0f\u5b66-\u8865\u5145",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/02_\u5c0f\u5b66_\u4f4e\u5e74\u7ea7/elementary_supplement_external_20260221.js",
      ],
      getRaw() {
                                return [
                                  ...(typeof STAGE_ELEMENTARY_SUPPLEMENT_20260221 !== "undefined" ? STAGE_ELEMENTARY_SUPPLEMENT_20260221 : []),
                                ];
                              }
    },
  ];

  const byId = Object.create(null);
  packs.forEach(p => { byId[p.id] = p; });

  window.MMWG_VOCAB_MANIFEST = {
    version: "2026-02-22.1",
    packs,
    byId
  };
})();
