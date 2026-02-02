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
    // EXTERNAL_PACKS_START
    {
      id: "external.elementary_lower.pack011",
      title: "小学低年级 / 小学低年级基础",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级基础.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER !== "undefined" ? STAGE_ELEMENTARY_LOWER : []; }
    },
    {
      id: "external.elementary_lower.pack012",
      title: "小学低年级 / 小学全阶段合并词库",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.36,
      file: "words/vocabs/external/elementary_lower/小学全阶段合并词库.js",
      getRaw() { return typeof MERGED_VOCABULARY !== "undefined" ? MERGED_VOCABULARY : []; }
    },
    {
      id: "external.elementary_lower.part01",
      title: "小学低年级 / 小学低年级 分卷 01",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_01.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART01 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART01 : []; }
    },
    {
      id: "external.elementary_lower.part02",
      title: "小学低年级 / 小学低年级 分卷 02",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_02.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART02 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART02 : []; }
    },
    {
      id: "external.elementary_lower.part03",
      title: "小学低年级 / 小学低年级 分卷 03",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_03.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART03 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART03 : []; }
    },
    {
      id: "external.elementary_lower.part04",
      title: "小学低年级 / 小学低年级 分卷 04",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_04.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART04 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART04 : []; }
    },
    {
      id: "external.elementary_lower.part05",
      title: "小学低年级 / 小学低年级 分卷 05",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_05.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART05 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART05 : []; }
    },
    {
      id: "external.elementary_lower.part06",
      title: "小学低年级 / 小学低年级 分卷 06",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_06.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART06 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART06 : []; }
    },
    {
      id: "external.elementary_lower.part07",
      title: "小学低年级 / 小学低年级 分卷 07",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_07.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART07 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART07 : []; }
    },
    {
      id: "external.elementary_lower.part08",
      title: "小学低年级 / 小学低年级 分卷 08",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_08.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART08 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART08 : []; }
    },
    {
      id: "external.elementary_lower.part09",
      title: "小学低年级 / 小学低年级 分卷 09",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_09.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART09 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART09 : []; }
    },
    {
      id: "external.elementary_lower.part10",
      title: "小学低年级 / 小学低年级 分卷 10",
      stage: "elementary_lower",
      difficulty: "basic",
      weight: 0.9,
      file: "words/vocabs/external/elementary_lower/小学低年级_分卷_10.js",
      getRaw() { return typeof STAGE_ELEMENTARY_LOWER_PART10 !== "undefined" ? STAGE_ELEMENTARY_LOWER_PART10 : []; }
    },
    {
      id: "external.elementary_upper.pack001",
      title: "小学高年级 / 小学高年级基础",
      stage: "elementary_upper",
      difficulty: "basic",
      weight: 0.7,
      file: "words/vocabs/external/elementary_upper/小学高年级基础.js",
      getRaw() { return typeof STAGE_ELEMENTARY_UPPER !== "undefined" ? STAGE_ELEMENTARY_UPPER : []; }
    },
    {
      id: "external.game.animal_crossing.animal_crossing_all_characters",
      title: "游戏专题 / animal_crossing / animal crossing all characters",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.17,
      file: "words/vocabs/external/game/animal_crossing/animal_crossing_all_characters.js",
      getRaw() { return typeof ANIMAL_CROSSING_ALL_CHARACTERS !== "undefined" ? ANIMAL_CROSSING_ALL_CHARACTERS : []; }
    },
    {
      id: "external.game.animal_crossing.animal_crossing_all_items",
      title: "游戏专题 / animal_crossing / animal crossing all items",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.17,
      file: "words/vocabs/external/game/animal_crossing/animal_crossing_all_items.js",
      getRaw() { return typeof ANIMAL_CROSSING_ALL_ITEMS !== "undefined" ? ANIMAL_CROSSING_ALL_ITEMS : []; }
    },
    {
      id: "external.game.animal_crossing.animal_crossing_characters",
      title: "游戏专题 / animal_crossing / animal crossing characters",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.42,
      file: "words/vocabs/external/game/animal_crossing/animal_crossing_characters.js",
      getRaw() { return typeof ANIMAL_CROSSING_CHARACTERS !== "undefined" ? ANIMAL_CROSSING_CHARACTERS : []; }
    },
    {
      id: "external.game.animal_crossing.animal_crossing_items",
      title: "游戏专题 / animal_crossing / animal crossing items",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.42,
      file: "words/vocabs/external/game/animal_crossing/animal_crossing_items.js",
      getRaw() { return typeof ANIMAL_CROSSING_ITEMS !== "undefined" ? ANIMAL_CROSSING_ITEMS : []; }
    },
    {
      id: "external.game.disney_illusion_island.disney_illusion_island_basic",
      title: "游戏专题 / disney_illusion_island / disney illusion island basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/disney_illusion_island/disney_illusion_island_basic.js",
      getRaw() { return typeof DISNEY_ILLUSION_ISLAND_BASIC !== "undefined" ? DISNEY_ILLUSION_ISLAND_BASIC : []; }
    },
    {
      id: "external.game.kirby.kirby_basic",
      title: "游戏专题 / kirby / kirby basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/kirby/kirby_basic.js",
      getRaw() { return typeof KIRBY_BASIC !== "undefined" ? KIRBY_BASIC : []; }
    },
    {
      id: "external.game.lego.lego_basic",
      title: "游戏专题 / lego / lego basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/lego/lego_basic.js",
      getRaw() { return typeof LEGO_BASIC !== "undefined" ? LEGO_BASIC : []; }
    },
    {
      id: "external.game.mario.mario_basic",
      title: "游戏专题 / mario / mario basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/mario/mario_basic.js",
      getRaw() { return typeof MARIO_BASIC !== "undefined" ? MARIO_BASIC : []; }
    },
    {
      id: "external.game.pbs_kids.pbs_kids_all_programs",
      title: "游戏专题 / pbs_kids / pbs kids all programs",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.17,
      file: "words/vocabs/external/game/pbs_kids/pbs_kids_all_programs.js",
      getRaw() { return typeof PBS_KIDS_ALL_PROGRAMS !== "undefined" ? PBS_KIDS_ALL_PROGRAMS : []; }
    },
    {
      id: "external.game.pbs_kids.pbs_kids_colors",
      title: "游戏专题 / pbs_kids / pbs kids colors",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.42,
      file: "words/vocabs/external/game/pbs_kids/pbs_kids_colors.js",
      getRaw() { return typeof PBS_KIDS_COLORS !== "undefined" ? PBS_KIDS_COLORS : []; }
    },
    {
      id: "external.game.pokemon.pokemon_all_generations",
      title: "游戏专题 / pokemon / pokemon all generations",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.17,
      file: "words/vocabs/external/game/pokemon/pokemon_all_generations.js",
      getRaw() { return typeof POKEMON_ALL_GENERATIONS !== "undefined" ? POKEMON_ALL_GENERATIONS : []; }
    },
    {
      id: "external.game.pokemon.pokemon_basic",
      title: "游戏专题 / pokemon / pokemon basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/pokemon/pokemon_basic.js",
      getRaw() { return typeof POKEMON_BASIC !== "undefined" ? POKEMON_BASIC : []; }
    },
    {
      id: "external.game.pvz.pvz_basic",
      title: "游戏专题 / pvz / pvz basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/pvz/pvz_basic.js",
      getRaw() { return typeof PVZ_BASIC !== "undefined" ? PVZ_BASIC : []; }
    },
    {
      id: "external.game.scribblenauts.scribblenauts_basic",
      title: "游戏专题 / scribblenauts / scribblenauts basic",
      stage: "game",
      difficulty: "basic",
      weight: 0.6,
      file: "words/vocabs/external/game/scribblenauts/scribblenauts_basic.js",
      getRaw() { return typeof SCRIBBLENAUTS_BASIC !== "undefined" ? SCRIBBLENAUTS_BASIC : []; }
    },
    {
      id: "external.game.toca_boca.toca_boca_all_games",
      title: "游戏专题 / toca_boca / toca boca all games",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.17,
      file: "words/vocabs/external/game/toca_boca/toca_boca_all_games.js",
      getRaw() { return typeof TOCA_BOCA_ALL_GAMES !== "undefined" ? TOCA_BOCA_ALL_GAMES : []; }
    },
    {
      id: "external.game.toca_boca.toca_boca_kitchen",
      title: "游戏专题 / toca_boca / toca boca kitchen",
      stage: "game",
      difficulty: "intermediate",
      weight: 0.42,
      file: "words/vocabs/external/game/toca_boca/toca_boca_kitchen.js",
      getRaw() { return typeof TOCA_BOCA_KITCHEN !== "undefined" ? TOCA_BOCA_KITCHEN : []; }
    },
    {
      id: "external.general.pack001",
      title: "通用主题 / 常用词汇",
      stage: "general",
      difficulty: "intermediate",
      weight: 0.59,
      file: "words/vocabs/external/general/常用词汇.js",
      getRaw() { return typeof VOCAB_1____COMMON !== "undefined" ? VOCAB_1____COMMON : []; }
    },
    {
      id: "external.kindergarten.1",
      title: "幼儿园 / 幼儿园 1 基础",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_1_基础.js",
      getRaw() { return typeof VOCAB_1__________ !== "undefined" ? VOCAB_1__________ : []; }
    },
    {
      id: "external.kindergarten.2",
      title: "幼儿园 / 幼儿园 2 学习",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_2_学习.js",
      getRaw() { return typeof VOCAB_2__________ !== "undefined" ? VOCAB_2__________ : []; }
    },
    {
      id: "external.kindergarten.3",
      title: "幼儿园 / 幼儿园 3 自然",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_3_自然.js",
      getRaw() { return typeof VOCAB_3__________ !== "undefined" ? VOCAB_3__________ : []; }
    },
    {
      id: "external.kindergarten.4",
      title: "幼儿园 / 幼儿园 4 沟通",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_4_沟通.js",
      getRaw() { return typeof VOCAB_4_____ !== "undefined" ? VOCAB_4_____ : []; }
    },
    {
      id: "external.kindergarten.5",
      title: "幼儿园 / 幼儿园 5 日常",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_5_日常.js",
      getRaw() { return typeof VOCAB_5_____ !== "undefined" ? VOCAB_5_____ : []; }
    },
    {
      id: "external.kindergarten.6",
      title: "幼儿园 / 幼儿园 6 通用",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_6_通用.js",
      getRaw() { return typeof VOCAB_6______ !== "undefined" ? VOCAB_6______ : []; }
    },
    {
      id: "external.kindergarten.pack017",
      title: "幼儿园 / 幼儿园基础",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园基础.js",
      getRaw() { return typeof STAGE_KINDERGARTEN !== "undefined" ? STAGE_KINDERGARTEN : []; }
    },
    {
      id: "external.kindergarten.pack018",
      title: "幼儿园 / 幼儿园完整词库",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 0.4,
      file: "words/vocabs/external/kindergarten/幼儿园完整词库.js",
      getRaw() { return typeof MERGED_KINDERGARTEN_VOCAB !== "undefined" ? MERGED_KINDERGARTEN_VOCAB : []; }
    },
    {
      id: "external.kindergarten.part01",
      title: "幼儿园 / 幼儿园 分卷 01",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_01.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART01 !== "undefined" ? STAGE_KINDERGARTEN_PART01 : []; }
    },
    {
      id: "external.kindergarten.part02",
      title: "幼儿园 / 幼儿园 分卷 02",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_02.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART02 !== "undefined" ? STAGE_KINDERGARTEN_PART02 : []; }
    },
    {
      id: "external.kindergarten.part03",
      title: "幼儿园 / 幼儿园 分卷 03",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_03.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART03 !== "undefined" ? STAGE_KINDERGARTEN_PART03 : []; }
    },
    {
      id: "external.kindergarten.part04",
      title: "幼儿园 / 幼儿园 分卷 04",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_04.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART04 !== "undefined" ? STAGE_KINDERGARTEN_PART04 : []; }
    },
    {
      id: "external.kindergarten.part05",
      title: "幼儿园 / 幼儿园 分卷 05",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_05.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART05 !== "undefined" ? STAGE_KINDERGARTEN_PART05 : []; }
    },
    {
      id: "external.kindergarten.part06",
      title: "幼儿园 / 幼儿园 分卷 06",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_06.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART06 !== "undefined" ? STAGE_KINDERGARTEN_PART06 : []; }
    },
    {
      id: "external.kindergarten.part07",
      title: "幼儿园 / 幼儿园 分卷 07",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_07.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART07 !== "undefined" ? STAGE_KINDERGARTEN_PART07 : []; }
    },
    {
      id: "external.kindergarten.part08",
      title: "幼儿园 / 幼儿园 分卷 08",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_08.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART08 !== "undefined" ? STAGE_KINDERGARTEN_PART08 : []; }
    },
    {
      id: "external.kindergarten.part09",
      title: "幼儿园 / 幼儿园 分卷 09",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_09.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART09 !== "undefined" ? STAGE_KINDERGARTEN_PART09 : []; }
    },
    {
      id: "external.kindergarten.part10",
      title: "幼儿园 / 幼儿园 分卷 10",
      stage: "kindergarten",
      difficulty: "basic",
      weight: 1,
      file: "words/vocabs/external/kindergarten/幼儿园_分卷_10.js",
      getRaw() { return typeof STAGE_KINDERGARTEN_PART10 !== "undefined" ? STAGE_KINDERGARTEN_PART10 : []; }
    },
    {
      id: "external.minecraft.minecraft_advanced",
      title: "游戏专题 / Minecraft / minecraft advanced",
      stage: "minecraft",
      difficulty: "advanced",
      weight: 0.4,
      file: "words/vocabs/external/minecraft/minecraft_advanced.js",
      getRaw() { return typeof VOCAB_3_MINECRAFT____ADVANCED !== "undefined" ? VOCAB_3_MINECRAFT____ADVANCED : []; }
    },
    {
      id: "external.minecraft.minecraft_advancements",
      title: "游戏专题 / Minecraft / minecraft advancements",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_advancements.js",
      getRaw() { return typeof MINECRAFT_8_____ADVANCEMENTS_ !== "undefined" ? MINECRAFT_8_____ADVANCEMENTS_ : []; }
    },
    {
      id: "external.minecraft.minecraft_basic",
      title: "游戏专题 / Minecraft / minecraft basic",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_basic.js",
      getRaw() { return typeof VOCAB_1_MINECRAFT____BASIC !== "undefined" ? VOCAB_1_MINECRAFT____BASIC : []; }
    },
    {
      id: "external.minecraft.minecraft_biomes",
      title: "游戏专题 / Minecraft / minecraft biomes",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_biomes.js",
      getRaw() { return typeof MINECRAFT_5_BIOMES_____ !== "undefined" ? MINECRAFT_5_BIOMES_____ : []; }
    },
    {
      id: "external.minecraft.minecraft_blocks",
      title: "游戏专题 / Minecraft / minecraft blocks",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_blocks.js",
      getRaw() { return typeof MINECRAFT_1_BLOCKS___ !== "undefined" ? MINECRAFT_1_BLOCKS___ : []; }
    },
    {
      id: "external.minecraft.minecraft_enchantments",
      title: "游戏专题 / Minecraft / minecraft enchantments",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_enchantments.js",
      getRaw() { return typeof MINECRAFT_7_____ENCHANTMENTS_ !== "undefined" ? MINECRAFT_7_____ENCHANTMENTS_ : []; }
    },
    {
      id: "external.minecraft.minecraft_entities",
      title: "游戏专题 / Minecraft / minecraft entities",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_entities.js",
      getRaw() { return typeof MINECRAFT_3_ENTITIES___ !== "undefined" ? MINECRAFT_3_ENTITIES___ : []; }
    },
    {
      id: "external.minecraft.minecraft_environment",
      title: "游戏专题 / Minecraft / minecraft environment",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_environment.js",
      getRaw() { return typeof MINECRAFT_4_ENVIRONMENT___ !== "undefined" ? MINECRAFT_4_ENVIRONMENT___ : []; }
    },
    {
      id: "external.minecraft.minecraft_intermediate",
      title: "游戏专题 / Minecraft / minecraft intermediate",
      stage: "minecraft",
      difficulty: "intermediate",
      weight: 0.56,
      file: "words/vocabs/external/minecraft/minecraft_intermediate.js",
      getRaw() { return typeof VOCAB_2_MINECRAFT____BASIC !== "undefined" ? VOCAB_2_MINECRAFT____BASIC : []; }
    },
    {
      id: "external.minecraft.minecraft_items",
      title: "游戏专题 / Minecraft / minecraft items",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_items.js",
      getRaw() { return typeof MINECRAFT_2_ITEMS___ !== "undefined" ? MINECRAFT_2_ITEMS___ : []; }
    },
    {
      id: "external.minecraft.minecraft_items_2",
      title: "游戏专题 / Minecraft / minecraft items 2",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_items_2.js",
      getRaw() { return typeof MINECRAFT_2_ITEMS___2 !== "undefined" ? MINECRAFT_2_ITEMS___2 : []; }
    },
    {
      id: "external.minecraft.minecraft_status_effects",
      title: "游戏专题 / Minecraft / minecraft status effects",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/minecraft_status_effects.js",
      getRaw() { return typeof MINECRAFT_6_______STATUS_EFFECTS_ !== "undefined" ? MINECRAFT_6_______STATUS_EFFECTS_ : []; }
    },
    {
      id: "external.minecraft.minecraft_words_full",
      title: "游戏专题 / Minecraft / minecraft words full",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.32,
      file: "words/vocabs/external/minecraft/minecraft_words_full.js",
      getRaw() { return typeof MINECRAFT_3_____ !== "undefined" ? MINECRAFT_3_____ : []; }
    },
    {
      id: "external.minecraft.pack014",
      title: "游戏专题 / Minecraft / 我的世界 全",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.32,
      file: "words/vocabs/external/minecraft/我的世界_全.js",
      getRaw() { return typeof MINECRAFT_3_____ !== "undefined" ? MINECRAFT_3_____ : []; }
    },
    {
      id: "external.minecraft.pack015",
      title: "游戏专题 / Minecraft / 我的世界 基础",
      stage: "minecraft",
      difficulty: "basic",
      weight: 0.8,
      file: "words/vocabs/external/minecraft/我的世界_基础.js",
      getRaw() { return typeof VOCAB_1_MINECRAFT____BASIC !== "undefined" ? VOCAB_1_MINECRAFT____BASIC : []; }
    }
    // EXTERNAL_PACKS_END
  ];

  const byId = Object.create(null);
  packs.forEach(p => { byId[p.id] = p; });

  window.MMWG_VOCAB_MANIFEST = {
    version: "2026-02-02.1",
    packs,
    byId
  };
})();

