(() => {
  const packs = [
    {
      id: "vocab.kindergarten.basic",
      title: "骞煎効鍥?- 鍒濈骇",
      stage: "kindergarten",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_01.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_02.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_03.js",
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
      title: "骞煎効鍥?- 涓骇",
      stage: "kindergarten",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_04.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_05.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_06.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_07.js",
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
      title: "骞煎効鍥?- 楂樼骇",
      stage: "kindergarten",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_08.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_09.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_10.js",
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
      title: "骞煎効鍥?- 瀹屾暣",
      stage: "kindergarten",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤1_鍩虹.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤2_瀛︿範.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤3_鑷劧.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤4_娌熼€?js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤5_鏃ュ父.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤6_閫氱敤.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_01.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_02.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_03.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_04.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_05.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_06.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_07.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_08.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_09.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥璤鍒嗗嵎_10.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥熀纭€.js",
        "words/vocabs/01_骞煎効鍥?骞煎効鍥畬鏁磋瘝搴?js",
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
      id: "vocab.elementary_lower.basic",
      title: "灏忓浣庡勾绾?- 鍒濈骇",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_01.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_02.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_03.js",
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
      title: "灏忓浣庡勾绾?- 涓骇",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_04.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_05.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_06.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_07.js",
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
      title: "灏忓浣庡勾绾?- 楂樼骇",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_08.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_09.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_10.js",
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
      title: "灏忓浣庡勾绾?- 瀹屾暣",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_01.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_02.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_03.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_04.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_05.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_06.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_07.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_08.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_09.js",
        "words/vocabs/02_灏忓_浣庡勾绾?灏忓浣庡勾绾鍒嗗嵎_10.js",
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
      title: "灏忓楂樺勾绾?- 鍒濈骇",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓浣庡勾绾у熀纭€.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []),
        ];
      }
    },
    {
      id: "vocab.elementary_upper.intermediate",
      title: "灏忓楂樺勾绾?- 涓骇",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓楂樺勾绾у熀纭€.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_ELEMENTARY_UPPER !== "undefined" ? STAGE_ELEMENTARY_UPPER : []),
        ];
      }
    },
    {
      id: "vocab.elementary_upper.advanced",
      title: "灏忓楂樺勾绾?- 楂樼骇",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓鍏ㄩ樁娈靛悎骞惰瘝搴?js",
      ],
      getRaw() {
        return [
          ...(typeof MERGED_VOCABULARY !== "undefined" ? MERGED_VOCABULARY : []),
        ];
      }
    },
    {
      id: "vocab.elementary_upper",
      title: "灏忓楂樺勾绾?- 瀹屾暣",
      stage: "elementary_upper",
      difficulty: "intermediate",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓浣庡勾绾у熀纭€.js",
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓浣庡勾绾ц瘝姹囧簱.js",
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓鍏ㄩ樁娈靛悎骞惰瘝搴?js",
        "words/vocabs/03_灏忓_楂樺勾绾?灏忓楂樺勾绾у熀纭€.js",
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
      title: "鎴戠殑涓栫晫 - 鍒濈骇",
      stage: "minecraft",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_basic.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_blocks.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_items.js",
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
      title: "鎴戠殑涓栫晫 - 涓骇",
      stage: "minecraft",
      difficulty: "basic",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_intermediate.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_entities.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_biomes.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_environment.js",
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
      title: "鎴戠殑涓栫晫 - 楂樼骇",
      stage: "minecraft",
      difficulty: "basic",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_advanced.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_enchantments.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_advancements.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_status_effects.js",
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
      title: "鎴戠殑涓栫晫 - 瀹屾暣",
      stage: "minecraft",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_advanced.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_advancements.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_basic.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_biomes.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_blocks.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_enchantments.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_entities.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_environment.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_intermediate.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_items.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_items_2.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_status_effects.js",
        "words/vocabs/04_鎴戠殑涓栫晫/minecraft_words_full.js",
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
      title: "初中-初级",
      stage: "junior_high",
      difficulty: "basic",
      level: "basic",
      weight: 1,
      files: [
        "words/vocabs/05_初中/junior_high_basic.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_JUNIOR_HIGH_BASIC !== "undefined" ? STAGE_JUNIOR_HIGH_BASIC : []),
        ];
      }
    },
    {
      id: "vocab.junior_high.intermediate",
      title: "初中-中级",
      stage: "junior_high",
      difficulty: "intermediate",
      level: "intermediate",
      weight: 1,
      files: [
        "words/vocabs/05_初中/junior_high_intermediate.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_JUNIOR_HIGH_INTERMEDIATE !== "undefined" ? STAGE_JUNIOR_HIGH_INTERMEDIATE : []),
        ];
      }
    },
    {
      id: "vocab.junior_high.advanced",
      title: "初中-高级",
      stage: "junior_high",
      difficulty: "advanced",
      level: "advanced",
      weight: 1,
      files: [
        "words/vocabs/05_初中/junior_high_advanced.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_JUNIOR_HIGH_ADVANCED !== "undefined" ? STAGE_JUNIOR_HIGH_ADVANCED : []),
        ];
      }
    },
    {
      id: "vocab.junior_high",
      title: "鍒濅腑-瀹屾暣",
      stage: "junior_high",
      difficulty: "intermediate",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/05_初中/junior_high_full.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_JUNIOR_HIGH !== "undefined" ? STAGE_JUNIOR_HIGH : []),
        ];
      }
    },
    {
      id: "vocab.kindergarten.supplement",
      title: "骞煎効鍥?琛ュ厖",
      stage: "kindergarten",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/01_骞煎効鍥?kindergarten_supplement_external_20260221.js",
      ],
      getRaw() {
        return [
          ...(typeof STAGE_KINDERGARTEN_SUPPLEMENT_20260221 !== "undefined" ? STAGE_KINDERGARTEN_SUPPLEMENT_20260221 : []),
        ];
      }
    },
    {
      id: "vocab.elementary_lower.supplement",
      title: "灏忓-琛ュ厖",
      stage: "elementary_lower",
      difficulty: "basic",
      level: "full",
      weight: 1,
      files: [
        "words/vocabs/02_灏忓_浣庡勾绾?elementary_supplement_external_20260221.js",
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
    version: "2026-02-21.3",
    packs,
    byId
  };
})();



