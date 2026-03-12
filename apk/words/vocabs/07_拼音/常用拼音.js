function createPinyinEntry({
  pinyin,
  base,
  chinese,
  english,
  examples,
  homophones = [],
  nearPhones = []
}) {
  const normalizedExamples = (Array.isArray(examples) ? examples : [])
    .slice(0, 2)
    .map((item) => ({
      word: String(item?.word || "").trim(),
      english: String(item?.english || "").trim()
    }))
    .filter((item) => item.word);

  return {
    word: pinyin,
    pinyin,
    base,
    chinese,
    english,
    examples: normalizedExamples,
    homophones: Array.isArray(homophones) ? homophones : [],
    nearPhones: Array.isArray(nearPhones) ? nearPhones : [],
    difficulty: "basic",
    stage: "kindergarten",
    mode: "pinyin",
    imageURLs: []
  };
}

const PINYIN_CORE_PACK = [
  createPinyinEntry({
    "pinyin": "bā",
    "base": "ba",
    "chinese": "八",
    "english": "eight",
    "examples": [
      {
        "word": "八月",
        "english": "August"
      },
      {
        "word": "八个",
        "english": "eight items"
      }
    ],
    "homophones": [
      "八"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yī",
    "base": "yi",
    "chinese": "一",
    "english": "one",
    "examples": [
      {
        "word": "一天",
        "english": "one day"
      }
    ],
    "homophones": [
      "一",
      "衣",
      "依",
      "医"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "èr",
    "base": "er",
    "chinese": "二",
    "english": "two",
    "examples": [
      {
        "word": "二月",
        "english": "February"
      },
      {
        "word": "二人",
        "english": "two people"
      }
    ],
    "homophones": [
      "二"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shí",
    "base": "shi",
    "chinese": "十",
    "english": "ten",
    "examples": [
      {
        "word": "十个",
        "english": "ten items"
      },
      {
        "word": "十天",
        "english": "ten days"
      }
    ],
    "homophones": [
      "十",
      "石",
      "时",
      "拾",
      "识",
      "实"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chǎng",
    "base": "chang",
    "chinese": "厂",
    "english": "factory",
    "examples": [
      {
        "word": "工厂",
        "english": "factory"
      }
    ],
    "homophones": [
      "厂",
      "场"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qī",
    "base": "qi",
    "chinese": "七",
    "english": "seven",
    "examples": [
      {
        "word": "七天",
        "english": "seven days"
      },
      {
        "word": "七个",
        "english": "seven items"
      }
    ],
    "homophones": [
      "七",
      "期",
      "妻"
    ],
    "nearPhones": [
      "ji",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ér",
    "base": "er",
    "chinese": "儿",
    "english": "child",
    "examples": [
      {
        "word": "儿子",
        "english": "son"
      },
      {
        "word": "女儿",
        "english": "daughter"
      }
    ],
    "homophones": [
      "儿"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "rén",
    "base": "ren",
    "chinese": "人",
    "english": "person",
    "examples": [
      {
        "word": "大人",
        "english": "adult"
      },
      {
        "word": "人们",
        "english": "people"
      }
    ],
    "homophones": [
      "人"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "rù",
    "base": "ru",
    "chinese": "入",
    "english": "enter",
    "examples": [
      {
        "word": "入口",
        "english": "entrance"
      },
      {
        "word": "入学",
        "english": "enroll"
      }
    ],
    "homophones": [
      "入"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jǐ",
    "base": "ji",
    "chinese": "几",
    "english": "how many",
    "examples": [
      {
        "word": "几个",
        "english": "how many"
      },
      {
        "word": "几天",
        "english": "how many days"
      }
    ],
    "homophones": [
      "几",
      "己"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǔ",
    "base": "jiu",
    "chinese": "九",
    "english": "nine",
    "examples": [
      {
        "word": "九个",
        "english": "nine items"
      },
      {
        "word": "九月",
        "english": "September"
      }
    ],
    "homophones": [
      "九",
      "酒",
      "久"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "le",
    "base": "le",
    "chinese": "了",
    "english": "done",
    "examples": [
      {
        "word": "好了",
        "english": "all right"
      },
      {
        "word": "走了",
        "english": "gone"
      }
    ],
    "homophones": [
      "了"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dāo",
    "base": "dao",
    "chinese": "刀",
    "english": "knife",
    "examples": [
      {
        "word": "小刀",
        "english": "knife"
      },
      {
        "word": "刀子",
        "english": "blade"
      }
    ],
    "homophones": [
      "刀"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lì",
    "base": "li",
    "chinese": "力",
    "english": "strength",
    "examples": [
      {
        "word": "力气",
        "english": "strength"
      },
      {
        "word": "用力",
        "english": "use force"
      }
    ],
    "homophones": [
      "力",
      "立",
      "利",
      "例",
      "历"
    ],
    "nearPhones": [
      "ni",
      "ri"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yòu",
    "base": "you",
    "chinese": "又",
    "english": "again",
    "examples": [
      {
        "word": "又来",
        "english": "come again"
      },
      {
        "word": "又见",
        "english": "see again"
      }
    ],
    "homophones": [
      "又",
      "右"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "sān",
    "base": "san",
    "chinese": "三",
    "english": "three",
    "examples": [
      {
        "word": "三天",
        "english": "three days"
      },
      {
        "word": "三个",
        "english": "three items"
      }
    ],
    "homophones": [
      "三"
    ],
    "nearPhones": [
      "shan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gān",
    "base": "gan",
    "chinese": "干",
    "english": "dry",
    "examples": [
      {
        "word": "干衣",
        "english": "dry clothes"
      }
    ],
    "homophones": [
      "干"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gōng",
    "base": "gong",
    "chinese": "工",
    "english": "work",
    "examples": [
      {
        "word": "工人",
        "english": "worker"
      },
      {
        "word": "工厂",
        "english": "factory"
      }
    ],
    "homophones": [
      "工",
      "公",
      "功",
      "弓"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tǔ",
    "base": "tu",
    "chinese": "土",
    "english": "earth",
    "examples": [
      {
        "word": "土地",
        "english": "land"
      }
    ],
    "homophones": [
      "土"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cái",
    "base": "cai",
    "chinese": "才",
    "english": "talent",
    "examples": [
      {
        "word": "人才",
        "english": "talent"
      },
      {
        "word": "才艺",
        "english": "skill"
      }
    ],
    "homophones": [
      "才",
      "材",
      "财"
    ],
    "nearPhones": [
      "zai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xià",
    "base": "xia",
    "chinese": "下",
    "english": "down",
    "examples": [
      {
        "word": "下面",
        "english": "below"
      },
      {
        "word": "下雨",
        "english": "rain down"
      }
    ],
    "homophones": [
      "下",
      "夏"
    ],
    "nearPhones": [
      "jia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dà",
    "base": "da",
    "chinese": "大",
    "english": "big",
    "examples": [
      {
        "word": "大山",
        "english": "big mountain"
      },
      {
        "word": "大人",
        "english": "adult"
      }
    ],
    "homophones": [
      "大"
    ],
    "nearPhones": [
      "ta"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shàng",
    "base": "shang",
    "chinese": "上",
    "english": "up",
    "examples": [
      {
        "word": "上学",
        "english": "go to school"
      },
      {
        "word": "上面",
        "english": "upper side"
      }
    ],
    "homophones": [
      "上"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiǎo",
    "base": "xiao",
    "chinese": "小",
    "english": "small",
    "examples": [
      {
        "word": "小手",
        "english": "small hand"
      },
      {
        "word": "小狗",
        "english": "puppy"
      }
    ],
    "homophones": [
      "小"
    ],
    "nearPhones": [
      "jiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kǒu",
    "base": "kou",
    "chinese": "口",
    "english": "mouth",
    "examples": [
      {
        "word": "口水",
        "english": "saliva"
      }
    ],
    "homophones": [
      "口"
    ],
    "nearPhones": [
      "gou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shān",
    "base": "shan",
    "chinese": "山",
    "english": "mountain",
    "examples": [
      {
        "word": "高山",
        "english": "high mountain"
      },
      {
        "word": "山羊",
        "english": "goat"
      }
    ],
    "homophones": [
      "山"
    ],
    "nearPhones": [
      "san"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jīn",
    "base": "jin",
    "chinese": "巾",
    "english": "towel",
    "examples": [
      {
        "word": "毛巾",
        "english": "towel"
      },
      {
        "word": "纸巾",
        "english": "tissue"
      }
    ],
    "homophones": [
      "巾",
      "今",
      "金"
    ],
    "nearPhones": [
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiān",
    "base": "qian",
    "chinese": "千",
    "english": "thousand",
    "examples": [
      {
        "word": "千米",
        "english": "kilometer"
      }
    ],
    "homophones": [
      "千"
    ],
    "nearPhones": [
      "jian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gè",
    "base": "ge",
    "chinese": "个",
    "english": "piece",
    "examples": [
      {
        "word": "一个",
        "english": "one item"
      },
      {
        "word": "个子",
        "english": "height"
      }
    ],
    "homophones": [
      "个",
      "各"
    ],
    "nearPhones": [
      "ke"
    ]
  }),
  createPinyinEntry({
    "pinyin": "guǎng",
    "base": "guang",
    "chinese": "广",
    "english": "wide",
    "examples": [
      {
        "word": "广场",
        "english": "square"
      },
      {
        "word": "广大",
        "english": "broad"
      }
    ],
    "homophones": [
      "广"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mén",
    "base": "men",
    "chinese": "门",
    "english": "door",
    "examples": [
      {
        "word": "开门",
        "english": "open door"
      },
      {
        "word": "门口",
        "english": "doorway"
      }
    ],
    "homophones": [
      "门"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zǐ",
    "base": "zi",
    "chinese": "子",
    "english": "child",
    "examples": [
      {
        "word": "儿子",
        "english": "son"
      },
      {
        "word": "子女",
        "english": "children"
      }
    ],
    "homophones": [
      "子"
    ],
    "nearPhones": [
      "zhi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yě",
    "base": "ye",
    "chinese": "也",
    "english": "also",
    "examples": [
      {
        "word": "也好",
        "english": "also fine"
      },
      {
        "word": "也是",
        "english": "also is"
      }
    ],
    "homophones": [
      "也",
      "野"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nǚ",
    "base": "nü",
    "chinese": "女",
    "english": "female",
    "examples": [
      {
        "word": "女儿",
        "english": "daughter"
      },
      {
        "word": "女生",
        "english": "girl student"
      }
    ],
    "homophones": [
      "女"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fēi",
    "base": "fei",
    "chinese": "飞",
    "english": "fly",
    "examples": [
      {
        "word": "飞机",
        "english": "airplane"
      },
      {
        "word": "飞鸟",
        "english": "flying bird"
      }
    ],
    "homophones": [
      "飞",
      "非"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xí",
    "base": "xi",
    "chinese": "习",
    "english": "practice",
    "examples": [
      {
        "word": "学习",
        "english": "study"
      },
      {
        "word": "练习",
        "english": "practice"
      }
    ],
    "homophones": [
      "习",
      "席"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mǎ",
    "base": "ma",
    "chinese": "马",
    "english": "horse",
    "examples": [
      {
        "word": "小马",
        "english": "pony"
      },
      {
        "word": "马车",
        "english": "horse cart"
      }
    ],
    "homophones": [
      "马"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wáng",
    "base": "wang",
    "chinese": "王",
    "english": "king",
    "examples": [
      {
        "word": "王子",
        "english": "prince"
      },
      {
        "word": "国王",
        "english": "king"
      }
    ],
    "homophones": [
      "王",
      "亡"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "kāi",
    "base": "kai",
    "chinese": "开",
    "english": "open",
    "examples": [
      {
        "word": "开门",
        "english": "open door"
      },
      {
        "word": "开心",
        "english": "happy"
      }
    ],
    "homophones": [
      "开"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tiān",
    "base": "tian",
    "chinese": "天",
    "english": "sky",
    "examples": [
      {
        "word": "今天",
        "english": "today"
      },
      {
        "word": "天空",
        "english": "sky"
      }
    ],
    "homophones": [
      "天"
    ],
    "nearPhones": [
      "dian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuán",
    "base": "yuan",
    "chinese": "元",
    "english": "unit",
    "examples": [
      {
        "word": "元旦",
        "english": "new year"
      },
      {
        "word": "一元",
        "english": "one yuan"
      }
    ],
    "homophones": [
      "元",
      "圆",
      "原",
      "园"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yún",
    "base": "yun",
    "chinese": "云",
    "english": "cloud",
    "examples": [
      {
        "word": "白云",
        "english": "white cloud"
      }
    ],
    "homophones": [
      "云"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mù",
    "base": "mu",
    "chinese": "木",
    "english": "wood",
    "examples": [
      {
        "word": "木头",
        "english": "wood"
      },
      {
        "word": "木马",
        "english": "wooden horse"
      }
    ],
    "homophones": [
      "木",
      "目"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wǔ",
    "base": "wu",
    "chinese": "五",
    "english": "five",
    "examples": [
      {
        "word": "五个",
        "english": "five items"
      },
      {
        "word": "五月",
        "english": "May"
      }
    ],
    "homophones": [
      "五",
      "午",
      "舞",
      "武"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bù",
    "base": "bu",
    "chinese": "不",
    "english": "not",
    "examples": [
      {
        "word": "不要",
        "english": "do not want"
      },
      {
        "word": "不去",
        "english": "not go"
      }
    ],
    "homophones": [
      "不",
      "部",
      "步",
      "布"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tài",
    "base": "tai",
    "chinese": "太",
    "english": "too",
    "examples": [
      {
        "word": "太大",
        "english": "too big"
      },
      {
        "word": "太小",
        "english": "too small"
      }
    ],
    "homophones": [
      "太"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǒu",
    "base": "you",
    "chinese": "友",
    "english": "friend",
    "examples": [
      {
        "word": "朋友",
        "english": "friend"
      },
      {
        "word": "友好",
        "english": "friendly"
      }
    ],
    "homophones": [
      "友",
      "有"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chē",
    "base": "che",
    "chinese": "车",
    "english": "car",
    "examples": [
      {
        "word": "马车",
        "english": "cart"
      }
    ],
    "homophones": [
      "车"
    ],
    "nearPhones": [
      "ce"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yá",
    "base": "ya",
    "chinese": "牙",
    "english": "tooth",
    "examples": [
      {
        "word": "牙口",
        "english": "teeth"
      }
    ],
    "homophones": [
      "牙"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bǐ",
    "base": "bi",
    "chinese": "比",
    "english": "compare",
    "examples": [
      {
        "word": "比高",
        "english": "compare height"
      },
      {
        "word": "比一比",
        "english": "compare"
      }
    ],
    "homophones": [
      "比",
      "笔",
      "彼"
    ],
    "nearPhones": [
      "pi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiē",
    "base": "qie",
    "chinese": "切",
    "english": "cut",
    "examples": [
      {
        "word": "切菜",
        "english": "cut vegetables"
      },
      {
        "word": "切片",
        "english": "slice"
      }
    ],
    "homophones": [
      "切"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhǐ",
    "base": "zhi",
    "chinese": "止",
    "english": "stop",
    "examples": [
      {
        "word": "停止",
        "english": "stop"
      },
      {
        "word": "止步",
        "english": "halt"
      }
    ],
    "homophones": [
      "止",
      "纸",
      "指"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shǎo",
    "base": "shao",
    "chinese": "少",
    "english": "few",
    "examples": [
      {
        "word": "多少",
        "english": "how many"
      },
      {
        "word": "少儿",
        "english": "children"
      }
    ],
    "homophones": [
      "少"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "rì",
    "base": "ri",
    "chinese": "日",
    "english": "sun",
    "examples": [
      {
        "word": "日出",
        "english": "sunrise"
      },
      {
        "word": "生日",
        "english": "birthday"
      }
    ],
    "homophones": [
      "日"
    ],
    "nearPhones": [
      "li"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhōng",
    "base": "zhong",
    "chinese": "中",
    "english": "middle",
    "examples": [
      {
        "word": "中国",
        "english": "China"
      },
      {
        "word": "中间",
        "english": "middle"
      }
    ],
    "homophones": [
      "中",
      "钟",
      "终"
    ],
    "nearPhones": [
      "chong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bèi",
    "base": "bei",
    "chinese": "贝",
    "english": "shell",
    "examples": [
      {
        "word": "贝子",
        "english": "cowrie"
      }
    ],
    "homophones": [
      "贝",
      "备"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nèi",
    "base": "nei",
    "chinese": "内",
    "english": "inside",
    "examples": [
      {
        "word": "内外",
        "english": "inside and outside"
      },
      {
        "word": "内衣",
        "english": "underwear"
      }
    ],
    "homophones": [
      "内"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shuǐ",
    "base": "shui",
    "chinese": "水",
    "english": "water",
    "examples": [
      {
        "word": "水果",
        "english": "fruit"
      }
    ],
    "homophones": [
      "水"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiàn",
    "base": "jian",
    "chinese": "见",
    "english": "see",
    "examples": [
      {
        "word": "看见",
        "english": "see"
      },
      {
        "word": "再见",
        "english": "goodbye"
      }
    ],
    "homophones": [
      "见",
      "建"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "niú",
    "base": "niu",
    "chinese": "牛",
    "english": "cow",
    "examples": [
      {
        "word": "小牛",
        "english": "calf"
      },
      {
        "word": "牛奶",
        "english": "milk"
      }
    ],
    "homophones": [
      "牛"
    ],
    "nearPhones": [
      "liu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shǒu",
    "base": "shou",
    "chinese": "手",
    "english": "hand",
    "examples": [
      {
        "word": "小手",
        "english": "small hand"
      },
      {
        "word": "手心",
        "english": "palm"
      }
    ],
    "homophones": [
      "手",
      "首",
      "守"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qì",
    "base": "qi",
    "chinese": "气",
    "english": "air",
    "examples": [
      {
        "word": "空气",
        "english": "air"
      },
      {
        "word": "生气",
        "english": "angry"
      }
    ],
    "homophones": [
      "气"
    ],
    "nearPhones": [
      "ji",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "máo",
    "base": "mao",
    "chinese": "毛",
    "english": "hair",
    "examples": [
      {
        "word": "毛衣",
        "english": "sweater"
      },
      {
        "word": "羽毛",
        "english": "feather"
      }
    ],
    "homophones": [
      "毛"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cháng",
    "base": "chang",
    "chinese": "长",
    "english": "long",
    "examples": [
      {
        "word": "长大",
        "english": "grow up"
      },
      {
        "word": "长高",
        "english": "grow taller"
      }
    ],
    "homophones": [
      "长",
      "常"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "piàn",
    "base": "pian",
    "chinese": "片",
    "english": "slice",
    "examples": [
      {
        "word": "叶片",
        "english": "leaf blade"
      }
    ],
    "homophones": [
      "片"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhǎo",
    "base": "zhao",
    "chinese": "爪",
    "english": "claw",
    "examples": [
      {
        "word": "爪子",
        "english": "claw"
      }
    ],
    "homophones": [
      "爪"
    ],
    "nearPhones": [
      "zao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fǎn",
    "base": "fan",
    "chinese": "反",
    "english": "opposite",
    "examples": [
      {
        "word": "反面",
        "english": "back side"
      },
      {
        "word": "相反",
        "english": "opposite"
      }
    ],
    "homophones": [
      "反"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fù",
    "base": "fu",
    "chinese": "父",
    "english": "father",
    "examples": [
      {
        "word": "父母",
        "english": "parents"
      },
      {
        "word": "父子",
        "english": "father and son"
      }
    ],
    "homophones": [
      "父",
      "富",
      "妇"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cóng",
    "base": "cong",
    "chinese": "从",
    "english": "follow",
    "examples": [
      {
        "word": "从前",
        "english": "long ago"
      },
      {
        "word": "从来",
        "english": "always"
      }
    ],
    "homophones": [
      "从"
    ],
    "nearPhones": [
      "chong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fēn",
    "base": "fen",
    "chinese": "分",
    "english": "divide",
    "examples": [
      {
        "word": "分开",
        "english": "separate"
      },
      {
        "word": "分工",
        "english": "share work"
      }
    ],
    "homophones": [
      "分"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yuè",
    "base": "yue",
    "chinese": "月",
    "english": "moon",
    "examples": [
      {
        "word": "月光",
        "english": "moonlight"
      }
    ],
    "homophones": [
      "月"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fēng",
    "base": "feng",
    "chinese": "风",
    "english": "wind",
    "examples": [
      {
        "word": "大风",
        "english": "strong wind"
      },
      {
        "word": "风车",
        "english": "windmill"
      }
    ],
    "homophones": [
      "风",
      "丰"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liù",
    "base": "liu",
    "chinese": "六",
    "english": "six",
    "examples": [
      {
        "word": "六个",
        "english": "six items"
      },
      {
        "word": "六月",
        "english": "June"
      }
    ],
    "homophones": [
      "六"
    ],
    "nearPhones": [
      "niu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wén",
    "base": "wen",
    "chinese": "文",
    "english": "language",
    "examples": [
      {
        "word": "文字",
        "english": "written words"
      },
      {
        "word": "语文",
        "english": "Chinese language"
      }
    ],
    "homophones": [
      "文",
      "闻"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fāng",
    "base": "fang",
    "chinese": "方",
    "english": "direction",
    "examples": [
      {
        "word": "方向",
        "english": "direction"
      }
    ],
    "homophones": [
      "方"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huǒ",
    "base": "huo",
    "chinese": "火",
    "english": "fire",
    "examples": [
      {
        "word": "火车",
        "english": "train"
      },
      {
        "word": "火山",
        "english": "volcano"
      }
    ],
    "homophones": [
      "火"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hù",
    "base": "hu",
    "chinese": "户",
    "english": "household",
    "examples": [
      {
        "word": "户外",
        "english": "outdoor"
      },
      {
        "word": "住户",
        "english": "resident"
      }
    ],
    "homophones": [
      "户"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xīn",
    "base": "xin",
    "chinese": "心",
    "english": "heart",
    "examples": [
      {
        "word": "开心",
        "english": "happy"
      },
      {
        "word": "爱心",
        "english": "love"
      }
    ],
    "homophones": [
      "心",
      "新",
      "辛"
    ],
    "nearPhones": [
      "jin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuāng",
    "base": "shuang",
    "chinese": "双",
    "english": "pair",
    "examples": [
      {
        "word": "双手",
        "english": "two hands"
      }
    ],
    "homophones": [
      "双"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shū",
    "base": "shu",
    "chinese": "书",
    "english": "book",
    "examples": [
      {
        "word": "书本",
        "english": "book"
      },
      {
        "word": "读书",
        "english": "read books"
      }
    ],
    "homophones": [
      "书"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yù",
    "base": "yu",
    "chinese": "玉",
    "english": "jade",
    "examples": [
      {
        "word": "玉石",
        "english": "jade"
      },
      {
        "word": "玉米",
        "english": "corn"
      }
    ],
    "homophones": [
      "玉",
      "遇",
      "育",
      "欲"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dǎ",
    "base": "da",
    "chinese": "打",
    "english": "hit",
    "examples": [
      {
        "word": "打开",
        "english": "open"
      },
      {
        "word": "打球",
        "english": "play ball"
      }
    ],
    "homophones": [
      "打"
    ],
    "nearPhones": [
      "ta"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhèng",
    "base": "zheng",
    "chinese": "正",
    "english": "correct",
    "examples": [
      {
        "word": "正门",
        "english": "front gate"
      },
      {
        "word": "正好",
        "english": "just right"
      }
    ],
    "homophones": [
      "正",
      "证",
      "政"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qù",
    "base": "qu",
    "chinese": "去",
    "english": "go",
    "examples": [
      {
        "word": "回去",
        "english": "go back"
      },
      {
        "word": "下去",
        "english": "go down"
      }
    ],
    "homophones": [
      "去"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gǔ",
    "base": "gu",
    "chinese": "古",
    "english": "ancient",
    "examples": [
      {
        "word": "古老",
        "english": "ancient"
      },
      {
        "word": "古诗",
        "english": "old poem"
      }
    ],
    "homophones": [
      "古",
      "骨",
      "谷"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "běn",
    "base": "ben",
    "chinese": "本",
    "english": "root",
    "examples": [
      {
        "word": "本子",
        "english": "notebook"
      },
      {
        "word": "书本",
        "english": "book"
      }
    ],
    "homophones": [
      "本"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "kě",
    "base": "ke",
    "chinese": "可",
    "english": "can",
    "examples": [
      {
        "word": "可以",
        "english": "can"
      },
      {
        "word": "可爱",
        "english": "lovely"
      }
    ],
    "homophones": [
      "可"
    ],
    "nearPhones": [
      "ge"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zuǒ",
    "base": "zuo",
    "chinese": "左",
    "english": "left",
    "examples": [
      {
        "word": "左手",
        "english": "left hand"
      }
    ],
    "homophones": [
      "左"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "píng",
    "base": "ping",
    "chinese": "平",
    "english": "flat",
    "examples": [
      {
        "word": "平地",
        "english": "flat ground"
      },
      {
        "word": "平安",
        "english": "safe"
      }
    ],
    "homophones": [
      "平"
    ],
    "nearPhones": [
      "bing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "běi",
    "base": "bei",
    "chinese": "北",
    "english": "north",
    "examples": [
      {
        "word": "北方",
        "english": "north"
      },
      {
        "word": "北风",
        "english": "north wind"
      }
    ],
    "homophones": [
      "北"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dàn",
    "base": "dan",
    "chinese": "旦",
    "english": "dawn",
    "examples": [
      {
        "word": "元旦",
        "english": "new year day"
      }
    ],
    "homophones": [
      "旦"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "diàn",
    "base": "dian",
    "chinese": "电",
    "english": "electricity",
    "examples": [
      {
        "word": "电灯",
        "english": "lamp"
      },
      {
        "word": "电话",
        "english": "telephone"
      }
    ],
    "homophones": [
      "电",
      "店"
    ],
    "nearPhones": [
      "tian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tián",
    "base": "tian",
    "chinese": "田",
    "english": "field",
    "examples": [
      {
        "word": "田地",
        "english": "field"
      },
      {
        "word": "水田",
        "english": "paddy field"
      }
    ],
    "homophones": [
      "田"
    ],
    "nearPhones": [
      "dian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiào",
    "base": "jiao",
    "chinese": "叫",
    "english": "call",
    "examples": [
      {
        "word": "叫声",
        "english": "call"
      },
      {
        "word": "叫好",
        "english": "cheer"
      }
    ],
    "homophones": [
      "叫",
      "教"
    ],
    "nearPhones": [
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sì",
    "base": "si",
    "chinese": "四",
    "english": "four",
    "examples": [
      {
        "word": "四个",
        "english": "four items"
      },
      {
        "word": "四月",
        "english": "April"
      }
    ],
    "homophones": [
      "四",
      "寺"
    ],
    "nearPhones": [
      "shi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shēng",
    "base": "sheng",
    "chinese": "生",
    "english": "life",
    "examples": [
      {
        "word": "生日",
        "english": "birthday"
      },
      {
        "word": "生活",
        "english": "life"
      }
    ],
    "homophones": [
      "生",
      "声"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hé",
    "base": "he",
    "chinese": "禾",
    "english": "grain",
    "examples": [
      {
        "word": "禾田",
        "english": "grain field"
      }
    ],
    "homophones": [
      "禾",
      "合",
      "和",
      "河",
      "何"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "men",
    "base": "men",
    "chinese": "们",
    "english": "plural",
    "examples": [
      {
        "word": "我们",
        "english": "we"
      },
      {
        "word": "你们",
        "english": "you all"
      }
    ],
    "homophones": [
      "们"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bái",
    "base": "bai",
    "chinese": "白",
    "english": "white",
    "examples": [
      {
        "word": "白云",
        "english": "white cloud"
      },
      {
        "word": "白天",
        "english": "daytime"
      }
    ],
    "homophones": [
      "白"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tā",
    "base": "ta",
    "chinese": "他",
    "english": "he",
    "examples": [
      {
        "word": "他们",
        "english": "they"
      },
      {
        "word": "他人",
        "english": "other person"
      }
    ],
    "homophones": [
      "他",
      "她"
    ],
    "nearPhones": [
      "da"
    ]
  }),
  createPinyinEntry({
    "pinyin": "guā",
    "base": "gua",
    "chinese": "瓜",
    "english": "melon",
    "examples": [
      {
        "word": "西瓜",
        "english": "watermelon"
      },
      {
        "word": "瓜果",
        "english": "melon and fruit"
      }
    ],
    "homophones": [
      "瓜"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yòng",
    "base": "yong",
    "chinese": "用",
    "english": "use",
    "examples": [
      {
        "word": "有用",
        "english": "useful"
      },
      {
        "word": "用心",
        "english": "attentive"
      }
    ],
    "homophones": [
      "用"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cè",
    "base": "ce",
    "chinese": "册",
    "english": "booklet",
    "examples": [
      {
        "word": "画册",
        "english": "picture book"
      },
      {
        "word": "手册",
        "english": "handbook"
      }
    ],
    "homophones": [
      "册"
    ],
    "nearPhones": [
      "che"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wài",
    "base": "wai",
    "chinese": "外",
    "english": "outside",
    "examples": [
      {
        "word": "外面",
        "english": "outside"
      },
      {
        "word": "外衣",
        "english": "coat"
      }
    ],
    "homophones": [
      "外"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dōng",
    "base": "dong",
    "chinese": "冬",
    "english": "winter",
    "examples": [
      {
        "word": "冬天",
        "english": "winter"
      },
      {
        "word": "冬衣",
        "english": "winter clothes"
      }
    ],
    "homophones": [
      "冬",
      "东"
    ],
    "nearPhones": [
      "tong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "niǎo",
    "base": "niao",
    "chinese": "鸟",
    "english": "bird",
    "examples": [
      {
        "word": "小鸟",
        "english": "little bird"
      },
      {
        "word": "鸟儿",
        "english": "bird"
      }
    ],
    "homophones": [
      "鸟"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bāo",
    "base": "bao",
    "chinese": "包",
    "english": "bag",
    "examples": [
      {
        "word": "书包",
        "english": "school bag"
      },
      {
        "word": "包子",
        "english": "bun"
      }
    ],
    "homophones": [
      "包"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhǔ",
    "base": "zhu",
    "chinese": "主",
    "english": "main",
    "examples": [
      {
        "word": "主人",
        "english": "host"
      },
      {
        "word": "主要",
        "english": "main"
      }
    ],
    "homophones": [
      "主"
    ],
    "nearPhones": [
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "市",
    "english": "market",
    "examples": [
      {
        "word": "市场",
        "english": "market"
      },
      {
        "word": "城市",
        "english": "city"
      }
    ],
    "homophones": [
      "市",
      "是",
      "事",
      "试",
      "室",
      "式"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bàn",
    "base": "ban",
    "chinese": "半",
    "english": "half",
    "examples": [
      {
        "word": "半天",
        "english": "half day"
      },
      {
        "word": "一半",
        "english": "half"
      }
    ],
    "homophones": [
      "半"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "ràng",
    "base": "rang",
    "chinese": "让",
    "english": "let",
    "examples": [
      {
        "word": "让开",
        "english": "make way"
      },
      {
        "word": "让路",
        "english": "give way"
      }
    ],
    "homophones": [
      "让"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chū",
    "base": "chu",
    "chinese": "出",
    "english": "go out",
    "examples": [
      {
        "word": "出去",
        "english": "go out"
      },
      {
        "word": "出门",
        "english": "leave home"
      }
    ],
    "homophones": [
      "出",
      "初"
    ],
    "nearPhones": [
      "zhu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nǎi",
    "base": "nai",
    "chinese": "奶",
    "english": "milk",
    "examples": [
      {
        "word": "牛奶",
        "english": "milk"
      },
      {
        "word": "奶奶",
        "english": "grandma"
      }
    ],
    "homophones": [
      "奶"
    ],
    "nearPhones": [
      "lai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiā",
    "base": "jia",
    "chinese": "加",
    "english": "add",
    "examples": [
      {
        "word": "加上",
        "english": "add"
      },
      {
        "word": "加油",
        "english": "cheer up"
      }
    ],
    "homophones": [
      "加",
      "家"
    ],
    "nearPhones": [
      "xia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pí",
    "base": "pi",
    "chinese": "皮",
    "english": "skin",
    "examples": [
      {
        "word": "果皮",
        "english": "peel"
      },
      {
        "word": "皮球",
        "english": "ball"
      }
    ],
    "homophones": [
      "皮"
    ],
    "nearPhones": [
      "bi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mǔ",
    "base": "mu",
    "chinese": "母",
    "english": "mother",
    "examples": [
      {
        "word": "父母",
        "english": "parents"
      },
      {
        "word": "母女",
        "english": "mother and daughter"
      }
    ],
    "homophones": [
      "母"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dòng",
    "base": "dong",
    "chinese": "动",
    "english": "move",
    "examples": [
      {
        "word": "运动",
        "english": "exercise"
      },
      {
        "word": "动手",
        "english": "use hands"
      }
    ],
    "homophones": [
      "动"
    ],
    "nearPhones": [
      "tong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lǎo",
    "base": "lao",
    "chinese": "老",
    "english": "old",
    "examples": [
      {
        "word": "老师",
        "english": "teacher"
      },
      {
        "word": "老人",
        "english": "old person"
      }
    ],
    "homophones": [
      "老"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dì",
    "base": "di",
    "chinese": "地",
    "english": "ground",
    "examples": [
      {
        "word": "地上",
        "english": "on the ground"
      },
      {
        "word": "土地",
        "english": "land"
      }
    ],
    "homophones": [
      "地",
      "第",
      "弟"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "ěr",
    "base": "er",
    "chinese": "耳",
    "english": "ear",
    "examples": [
      {
        "word": "木耳",
        "english": "fungus"
      }
    ],
    "homophones": [
      "耳"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gòng",
    "base": "gong",
    "chinese": "共",
    "english": "together",
    "examples": [
      {
        "word": "共同",
        "english": "together"
      },
      {
        "word": "公共",
        "english": "public"
      }
    ],
    "homophones": [
      "共"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jī",
    "base": "ji",
    "chinese": "机",
    "english": "machine",
    "examples": [
      {
        "word": "飞机",
        "english": "airplane"
      }
    ],
    "homophones": [
      "机",
      "基"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "guò",
    "base": "guo",
    "chinese": "过",
    "english": "pass",
    "examples": [
      {
        "word": "过去",
        "english": "past"
      },
      {
        "word": "走过",
        "english": "walk past"
      }
    ],
    "homophones": [
      "过"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zài",
    "base": "zai",
    "chinese": "在",
    "english": "at",
    "examples": [
      {
        "word": "在家",
        "english": "at home"
      },
      {
        "word": "正在",
        "english": "in progress"
      }
    ],
    "homophones": [
      "在",
      "再"
    ],
    "nearPhones": [
      "cai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bǎi",
    "base": "bai",
    "chinese": "百",
    "english": "hundred",
    "examples": [
      {
        "word": "百米",
        "english": "hundred meters"
      },
      {
        "word": "百花",
        "english": "many flowers"
      }
    ],
    "homophones": [
      "百"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yè",
    "base": "ye",
    "chinese": "页",
    "english": "page",
    "examples": [
      {
        "word": "页面",
        "english": "page"
      },
      {
        "word": "书页",
        "english": "book page"
      }
    ],
    "homophones": [
      "页",
      "夜",
      "业",
      "叶"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guāng",
    "base": "guang",
    "chinese": "光",
    "english": "light",
    "examples": [
      {
        "word": "阳光",
        "english": "sunlight"
      },
      {
        "word": "月光",
        "english": "moonlight"
      }
    ],
    "homophones": [
      "光"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dāng",
    "base": "dang",
    "chinese": "当",
    "english": "be",
    "examples": [
      {
        "word": "当时",
        "english": "at that time"
      },
      {
        "word": "当然",
        "english": "of course"
      }
    ],
    "homophones": [
      "当"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zǎo",
    "base": "zao",
    "chinese": "早",
    "english": "early",
    "examples": [
      {
        "word": "早上",
        "english": "morning"
      },
      {
        "word": "早点",
        "english": "breakfast"
      }
    ],
    "homophones": [
      "早"
    ],
    "nearPhones": [
      "zhao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chóng",
    "base": "chong",
    "chinese": "虫",
    "english": "bug",
    "examples": [
      {
        "word": "虫子",
        "english": "bug"
      },
      {
        "word": "飞虫",
        "english": "flying insect"
      }
    ],
    "homophones": [
      "虫",
      "崇"
    ],
    "nearPhones": [
      "zhong",
      "cong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tóng",
    "base": "tong",
    "chinese": "同",
    "english": "same",
    "examples": [
      {
        "word": "同学",
        "english": "classmate"
      },
      {
        "word": "同心",
        "english": "same heart"
      }
    ],
    "homophones": [
      "同",
      "童"
    ],
    "nearPhones": [
      "dong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chī",
    "base": "chi",
    "chinese": "吃",
    "english": "eat",
    "examples": [
      {
        "word": "吃饭",
        "english": "eat meal"
      },
      {
        "word": "吃水果",
        "english": "eat fruit"
      }
    ],
    "homophones": [
      "吃"
    ],
    "nearPhones": [
      "zhi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huí",
    "base": "hui",
    "chinese": "回",
    "english": "return",
    "examples": [
      {
        "word": "回来",
        "english": "come back"
      },
      {
        "word": "回家",
        "english": "go home"
      }
    ],
    "homophones": [
      "回"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wǎng",
    "base": "wang",
    "chinese": "网",
    "english": "net",
    "examples": [
      {
        "word": "上网",
        "english": "go online"
      }
    ],
    "homophones": [
      "网",
      "往"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "ròu",
    "base": "rou",
    "chinese": "肉",
    "english": "meat",
    "examples": [
      {
        "word": "牛肉",
        "english": "beef"
      },
      {
        "word": "果肉",
        "english": "pulp"
      }
    ],
    "homophones": [
      "肉"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nián",
    "base": "nian",
    "chinese": "年",
    "english": "year",
    "examples": [
      {
        "word": "今年",
        "english": "this year"
      },
      {
        "word": "过年",
        "english": "new year"
      }
    ],
    "homophones": [
      "年"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiān",
    "base": "xian",
    "chinese": "先",
    "english": "first",
    "examples": [
      {
        "word": "先生",
        "english": "teacher"
      },
      {
        "word": "先后",
        "english": "before and after"
      }
    ],
    "homophones": [
      "先",
      "鲜"
    ],
    "nearPhones": [
      "jian",
      "qian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhú",
    "base": "zhu",
    "chinese": "竹",
    "english": "bamboo",
    "examples": [
      {
        "word": "竹子",
        "english": "bamboo"
      },
      {
        "word": "竹林",
        "english": "bamboo grove"
      }
    ],
    "homophones": [
      "竹"
    ],
    "nearPhones": [
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zì",
    "base": "zi",
    "chinese": "自",
    "english": "self",
    "examples": [
      {
        "word": "自己",
        "english": "self"
      },
      {
        "word": "自习",
        "english": "self study"
      }
    ],
    "homophones": [
      "自",
      "字"
    ],
    "nearPhones": [
      "zhi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiàng",
    "base": "xiang",
    "chinese": "向",
    "english": "toward",
    "examples": [
      {
        "word": "向上",
        "english": "upward"
      },
      {
        "word": "方向",
        "english": "direction"
      }
    ],
    "homophones": [
      "向"
    ],
    "nearPhones": [
      "jiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hòu",
    "base": "hou",
    "chinese": "后",
    "english": "after",
    "examples": [
      {
        "word": "后面",
        "english": "behind"
      },
      {
        "word": "后来",
        "english": "later"
      }
    ],
    "homophones": [
      "后",
      "厚"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xíng",
    "base": "xing",
    "chinese": "行",
    "english": "go",
    "examples": [
      {
        "word": "行走",
        "english": "walk"
      },
      {
        "word": "行人",
        "english": "pedestrian"
      }
    ],
    "homophones": [
      "行",
      "形"
    ],
    "nearPhones": [
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "quán",
    "base": "quan",
    "chinese": "全",
    "english": "whole",
    "examples": [
      {
        "word": "全家",
        "english": "whole family"
      },
      {
        "word": "安全",
        "english": "safety"
      }
    ],
    "homophones": [
      "全",
      "泉",
      "权"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huì",
    "base": "hui",
    "chinese": "会",
    "english": "can",
    "examples": [
      {
        "word": "会画",
        "english": "can draw"
      },
      {
        "word": "会写",
        "english": "can write"
      }
    ],
    "homophones": [
      "会",
      "惠"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yé",
    "base": "ye",
    "chinese": "爷",
    "english": "grandpa",
    "examples": [
      {
        "word": "爷爷",
        "english": "grandpa"
      },
      {
        "word": "老爷",
        "english": "master"
      }
    ],
    "homophones": [
      "爷"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "duō",
    "base": "duo",
    "chinese": "多",
    "english": "many",
    "examples": [
      {
        "word": "多少",
        "english": "how many"
      },
      {
        "word": "多云",
        "english": "cloudy"
      }
    ],
    "homophones": [
      "多"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bīng",
    "base": "bing",
    "chinese": "冰",
    "english": "ice",
    "examples": [
      {
        "word": "冰水",
        "english": "ice water"
      }
    ],
    "homophones": [
      "冰",
      "兵"
    ],
    "nearPhones": [
      "ping"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiāo",
    "base": "jiao",
    "chinese": "交",
    "english": "make friends",
    "examples": [
      {
        "word": "交朋友",
        "english": "make friends"
      },
      {
        "word": "交流",
        "english": "communicate"
      }
    ],
    "homophones": [
      "交"
    ],
    "nearPhones": [
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wèn",
    "base": "wen",
    "chinese": "问",
    "english": "ask",
    "examples": [
      {
        "word": "问好",
        "english": "greet"
      }
    ],
    "homophones": [
      "问"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yáng",
    "base": "yang",
    "chinese": "羊",
    "english": "sheep",
    "examples": [
      {
        "word": "山羊",
        "english": "goat"
      }
    ],
    "homophones": [
      "羊",
      "阳",
      "洋",
      "扬"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guān",
    "base": "guan",
    "chinese": "关",
    "english": "close",
    "examples": [
      {
        "word": "关门",
        "english": "close door"
      },
      {
        "word": "关灯",
        "english": "turn off light"
      }
    ],
    "homophones": [
      "关",
      "官",
      "观"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mǐ",
    "base": "mi",
    "chinese": "米",
    "english": "rice",
    "examples": [
      {
        "word": "大米",
        "english": "rice"
      },
      {
        "word": "玉米",
        "english": "corn"
      }
    ],
    "homophones": [
      "米"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dēng",
    "base": "deng",
    "chinese": "灯",
    "english": "lamp",
    "examples": [
      {
        "word": "电灯",
        "english": "electric lamp"
      }
    ],
    "homophones": [
      "灯",
      "登"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiāng",
    "base": "jiang",
    "chinese": "江",
    "english": "river",
    "examples": [
      {
        "word": "江水",
        "english": "river water"
      },
      {
        "word": "长江",
        "english": "Yangtze River"
      }
    ],
    "homophones": [
      "江",
      "将"
    ],
    "nearPhones": [
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yīn",
    "base": "yin",
    "chinese": "阴",
    "english": "shade",
    "examples": [
      {
        "word": "阴天",
        "english": "cloudy day"
      },
      {
        "word": "树阴",
        "english": "shade"
      }
    ],
    "homophones": [
      "阴",
      "因",
      "音"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hǎo",
    "base": "hao",
    "chinese": "好",
    "english": "good",
    "examples": [
      {
        "word": "好看",
        "english": "good looking"
      },
      {
        "word": "好人",
        "english": "good person"
      }
    ],
    "homophones": [
      "好"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mā",
    "base": "ma",
    "chinese": "妈",
    "english": "mom",
    "examples": [
      {
        "word": "妈妈",
        "english": "mom"
      }
    ],
    "homophones": [
      "妈"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǔ",
    "base": "yu",
    "chinese": "羽",
    "english": "feather",
    "examples": [
      {
        "word": "羽毛",
        "english": "feather"
      },
      {
        "word": "羽衣",
        "english": "feather coat"
      }
    ],
    "homophones": [
      "羽",
      "雨",
      "与",
      "语"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hóng",
    "base": "hong",
    "chinese": "红",
    "english": "red",
    "examples": [
      {
        "word": "红花",
        "english": "red flower"
      },
      {
        "word": "红色",
        "english": "red color"
      }
    ],
    "homophones": [
      "红"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jìn",
    "base": "jin",
    "chinese": "进",
    "english": "enter",
    "examples": [
      {
        "word": "进去",
        "english": "go in"
      },
      {
        "word": "进门",
        "english": "enter door"
      }
    ],
    "homophones": [
      "进",
      "近",
      "禁"
    ],
    "nearPhones": [
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuǎn",
    "base": "yuan",
    "chinese": "远",
    "english": "far",
    "examples": [
      {
        "word": "远方",
        "english": "far away"
      },
      {
        "word": "远近",
        "english": "distance"
      }
    ],
    "homophones": [
      "远"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zǒu",
    "base": "zou",
    "chinese": "走",
    "english": "walk",
    "examples": [
      {
        "word": "走路",
        "english": "walk"
      },
      {
        "word": "行走",
        "english": "go on foot"
      }
    ],
    "homophones": [
      "走"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huā",
    "base": "hua",
    "chinese": "花",
    "english": "flower",
    "examples": [
      {
        "word": "红花",
        "english": "red flower"
      }
    ],
    "homophones": [
      "花"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lái",
    "base": "lai",
    "chinese": "来",
    "english": "come",
    "examples": [
      {
        "word": "回来",
        "english": "come back"
      },
      {
        "word": "来到",
        "english": "come to"
      }
    ],
    "homophones": [
      "来"
    ],
    "nearPhones": [
      "nai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lǐ",
    "base": "li",
    "chinese": "里",
    "english": "inside",
    "examples": [
      {
        "word": "里面",
        "english": "inside"
      }
    ],
    "homophones": [
      "里",
      "礼",
      "理"
    ],
    "nearPhones": [
      "ni",
      "ri"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tīng",
    "base": "ting",
    "chinese": "听",
    "english": "listen",
    "examples": [
      {
        "word": "听见",
        "english": "hear"
      },
      {
        "word": "听话",
        "english": "listen well"
      }
    ],
    "homophones": [
      "听"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wǒ",
    "base": "wo",
    "chinese": "我",
    "english": "I",
    "examples": [
      {
        "word": "我们",
        "english": "we"
      },
      {
        "word": "我的",
        "english": "my"
      }
    ],
    "homophones": [
      "我"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nǐ",
    "base": "ni",
    "chinese": "你",
    "english": "you",
    "examples": [
      {
        "word": "你好",
        "english": "hello"
      },
      {
        "word": "你们",
        "english": "you all"
      }
    ],
    "homophones": [
      "你"
    ],
    "nearPhones": [
      "li"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fàn",
    "base": "fan",
    "chinese": "饭",
    "english": "meal",
    "examples": [
      {
        "word": "米饭",
        "english": "rice"
      },
      {
        "word": "吃饭",
        "english": "eat meal"
      }
    ],
    "homophones": [
      "饭"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chuáng",
    "base": "chuang",
    "chinese": "床",
    "english": "bed",
    "examples": [
      {
        "word": "小床",
        "english": "small bed"
      },
      {
        "word": "床单",
        "english": "bed sheet"
      }
    ],
    "homophones": [
      "床"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiān",
    "base": "jian",
    "chinese": "间",
    "english": "room",
    "examples": [
      {
        "word": "中间",
        "english": "middle"
      }
    ],
    "homophones": [
      "间",
      "坚"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wán",
    "base": "wan",
    "chinese": "玩",
    "english": "play",
    "examples": [
      {
        "word": "玩水",
        "english": "play with water"
      }
    ],
    "homophones": [
      "玩",
      "完"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qīng",
    "base": "qing",
    "chinese": "青",
    "english": "green-blue",
    "examples": [
      {
        "word": "青草",
        "english": "green grass"
      },
      {
        "word": "青山",
        "english": "green mountain"
      }
    ],
    "homophones": [
      "青",
      "轻",
      "清"
    ],
    "nearPhones": [
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "guǒ",
    "base": "guo",
    "chinese": "果",
    "english": "fruit",
    "examples": [
      {
        "word": "水果",
        "english": "fruit"
      }
    ],
    "homophones": [
      "果"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guó",
    "base": "guo",
    "chinese": "国",
    "english": "country",
    "examples": [
      {
        "word": "中国",
        "english": "China"
      },
      {
        "word": "国家",
        "english": "country"
      }
    ],
    "homophones": [
      "国"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "míng",
    "base": "ming",
    "chinese": "明",
    "english": "bright",
    "examples": [
      {
        "word": "明天",
        "english": "tomorrow"
      }
    ],
    "homophones": [
      "明",
      "名"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bà",
    "base": "ba",
    "chinese": "爸",
    "english": "dad",
    "examples": [
      {
        "word": "爸爸",
        "english": "dad"
      },
      {
        "word": "老爸",
        "english": "father"
      }
    ],
    "homophones": [
      "爸"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "péng",
    "base": "peng",
    "chinese": "朋",
    "english": "friend",
    "examples": [
      {
        "word": "朋友",
        "english": "friend"
      },
      {
        "word": "亲朋",
        "english": "relatives and friends"
      }
    ],
    "homophones": [
      "朋"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yú",
    "base": "yu",
    "chinese": "鱼",
    "english": "fish",
    "examples": [
      {
        "word": "小鱼",
        "english": "small fish"
      },
      {
        "word": "金鱼",
        "english": "goldfish"
      }
    ],
    "homophones": [
      "鱼",
      "余"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gǒu",
    "base": "gou",
    "chinese": "狗",
    "english": "dog",
    "examples": [
      {
        "word": "小狗",
        "english": "puppy"
      },
      {
        "word": "狗叫",
        "english": "dog bark"
      }
    ],
    "homophones": [
      "狗"
    ],
    "nearPhones": [
      "kou"
    ]
  })
];
