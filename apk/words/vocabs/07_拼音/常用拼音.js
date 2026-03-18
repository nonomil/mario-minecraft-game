function createPinyinEntry({
  pinyin,
  base,
  chinese,
  english,
  gradeBand = "",
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
    gradeBand,
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
    "pinyin": "yī",
    "base": "yi",
    "chinese": "一",
    "english": "one",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "zhang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qī",
    "base": "qi",
    "chinese": "七",
    "english": "seven",
    "gradeBand": "学前",
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
      "期"
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
    "gradeBand": "学前",
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
    "pinyin": "bā",
    "base": "ba",
    "chinese": "八",
    "english": "eight",
    "gradeBand": "学前",
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
    "pinyin": "rén",
    "base": "ren",
    "chinese": "人",
    "english": "person",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "lu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jǐ",
    "base": "ji",
    "chinese": "几",
    "english": "how many",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "le",
    "base": "le",
    "chinese": "了",
    "english": "done",
    "gradeBand": "学前",
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
    "nearPhones": [
      "re"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dāo",
    "base": "dao",
    "chinese": "刀",
    "english": "knife",
    "gradeBand": "学前",
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
    "nearPhones": [
      "tao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lì",
    "base": "li",
    "chinese": "力",
    "english": "strength",
    "gradeBand": "学前",
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
      "利"
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "干衣",
        "english": "dry clothes"
      }
    ],
    "homophones": [
      "干"
    ],
    "nearPhones": [
      "kan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gōng",
    "base": "gong",
    "chinese": "工",
    "english": "work",
    "gradeBand": "学前",
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
    "nearPhones": [
      "kong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tǔ",
    "base": "tu",
    "chinese": "土",
    "english": "earth",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "土地",
        "english": "land"
      }
    ],
    "homophones": [
      "土"
    ],
    "nearPhones": [
      "du"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cái",
    "base": "cai",
    "chinese": "才",
    "english": "talent",
    "gradeBand": "学前",
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
      "材"
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "jiao",
      "qiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kǒu",
    "base": "kou",
    "chinese": "口",
    "english": "mouth",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiān",
    "base": "qian",
    "chinese": "千",
    "english": "thousand",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "pinyin": "jǐ",
    "base": "ji",
    "chinese": "己",
    "english": "self",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "自己",
        "english": "self"
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
    "pinyin": "zǐ",
    "base": "zi",
    "chinese": "子",
    "english": "child",
    "gradeBand": "学前",
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
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yě",
    "base": "ye",
    "chinese": "也",
    "english": "also",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "lü"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fēi",
    "base": "fei",
    "chinese": "飞",
    "english": "fly",
    "gradeBand": "学前",
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
    "nearPhones": [
      "hei"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xí",
    "base": "xi",
    "chinese": "习",
    "english": "practice",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "王"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "kāi",
    "base": "kai",
    "chinese": "开",
    "english": "open",
    "gradeBand": "学前",
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
    "nearPhones": [
      "gai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tiān",
    "base": "tian",
    "chinese": "天",
    "english": "sky",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "舞"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bù",
    "base": "bu",
    "chinese": "不",
    "english": "not",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "dai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǒu",
    "base": "you",
    "chinese": "友",
    "english": "friend",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "zhe",
      "ce"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yá",
    "base": "ya",
    "chinese": "牙",
    "english": "tooth",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "刷牙",
        "english": "brush teeth"
      }
    ],
    "homophones": [
      "牙",
      "芽"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bǐ",
    "base": "bi",
    "chinese": "比",
    "english": "compare",
    "gradeBand": "学前",
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
      "笔"
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "jie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǐ",
    "base": "zhi",
    "chinese": "止",
    "english": "stop",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "贝",
        "english": "shell"
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "lei"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuǐ",
    "base": "shui",
    "chinese": "水",
    "english": "water",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "水果",
        "english": "fruit"
      }
    ],
    "homophones": [
      "水"
    ],
    "nearPhones": [
      "sui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiàn",
    "base": "jian",
    "chinese": "见",
    "english": "see",
    "gradeBand": "学前",
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
      "建",
      "健"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wǔ",
    "base": "wu",
    "chinese": "午",
    "english": "noon",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "上午",
        "english": "morning"
      },
      {
        "word": "中午",
        "english": "noon"
      }
    ],
    "homophones": [
      "五",
      "午",
      "舞"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "niú",
    "base": "niu",
    "chinese": "牛",
    "english": "cow",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "zhang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "piàn",
    "base": "pian",
    "chinese": "片",
    "english": "slice",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "叶片",
        "english": "leaf blade"
      }
    ],
    "homophones": [
      "片"
    ],
    "nearPhones": [
      "bian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǎo",
    "base": "zhao",
    "chinese": "爪",
    "english": "claw",
    "gradeBand": "学前",
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
      "zao",
      "chao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fǎn",
    "base": "fan",
    "chinese": "反",
    "english": "opposite",
    "gradeBand": "学前",
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
    "nearPhones": [
      "han"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fù",
    "base": "fu",
    "chinese": "父",
    "english": "father",
    "gradeBand": "学前",
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
      "富"
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
    "gradeBand": "学前",
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
    "pinyin": "jīn",
    "base": "jin",
    "chinese": "今",
    "english": "today",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "今天",
        "english": "today"
      },
      {
        "word": "今早",
        "english": "this morning"
      }
    ],
    "homophones": [
      "巾",
      "今",
      "金"
    ],
    "nearPhones": [
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fēn",
    "base": "fen",
    "chinese": "分",
    "english": "divide",
    "gradeBand": "学前",
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
    "nearPhones": [
      "hen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gōng",
    "base": "gong",
    "chinese": "公",
    "english": "public",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "公园",
        "english": "park"
      },
      {
        "word": "公共",
        "english": "public"
      }
    ],
    "homophones": [
      "工",
      "公",
      "功",
      "弓"
    ],
    "nearPhones": [
      "kong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuè",
    "base": "yue",
    "chinese": "月",
    "english": "moon",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "jin",
      "qin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuāng",
    "base": "shuang",
    "chinese": "双",
    "english": "pair",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "su"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yù",
    "base": "yu",
    "chinese": "玉",
    "english": "jade",
    "gradeBand": "学前",
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
      "育"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dǎ",
    "base": "da",
    "chinese": "打",
    "english": "hit",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "证"
    ],
    "nearPhones": [
      "zeng",
      "cheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qù",
    "base": "qu",
    "chinese": "去",
    "english": "go",
    "gradeBand": "学前",
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
    "nearPhones": [
      "ju",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gǔ",
    "base": "gu",
    "chinese": "古",
    "english": "ancient",
    "gradeBand": "学前",
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
    "nearPhones": [
      "ku"
    ]
  }),
  createPinyinEntry({
    "pinyin": "běn",
    "base": "ben",
    "chinese": "本",
    "english": "root",
    "gradeBand": "学前",
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
    "nearPhones": [
      "pen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kě",
    "base": "ke",
    "chinese": "可",
    "english": "can",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "左手",
        "english": "left hand"
      }
    ],
    "homophones": [
      "左"
    ],
    "nearPhones": [
      "zhuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shí",
    "base": "shi",
    "chinese": "石",
    "english": "stone",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "石头",
        "english": "stone"
      },
      {
        "word": "石子",
        "english": "pebble"
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
    "pinyin": "yòu",
    "base": "you",
    "chinese": "右",
    "english": "right",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "右手",
        "english": "right hand"
      }
    ],
    "homophones": [
      "又",
      "右"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "píng",
    "base": "ping",
    "chinese": "平",
    "english": "flat",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "元旦",
        "english": "new year day"
      }
    ],
    "homophones": [
      "旦"
    ],
    "nearPhones": [
      "tan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mù",
    "base": "mu",
    "chinese": "目",
    "english": "eye",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "目光",
        "english": "gaze"
      }
    ],
    "homophones": [
      "木",
      "目"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "diàn",
    "base": "dian",
    "chinese": "电",
    "english": "electricity",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "qiao",
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sì",
    "base": "si",
    "chinese": "四",
    "english": "four",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "禾苗",
        "english": "seedling"
      },
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "pai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tā",
    "base": "ta",
    "chinese": "他",
    "english": "he",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "che",
      "ze"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wài",
    "base": "wai",
    "chinese": "外",
    "english": "outside",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "liao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bāo",
    "base": "bao",
    "chinese": "包",
    "english": "bag",
    "gradeBand": "学前",
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
    "nearPhones": [
      "pao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǔ",
    "base": "zhu",
    "chinese": "主",
    "english": "main",
    "gradeBand": "学前",
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
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "市",
    "english": "market",
    "gradeBand": "学前",
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
    "pinyin": "lì",
    "base": "li",
    "chinese": "立",
    "english": "stand",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "立正",
        "english": "stand straight"
      }
    ],
    "homophones": [
      "力",
      "立",
      "利"
    ],
    "nearPhones": [
      "ni",
      "ri"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bàn",
    "base": "ban",
    "chinese": "半",
    "english": "half",
    "gradeBand": "学前",
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
    "nearPhones": [
      "pan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ràng",
    "base": "rang",
    "chinese": "让",
    "english": "let",
    "gradeBand": "学前",
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
    "nearPhones": [
      "lang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chū",
    "base": "chu",
    "chinese": "出",
    "english": "go out",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "家",
      "夹"
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "nao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dì",
    "base": "di",
    "chinese": "地",
    "english": "ground",
    "gradeBand": "学前",
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
    "nearPhones": [
      "ti"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ěr",
    "base": "er",
    "chinese": "耳",
    "english": "ear",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "kong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jī",
    "base": "ji",
    "chinese": "机",
    "english": "machine",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "飞机",
        "english": "airplane"
      }
    ],
    "homophones": [
      "机"
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "pai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǒu",
    "base": "you",
    "chinese": "有",
    "english": "have",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "有用",
        "english": "useful"
      },
      {
        "word": "有时",
        "english": "sometimes"
      }
    ],
    "homophones": [
      "友",
      "有"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yè",
    "base": "ye",
    "chinese": "页",
    "english": "page",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "tang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zǎo",
    "base": "zao",
    "chinese": "早",
    "english": "early",
    "gradeBand": "学前",
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
      "zhao",
      "cao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chóng",
    "base": "chong",
    "chinese": "虫",
    "english": "bug",
    "gradeBand": "学前",
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
      "虫"
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huí",
    "base": "hui",
    "chinese": "回",
    "english": "return",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "lou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nián",
    "base": "nian",
    "chinese": "年",
    "english": "year",
    "gradeBand": "学前",
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
    "nearPhones": [
      "lian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiān",
    "base": "xian",
    "chinese": "先",
    "english": "first",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zì",
    "base": "zi",
    "chinese": "自",
    "english": "self",
    "gradeBand": "学前",
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
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiàng",
    "base": "xiang",
    "chinese": "向",
    "english": "toward",
    "gradeBand": "学前",
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
      "jiang",
      "qiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hòu",
    "base": "hou",
    "chinese": "后",
    "english": "after",
    "gradeBand": "学前",
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
    "nearPhones": [
      "fou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xíng",
    "base": "xing",
    "chinese": "行",
    "english": "go",
    "gradeBand": "学前",
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
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "quán",
    "base": "quan",
    "chinese": "全",
    "english": "whole",
    "gradeBand": "学前",
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
    "nearPhones": [
      "juan",
      "xuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huì",
    "base": "hui",
    "chinese": "会",
    "english": "can",
    "gradeBand": "学前",
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
      "会"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hé",
    "base": "he",
    "chinese": "合",
    "english": "join",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "合作",
        "english": "cooperate"
      },
      {
        "word": "合上",
        "english": "close together"
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
    "pinyin": "yé",
    "base": "ye",
    "chinese": "爷",
    "english": "grandpa",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "tuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bīng",
    "base": "bing",
    "chinese": "冰",
    "english": "ice",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "qiao",
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yī",
    "base": "yi",
    "chinese": "衣",
    "english": "clothes",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "衣服",
        "english": "clothes"
      },
      {
        "word": "上衣",
        "english": "coat"
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
    "pinyin": "wèn",
    "base": "wen",
    "chinese": "问",
    "english": "ask",
    "gradeBand": "学前",
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
    "pinyin": "zì",
    "base": "zi",
    "chinese": "字",
    "english": "character",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "汉字",
        "english": "Chinese character"
      },
      {
        "word": "写字",
        "english": "write characters"
      }
    ],
    "homophones": [
      "自",
      "字"
    ],
    "nearPhones": [
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yáng",
    "base": "yang",
    "chinese": "羊",
    "english": "sheep",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "qiang",
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yáng",
    "base": "yang",
    "chinese": "阳",
    "english": "sun",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "太阳",
        "english": "sun"
      },
      {
        "word": "阳光",
        "english": "sunlight"
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
    "pinyin": "yīn",
    "base": "yin",
    "chinese": "阴",
    "english": "shade",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "pinyin": "tā",
    "base": "ta",
    "chinese": "她",
    "english": "she",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "她们",
        "english": "they"
      },
      {
        "word": "她的",
        "english": "her"
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
    "pinyin": "mā",
    "base": "ma",
    "chinese": "妈",
    "english": "mom",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuǎn",
    "base": "yuan",
    "chinese": "远",
    "english": "far",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "pinyin": "shí",
    "base": "shi",
    "chinese": "时",
    "english": "time",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "时间",
        "english": "time"
      },
      {
        "word": "有时",
        "english": "sometimes"
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
    "pinyin": "lǐ",
    "base": "li",
    "chinese": "里",
    "english": "inside",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "ding"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wǒ",
    "base": "wo",
    "chinese": "我",
    "english": "I",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "nearPhones": [
      "han"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chuáng",
    "base": "chuang",
    "chinese": "床",
    "english": "bed",
    "gradeBand": "学前",
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
    "nearPhones": [
      "zhuang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiān",
    "base": "jian",
    "chinese": "间",
    "english": "room",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
    "examples": [
      {
        "word": "玩",
        "english": "play"
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
    "gradeBand": "学前",
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
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǔ",
    "base": "yu",
    "chinese": "雨",
    "english": "rain",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "下雨",
        "english": "rain"
      },
      {
        "word": "雨衣",
        "english": "raincoat"
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
    "pinyin": "guǒ",
    "base": "guo",
    "chinese": "果",
    "english": "fruit",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "pinyin": "hé",
    "base": "he",
    "chinese": "和",
    "english": "together",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "和好",
        "english": "make up"
      },
      {
        "word": "和气",
        "english": "kindness"
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
    "pinyin": "bà",
    "base": "ba",
    "chinese": "爸",
    "english": "dad",
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
    "gradeBand": "学前",
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
  }),
  createPinyinEntry({
    "pinyin": "xué",
    "base": "xue",
    "chinese": "学",
    "english": "learn",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "学习",
        "english": "study"
      },
      {
        "word": "学校",
        "english": "school"
      }
    ],
    "homophones": [
      "学"
    ],
    "nearPhones": [
      "jue"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiā",
    "base": "jia",
    "chinese": "家",
    "english": "home",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "回家",
        "english": "go home"
      },
      {
        "word": "家人",
        "english": "family"
      }
    ],
    "homophones": [
      "加",
      "家",
      "夹"
    ],
    "nearPhones": [
      "xia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "māo",
    "base": "mao",
    "chinese": "猫",
    "english": "cat",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "小猫",
        "english": "kitten"
      }
    ],
    "homophones": [
      "猫"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "de",
    "base": "de",
    "chinese": "的",
    "english": "possessive",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "别的",
        "english": "else"
      }
    ],
    "homophones": [
      "的"
    ],
    "nearPhones": [
      "te"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "是",
    "english": "be",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "是",
        "english": "be"
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
    "pinyin": "jiù",
    "base": "jiu",
    "chinese": "就",
    "english": "then",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "就要",
        "english": "will"
      }
    ],
    "homophones": [
      "就",
      "救",
      "旧"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yào",
    "base": "yao",
    "chinese": "要",
    "english": "want",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "想要",
        "english": "want"
      }
    ],
    "homophones": [
      "要",
      "药"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shuō",
    "base": "shuo",
    "chinese": "说",
    "english": "to persuade",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "说话",
        "english": "to speak"
      }
    ],
    "homophones": [
      "说"
    ],
    "nearPhones": [
      "suo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dōu",
    "base": "dou",
    "chinese": "都",
    "english": "all",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "全都",
        "english": "all"
      }
    ],
    "homophones": [
      "都"
    ],
    "nearPhones": [
      "tou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "duì",
    "base": "dui",
    "chinese": "对",
    "english": "right",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "不对",
        "english": "incorrect"
      }
    ],
    "homophones": [
      "对"
    ],
    "nearPhones": [
      "tui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dào",
    "base": "dao",
    "chinese": "到",
    "english": "arrive",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "看到",
        "english": "to see"
      }
    ],
    "homophones": [
      "到",
      "道"
    ],
    "nearPhones": [
      "tao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhe",
    "base": "zhe",
    "chinese": "着",
    "english": "ongoing",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "看着",
        "english": "looking at"
      }
    ],
    "homophones": [
      "着",
      "著"
    ],
    "nearPhones": [
      "ze",
      "che"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiǎng",
    "base": "xiang",
    "chinese": "想",
    "english": "to think",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "想到",
        "english": "to think of"
      }
    ],
    "homophones": [
      "想"
    ],
    "nearPhones": [
      "jiang",
      "qiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "néng",
    "base": "neng",
    "chinese": "能",
    "english": "can",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "能力",
        "english": "ability"
      }
    ],
    "homophones": [
      "能"
    ],
    "nearPhones": [
      "leng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gěi",
    "base": "gei",
    "chinese": "给",
    "english": "give",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "送给",
        "english": "give to"
      }
    ],
    "homophones": [
      "给"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "kàn",
    "base": "kan",
    "chinese": "看",
    "english": "to look after",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "看到",
        "english": "to see"
      }
    ],
    "homophones": [
      "看"
    ],
    "nearPhones": [
      "gan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "diǎn",
    "base": "dian",
    "chinese": "点",
    "english": "point",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "地点",
        "english": "place"
      }
    ],
    "homophones": [
      "点"
    ],
    "nearPhones": [
      "tian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhēn",
    "base": "zhen",
    "chinese": "真",
    "english": "really",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "真的",
        "english": "really"
      }
    ],
    "homophones": [
      "真",
      "针"
    ],
    "nearPhones": [
      "chen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "liǎng",
    "base": "liang",
    "chinese": "两",
    "english": "two",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "两个",
        "english": "two items"
      }
    ],
    "homophones": [
      "两"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "děng",
    "base": "deng",
    "chinese": "等",
    "english": "wait",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "等待",
        "english": "wait"
      }
    ],
    "homophones": [
      "等"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zuì",
    "base": "zui",
    "chinese": "最",
    "english": "most",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "最后",
        "english": "final"
      }
    ],
    "homophones": [
      "最",
      "罪"
    ],
    "nearPhones": [
      "zhui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zài",
    "base": "zai",
    "chinese": "再",
    "english": "again",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "再见",
        "english": "goodbye"
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
    "pinyin": "cì",
    "base": "ci",
    "chinese": "次",
    "english": "time",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "每次",
        "english": "every time"
      }
    ],
    "homophones": [
      "次"
    ],
    "nearPhones": [
      "chi",
      "zi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "事",
    "english": "matter",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "事情",
        "english": "affair"
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
    "pinyin": "qián",
    "base": "qian",
    "chinese": "前",
    "english": "front",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "前天",
        "english": "the day before yesterday"
      }
    ],
    "homophones": [
      "前",
      "钱"
    ],
    "nearPhones": [
      "jian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ài",
    "base": "ai",
    "chinese": "爱",
    "english": "to love",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "爱好",
        "english": "to like"
      }
    ],
    "homophones": [
      "爱"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shuí",
    "base": "shui",
    "chinese": "谁",
    "english": "who",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "谁",
        "english": "who"
      }
    ],
    "homophones": [
      "谁"
    ],
    "nearPhones": [
      "sui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xīn",
    "base": "xin",
    "chinese": "新",
    "english": "abbr. for Xinjiang 疆 or Singapore",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "新年",
        "english": "New Year"
      }
    ],
    "homophones": [
      "心",
      "新",
      "辛"
    ],
    "nearPhones": [
      "jin",
      "qin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kuài",
    "base": "kuai",
    "chinese": "快",
    "english": "rapid",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "快乐",
        "english": "happy"
      }
    ],
    "homophones": [
      "快"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huà",
    "base": "hua",
    "chinese": "话",
    "english": "dialect",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "电话",
        "english": "telephone"
      }
    ],
    "homophones": [
      "话",
      "画",
      "化"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qǐ",
    "base": "qi",
    "chinese": "起",
    "english": "rise",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "一起",
        "english": "in the same place"
      }
    ],
    "homophones": [
      "起"
    ],
    "nearPhones": [
      "ji",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bié",
    "base": "bie",
    "chinese": "别",
    "english": "other",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "别人",
        "english": "other people"
      }
    ],
    "homophones": [
      "别"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qǐng",
    "base": "qing",
    "chinese": "请",
    "english": "to ask",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "请问",
        "english": "Excuse me"
      }
    ],
    "homophones": [
      "请"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qián",
    "base": "qian",
    "chinese": "钱",
    "english": "coin",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "钱包",
        "english": "purse"
      }
    ],
    "homophones": [
      "前",
      "钱"
    ],
    "nearPhones": [
      "jian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mǎi",
    "base": "mai",
    "chinese": "买",
    "english": "to buy",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "买",
        "english": "to buy"
      }
    ],
    "homophones": [
      "买"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "suì",
    "base": "sui",
    "chinese": "岁",
    "english": "years old",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "岁月",
        "english": "years"
      }
    ],
    "homophones": [
      "岁"
    ],
    "nearPhones": [
      "shui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hào",
    "base": "hao",
    "chinese": "号",
    "english": "number",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "问号",
        "english": "question mark"
      }
    ],
    "homophones": [
      "号"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhù",
    "base": "zhu",
    "chinese": "住",
    "english": "live",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "记住",
        "english": "to remember"
      }
    ],
    "homophones": [
      "住",
      "祝",
      "注",
      "助"
    ],
    "nearPhones": [
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fàng",
    "base": "fang",
    "chinese": "放",
    "english": "put",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "放假",
        "english": "to have a holiday or vacation"
      }
    ],
    "homophones": [
      "放"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gāo",
    "base": "gao",
    "chinese": "高",
    "english": "high",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "高兴",
        "english": "happy"
      }
    ],
    "homophones": [
      "高"
    ],
    "nearPhones": [
      "kao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiě",
    "base": "xie",
    "chinese": "写",
    "english": "to write",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "听写",
        "english": "to write down"
      }
    ],
    "homophones": [
      "写"
    ],
    "nearPhones": [
      "jie",
      "qie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sòng",
    "base": "song",
    "chinese": "送",
    "english": "to send",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "送给",
        "english": "to send"
      }
    ],
    "homophones": [
      "送"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiào",
    "base": "xiao",
    "chinese": "笑",
    "english": "to laugh",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "笑话",
        "english": "joke"
      }
    ],
    "homophones": [
      "笑",
      "校"
    ],
    "nearPhones": [
      "jiao",
      "qiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lù",
    "base": "lu",
    "chinese": "路",
    "english": "road",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "路上",
        "english": "on the road"
      }
    ],
    "homophones": [
      "路",
      "露",
      "陆",
      "鹿"
    ],
    "nearPhones": [
      "nu",
      "ru"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiú",
    "base": "qiu",
    "chinese": "球",
    "english": "ball",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "打球",
        "english": "to play ball"
      }
    ],
    "homophones": [
      "球"
    ],
    "nearPhones": [
      "jiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nán",
    "base": "nan",
    "chinese": "难",
    "english": "difficult",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "难过",
        "english": "to feel sad"
      }
    ],
    "homophones": [
      "难",
      "男",
      "南"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wǎn",
    "base": "wan",
    "chinese": "晚",
    "english": "evening",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "晚上",
        "english": "evening"
      }
    ],
    "homophones": [
      "晚"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nán",
    "base": "nan",
    "chinese": "男",
    "english": "male",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "男人",
        "english": "a man"
      }
    ],
    "homophones": [
      "难",
      "男",
      "南"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhòng",
    "base": "zhong",
    "chinese": "重",
    "english": "to repeat",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "重要",
        "english": "important"
      }
    ],
    "homophones": [
      "重"
    ],
    "nearPhones": [
      "chong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gē",
    "base": "ge",
    "chinese": "歌",
    "english": "song",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "唱歌",
        "english": "to sing a song"
      }
    ],
    "homophones": [
      "歌"
    ],
    "nearPhones": [
      "ke"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chàng",
    "base": "chang",
    "chinese": "唱",
    "english": "to sing",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "唱歌",
        "english": "to sing a song"
      }
    ],
    "homophones": [
      "唱"
    ],
    "nearPhones": [
      "zhang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bìng",
    "base": "bing",
    "chinese": "病",
    "english": "illness",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "病人",
        "english": "sick person"
      }
    ],
    "homophones": [
      "病"
    ],
    "nearPhones": [
      "ping"
    ]
  }),
  createPinyinEntry({
    "pinyin": "máng",
    "base": "mang",
    "chinese": "忙",
    "english": "busy",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "忙",
        "english": "busy"
      }
    ],
    "homophones": [
      "忙"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "试",
    "english": "to test",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "考试",
        "english": "to take an exam"
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
    "pinyin": "rè",
    "base": "re",
    "chinese": "热",
    "english": "to warm up",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "热情",
        "english": "cordial"
      }
    ],
    "homophones": [
      "热"
    ],
    "nearPhones": [
      "le"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xī",
    "base": "xi",
    "chinese": "西",
    "english": "the West",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "东西",
        "english": "east and west"
      }
    ],
    "homophones": [
      "西",
      "惜",
      "夕"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dì",
    "base": "di",
    "chinese": "第",
    "english": "common character",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "第二",
        "english": "second"
      }
    ],
    "homophones": [
      "地",
      "第",
      "弟"
    ],
    "nearPhones": [
      "ti"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiào",
    "base": "jiao",
    "chinese": "教",
    "english": "to teach",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "教育",
        "english": "to educate"
      }
    ],
    "homophones": [
      "叫",
      "教"
    ],
    "nearPhones": [
      "qiao",
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dú",
    "base": "du",
    "chinese": "读",
    "english": "comma",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "读书",
        "english": "to read a book"
      }
    ],
    "homophones": [
      "读",
      "独"
    ],
    "nearPhones": [
      "tu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wàng",
    "base": "wang",
    "chinese": "忘",
    "english": "to forget",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "忘记",
        "english": "to forget"
      }
    ],
    "homophones": [
      "忘",
      "望"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lěng",
    "base": "leng",
    "chinese": "冷",
    "english": "cold",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "冷静",
        "english": "calm"
      }
    ],
    "homophones": [
      "冷"
    ],
    "nearPhones": [
      "neng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cháng",
    "base": "chang",
    "chinese": "常",
    "english": "always",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "非常",
        "english": "very"
      }
    ],
    "homophones": [
      "长",
      "常"
    ],
    "nearPhones": [
      "zhang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jì",
    "base": "ji",
    "chinese": "记",
    "english": "to record",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "记得",
        "english": "to remember"
      }
    ],
    "homophones": [
      "记",
      "季",
      "计",
      "技"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xǐ",
    "base": "xi",
    "chinese": "洗",
    "english": "to wash",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "洗",
        "english": "to wash"
      }
    ],
    "homophones": [
      "洗",
      "喜"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cài",
    "base": "cai",
    "chinese": "菜",
    "english": "dish",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "菜单",
        "english": "menu"
      }
    ],
    "homophones": [
      "菜"
    ],
    "nearPhones": [
      "zai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shù",
    "base": "shu",
    "chinese": "树",
    "english": "tree",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "树林",
        "english": "woods"
      }
    ],
    "homophones": [
      "树",
      "数"
    ],
    "nearPhones": [
      "su"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dōng",
    "base": "dong",
    "chinese": "东",
    "english": "east",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "东西",
        "english": "east and west"
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
    "pinyin": "kè",
    "base": "ke",
    "chinese": "课",
    "english": "subject",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "上课",
        "english": "to go to class"
      }
    ],
    "homophones": [
      "课",
      "客"
    ],
    "nearPhones": [
      "ge"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nán",
    "base": "nan",
    "chinese": "南",
    "english": "south",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "南",
        "english": "south"
      }
    ],
    "homophones": [
      "难",
      "男",
      "南"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chá",
    "base": "cha",
    "chinese": "茶",
    "english": "tea",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "绿茶",
        "english": "green tea"
      }
    ],
    "homophones": [
      "茶"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "kǎo",
    "base": "kao",
    "chinese": "考",
    "english": "to beat",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "考试",
        "english": "to take an exam"
      }
    ],
    "homophones": [
      "考"
    ],
    "nearPhones": [
      "gao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "guì",
    "base": "gui",
    "chinese": "贵",
    "english": "expensive",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "贵",
        "english": "expensive"
      }
    ],
    "homophones": [
      "贵",
      "柜"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mèi",
    "base": "mei",
    "chinese": "妹",
    "english": "younger sister",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "妹妹",
        "english": "younger sister"
      }
    ],
    "homophones": [
      "妹"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dì",
    "base": "di",
    "chinese": "弟",
    "english": "younger brother",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "弟弟",
        "english": "younger brother"
      }
    ],
    "homophones": [
      "地",
      "第",
      "弟"
    ],
    "nearPhones": [
      "ti"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dé",
    "base": "de",
    "chinese": "得",
    "english": "get",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "得到",
        "english": "get"
      }
    ],
    "homophones": [
      "得",
      "德"
    ],
    "nearPhones": [
      "te"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gèng",
    "base": "geng",
    "chinese": "更",
    "english": "more",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "更加",
        "english": "more"
      }
    ],
    "homophones": [
      "更"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wèi",
    "base": "wei",
    "chinese": "位",
    "english": "position",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "单位",
        "english": "unit"
      }
    ],
    "homophones": [
      "位",
      "未",
      "味"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chéng",
    "base": "cheng",
    "chinese": "成",
    "english": "become",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "成",
        "english": "become"
      }
    ],
    "homophones": [
      "成",
      "城",
      "乘",
      "承",
      "诚"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "míng",
    "base": "ming",
    "chinese": "名",
    "english": "name",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "名字",
        "english": "name"
      }
    ],
    "homophones": [
      "明",
      "名"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chǎng",
    "base": "chang",
    "chinese": "场",
    "english": "place",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "机场",
        "english": "airport"
      }
    ],
    "homophones": [
      "厂",
      "场"
    ],
    "nearPhones": [
      "zhang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tóu",
    "base": "tou",
    "chinese": "头",
    "english": "head",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "头发",
        "english": "hair"
      }
    ],
    "homophones": [
      "头",
      "投"
    ],
    "nearPhones": [
      "dou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wán",
    "base": "wan",
    "chinese": "完",
    "english": "finish",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "完全",
        "english": "complete"
      }
    ],
    "homophones": [
      "玩",
      "完"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fā",
    "base": "fa",
    "chinese": "发",
    "english": "send",
    "gradeBand": "学前",
    "examples": [
      {
        "word": "发现",
        "english": "discover"
      }
    ],
    "homophones": [
      "发"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xìn",
    "base": "xin",
    "chinese": "信",
    "english": "letter",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "相信",
        "english": "to be convinced"
      }
    ],
    "homophones": [
      "信"
    ],
    "nearPhones": [
      "jin",
      "qin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiē",
    "base": "jie",
    "chinese": "接",
    "english": "connect",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "接受",
        "english": "to accept"
      }
    ],
    "homophones": [
      "接",
      "街",
      "皆"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dào",
    "base": "dao",
    "chinese": "道",
    "english": "road",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "知道",
        "english": "know"
      }
    ],
    "homophones": [
      "到",
      "道"
    ],
    "nearPhones": [
      "tao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "biàn",
    "base": "bian",
    "chinese": "变",
    "english": "change",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "变化",
        "english": "change"
      }
    ],
    "homophones": [
      "变",
      "便"
    ],
    "nearPhones": [
      "pian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǎng",
    "base": "jiang",
    "chinese": "讲",
    "english": "to speak",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "讲话",
        "english": "a speech"
      }
    ],
    "homophones": [
      "讲"
    ],
    "nearPhones": [
      "qiang",
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wàn",
    "base": "wan",
    "chinese": "万",
    "english": "ten thousand",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "万一",
        "english": "just in case"
      }
    ],
    "homophones": [
      "万"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xuǎn",
    "base": "xuan",
    "chinese": "选",
    "english": "to choose",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "选手",
        "english": "athlete"
      }
    ],
    "homophones": [
      "选"
    ],
    "nearPhones": [
      "juan",
      "quan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mài",
    "base": "mai",
    "chinese": "卖",
    "english": "to sell",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "外卖",
        "english": "to provide a takeout or home"
      }
    ],
    "homophones": [
      "卖",
      "麦"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jù",
    "base": "ju",
    "chinese": "句",
    "english": "sentence",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "句子",
        "english": "sentence"
      }
    ],
    "homophones": [
      "句",
      "巨"
    ],
    "nearPhones": [
      "qu",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "miàn",
    "base": "mian",
    "chinese": "面",
    "english": "face",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "见面",
        "english": "to meet"
      }
    ],
    "homophones": [
      "面"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "suàn",
    "base": "suan",
    "chinese": "算",
    "english": "count",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "计算",
        "english": "calculate"
      }
    ],
    "homophones": [
      "算"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yào",
    "base": "yao",
    "chinese": "药",
    "english": "leaf of the iris",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "药店",
        "english": "pharmacy"
      }
    ],
    "homophones": [
      "要",
      "药"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liú",
    "base": "liu",
    "chinese": "留",
    "english": "to leave",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "留下",
        "english": "to leave behind"
      }
    ],
    "homophones": [
      "留",
      "流"
    ],
    "nearPhones": [
      "niu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hēi",
    "base": "hei",
    "chinese": "黑",
    "english": "black",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "黑色",
        "english": "black"
      }
    ],
    "homophones": [
      "黑"
    ],
    "nearPhones": [
      "fei"
    ]
  }),
  createPinyinEntry({
    "pinyin": "diàn",
    "base": "dian",
    "chinese": "店",
    "english": "inn",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "商店",
        "english": "store"
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
    "pinyin": "wǎng",
    "base": "wang",
    "chinese": "往",
    "english": "toward",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "前往",
        "english": "to leave for"
      }
    ],
    "homophones": [
      "网",
      "往"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǎn",
    "base": "yan",
    "chinese": "眼",
    "english": "eye",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "眼睛",
        "english": "eye"
      }
    ],
    "homophones": [
      "眼"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tíng",
    "base": "ting",
    "chinese": "停",
    "english": "to stop",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "停车",
        "english": "to pull up"
      }
    ],
    "homophones": [
      "停",
      "庭"
    ],
    "nearPhones": [
      "ding"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǔ",
    "base": "jiu",
    "chinese": "酒",
    "english": "wine",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "酒店",
        "english": "wine shop"
      }
    ],
    "homophones": [
      "九",
      "酒",
      "久"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìn",
    "base": "jin",
    "chinese": "近",
    "english": "near",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "最近",
        "english": "recently"
      }
    ],
    "homophones": [
      "进",
      "近",
      "禁"
    ],
    "nearPhones": [
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shōu",
    "base": "shou",
    "chinese": "收",
    "english": "to receive",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "收到",
        "english": "to receive"
      }
    ],
    "homophones": [
      "收"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shù",
    "base": "shu",
    "chinese": "数",
    "english": "number",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "数学",
        "english": "math"
      }
    ],
    "homophones": [
      "树",
      "数"
    ],
    "nearPhones": [
      "su"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dù",
    "base": "du",
    "chinese": "度",
    "english": "degree",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "温度",
        "english": "temperature"
      }
    ],
    "homophones": [
      "度"
    ],
    "nearPhones": [
      "tu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dī",
    "base": "di",
    "chinese": "低",
    "english": "low",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "降低",
        "english": "to reduce"
      }
    ],
    "homophones": [
      "低"
    ],
    "nearPhones": [
      "ti"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mǎn",
    "base": "man",
    "chinese": "满",
    "english": "Manchu ethnic group",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "满意",
        "english": "satisfied"
      }
    ],
    "homophones": [
      "满"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "duǎn",
    "base": "duan",
    "chinese": "短",
    "english": "short",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "短信",
        "english": "text message"
      }
    ],
    "homophones": [
      "短"
    ],
    "nearPhones": [
      "tuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǎ",
    "base": "jia",
    "chinese": "假",
    "english": "used in 掰",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "放假",
        "english": "to have a holiday or vacation"
      }
    ],
    "homophones": [
      "假"
    ],
    "nearPhones": [
      "xia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gǎi",
    "base": "gai",
    "chinese": "改",
    "english": "to change",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "改变",
        "english": "to change"
      }
    ],
    "homophones": [
      "改"
    ],
    "nearPhones": [
      "kai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shěng",
    "base": "sheng",
    "chinese": "省",
    "english": "save",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "节省",
        "english": "saving"
      }
    ],
    "homophones": [
      "省"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yè",
    "base": "ye",
    "chinese": "夜",
    "english": "night",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "半夜",
        "english": "midnight"
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
    "pinyin": "hǎi",
    "base": "hai",
    "chinese": "海",
    "english": "ocean",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "大海",
        "english": "sea"
      }
    ],
    "homophones": [
      "海"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huà",
    "base": "hua",
    "chinese": "画",
    "english": "to draw",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "画家",
        "english": "painter"
      }
    ],
    "homophones": [
      "话",
      "画",
      "化"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tōng",
    "base": "tong",
    "chinese": "通",
    "english": "pass",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "通过",
        "english": "pass"
      }
    ],
    "homophones": [
      "通"
    ],
    "nearPhones": [
      "dong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jié",
    "base": "jie",
    "chinese": "节",
    "english": "festival",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "节日",
        "english": "festival"
      }
    ],
    "homophones": [
      "节",
      "结",
      "洁"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qǔ",
    "base": "qu",
    "chinese": "取",
    "english": "take",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "取得",
        "english": "obtain"
      }
    ],
    "homophones": [
      "取"
    ],
    "nearPhones": [
      "ju",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiē",
    "base": "jie",
    "chinese": "街",
    "english": "street",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "街道",
        "english": "street"
      }
    ],
    "homophones": [
      "接",
      "街",
      "皆"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bǐ",
    "base": "bi",
    "chinese": "笔",
    "english": "pen",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "笔记",
        "english": "to take down"
      }
    ],
    "homophones": [
      "比",
      "笔"
    ],
    "nearPhones": [
      "pi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tuī",
    "base": "tui",
    "chinese": "推",
    "english": "to push",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "推进",
        "english": "to impel"
      }
    ],
    "homophones": [
      "推"
    ],
    "nearPhones": [
      "dui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yóu",
    "base": "you",
    "chinese": "油",
    "english": "oil",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "奶油",
        "english": "cream"
      }
    ],
    "homophones": [
      "油",
      "由",
      "游"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liú",
    "base": "liu",
    "chinese": "流",
    "english": "flow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "流水",
        "english": "running water"
      }
    ],
    "homophones": [
      "留",
      "流"
    ],
    "nearPhones": [
      "niu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "biǎo",
    "base": "biao",
    "chinese": "表",
    "english": "exterior surface",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "手表",
        "english": "wristwatch"
      }
    ],
    "homophones": [
      "表"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chuán",
    "base": "chuan",
    "chinese": "船",
    "english": "boat",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "船",
        "english": "boat"
      }
    ],
    "homophones": [
      "船",
      "传"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǎng",
    "base": "yang",
    "chinese": "养",
    "english": "to raise",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "养",
        "english": "to raise"
      }
    ],
    "homophones": [
      "养",
      "仰"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiè",
    "base": "jie",
    "chinese": "借",
    "english": "to lend",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "借",
        "english": "to lend"
      }
    ],
    "homophones": [
      "借",
      "界"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kē",
    "base": "ke",
    "chinese": "科",
    "english": "branch of study",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "科学",
        "english": "science"
      }
    ],
    "homophones": [
      "科"
    ],
    "nearPhones": [
      "ge"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǐ",
    "base": "zhi",
    "chinese": "纸",
    "english": "paper",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "报纸",
        "english": "newspaper"
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
    "pinyin": "jí",
    "base": "ji",
    "chinese": "急",
    "english": "urgent",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "急",
        "english": "urgent"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huáng",
    "base": "huang",
    "chinese": "黄",
    "english": "yellow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "黄色",
        "english": "yellow"
      }
    ],
    "homophones": [
      "黄"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qīng",
    "base": "qing",
    "chinese": "轻",
    "english": "light",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "年轻",
        "english": "young"
      }
    ],
    "homophones": [
      "青",
      "轻",
      "清"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chuī",
    "base": "chui",
    "chinese": "吹",
    "english": "to blow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "吹牛",
        "english": "to talk big"
      }
    ],
    "homophones": [
      "吹"
    ],
    "nearPhones": [
      "zhui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xuě",
    "base": "xue",
    "chinese": "雪",
    "english": "snow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "下雪",
        "english": "to snow"
      }
    ],
    "homophones": [
      "雪"
    ],
    "nearPhones": [
      "jue"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hé",
    "base": "he",
    "chinese": "河",
    "english": "river",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "河流",
        "english": "river"
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
    "pinyin": "liàn",
    "base": "lian",
    "chinese": "练",
    "english": "to practice",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "练习",
        "english": "to practice"
      }
    ],
    "homophones": [
      "练"
    ],
    "nearPhones": [
      "nian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jǔ",
    "base": "ju",
    "chinese": "举",
    "english": "to lift",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "举行",
        "english": "to hold"
      }
    ],
    "homophones": [
      "举"
    ],
    "nearPhones": [
      "qu",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǎo",
    "base": "jiao",
    "chinese": "角",
    "english": "angle",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "角度",
        "english": "angle"
      }
    ],
    "homophones": [
      "角"
    ],
    "nearPhones": [
      "qiao",
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wén",
    "base": "wen",
    "chinese": "闻",
    "english": "to hear",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "新闻",
        "english": "news"
      }
    ],
    "homophones": [
      "文",
      "闻"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cǎo",
    "base": "cao",
    "chinese": "草",
    "english": "grass",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "草地",
        "english": "lawn"
      }
    ],
    "homophones": [
      "草"
    ],
    "nearPhones": [
      "chao",
      "zao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hú",
    "base": "hu",
    "chinese": "湖",
    "english": "lake",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "湖",
        "english": "lake"
      }
    ],
    "homophones": [
      "湖",
      "狐",
      "壶"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lǜ",
    "base": "lü",
    "chinese": "绿",
    "english": "green",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "绿色",
        "english": "green"
      }
    ],
    "homophones": [
      "绿"
    ],
    "nearPhones": [
      "nü"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tí",
    "base": "ti",
    "chinese": "题",
    "english": "topic",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "问题",
        "english": "question"
      }
    ],
    "homophones": [
      "题"
    ],
    "nearPhones": [
      "di"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "亿",
    "english": "100 million",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "亿元",
        "english": "hundred million yuan"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xìng",
    "base": "xing",
    "chinese": "姓",
    "english": "family name",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "姓名",
        "english": "full name"
      }
    ],
    "homophones": [
      "姓",
      "性",
      "兴",
      "幸"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "liáng",
    "base": "liang",
    "chinese": "凉",
    "english": "the five Liang of the Sixteen",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "凉快",
        "english": "nice and cold"
      }
    ],
    "homophones": [
      "凉",
      "良"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qíng",
    "base": "qing",
    "chinese": "晴",
    "english": "clear",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "晴天",
        "english": "clear sky"
      }
    ],
    "homophones": [
      "晴",
      "情"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "suǒ",
    "base": "suo",
    "chinese": "所",
    "english": "actually",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "所以",
        "english": "therefore"
      }
    ],
    "homophones": [
      "所"
    ],
    "nearPhones": [
      "shuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sǐ",
    "base": "si",
    "chinese": "死",
    "english": "to die",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "死",
        "english": "to die"
      }
    ],
    "homophones": [
      "死"
    ],
    "nearPhones": [
      "shi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǒng",
    "base": "zhong",
    "chinese": "种",
    "english": "seed",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "各种",
        "english": "every kind of"
      }
    ],
    "homophones": [
      "种"
    ],
    "nearPhones": [
      "chong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǐ",
    "base": "yi",
    "chinese": "已",
    "english": "already",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "已经",
        "english": "already"
      }
    ],
    "homophones": [
      "已",
      "以",
      "蚁",
      "椅"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "měi",
    "base": "mei",
    "chinese": "每",
    "english": "each",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "每当",
        "english": "whenever"
      }
    ],
    "homophones": [
      "每",
      "美"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "měi",
    "base": "mei",
    "chinese": "美",
    "english": "beautiful",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "美元",
        "english": "American dollar"
      }
    ],
    "homophones": [
      "每",
      "美"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yóu",
    "base": "you",
    "chinese": "由",
    "english": "to follow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "自由",
        "english": "freedom"
      }
    ],
    "homophones": [
      "油",
      "由",
      "游"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shòu",
    "base": "shou",
    "chinese": "受",
    "english": "to receive",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "接受",
        "english": "to accept"
      }
    ],
    "homophones": [
      "受"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shǐ",
    "base": "shi",
    "chinese": "使",
    "english": "to make",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "使用",
        "english": "to use"
      }
    ],
    "homophones": [
      "使",
      "始",
      "史"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lián",
    "base": "lian",
    "chinese": "连",
    "english": "to link",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "连续",
        "english": "continuous"
      }
    ],
    "homophones": [
      "连"
    ],
    "nearPhones": [
      "nian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bù",
    "base": "bu",
    "chinese": "部",
    "english": "ministry",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "部分",
        "english": "part"
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
    "pinyin": "zhě",
    "base": "zhe",
    "chinese": "者",
    "english": "one who",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "者",
        "english": "one who"
      }
    ],
    "homophones": [
      "者"
    ],
    "nearPhones": [
      "ze",
      "che"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiáng",
    "base": "qiang",
    "chinese": "强",
    "english": "stubborn",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "强大",
        "english": "large"
      }
    ],
    "homophones": [
      "强"
    ],
    "nearPhones": [
      "jiang",
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huó",
    "base": "huo",
    "chinese": "活",
    "english": "to live",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "生活",
        "english": "to live"
      }
    ],
    "homophones": [
      "活"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qū",
    "base": "qu",
    "chinese": "区",
    "english": "area",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "地区",
        "english": "local"
      }
    ],
    "homophones": [
      "区",
      "曲"
    ],
    "nearPhones": [
      "ju",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǐ",
    "base": "zhi",
    "chinese": "指",
    "english": "finger",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "指",
        "english": "finger"
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
    "pinyin": "xiàn",
    "base": "xian",
    "chinese": "线",
    "english": "thread",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "路线",
        "english": "itinerary"
      }
    ],
    "homophones": [
      "线",
      "限",
      "现"
    ],
    "nearPhones": [
      "jian",
      "qian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shāng",
    "base": "shang",
    "chinese": "伤",
    "english": "to injure",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "受伤",
        "english": "to sustain injuries"
      }
    ],
    "homophones": [
      "伤",
      "商"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xuè",
    "base": "xue",
    "chinese": "血",
    "english": "blood",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "血",
        "english": "blood"
      }
    ],
    "homophones": [
      "血"
    ],
    "nearPhones": [
      "jue"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xìng",
    "base": "xing",
    "chinese": "性",
    "english": "nature",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "个性",
        "english": "individuality"
      }
    ],
    "homophones": [
      "姓",
      "性",
      "兴",
      "幸"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuē",
    "base": "yue",
    "chinese": "约",
    "english": "to weigh in a balance or on a",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "大约",
        "english": "approximately"
      }
    ],
    "homophones": [
      "约"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jīn",
    "base": "jin",
    "chinese": "金",
    "english": "gold",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "金",
        "english": "gold"
      }
    ],
    "homophones": [
      "巾",
      "今",
      "金"
    ],
    "nearPhones": [
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tán",
    "base": "tan",
    "chinese": "谈",
    "english": "to speak",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "谈判",
        "english": "to negotiate"
      }
    ],
    "homophones": [
      "谈"
    ],
    "nearPhones": [
      "dan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chéng",
    "base": "cheng",
    "chinese": "城",
    "english": "town",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "长城",
        "english": "the Great Wall"
      }
    ],
    "homophones": [
      "成",
      "城",
      "乘",
      "承",
      "诚"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gǎn",
    "base": "gan",
    "chinese": "敢",
    "english": "to dare",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "勇敢",
        "english": "brave"
      }
    ],
    "homophones": [
      "敢",
      "感"
    ],
    "nearPhones": [
      "kan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhī",
    "base": "zhi",
    "chinese": "支",
    "english": "to support",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "支持",
        "english": "to be in favor of"
      }
    ],
    "homophones": [
      "支",
      "枝",
      "知"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bào",
    "base": "bao",
    "chinese": "报",
    "english": "to announce",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "报纸",
        "english": "newspaper"
      }
    ],
    "homophones": [
      "报",
      "抱"
    ],
    "nearPhones": [
      "pao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bù",
    "base": "bu",
    "chinese": "步",
    "english": "a step",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "进步",
        "english": "progress"
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
    "pinyin": "shēn",
    "base": "shen",
    "chinese": "深",
    "english": "deep",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "深",
        "english": "deep"
      }
    ],
    "homophones": [
      "深",
      "身"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gè",
    "base": "ge",
    "chinese": "各",
    "english": "each",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "各位",
        "english": "everybody"
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
    "pinyin": "qīn",
    "base": "qin",
    "chinese": "亲",
    "english": "parent",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "父亲",
        "english": "father"
      }
    ],
    "homophones": [
      "亲"
    ],
    "nearPhones": [
      "jin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǔ",
    "base": "jiu",
    "chinese": "久",
    "english": "long time",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "久",
        "english": "long time"
      }
    ],
    "homophones": [
      "九",
      "酒",
      "久"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhù",
    "base": "zhu",
    "chinese": "祝",
    "english": "to pray for",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "庆祝",
        "english": "to celebrate"
      }
    ],
    "homophones": [
      "住",
      "祝",
      "注",
      "助"
    ],
    "nearPhones": [
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiù",
    "base": "jiu",
    "chinese": "救",
    "english": "to save",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "救",
        "english": "to save"
      }
    ],
    "homophones": [
      "就",
      "救",
      "旧"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tú",
    "base": "tu",
    "chinese": "图",
    "english": "diagram",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "地图",
        "english": "map"
      }
    ],
    "homophones": [
      "图"
    ],
    "nearPhones": [
      "du"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhuī",
    "base": "zhui",
    "chinese": "追",
    "english": "to sculpt",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "追",
        "english": "to sculpt"
      }
    ],
    "homophones": [
      "追"
    ],
    "nearPhones": [
      "zui",
      "chui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pò",
    "base": "po",
    "chinese": "破",
    "english": "broken",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "破",
        "english": "broken"
      }
    ],
    "homophones": [
      "破"
    ],
    "nearPhones": [
      "bo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chuán",
    "base": "chuan",
    "chinese": "传",
    "english": "to pass on",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "传",
        "english": "to pass on"
      }
    ],
    "homophones": [
      "船",
      "传"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cháo",
    "base": "chao",
    "chinese": "朝",
    "english": "abbr. for 朝鲜 Korea",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "朝着",
        "english": "towards"
      }
    ],
    "homophones": [
      "朝"
    ],
    "nearPhones": [
      "zhao",
      "cao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kōng",
    "base": "kong",
    "chinese": "空",
    "english": "empty",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "空气",
        "english": "air"
      }
    ],
    "homophones": [
      "空"
    ],
    "nearPhones": [
      "gong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "室",
    "english": "room",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "教室",
        "english": "classroom"
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
    "pinyin": "zhí",
    "base": "zhi",
    "chinese": "直",
    "english": "Zhi",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "一直",
        "english": "straight"
      }
    ],
    "homophones": [
      "直",
      "植",
      "执",
      "值"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dài",
    "base": "dai",
    "chinese": "代",
    "english": "to substitute",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "代表",
        "english": "representative"
      }
    ],
    "homophones": [
      "代",
      "待"
    ],
    "nearPhones": [
      "tai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qī",
    "base": "qi",
    "chinese": "期",
    "english": "period",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "星期",
        "english": "week"
      }
    ],
    "homophones": [
      "七",
      "期"
    ],
    "nearPhones": [
      "ji",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "diào",
    "base": "diao",
    "chinese": "调",
    "english": "to transfer",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "调",
        "english": "to transfer"
      }
    ],
    "homophones": [
      "调"
    ],
    "nearPhones": [
      "tiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lè",
    "base": "le",
    "chinese": "乐",
    "english": "happy",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "快乐",
        "english": "happy"
      }
    ],
    "homophones": [
      "乐"
    ],
    "nearPhones": [
      "re"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bǎo",
    "base": "bao",
    "chinese": "保",
    "english": "Bulgaria",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "保",
        "english": "Bulgaria"
      }
    ],
    "homophones": [
      "保"
    ],
    "nearPhones": [
      "pao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tuán",
    "base": "tuan",
    "chinese": "团",
    "english": "round",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "团结",
        "english": "to unite"
      }
    ],
    "homophones": [
      "团"
    ],
    "nearPhones": [
      "duan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhèng",
    "base": "zheng",
    "chinese": "证",
    "english": "to admonish",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "保证",
        "english": "guarantee"
      }
    ],
    "homophones": [
      "正",
      "证"
    ],
    "nearPhones": [
      "zeng",
      "cheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shèng",
    "base": "sheng",
    "chinese": "胜",
    "english": "victory",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "胜利",
        "english": "victory"
      }
    ],
    "homophones": [
      "胜",
      "盛"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiàn",
    "base": "jian",
    "chinese": "建",
    "english": "to establish",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "建议",
        "english": "to propose"
      }
    ],
    "homophones": [
      "见",
      "建",
      "健"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bù",
    "base": "bu",
    "chinese": "布",
    "english": "to announce",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "布",
        "english": "to announce"
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
    "pinyin": "zhōng",
    "base": "zhong",
    "chinese": "钟",
    "english": "handleless cup",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "分钟",
        "english": "minute"
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
    "pinyin": "xiū",
    "base": "xiu",
    "chinese": "修",
    "english": "to decorate",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "修改",
        "english": "to amend"
      }
    ],
    "homophones": [
      "修",
      "休"
    ],
    "nearPhones": [
      "jiu",
      "qiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiù",
    "base": "jiu",
    "chinese": "旧",
    "english": "old",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "依旧",
        "english": "as before"
      }
    ],
    "homophones": [
      "就",
      "救",
      "旧"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tuì",
    "base": "tui",
    "chinese": "退",
    "english": "to retreat",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "退出",
        "english": "to withdraw"
      }
    ],
    "homophones": [
      "退"
    ],
    "nearPhones": [
      "dui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kùn",
    "base": "kun",
    "chinese": "困",
    "english": "to trap",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "困难",
        "english": "difficult"
      }
    ],
    "homophones": [
      "困"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chū",
    "base": "chu",
    "chinese": "初",
    "english": "at first",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "当初",
        "english": "at that time"
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
    "pinyin": "xiāng",
    "base": "xiang",
    "chinese": "香",
    "english": "fragrant",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "香",
        "english": "fragrant"
      }
    ],
    "homophones": [
      "香",
      "乡",
      "相"
    ],
    "nearPhones": [
      "jiang",
      "qiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fáng",
    "base": "fang",
    "chinese": "防",
    "english": "to protect",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "防止",
        "english": "to prevent"
      }
    ],
    "homophones": [
      "防"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "huà",
    "base": "hua",
    "chinese": "化",
    "english": "to make into",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "变化",
        "english": "to change"
      }
    ],
    "homophones": [
      "话",
      "画",
      "化"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lǐng",
    "base": "ling",
    "chinese": "领",
    "english": "neck",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "领",
        "english": "neck"
      }
    ],
    "homophones": [
      "领"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yān",
    "base": "yan",
    "chinese": "烟",
    "english": "cigarette or pipe tobacco",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "烟",
        "english": "cigarette or pipe tobacco"
      }
    ],
    "homophones": [
      "烟"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cún",
    "base": "cun",
    "chinese": "存",
    "english": "to exist",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "存在",
        "english": "to exist"
      }
    ],
    "homophones": [
      "存"
    ],
    "nearPhones": [
      "chun",
      "zun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiáo",
    "base": "qiao",
    "chinese": "桥",
    "english": "bridge",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "桥",
        "english": "bridge"
      }
    ],
    "homophones": [
      "桥"
    ],
    "nearPhones": [
      "jiao",
      "xiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yóu",
    "base": "you",
    "chinese": "游",
    "english": "to swim",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "旅游",
        "english": "trip"
      }
    ],
    "homophones": [
      "油",
      "由",
      "游"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tiě",
    "base": "tie",
    "chinese": "铁",
    "english": "iron",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "地铁",
        "english": "underground railway"
      }
    ],
    "homophones": [
      "铁"
    ],
    "nearPhones": [
      "die"
    ]
  }),
  createPinyinEntry({
    "pinyin": "niàn",
    "base": "nian",
    "chinese": "念",
    "english": "to read",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "念",
        "english": "to read"
      }
    ],
    "homophones": [
      "念"
    ],
    "nearPhones": [
      "lian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cūn",
    "base": "cun",
    "chinese": "村",
    "english": "village",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "农村",
        "english": "rural area"
      }
    ],
    "homophones": [
      "村"
    ],
    "nearPhones": [
      "chun",
      "zun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yín",
    "base": "yin",
    "chinese": "银",
    "english": "silver",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "银行",
        "english": "bank"
      }
    ],
    "homophones": [
      "银"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zào",
    "base": "zao",
    "chinese": "造",
    "english": "to make",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "造成",
        "english": "to bring about"
      }
    ],
    "homophones": [
      "造"
    ],
    "nearPhones": [
      "zhao",
      "cao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fú",
    "base": "fu",
    "chinese": "福",
    "english": "good fortune",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "幸福",
        "english": "happiness"
      }
    ],
    "homophones": [
      "福",
      "扶",
      "服",
      "佛",
      "浮"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhēng",
    "base": "zheng",
    "chinese": "争",
    "english": "to strive for",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "争取",
        "english": "to fight for"
      }
    ],
    "homophones": [
      "争"
    ],
    "nearPhones": [
      "zeng",
      "cheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fù",
    "base": "fu",
    "chinese": "富",
    "english": "rich",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "丰富",
        "english": "to enrich"
      }
    ],
    "homophones": [
      "父",
      "富"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìng",
    "base": "jing",
    "chinese": "静",
    "english": "still",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "安静",
        "english": "quiet"
      }
    ],
    "homophones": [
      "静",
      "净",
      "敬",
      "竞",
      "镜"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wú",
    "base": "wu",
    "chinese": "无",
    "english": "not to have",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "无法",
        "english": "unable"
      }
    ],
    "homophones": [
      "无"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chù",
    "base": "chu",
    "chinese": "处",
    "english": "to reside",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "到处",
        "english": "everywhere"
      }
    ],
    "homophones": [
      "处"
    ],
    "nearPhones": [
      "zhu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dìng",
    "base": "ding",
    "chinese": "定",
    "english": "to set",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "一定",
        "english": "surely"
      }
    ],
    "homophones": [
      "定"
    ],
    "nearPhones": [
      "ting"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shǒu",
    "base": "shou",
    "chinese": "首",
    "english": "head",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "首先",
        "english": "first"
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
    "pinyin": "fǎ",
    "base": "fa",
    "chinese": "法",
    "english": "France",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "法",
        "english": "France"
      }
    ],
    "homophones": [
      "法"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jú",
    "base": "ju",
    "chinese": "局",
    "english": "narrow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "局",
        "english": "narrow"
      }
    ],
    "homophones": [
      "局"
    ],
    "nearPhones": [
      "qu",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dān",
    "base": "dan",
    "chinese": "单",
    "english": "bill",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "名单",
        "english": "list of names"
      }
    ],
    "homophones": [
      "单"
    ],
    "nearPhones": [
      "tan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fēi",
    "base": "fei",
    "chinese": "非",
    "english": "abbr. for 洲",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "非常",
        "english": "very"
      }
    ],
    "homophones": [
      "飞",
      "非"
    ],
    "nearPhones": [
      "hei"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yīng",
    "base": "ying",
    "chinese": "应",
    "english": "to agree",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "应",
        "english": "to agree"
      }
    ],
    "homophones": [
      "应",
      "英"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tóu",
    "base": "tou",
    "chinese": "投",
    "english": "to cast",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "投",
        "english": "to cast"
      }
    ],
    "homophones": [
      "头",
      "投"
    ],
    "nearPhones": [
      "dou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gēn",
    "base": "gen",
    "chinese": "根",
    "english": "root",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "根本",
        "english": "fundamental"
      }
    ],
    "homophones": [
      "根"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bào",
    "base": "bao",
    "chinese": "抱",
    "english": "to hold",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "抱怨",
        "english": "to complain"
      }
    ],
    "homophones": [
      "报",
      "抱"
    ],
    "nearPhones": [
      "pao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jí",
    "base": "ji",
    "chinese": "极",
    "english": "extremely",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "极了",
        "english": "extremely"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "luò",
    "base": "luo",
    "chinese": "落",
    "english": "to leave out",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "落后",
        "english": "to fall behind"
      }
    ],
    "homophones": [
      "落"
    ],
    "nearPhones": [
      "ruo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ān",
    "base": "an",
    "chinese": "安",
    "english": "to calm",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "安全",
        "english": "safe"
      }
    ],
    "homophones": [
      "安"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jì",
    "base": "ji",
    "chinese": "季",
    "english": "season",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "季节",
        "english": "time"
      }
    ],
    "homophones": [
      "记",
      "季",
      "计",
      "技"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dǐng",
    "base": "ding",
    "chinese": "顶",
    "english": "apex",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "顶级",
        "english": "top-notch"
      }
    ],
    "homophones": [
      "顶"
    ],
    "nearPhones": [
      "ting"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huò",
    "base": "huo",
    "chinese": "货",
    "english": "goods",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "百货",
        "english": "general merchandise"
      }
    ],
    "homophones": [
      "货"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guān",
    "base": "guan",
    "chinese": "官",
    "english": "government official",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "法官",
        "english": "judge"
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
    "pinyin": "sè",
    "base": "se",
    "chinese": "色",
    "english": "color",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "色",
        "english": "color"
      }
    ],
    "homophones": [
      "色"
    ],
    "nearPhones": [
      "she"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jié",
    "base": "jie",
    "chinese": "结",
    "english": "to produce",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "结果",
        "english": "to bear fruit"
      }
    ],
    "homophones": [
      "节",
      "结",
      "洁"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "juǎn",
    "base": "juan",
    "chinese": "卷",
    "english": "to roll up",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "试卷",
        "english": "examination paper"
      }
    ],
    "homophones": [
      "卷"
    ],
    "nearPhones": [
      "quan",
      "xuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhì",
    "base": "zhi",
    "chinese": "治",
    "english": "to rule",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "治",
        "english": "to rule"
      }
    ],
    "homophones": [
      "治",
      "至",
      "制",
      "致",
      "志"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "liàng",
    "base": "liang",
    "chinese": "量",
    "english": "to measure",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "大量",
        "english": "great amount"
      }
    ],
    "homophones": [
      "量"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liè",
    "base": "lie",
    "chinese": "列",
    "english": "to arrange",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "列",
        "english": "to arrange"
      }
    ],
    "homophones": [
      "列",
      "烈"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guī",
    "base": "gui",
    "chinese": "归",
    "english": "to return",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "回归",
        "english": "to return to"
      }
    ],
    "homophones": [
      "归",
      "龟"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tuō",
    "base": "tuo",
    "chinese": "脱",
    "english": "to shed",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "脱",
        "english": "to shed"
      }
    ],
    "homophones": [
      "脱"
    ],
    "nearPhones": [
      "duo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kǔ",
    "base": "ku",
    "chinese": "苦",
    "english": "bitter",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "苦",
        "english": "bitter"
      }
    ],
    "homophones": [
      "苦"
    ],
    "nearPhones": [
      "gu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bīng",
    "base": "bing",
    "chinese": "兵",
    "english": "soldiers",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "士兵",
        "english": "soldier"
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
    "pinyin": "àn",
    "base": "an",
    "chinese": "暗",
    "english": "dark",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "黑暗",
        "english": "dark"
      }
    ],
    "homophones": [
      "暗",
      "案"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shī",
    "base": "shi",
    "chinese": "诗",
    "english": "abbr. for Shijing 诗经",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "诗人",
        "english": "bard"
      }
    ],
    "homophones": [
      "诗",
      "师",
      "失"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shǒu",
    "base": "shou",
    "chinese": "守",
    "english": "to guard",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "保守",
        "english": "conservative"
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
    "pinyin": "sōng",
    "base": "song",
    "chinese": "松",
    "english": "pine",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "轻松",
        "english": "light"
      }
    ],
    "homophones": [
      "松"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dēng",
    "base": "deng",
    "chinese": "登",
    "english": "to scale",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "登记",
        "english": "to register"
      }
    ],
    "homophones": [
      "灯",
      "登"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yù",
    "base": "yu",
    "chinese": "遇",
    "english": "to meet",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "遇到",
        "english": "to meet"
      }
    ],
    "homophones": [
      "玉",
      "遇",
      "育"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǐn",
    "base": "yin",
    "chinese": "引",
    "english": "to draw",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "引起",
        "english": "to give rise to"
      }
    ],
    "homophones": [
      "引",
      "饮"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiàng",
    "base": "jiang",
    "chinese": "降",
    "english": "to drop",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "下降",
        "english": "to decline"
      }
    ],
    "homophones": [
      "降"
    ],
    "nearPhones": [
      "qiang",
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuán",
    "base": "yuan",
    "chinese": "圆",
    "english": "circle",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "圆满",
        "english": "satisfactory"
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
    "pinyin": "sàn",
    "base": "san",
    "chinese": "散",
    "english": "scattered",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "散步",
        "english": "to take a walk"
      }
    ],
    "homophones": [
      "散"
    ],
    "nearPhones": [
      "shan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ruò",
    "base": "ruo",
    "chinese": "弱",
    "english": "weak",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "薄弱",
        "english": "weak"
      }
    ],
    "homophones": [
      "弱",
      "若"
    ],
    "nearPhones": [
      "luo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhēn",
    "base": "zhen",
    "chinese": "针",
    "english": "needle",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "针对",
        "english": "to target"
      }
    ],
    "homophones": [
      "真",
      "针"
    ],
    "nearPhones": [
      "chen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yí",
    "base": "yi",
    "chinese": "移",
    "english": "to move",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "移动",
        "english": "to move"
      }
    ],
    "homophones": [
      "移",
      "遗"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chún",
    "base": "chun",
    "chinese": "纯",
    "english": "pure",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "单纯",
        "english": "simple"
      }
    ],
    "homophones": [
      "纯"
    ],
    "nearPhones": [
      "cun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mì",
    "base": "mi",
    "chinese": "密",
    "english": "name of an ancient state",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "密",
        "english": "name of an ancient state"
      }
    ],
    "homophones": [
      "密"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiǎn",
    "base": "jian",
    "chinese": "减",
    "english": "to lower",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "减少",
        "english": "to lessen"
      }
    ],
    "homophones": [
      "减",
      "剪"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mò",
    "base": "mo",
    "chinese": "末",
    "english": "tip",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "末",
        "english": "tip"
      }
    ],
    "homophones": [
      "末"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xì",
    "base": "xi",
    "chinese": "细",
    "english": "thin or slender",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "细节",
        "english": "details"
      }
    ],
    "homophones": [
      "细"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hòu",
    "base": "hou",
    "chinese": "厚",
    "english": "thick",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "深厚",
        "english": "deep"
      }
    ],
    "homophones": [
      "后",
      "厚"
    ],
    "nearPhones": [
      "fou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bài",
    "base": "bai",
    "chinese": "败",
    "english": "to defeat",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "失败",
        "english": "to be defeated"
      }
    ],
    "homophones": [
      "败"
    ],
    "nearPhones": [
      "pai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chǐ",
    "base": "chi",
    "chinese": "尺",
    "english": "one of the characters used to",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "尺寸",
        "english": "size"
      }
    ],
    "homophones": [
      "尺"
    ],
    "nearPhones": [
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiǎn",
    "base": "qian",
    "chinese": "浅",
    "english": "sound of moving water",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "浅",
        "english": "sound of moving water"
      }
    ],
    "homophones": [
      "浅"
    ],
    "nearPhones": [
      "jian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yán",
    "base": "yan",
    "chinese": "严",
    "english": "tight",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "严重",
        "english": "grave"
      }
    ],
    "homophones": [
      "严",
      "言",
      "研"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiān",
    "base": "xian",
    "chinese": "鲜",
    "english": "fresh",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "新鲜",
        "english": "fresh"
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
    "pinyin": "shǎng",
    "base": "shang",
    "chinese": "赏",
    "english": "to bestow",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "赏",
        "english": "to bestow"
      }
    ],
    "homophones": [
      "赏"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiāng",
    "base": "jiang",
    "chinese": "将",
    "english": "will",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "将来",
        "english": "in the future"
      }
    ],
    "homophones": [
      "江",
      "将"
    ],
    "nearPhones": [
      "qiang",
      "xiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shā",
    "base": "sha",
    "chinese": "杀",
    "english": "to kill",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "自杀",
        "english": "to kill oneself"
      }
    ],
    "homophones": [
      "杀"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shēng",
    "base": "sheng",
    "chinese": "声",
    "english": "sound",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "声音",
        "english": "voice"
      }
    ],
    "homophones": [
      "生",
      "声"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lìng",
    "base": "ling",
    "chinese": "令",
    "english": "used in 令",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "命令",
        "english": "order"
      }
    ],
    "homophones": [
      "令"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shén",
    "base": "shen",
    "chinese": "神",
    "english": "God",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "精神",
        "english": "spirit"
      }
    ],
    "homophones": [
      "神"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhì",
    "base": "zhi",
    "chinese": "至",
    "english": "to arrive",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "至少",
        "english": "at least"
      }
    ],
    "homophones": [
      "治",
      "至",
      "制",
      "致",
      "志"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dài",
    "base": "dai",
    "chinese": "待",
    "english": "to stay",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "等待",
        "english": "to wait"
      }
    ],
    "homophones": [
      "代",
      "待"
    ],
    "nearPhones": [
      "tai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "式",
    "english": "type",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "方式",
        "english": "way"
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
    "pinyin": "wǔ",
    "base": "wu",
    "chinese": "舞",
    "english": "to dance",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "舞",
        "english": "to dance"
      }
    ],
    "homophones": [
      "五",
      "午",
      "舞"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yuàn",
    "base": "yuan",
    "chinese": "愿",
    "english": "honest",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "愿意",
        "english": "to wish"
      }
    ],
    "homophones": [
      "愿",
      "怨"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hèn",
    "base": "hen",
    "chinese": "恨",
    "english": "to hate",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "恨",
        "english": "to hate"
      }
    ],
    "homophones": [
      "恨"
    ],
    "nearPhones": [
      "fen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shè",
    "base": "she",
    "chinese": "射",
    "english": "to shoot",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "发射",
        "english": "to shoot"
      }
    ],
    "homophones": [
      "射",
      "设"
    ],
    "nearPhones": [
      "se"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yùn",
    "base": "yun",
    "chinese": "运",
    "english": "to move",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "运动",
        "english": "to move"
      }
    ],
    "homophones": [
      "运"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jià",
    "base": "jia",
    "chinese": "价",
    "english": "price",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "价值",
        "english": "value"
      }
    ],
    "homophones": [
      "价"
    ],
    "nearPhones": [
      "xia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lǐ",
    "base": "li",
    "chinese": "礼",
    "english": "abbr. for 礼记",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "礼物",
        "english": "gift"
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
    "pinyin": "bì",
    "base": "bi",
    "chinese": "必",
    "english": "certainly",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "必须",
        "english": "to have to"
      }
    ],
    "homophones": [
      "必",
      "闭"
    ],
    "nearPhones": [
      "pi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hài",
    "base": "hai",
    "chinese": "害",
    "english": "to do harm to",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "害",
        "english": "to do harm to"
      }
    ],
    "homophones": [
      "害"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "rěn",
    "base": "ren",
    "chinese": "忍",
    "english": "to bear",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "忍受",
        "english": "to bear"
      }
    ],
    "homophones": [
      "忍"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dá",
    "base": "da",
    "chinese": "答",
    "english": "to answer",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "回答",
        "english": "to reply"
      }
    ],
    "homophones": [
      "答"
    ],
    "nearPhones": [
      "ta"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pǐn",
    "base": "pin",
    "chinese": "品",
    "english": "kind",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "作品",
        "english": "work"
      }
    ],
    "homophones": [
      "品"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chéng",
    "base": "cheng",
    "chinese": "乘",
    "english": "to ride",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "乘客",
        "english": "passenger"
      }
    ],
    "homophones": [
      "成",
      "城",
      "乘",
      "承",
      "诚"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "rèn",
    "base": "ren",
    "chinese": "认",
    "english": "to recognize",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "认识",
        "english": "to know"
      }
    ],
    "homophones": [
      "认"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hǔ",
    "base": "hu",
    "chinese": "虎",
    "english": "tiger",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "马虎",
        "english": "careless"
      }
    ],
    "homophones": [
      "虎"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "quàn",
    "base": "quan",
    "chinese": "劝",
    "english": "to advise",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "劝说",
        "english": "to persuade"
      }
    ],
    "homophones": [
      "劝"
    ],
    "nearPhones": [
      "juan",
      "xuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nuǎn",
    "base": "nuan",
    "chinese": "暖",
    "english": "warm",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "温暖",
        "english": "warm"
      }
    ],
    "homophones": [
      "暖"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cùn",
    "base": "cun",
    "chinese": "寸",
    "english": "a unit of length",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "尺寸",
        "english": "size"
      }
    ],
    "homophones": [
      "寸"
    ],
    "nearPhones": [
      "chun",
      "zun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fú",
    "base": "fu",
    "chinese": "扶",
    "english": "to support with the hand",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "扶持",
        "english": "to help"
      }
    ],
    "homophones": [
      "福",
      "扶",
      "服",
      "佛",
      "浮"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xián",
    "base": "xian",
    "chinese": "闲",
    "english": "enclosure",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "休闲",
        "english": "leisure"
      }
    ],
    "homophones": [
      "闲"
    ],
    "nearPhones": [
      "jian",
      "qian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiāng",
    "base": "xiang",
    "chinese": "乡",
    "english": "country or countryside",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "家乡",
        "english": "hometown"
      }
    ],
    "homophones": [
      "香",
      "乡",
      "相"
    ],
    "nearPhones": [
      "jiang",
      "qiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chóu",
    "base": "chou",
    "chinese": "愁",
    "english": "to worry about",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "发愁",
        "english": "to worry"
      }
    ],
    "homophones": [
      "愁"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yuàn",
    "base": "yuan",
    "chinese": "怨",
    "english": "to blame",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "抱怨",
        "english": "to complain"
      }
    ],
    "homophones": [
      "愿",
      "怨"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "quán",
    "base": "quan",
    "chinese": "泉",
    "english": "spring",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "温泉",
        "english": "hot spring"
      }
    ],
    "homophones": [
      "全",
      "泉",
      "权"
    ],
    "nearPhones": [
      "juan",
      "xuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shí",
    "base": "shi",
    "chinese": "拾",
    "english": "to ascend in light steps",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "收拾",
        "english": "to put in order"
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
    "pinyin": "yǔ",
    "base": "yu",
    "chinese": "与",
    "english": "and",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "参与",
        "english": "to participate"
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
    "pinyin": "rú",
    "base": "ru",
    "chinese": "如",
    "english": "as",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "如果",
        "english": "if"
      }
    ],
    "homophones": [
      "如"
    ],
    "nearPhones": [
      "lu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zuò",
    "base": "zuo",
    "chinese": "作",
    "english": "worker",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "工作",
        "english": "to work"
      }
    ],
    "homophones": [
      "作"
    ],
    "nearPhones": [
      "zhuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yīn",
    "base": "yin",
    "chinese": "因",
    "english": "cause",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "因",
        "english": "cause"
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
    "pinyin": "tè",
    "base": "te",
    "chinese": "特",
    "english": "special",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "特别",
        "english": "unusual"
      }
    ],
    "homophones": [
      "特"
    ],
    "nearPhones": [
      "de"
    ]
  }),
  createPinyinEntry({
    "pinyin": "biàn",
    "base": "bian",
    "chinese": "便",
    "english": "plain",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "方便",
        "english": "convenient"
      }
    ],
    "homophones": [
      "变",
      "便"
    ],
    "nearPhones": [
      "pian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qīng",
    "base": "qing",
    "chinese": "清",
    "english": "clear",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "清",
        "english": "clear"
      }
    ],
    "homophones": [
      "青",
      "轻",
      "清"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yuán",
    "base": "yuan",
    "chinese": "原",
    "english": "former",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "原因",
        "english": "cause"
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
    "pinyin": "jí",
    "base": "ji",
    "chinese": "集",
    "english": "to gather",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "集中",
        "english": "to concentrate"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "quán",
    "base": "quan",
    "chinese": "权",
    "english": "authority",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "权利",
        "english": "right"
      }
    ],
    "homophones": [
      "全",
      "泉",
      "权"
    ],
    "nearPhones": [
      "juan",
      "xuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jǐn",
    "base": "jin",
    "chinese": "尽",
    "english": "to the greatest extent",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "尽量",
        "english": "as much as possible"
      }
    ],
    "homophones": [
      "尽"
    ],
    "nearPhones": [
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lì",
    "base": "li",
    "chinese": "利",
    "english": "sharp",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "顺利",
        "english": "smoothly"
      }
    ],
    "homophones": [
      "力",
      "立",
      "利"
    ],
    "nearPhones": [
      "ni",
      "ri"
    ]
  }),
  createPinyinEntry({
    "pinyin": "ruò",
    "base": "ruo",
    "chinese": "若",
    "english": "to seem",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "若干",
        "english": "a certain number or amount"
      }
    ],
    "homophones": [
      "弱",
      "若"
    ],
    "nearPhones": [
      "luo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mìng",
    "base": "ming",
    "chinese": "命",
    "english": "life",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "生命",
        "english": "life"
      }
    ],
    "homophones": [
      "命"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhāo",
    "base": "zhao",
    "chinese": "招",
    "english": "to recruit",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "招呼",
        "english": "to call out to"
      }
    ],
    "homophones": [
      "招"
    ],
    "nearPhones": [
      "zao",
      "chao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fú",
    "base": "fu",
    "chinese": "服",
    "english": "clothes",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "衣服",
        "english": "clothes"
      }
    ],
    "homophones": [
      "福",
      "扶",
      "服",
      "佛",
      "浮"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lǐ",
    "base": "li",
    "chinese": "理",
    "english": "texture",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "经理",
        "english": "manager"
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
    "pinyin": "dǎo",
    "base": "dao",
    "chinese": "岛",
    "english": "island",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "半岛",
        "english": "peninsula"
      }
    ],
    "homophones": [
      "岛"
    ],
    "nearPhones": [
      "tao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hùn",
    "base": "hun",
    "chinese": "混",
    "english": "confused",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "混",
        "english": "confused"
      }
    ],
    "homophones": [
      "混"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jiě",
    "base": "jie",
    "chinese": "解",
    "english": "to divide",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "解",
        "english": "to divide"
      }
    ],
    "homophones": [
      "解"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zuì",
    "base": "zui",
    "chinese": "罪",
    "english": "guilt",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "罪",
        "english": "guilt"
      }
    ],
    "homophones": [
      "最",
      "罪"
    ],
    "nearPhones": [
      "zhui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yìn",
    "base": "yin",
    "chinese": "印",
    "english": "abbr. for 度",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "打印",
        "english": "to affix a seal"
      }
    ],
    "homophones": [
      "印"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chú",
    "base": "chu",
    "chinese": "除",
    "english": "to get rid of",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "除了",
        "english": "besides"
      }
    ],
    "homophones": [
      "除"
    ],
    "nearPhones": [
      "zhu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "duān",
    "base": "duan",
    "chinese": "端",
    "english": "end",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "极端",
        "english": "extreme"
      }
    ],
    "homophones": [
      "端"
    ],
    "nearPhones": [
      "tuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bì",
    "base": "bi",
    "chinese": "闭",
    "english": "to close",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "关闭",
        "english": "to close"
      }
    ],
    "homophones": [
      "必",
      "闭"
    ],
    "nearPhones": [
      "pi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zú",
    "base": "zu",
    "chinese": "足",
    "english": "excessive",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "满足",
        "english": "to satisfy"
      }
    ],
    "homophones": [
      "足",
      "族"
    ],
    "nearPhones": [
      "zhu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jué",
    "base": "jue",
    "chinese": "绝",
    "english": "to cut short",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "绝对",
        "english": "absolute"
      }
    ],
    "homophones": [
      "绝"
    ],
    "nearPhones": [
      "xue"
    ]
  }),
  createPinyinEntry({
    "pinyin": "liào",
    "base": "liao",
    "chinese": "料",
    "english": "material",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "料",
        "english": "material"
      }
    ],
    "homophones": [
      "料"
    ],
    "nearPhones": [
      "niao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lù",
    "base": "lu",
    "chinese": "露",
    "english": "to show",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "露",
        "english": "to show"
      }
    ],
    "homophones": [
      "路",
      "露",
      "陆",
      "鹿"
    ],
    "nearPhones": [
      "nu",
      "ru"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xíng",
    "base": "xing",
    "chinese": "形",
    "english": "to appear",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "形",
        "english": "to appear"
      }
    ],
    "homophones": [
      "行",
      "形"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shùn",
    "base": "shun",
    "chinese": "顺",
    "english": "to obey",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "顺利",
        "english": "smoothly"
      }
    ],
    "homophones": [
      "顺"
    ],
    "nearPhones": [
      "sun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yě",
    "base": "ye",
    "chinese": "野",
    "english": "field",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "野生",
        "english": "wild"
      }
    ],
    "homophones": [
      "也",
      "野"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zú",
    "base": "zu",
    "chinese": "族",
    "english": "race",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "民族",
        "english": "nationality"
      }
    ],
    "homophones": [
      "足",
      "族"
    ],
    "nearPhones": [
      "zhu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jīng",
    "base": "jing",
    "chinese": "精",
    "english": "essence",
    "gradeBand": "一年级",
    "examples": [
      {
        "word": "精神",
        "english": "spirit"
      }
    ],
    "homophones": [
      "精",
      "经",
      "惊",
      "京",
      "睛"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhāng",
    "base": "zhang",
    "chinese": "章",
    "english": "chapter",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "文章",
        "english": "article"
      }
    ],
    "homophones": [
      "章"
    ],
    "nearPhones": [
      "chang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pàn",
    "base": "pan",
    "chinese": "判",
    "english": "to judge",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "判",
        "english": "to judge"
      }
    ],
    "homophones": [
      "判"
    ],
    "nearPhones": [
      "ban"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuì",
    "base": "shui",
    "chinese": "税",
    "english": "taxes",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "税收",
        "english": "taxation"
      }
    ],
    "homophones": [
      "税",
      "睡"
    ],
    "nearPhones": [
      "sui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jǐng",
    "base": "jing",
    "chinese": "井",
    "english": "Jing",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "水井",
        "english": "water well"
      }
    ],
    "homophones": [
      "井",
      "景"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fú",
    "base": "fu",
    "chinese": "佛",
    "english": "Buddha",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "佛",
        "english": "Buddha"
      }
    ],
    "homophones": [
      "福",
      "扶",
      "服",
      "佛",
      "浮"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "miào",
    "base": "miao",
    "chinese": "妙",
    "english": "clever",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "妙",
        "english": "clever"
      }
    ],
    "homophones": [
      "妙"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fú",
    "base": "fu",
    "chinese": "浮",
    "english": "to float",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "浮现",
        "english": "to appear before one's eyes"
      }
    ],
    "homophones": [
      "福",
      "扶",
      "服",
      "佛",
      "浮"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wù",
    "base": "wu",
    "chinese": "误",
    "english": "mistake",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "误",
        "english": "mistake"
      }
    ],
    "homophones": [
      "误",
      "务",
      "物"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yuán",
    "base": "yuan",
    "chinese": "园",
    "english": "land used for growing plants",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "公园",
        "english": "park"
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
    "pinyin": "jìng",
    "base": "jing",
    "chinese": "净",
    "english": "clean",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "干净",
        "english": "clean"
      }
    ],
    "homophones": [
      "静",
      "净",
      "敬",
      "竞",
      "镜"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jǐng",
    "base": "jing",
    "chinese": "景",
    "english": "circumstance",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "景色",
        "english": "scenery"
      }
    ],
    "homophones": [
      "井",
      "景"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fān",
    "base": "fan",
    "chinese": "番",
    "english": "kind",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "番",
        "english": "kind"
      }
    ],
    "homophones": [
      "番"
    ],
    "nearPhones": [
      "han"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yáng",
    "base": "yang",
    "chinese": "洋",
    "english": "ocean",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "海洋",
        "english": "ocean"
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
    "pinyin": "zhī",
    "base": "zhi",
    "chinese": "枝",
    "english": "branch",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "树枝",
        "english": "branch"
      }
    ],
    "homophones": [
      "支",
      "枝",
      "知"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sì",
    "base": "si",
    "chinese": "寺",
    "english": "Buddhist temple",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "寺",
        "english": "Buddhist temple"
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
    "pinyin": "shí",
    "base": "shi",
    "chinese": "识",
    "english": "to know",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "认识",
        "english": "to know"
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
    "pinyin": "yǎng",
    "base": "yang",
    "chinese": "仰",
    "english": "to face upward",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "信仰",
        "english": "to believe in"
      }
    ],
    "homophones": [
      "养",
      "仰"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yǐ",
    "base": "yi",
    "chinese": "以",
    "english": "abbr. for Israel 列",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "可以",
        "english": "can"
      }
    ],
    "homophones": [
      "已",
      "以",
      "蚁",
      "椅"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jí",
    "base": "ji",
    "chinese": "及",
    "english": "and",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "及时",
        "english": "timely"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wèi",
    "base": "wei",
    "chinese": "未",
    "english": "not yet",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "未来",
        "english": "future"
      }
    ],
    "homophones": [
      "位",
      "未",
      "味"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gǎn",
    "base": "gan",
    "chinese": "感",
    "english": "to feel",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "感",
        "english": "to feel"
      }
    ],
    "homophones": [
      "敢",
      "感"
    ],
    "nearPhones": [
      "kan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zé",
    "base": "ze",
    "chinese": "则",
    "english": "common character",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "否则",
        "english": "otherwise"
      }
    ],
    "homophones": [
      "则",
      "责"
    ],
    "nearPhones": [
      "zhe",
      "ce"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qíng",
    "base": "qing",
    "chinese": "情",
    "english": "feeling",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "事情",
        "english": "affair"
      }
    ],
    "homophones": [
      "晴",
      "情"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dé",
    "base": "de",
    "chinese": "德",
    "english": "Germany",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "道德",
        "english": "virtue"
      }
    ],
    "homophones": [
      "得",
      "德"
    ],
    "nearPhones": [
      "te"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jīng",
    "base": "jing",
    "chinese": "经",
    "english": "classics",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "已经",
        "english": "already"
      }
    ],
    "homophones": [
      "精",
      "经",
      "惊",
      "京",
      "睛"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xǔ",
    "base": "xu",
    "chinese": "许",
    "english": "to allow",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "也许",
        "english": "perhaps"
      }
    ],
    "homophones": [
      "许"
    ],
    "nearPhones": [
      "ju",
      "qu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhù",
    "base": "zhu",
    "chinese": "注",
    "english": "to inject",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "注意",
        "english": "to take note of"
      }
    ],
    "homophones": [
      "住",
      "祝",
      "注",
      "助"
    ],
    "nearPhones": [
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhì",
    "base": "zhi",
    "chinese": "制",
    "english": "system",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "制造",
        "english": "to manufacture"
      }
    ],
    "homophones": [
      "治",
      "至",
      "制",
      "致",
      "志"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tàn",
    "base": "tan",
    "chinese": "探",
    "english": "to explore",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "探",
        "english": "to explore"
      }
    ],
    "homophones": [
      "探"
    ],
    "nearPhones": [
      "dan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qū",
    "base": "qu",
    "chinese": "曲",
    "english": "bent",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "歌曲",
        "english": "song"
      }
    ],
    "homophones": [
      "区",
      "曲"
    ],
    "nearPhones": [
      "ju",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shè",
    "base": "she",
    "chinese": "设",
    "english": "to set up",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "设计",
        "english": "to design"
      }
    ],
    "homophones": [
      "射",
      "设"
    ],
    "nearPhones": [
      "se"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sù",
    "base": "su",
    "chinese": "素",
    "english": "raw silk",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "因素",
        "english": "element"
      }
    ],
    "homophones": [
      "素"
    ],
    "nearPhones": [
      "shu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yè",
    "base": "ye",
    "chinese": "业",
    "english": "line of business",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "作业",
        "english": "school assignment"
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
    "pinyin": "jīng",
    "base": "jing",
    "chinese": "惊",
    "english": "to startle",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "吃惊",
        "english": "to be startled"
      }
    ],
    "homophones": [
      "精",
      "经",
      "惊",
      "京",
      "睛"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jì",
    "base": "ji",
    "chinese": "计",
    "english": "to calculate",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "计",
        "english": "to calculate"
      }
    ],
    "homophones": [
      "记",
      "季",
      "计",
      "技"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chǎn",
    "base": "chan",
    "chinese": "产",
    "english": "to give birth",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "产生",
        "english": "to arise"
      }
    ],
    "homophones": [
      "产"
    ],
    "nearPhones": [
      "zhan",
      "can"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gào",
    "base": "gao",
    "chinese": "告",
    "english": "to say",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "告",
        "english": "to say"
      }
    ],
    "homophones": [
      "告"
    ],
    "nearPhones": [
      "kao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wàng",
    "base": "wang",
    "chinese": "望",
    "english": "full moon",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "望",
        "english": "full moon"
      }
    ],
    "homophones": [
      "忘",
      "望"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zhì",
    "base": "zhi",
    "chinese": "致",
    "english": "to send",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "致",
        "english": "to send"
      }
    ],
    "homophones": [
      "治",
      "至",
      "制",
      "致",
      "志"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chí",
    "base": "chi",
    "chinese": "持",
    "english": "to hold",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "支持",
        "english": "to be in favor of"
      }
    ],
    "homophones": [
      "持"
    ],
    "nearPhones": [
      "zhi",
      "ci"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiē",
    "base": "jie",
    "chinese": "皆",
    "english": "all",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "皆可",
        "english": "all okay"
      }
    ],
    "homophones": [
      "接",
      "街",
      "皆"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shàn",
    "base": "shan",
    "chinese": "善",
    "english": "good",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "完善",
        "english": "comprehensive"
      }
    ],
    "homophones": [
      "善",
      "扇"
    ],
    "nearPhones": [
      "san"
    ]
  }),
  createPinyinEntry({
    "pinyin": "è",
    "base": "e",
    "chinese": "恶",
    "english": "used in 恶心",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "恶心",
        "english": "nausea"
      }
    ],
    "homophones": [
      "恶"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "táng",
    "base": "tang",
    "chinese": "堂",
    "english": "hall",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "课堂",
        "english": "classroom"
      }
    ],
    "homophones": [
      "堂"
    ],
    "nearPhones": [
      "dang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dú",
    "base": "du",
    "chinese": "独",
    "english": "alone",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "独立",
        "english": "independent"
      }
    ],
    "homophones": [
      "读",
      "独"
    ],
    "nearPhones": [
      "tu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yī",
    "base": "yi",
    "chinese": "依",
    "english": "to depend on",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "依然",
        "english": "still"
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
    "pinyin": "miǎn",
    "base": "mian",
    "chinese": "免",
    "english": "to excuse sb",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "免",
        "english": "to excuse sb"
      }
    ],
    "homophones": [
      "免"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "làng",
    "base": "lang",
    "chinese": "浪",
    "english": "wave",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "浪",
        "english": "wave"
      }
    ],
    "homophones": [
      "浪"
    ],
    "nearPhones": [
      "rang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xū",
    "base": "xu",
    "chinese": "须",
    "english": "must",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "必须",
        "english": "to have to"
      }
    ],
    "homophones": [
      "须",
      "虚"
    ],
    "nearPhones": [
      "ju",
      "qu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìng",
    "base": "jing",
    "chinese": "敬",
    "english": "to offer politely",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "尊敬",
        "english": "to respect"
      }
    ],
    "homophones": [
      "静",
      "净",
      "敬",
      "竞",
      "镜"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cǎi",
    "base": "cai",
    "chinese": "采",
    "english": "to pick",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "采取",
        "english": "to adopt or carry out"
      }
    ],
    "homophones": [
      "采"
    ],
    "nearPhones": [
      "zai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gōng",
    "base": "gong",
    "chinese": "功",
    "english": "meritorious deed or service",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "成功",
        "english": "success"
      }
    ],
    "homophones": [
      "工",
      "公",
      "功",
      "弓"
    ],
    "nearPhones": [
      "kong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiāo",
    "base": "xiao",
    "chinese": "消",
    "english": "to diminish",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "消",
        "english": "to diminish"
      }
    ],
    "homophones": [
      "消"
    ],
    "nearPhones": [
      "jiao",
      "qiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiàn",
    "base": "xian",
    "chinese": "限",
    "english": "to limit",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "限制",
        "english": "to restrict"
      }
    ],
    "homophones": [
      "线",
      "限",
      "现"
    ],
    "nearPhones": [
      "jian",
      "qian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xùn",
    "base": "xun",
    "chinese": "训",
    "english": "to teach",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "训练",
        "english": "to train"
      }
    ],
    "homophones": [
      "训"
    ],
    "nearPhones": [
      "qun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xū",
    "base": "xu",
    "chinese": "虚",
    "english": "emptiness",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "虚心",
        "english": "open-minded"
      }
    ],
    "homophones": [
      "须",
      "虚"
    ],
    "nearPhones": [
      "ju",
      "qu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xí",
    "base": "xi",
    "chinese": "席",
    "english": "woven mat",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "主席",
        "english": "chairperson"
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
    "pinyin": "gù",
    "base": "gu",
    "chinese": "故",
    "english": "happening",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "故事",
        "english": "old practice"
      }
    ],
    "homophones": [
      "故",
      "固"
    ],
    "nearPhones": [
      "ku"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yáng",
    "base": "yang",
    "chinese": "扬",
    "english": "abbr. for 扬州",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "表扬",
        "english": "to praise"
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
    "pinyin": "zhuàng",
    "base": "zhuang",
    "chinese": "壮",
    "english": "Zhuang ethnic group of Guangxi",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "强壮",
        "english": "strong"
      }
    ],
    "homophones": [
      "壮"
    ],
    "nearPhones": [
      "chuang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chōng",
    "base": "chong",
    "chinese": "充",
    "english": "sufficient",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "充满",
        "english": "full of"
      }
    ],
    "homophones": [
      "充"
    ],
    "nearPhones": [
      "zhong",
      "cong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shèng",
    "base": "sheng",
    "chinese": "盛",
    "english": "to hold",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "盛行",
        "english": "to be in vogue"
      }
    ],
    "homophones": [
      "胜",
      "盛"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xù",
    "base": "xu",
    "chinese": "续",
    "english": "to continue",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "续",
        "english": "to continue"
      }
    ],
    "homophones": [
      "续",
      "序"
    ],
    "nearPhones": [
      "ju",
      "qu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yíng",
    "base": "ying",
    "chinese": "迎",
    "english": "to welcome",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "欢迎",
        "english": "to welcome"
      }
    ],
    "homophones": [
      "迎"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "sú",
    "base": "su",
    "chinese": "俗",
    "english": "custom",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "风俗",
        "english": "social custom"
      }
    ],
    "homophones": [
      "俗"
    ],
    "nearPhones": [
      "shu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yú",
    "base": "yu",
    "chinese": "余",
    "english": "I",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "余",
        "english": "I"
      }
    ],
    "homophones": [
      "鱼",
      "余"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liáng",
    "base": "liang",
    "chinese": "良",
    "english": "good",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "良好",
        "english": "good"
      }
    ],
    "homophones": [
      "凉",
      "良"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zāi",
    "base": "zai",
    "chinese": "栽",
    "english": "to plant",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "栽",
        "english": "to plant"
      }
    ],
    "homophones": [
      "栽"
    ],
    "nearPhones": [
      "cai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nì",
    "base": "ni",
    "chinese": "逆",
    "english": "contrary",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "逆",
        "english": "contrary"
      }
    ],
    "homophones": [
      "逆"
    ],
    "nearPhones": [
      "li"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gōng",
    "base": "gong",
    "chinese": "弓",
    "english": "bow",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "弓",
        "english": "bow"
      }
    ],
    "homophones": [
      "工",
      "公",
      "功",
      "弓"
    ],
    "nearPhones": [
      "kong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "议",
    "english": "to comment on",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "建议",
        "english": "to propose"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xù",
    "base": "xu",
    "chinese": "序",
    "english": "preface",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "序",
        "english": "preface"
      }
    ],
    "homophones": [
      "续",
      "序"
    ],
    "nearPhones": [
      "ju",
      "qu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiàn",
    "base": "xian",
    "chinese": "现",
    "english": "to appear",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "现在",
        "english": "now"
      }
    ],
    "homophones": [
      "线",
      "限",
      "现"
    ],
    "nearPhones": [
      "jian",
      "qian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhī",
    "base": "zhi",
    "chinese": "知",
    "english": "to know",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "知道",
        "english": "to know"
      }
    ],
    "homophones": [
      "支",
      "枝",
      "知"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xǐ",
    "base": "xi",
    "chinese": "喜",
    "english": "to love",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "喜欢",
        "english": "to like"
      }
    ],
    "homophones": [
      "洗",
      "喜"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huān",
    "base": "huan",
    "chinese": "欢",
    "english": "happy",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "喜欢",
        "english": "to like"
      }
    ],
    "homophones": [
      "欢"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bèi",
    "base": "bei",
    "chinese": "备",
    "english": "to prepare",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "备",
        "english": "to prepare"
      }
    ],
    "homophones": [
      "贝",
      "备"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiào",
    "base": "xiao",
    "chinese": "校",
    "english": "school",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "学校",
        "english": "school"
      }
    ],
    "homophones": [
      "笑",
      "校"
    ],
    "nearPhones": [
      "jiao",
      "qiao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shēn",
    "base": "shen",
    "chinese": "身",
    "english": "body",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "身上",
        "english": "on the body"
      }
    ],
    "homophones": [
      "深",
      "身"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "xiè",
    "base": "xie",
    "chinese": "谢",
    "english": "to thank",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "谢谢",
        "english": "to thank"
      }
    ],
    "homophones": [
      "谢"
    ],
    "nearPhones": [
      "jie",
      "qie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zuó",
    "base": "zuo",
    "chinese": "昨",
    "english": "yesterday",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "昨天",
        "english": "yesterday"
      }
    ],
    "homophones": [
      "昨"
    ],
    "nearPhones": [
      "zhuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yī",
    "base": "yi",
    "chinese": "医",
    "english": "to cure",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "医",
        "english": "to cure"
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
    "pinyin": "tǐ",
    "base": "ti",
    "chinese": "体",
    "english": "body",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "身体",
        "english": "the body"
      }
    ],
    "homophones": [
      "体"
    ],
    "nearPhones": [
      "di"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "视",
    "english": "to look at",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "电视",
        "english": "television"
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
    "pinyin": "shī",
    "base": "shi",
    "chinese": "师",
    "english": "teacher",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "老师",
        "english": "teacher"
      }
    ],
    "homophones": [
      "诗",
      "师",
      "失"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xìng",
    "base": "xing",
    "chinese": "兴",
    "english": "to thrive",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "高兴",
        "english": "happy"
      }
    ],
    "homophones": [
      "姓",
      "性",
      "兴",
      "幸"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiū",
    "base": "xiu",
    "chinese": "休",
    "english": "to rest",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "休",
        "english": "to rest"
      }
    ],
    "homophones": [
      "修",
      "休"
    ],
    "nearPhones": [
      "jiu",
      "qiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xīng",
    "base": "xing",
    "chinese": "星",
    "english": "star",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "星期",
        "english": "week"
      }
    ],
    "homophones": [
      "星"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shāng",
    "base": "shang",
    "chinese": "商",
    "english": "commerce",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "商店",
        "english": "store"
      }
    ],
    "homophones": [
      "伤",
      "商"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jīng",
    "base": "jing",
    "chinese": "京",
    "english": "capital city",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "北京",
        "english": "Beijing"
      }
    ],
    "homophones": [
      "精",
      "经",
      "惊",
      "京",
      "睛"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǔ",
    "base": "yu",
    "chinese": "语",
    "english": "words",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "外语",
        "english": "foreign language"
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
    "pinyin": "hàn",
    "base": "han",
    "chinese": "汉",
    "english": "Chinese people",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "汉语",
        "english": "Chinese language"
      }
    ],
    "homophones": [
      "汉"
    ],
    "nearPhones": [
      "fan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "rán",
    "base": "ran",
    "chinese": "然",
    "english": "certainly",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "然后",
        "english": "then"
      }
    ],
    "homophones": [
      "然"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cān",
    "base": "can",
    "chinese": "参",
    "english": "to take part in",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "参加",
        "english": "to participate"
      }
    ],
    "homophones": [
      "参"
    ],
    "nearPhones": [
      "chan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiāng",
    "base": "xiang",
    "chinese": "相",
    "english": "mutual",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "相信",
        "english": "to be convinced"
      }
    ],
    "homophones": [
      "香",
      "乡",
      "相"
    ],
    "nearPhones": [
      "jiang",
      "qiang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhù",
    "base": "zhu",
    "chinese": "助",
    "english": "to help",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "助",
        "english": "to help"
      }
    ],
    "homophones": [
      "住",
      "祝",
      "注",
      "助"
    ],
    "nearPhones": [
      "zu",
      "chu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǒng",
    "base": "yong",
    "chinese": "永",
    "english": "long",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "永远",
        "english": "forever"
      }
    ],
    "homophones": [
      "永",
      "勇"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "tíng",
    "base": "ting",
    "chinese": "庭",
    "english": "court",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "家庭",
        "english": "family"
      }
    ],
    "homophones": [
      "停",
      "庭"
    ],
    "nearPhones": [
      "ding"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wù",
    "base": "wu",
    "chinese": "务",
    "english": "affairs",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "服务",
        "english": "to serve"
      }
    ],
    "homophones": [
      "误",
      "务",
      "物"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "意",
    "english": "thought",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "愿意",
        "english": "to wish"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yīn",
    "base": "yin",
    "chinese": "音",
    "english": "sound",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "音乐",
        "english": "music"
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
    "pinyin": "sī",
    "base": "si",
    "chinese": "思",
    "english": "to think",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "意思",
        "english": "idea"
      }
    ],
    "homophones": [
      "思"
    ],
    "nearPhones": [
      "shi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shí",
    "base": "shi",
    "chinese": "实",
    "english": "real",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "实现",
        "english": "to achieve"
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
    "pinyin": "yù",
    "base": "yu",
    "chinese": "育",
    "english": "to produce",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "教育",
        "english": "to educate"
      }
    ],
    "homophones": [
      "玉",
      "遇",
      "育"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wù",
    "base": "wu",
    "chinese": "物",
    "english": "thing",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "动物",
        "english": "animal"
      }
    ],
    "homophones": [
      "误",
      "务",
      "物"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "wèi",
    "base": "wei",
    "chinese": "味",
    "english": "taste",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "味道",
        "english": "flavor"
      }
    ],
    "homophones": [
      "位",
      "未",
      "味"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shí",
    "base": "shi",
    "chinese": "食",
    "english": "food",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "食物",
        "english": "food"
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
    "pinyin": "yán",
    "base": "yan",
    "chinese": "言",
    "english": "words",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "语言",
        "english": "language"
      }
    ],
    "homophones": [
      "严",
      "言",
      "研"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yīng",
    "base": "ying",
    "chinese": "英",
    "english": "petal",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "英语",
        "english": "English"
      }
    ],
    "homophones": [
      "应",
      "英"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "适",
    "english": "match",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "合适",
        "english": "suitable"
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
    "pinyin": "guān",
    "base": "guan",
    "chinese": "观",
    "english": "to observe",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "观点",
        "english": "point of view"
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
    "pinyin": "lǚ",
    "base": "lü",
    "chinese": "旅",
    "english": "journey",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "旅行",
        "english": "to travel"
      }
    ],
    "homophones": [
      "旅"
    ],
    "nearPhones": [
      "nü"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kè",
    "base": "ke",
    "chinese": "客",
    "english": "guest",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "客",
        "english": "guest"
      }
    ],
    "homophones": [
      "课",
      "客"
    ],
    "nearPhones": [
      "ge"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xià",
    "base": "xia",
    "chinese": "夏",
    "english": "summer",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "夏天",
        "english": "summer"
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
    "pinyin": "wēn",
    "base": "wen",
    "chinese": "温",
    "english": "warm",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "温度",
        "english": "temperature"
      }
    ],
    "homophones": [
      "温"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chūn",
    "base": "chun",
    "chinese": "春",
    "english": "springtime",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "春天",
        "english": "spring"
      }
    ],
    "homophones": [
      "春"
    ],
    "nearPhones": [
      "cun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qiū",
    "base": "qiu",
    "chinese": "秋",
    "english": "autumn",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "秋天",
        "english": "autumn"
      }
    ],
    "homophones": [
      "秋"
    ],
    "nearPhones": [
      "jiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shǐ",
    "base": "shi",
    "chinese": "始",
    "english": "to begin",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "开始",
        "english": "to begin"
      }
    ],
    "homophones": [
      "使",
      "始",
      "史"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "世",
    "english": "generation",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "世界",
        "english": "world"
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
    "pinyin": "jiè",
    "base": "jie",
    "chinese": "界",
    "english": "boundary",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "世界",
        "english": "world"
      }
    ],
    "homophones": [
      "借",
      "界"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hé",
    "base": "he",
    "chinese": "何",
    "english": "what",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "何",
        "english": "what"
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
    "pinyin": "zhōng",
    "base": "zhong",
    "chinese": "终",
    "english": "end",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "终",
        "english": "end"
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
    "pinyin": "yì",
    "base": "yi",
    "chinese": "易",
    "english": "to change",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "容易",
        "english": "easy"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "róng",
    "base": "rong",
    "chinese": "容",
    "english": "appearance",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "容易",
        "english": "easy"
      }
    ],
    "homophones": [
      "容"
    ],
    "nearPhones": [
      "long"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiān",
    "base": "jian",
    "chinese": "坚",
    "english": "hard",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "坚持",
        "english": "to persevere with"
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
    "pinyin": "jì",
    "base": "ji",
    "chinese": "技",
    "english": "ability",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "技",
        "english": "ability"
      }
    ],
    "homophones": [
      "记",
      "季",
      "计",
      "技"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhǎn",
    "base": "zhan",
    "chinese": "展",
    "english": "to open",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "发展",
        "english": "development"
      }
    ],
    "homophones": [
      "展"
    ],
    "nearPhones": [
      "chan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zé",
    "base": "ze",
    "chinese": "责",
    "english": "one's responsibility",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "责",
        "english": "one's responsibility"
      }
    ],
    "homophones": [
      "则",
      "责"
    ],
    "nearPhones": [
      "zhe",
      "ce"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xìng",
    "base": "xing",
    "chinese": "幸",
    "english": "favor",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "幸福",
        "english": "happiness"
      }
    ],
    "homophones": [
      "姓",
      "性",
      "兴",
      "幸"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shī",
    "base": "shi",
    "chinese": "失",
    "english": "to lose",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "失去",
        "english": "to lose"
      }
    ],
    "homophones": [
      "诗",
      "师",
      "失"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mín",
    "base": "min",
    "chinese": "民",
    "english": "citizens",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "人民",
        "english": "the people"
      }
    ],
    "homophones": [
      "民"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "示",
    "english": "altar",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "示",
        "english": "altar"
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
    "pinyin": "wěi",
    "base": "wei",
    "chinese": "伟",
    "english": "great",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "伟大",
        "english": "huge"
      }
    ],
    "homophones": [
      "伟",
      "尾"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zēng",
    "base": "zeng",
    "chinese": "增",
    "english": "to increase",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "增加",
        "english": "to raise"
      }
    ],
    "homophones": [
      "增"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "艺",
    "english": "art",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "艺",
        "english": "art"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "势",
    "english": "power",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "势",
        "english": "power"
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
    "pinyin": "liè",
    "base": "lie",
    "chinese": "烈",
    "english": "fiery",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "强烈",
        "english": "strong"
      }
    ],
    "homophones": [
      "列",
      "烈"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qìng",
    "base": "qing",
    "chinese": "庆",
    "english": "to congratulate",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "庆祝",
        "english": "to celebrate"
      }
    ],
    "homophones": [
      "庆"
    ],
    "nearPhones": [
      "jing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fēng",
    "base": "feng",
    "chinese": "丰",
    "english": "abundant",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "丰富",
        "english": "to enrich"
      }
    ],
    "homophones": [
      "风",
      "丰"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fǎng",
    "base": "fang",
    "chinese": "访",
    "english": "to visit",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "访问",
        "english": "to visit"
      }
    ],
    "homophones": [
      "访"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "fǒu",
    "base": "fou",
    "chinese": "否",
    "english": "no",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "否认",
        "english": "to declare to be untrue"
      }
    ],
    "homophones": [
      "否"
    ],
    "nearPhones": [
      "hou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "fū",
    "base": "fu",
    "chinese": "夫",
    "english": "man",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "功夫",
        "english": "skill"
      }
    ],
    "homophones": [
      "夫"
    ],
    "nearPhones": [
      "hu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wū",
    "base": "wu",
    "chinese": "屋",
    "english": "building",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "屋",
        "english": "building"
      }
    ],
    "homophones": [
      "屋"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nóng",
    "base": "nong",
    "chinese": "农",
    "english": "agriculture",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "农民",
        "english": "peasant"
      }
    ],
    "homophones": [
      "农"
    ],
    "nearPhones": [
      "long"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhì",
    "base": "zhi",
    "chinese": "志",
    "english": "determination",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "志愿",
        "english": "aspiration"
      }
    ],
    "homophones": [
      "治",
      "至",
      "制",
      "致",
      "志"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "huá",
    "base": "hua",
    "chinese": "华",
    "english": "flowery",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "华人",
        "english": "ethnic Chinese person or people"
      }
    ],
    "homophones": [
      "华"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "cái",
    "base": "cai",
    "chinese": "材",
    "english": "timber",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "教材",
        "english": "teaching material"
      }
    ],
    "homophones": [
      "才",
      "材"
    ],
    "nearPhones": [
      "zai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiū",
    "base": "jiu",
    "chinese": "究",
    "english": "to dig into",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "究",
        "english": "to dig into"
      }
    ],
    "homophones": [
      "究"
    ],
    "nearPhones": [
      "qiu",
      "xiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yán",
    "base": "yan",
    "chinese": "研",
    "english": "to grind",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "研",
        "english": "to grind"
      }
    ],
    "homophones": [
      "严",
      "言",
      "研"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shǐ",
    "base": "shi",
    "chinese": "史",
    "english": "history",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "史",
        "english": "history"
      }
    ],
    "homophones": [
      "使",
      "始",
      "史"
    ],
    "nearPhones": [
      "si"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiōng",
    "base": "xiong",
    "chinese": "兄",
    "english": "elder brother",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "兄弟",
        "english": "brothers"
      }
    ],
    "homophones": [
      "兄",
      "胸"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chéng",
    "base": "cheng",
    "chinese": "承",
    "english": "to undertake",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "承认",
        "english": "to admit"
      }
    ],
    "homophones": [
      "成",
      "城",
      "乘",
      "承",
      "诚"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhe",
    "base": "zhe",
    "chinese": "著",
    "english": "to show",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "著名",
        "english": "famous"
      }
    ],
    "homophones": [
      "着",
      "著"
    ],
    "nearPhones": [
      "ze",
      "che"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jù",
    "base": "ju",
    "chinese": "巨",
    "english": "large",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "巨大",
        "english": "huge"
      }
    ],
    "homophones": [
      "句",
      "巨"
    ],
    "nearPhones": [
      "qu",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiù",
    "base": "xiu",
    "chinese": "秀",
    "english": "elegant",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "秀",
        "english": "elegant"
      }
    ],
    "homophones": [
      "秀"
    ],
    "nearPhones": [
      "jiu",
      "qiu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tóng",
    "base": "tong",
    "chinese": "童",
    "english": "child",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "儿童",
        "english": "child"
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
    "pinyin": "àn",
    "base": "an",
    "chinese": "案",
    "english": "file",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "答案",
        "english": "answer"
      }
    ],
    "homophones": [
      "暗",
      "案"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hū",
    "base": "hu",
    "chinese": "呼",
    "english": "to breathe",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "呼",
        "english": "to breathe"
      }
    ],
    "homophones": [
      "呼"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shì",
    "base": "shi",
    "chinese": "士",
    "english": "scholar",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "女士",
        "english": "lady"
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
    "pinyin": "jū",
    "base": "ju",
    "chinese": "居",
    "english": "to live",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "居民",
        "english": "resident"
      }
    ],
    "homophones": [
      "居"
    ],
    "nearPhones": [
      "qu",
      "xu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìn",
    "base": "jin",
    "chinese": "禁",
    "english": "to restrict",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "禁止",
        "english": "to prohibit"
      }
    ],
    "homophones": [
      "进",
      "近",
      "禁"
    ],
    "nearPhones": [
      "qin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǒng",
    "base": "yong",
    "chinese": "勇",
    "english": "brave",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "勇敢",
        "english": "brave"
      }
    ],
    "homophones": [
      "永",
      "勇"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gù",
    "base": "gu",
    "chinese": "固",
    "english": "to solidify",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "固定",
        "english": "to fix"
      }
    ],
    "homophones": [
      "故",
      "固"
    ],
    "nearPhones": [
      "ku"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lù",
    "base": "lu",
    "chinese": "陆",
    "english": "land",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "大陆",
        "english": "mainland China"
      }
    ],
    "homophones": [
      "路",
      "露",
      "陆",
      "鹿"
    ],
    "nearPhones": [
      "nu",
      "ru"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhí",
    "base": "zhi",
    "chinese": "植",
    "english": "tree",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "植物",
        "english": "plant"
      }
    ],
    "homophones": [
      "直",
      "植",
      "执",
      "值"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "chuāng",
    "base": "chuang",
    "chinese": "窗",
    "english": "window",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "窗户",
        "english": "window"
      }
    ],
    "homophones": [
      "窗"
    ],
    "nearPhones": [
      "zhuang"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xiōng",
    "base": "xiong",
    "chinese": "胸",
    "english": "breast",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "胸部",
        "english": "chest"
      }
    ],
    "homophones": [
      "兄",
      "胸"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yí",
    "base": "yi",
    "chinese": "遗",
    "english": "to lose",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "遗产",
        "english": "heritage"
      }
    ],
    "homophones": [
      "移",
      "遗"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chéng",
    "base": "cheng",
    "chinese": "诚",
    "english": "honest",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "诚实",
        "english": "honest"
      }
    ],
    "homophones": [
      "成",
      "城",
      "乘",
      "承",
      "诚"
    ],
    "nearPhones": [
      "zheng"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gǔ",
    "base": "gu",
    "chinese": "骨",
    "english": "bone",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "骨头",
        "english": "bone"
      }
    ],
    "homophones": [
      "古",
      "骨",
      "谷"
    ],
    "nearPhones": [
      "ku"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sūn",
    "base": "sun",
    "chinese": "孙",
    "english": "grandchild",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "孙女",
        "english": "granddaughter"
      }
    ],
    "homophones": [
      "孙"
    ],
    "nearPhones": [
      "shun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dòu",
    "base": "dou",
    "chinese": "豆",
    "english": "beans",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "豆",
        "english": "beans"
      }
    ],
    "homophones": [
      "豆"
    ],
    "nearPhones": [
      "tou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hán",
    "base": "han",
    "chinese": "寒",
    "english": "chilly",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "寒冷",
        "english": "cold"
      }
    ],
    "homophones": [
      "寒"
    ],
    "nearPhones": [
      "fan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wěi",
    "base": "wei",
    "chinese": "尾",
    "english": "tail",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "尾",
        "english": "tail"
      }
    ],
    "homophones": [
      "伟",
      "尾"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "lín",
    "base": "lin",
    "chinese": "林",
    "english": "forest",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "树林",
        "english": "woods"
      }
    ],
    "homophones": [
      "林"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shǔ",
    "base": "shu",
    "chinese": "暑",
    "english": "hot",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "暑假",
        "english": "summer vacation"
      }
    ],
    "homophones": [
      "暑"
    ],
    "nearPhones": [
      "su"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yè",
    "base": "ye",
    "chinese": "叶",
    "english": "leaf",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "叶子",
        "english": "leaf"
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
    "pinyin": "zhí",
    "base": "zhi",
    "chinese": "执",
    "english": "to execute",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "执行",
        "english": "to implement"
      }
    ],
    "homophones": [
      "直",
      "植",
      "执",
      "值"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìng",
    "base": "jing",
    "chinese": "竞",
    "english": "to compete",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "竞争",
        "english": "to compete"
      }
    ],
    "homophones": [
      "静",
      "净",
      "敬",
      "竞",
      "镜"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "忆",
    "english": "to remember",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "记忆",
        "english": "to remember"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "zūn",
    "base": "zun",
    "chinese": "尊",
    "english": "to honor",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "尊重",
        "english": "to esteem"
      }
    ],
    "homophones": [
      "尊"
    ],
    "nearPhones": [
      "cun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xī",
    "base": "xi",
    "chinese": "惜",
    "english": "pity",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "可惜",
        "english": "it is a pity"
      }
    ],
    "homophones": [
      "西",
      "惜",
      "夕"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xīn",
    "base": "xin",
    "chinese": "辛",
    "english": "bitter",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "辛苦",
        "english": "exhausting"
      }
    ],
    "homophones": [
      "心",
      "新",
      "辛"
    ],
    "nearPhones": [
      "jin",
      "qin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǐn",
    "base": "yin",
    "chinese": "饮",
    "english": "to swallow",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "饮料",
        "english": "drink"
      }
    ],
    "homophones": [
      "引",
      "饮"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bí",
    "base": "bi",
    "chinese": "鼻",
    "english": "nose",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "鼻子",
        "english": "nose"
      }
    ],
    "homophones": [
      "鼻"
    ],
    "nearPhones": [
      "pi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "hè",
    "base": "he",
    "chinese": "贺",
    "english": "to congratulate",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "祝贺",
        "english": "to congratulate"
      }
    ],
    "homophones": [
      "贺"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shě",
    "base": "she",
    "chinese": "舍",
    "english": "house",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "舍",
        "english": "house"
      }
    ],
    "homophones": [
      "舍"
    ],
    "nearPhones": [
      "se"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mián",
    "base": "mian",
    "chinese": "眠",
    "english": "sleep",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "睡眠",
        "english": "sleep"
      }
    ],
    "homophones": [
      "眠"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "láo",
    "base": "lao",
    "chinese": "劳",
    "english": "to labor",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "劳动",
        "english": "work"
      }
    ],
    "homophones": [
      "劳"
    ],
    "nearPhones": [
      "nao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qín",
    "base": "qin",
    "chinese": "勤",
    "english": "industrious",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "勤",
        "english": "industrious"
      }
    ],
    "homophones": [
      "勤",
      "琴"
    ],
    "nearPhones": [
      "jin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xī",
    "base": "xi",
    "chinese": "夕",
    "english": "evening",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "除夕",
        "english": "lunar New Year's Eve"
      }
    ],
    "homophones": [
      "西",
      "惜",
      "夕"
    ],
    "nearPhones": [
      "ji",
      "qi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yì",
    "base": "yi",
    "chinese": "异",
    "english": "different",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "异常",
        "english": "unusual"
      }
    ],
    "homophones": [
      "亿",
      "议",
      "意",
      "易",
      "艺",
      "忆"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "nù",
    "base": "nu",
    "chinese": "怒",
    "english": "anger",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "怒",
        "english": "anger"
      }
    ],
    "homophones": [
      "怒"
    ],
    "nearPhones": [
      "lu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jié",
    "base": "jie",
    "chinese": "洁",
    "english": "clean",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "清洁",
        "english": "clean"
      }
    ],
    "homophones": [
      "节",
      "结",
      "洁"
    ],
    "nearPhones": [
      "qie",
      "xie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shé",
    "base": "she",
    "chinese": "舌",
    "english": "tongue",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "舌头",
        "english": "tongue"
      }
    ],
    "homophones": [
      "舌"
    ],
    "nearPhones": [
      "se"
    ]
  }),
  createPinyinEntry({
    "pinyin": "bō",
    "base": "bo",
    "chinese": "波",
    "english": "waves",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "波动",
        "english": "to undulate"
      }
    ],
    "homophones": [
      "波"
    ],
    "nearPhones": [
      "po"
    ]
  }),
  createPinyinEntry({
    "pinyin": "mài",
    "base": "mai",
    "chinese": "麦",
    "english": "wheat",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "小麦",
        "english": "wheat"
      }
    ],
    "homophones": [
      "卖",
      "麦"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "gǔ",
    "base": "gu",
    "chinese": "谷",
    "english": "valley",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "山谷",
        "english": "valley"
      }
    ],
    "homophones": [
      "古",
      "骨",
      "谷"
    ],
    "nearPhones": [
      "ku"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jí",
    "base": "ji",
    "chinese": "吉",
    "english": "lucky",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "吉",
        "english": "lucky"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "líng",
    "base": "ling",
    "chinese": "铃",
    "english": "bell",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "门铃",
        "english": "doorbell"
      },
      {
        "word": "铃声",
        "english": "ringing sound"
      }
    ],
    "homophones": [
      "铃"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "qín",
    "base": "qin",
    "chinese": "琴",
    "english": "instrument",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "口琴",
        "english": "harmonica"
      },
      {
        "word": "琴声",
        "english": "instrument sound"
      }
    ],
    "homophones": [
      "勤",
      "琴"
    ],
    "nearPhones": [
      "jin",
      "xin"
    ]
  }),
  createPinyinEntry({
    "pinyin": "dí",
    "base": "di",
    "chinese": "笛",
    "english": "flute",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "笛子",
        "english": "flute"
      },
      {
        "word": "短笛",
        "english": "short flute"
      }
    ],
    "homophones": [
      "笛"
    ],
    "nearPhones": [
      "ti"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pén",
    "base": "pen",
    "chinese": "盆",
    "english": "basin",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "花盆",
        "english": "flowerpot"
      },
      {
        "word": "水盆",
        "english": "washbasin"
      }
    ],
    "homophones": [
      "盆"
    ],
    "nearPhones": [
      "ben"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jìng",
    "base": "jing",
    "chinese": "镜",
    "english": "mirror",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "镜子",
        "english": "mirror"
      },
      {
        "word": "眼镜",
        "english": "glasses"
      }
    ],
    "homophones": [
      "静",
      "净",
      "敬",
      "竞",
      "镜"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "duī",
    "base": "dui",
    "chinese": "堆",
    "english": "pile",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "土堆",
        "english": "dirt pile"
      },
      {
        "word": "石堆",
        "english": "stone pile"
      }
    ],
    "homophones": [
      "堆"
    ],
    "nearPhones": [
      "tui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wā",
    "base": "wa",
    "chinese": "洼",
    "english": "puddle",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "水洼",
        "english": "puddle"
      },
      {
        "word": "小水洼",
        "english": "little puddle"
      }
    ],
    "homophones": [
      "洼",
      "蛙"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "shàn",
    "base": "shan",
    "chinese": "扇",
    "english": "fan",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "扇子",
        "english": "fan"
      },
      {
        "word": "风扇",
        "english": "electric fan"
      }
    ],
    "homophones": [
      "善",
      "扇"
    ],
    "nearPhones": [
      "san"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lóng",
    "base": "long",
    "chinese": "笼",
    "english": "cage",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "笼子",
        "english": "cage"
      },
      {
        "word": "鸟笼",
        "english": "birdcage"
      }
    ],
    "homophones": [
      "笼"
    ],
    "nearPhones": [
      "nong",
      "rong"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiǎn",
    "base": "jian",
    "chinese": "剪",
    "english": "cut",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "剪纸",
        "english": "paper-cutting"
      },
      {
        "word": "剪刀",
        "english": "scissors"
      }
    ],
    "homophones": [
      "减",
      "剪"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiā",
    "base": "jia",
    "chinese": "夹",
    "english": "clip",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "发夹",
        "english": "hair clip"
      },
      {
        "word": "夹子",
        "english": "clip"
      }
    ],
    "homophones": [
      "加",
      "家",
      "夹"
    ],
    "nearPhones": [
      "xia"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuā",
    "base": "shua",
    "chinese": "刷",
    "english": "brush",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "刷牙",
        "english": "brush teeth"
      },
      {
        "word": "牙刷",
        "english": "toothbrush"
      }
    ],
    "homophones": [
      "刷"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guì",
    "base": "gui",
    "chinese": "柜",
    "english": "cabinet",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "书柜",
        "english": "bookcase"
      },
      {
        "word": "柜子",
        "english": "cabinet"
      }
    ],
    "homophones": [
      "贵",
      "柜"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "chén",
    "base": "chen",
    "chinese": "晨",
    "english": "morning",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "早晨",
        "english": "morning"
      },
      {
        "word": "晨光",
        "english": "morning light"
      }
    ],
    "homophones": [
      "晨"
    ],
    "nearPhones": [
      "zhen"
    ]
  }),
  createPinyinEntry({
    "pinyin": "gé",
    "base": "ge",
    "chinese": "格",
    "english": "grid",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "田字格",
        "english": "grid square"
      },
      {
        "word": "方格",
        "english": "square grid"
      }
    ],
    "homophones": [
      "格"
    ],
    "nearPhones": [
      "ke"
    ]
  }),
  createPinyinEntry({
    "pinyin": "duàn",
    "base": "duan",
    "chinese": "段",
    "english": "paragraph",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "自然段",
        "english": "paragraph"
      },
      {
        "word": "段落",
        "english": "section"
      }
    ],
    "homophones": [
      "段"
    ],
    "nearPhones": [
      "tuan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "cāo",
    "base": "cao",
    "chinese": "操",
    "english": "exercise",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "课间操",
        "english": "exercise break"
      }
    ],
    "homophones": [
      "操"
    ],
    "nearPhones": [
      "chao",
      "zao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhí",
    "base": "zhi",
    "chinese": "值",
    "english": "duty",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "值日",
        "english": "be on duty"
      },
      {
        "word": "值班",
        "english": "take duty"
      }
    ],
    "homophones": [
      "直",
      "植",
      "执",
      "值"
    ],
    "nearPhones": [
      "zi",
      "chi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pīn",
    "base": "pin",
    "chinese": "拼",
    "english": "spell",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "拼音",
        "english": "pinyin"
      },
      {
        "word": "拼读",
        "english": "spell and read"
      }
    ],
    "homophones": [
      "拼"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bān",
    "base": "ban",
    "chinese": "班",
    "english": "class",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "班级",
        "english": "class"
      },
      {
        "word": "上班",
        "english": "start class"
      }
    ],
    "homophones": [
      "班"
    ],
    "nearPhones": [
      "pan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pǎo",
    "base": "pao",
    "chinese": "跑",
    "english": "run",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "跑步",
        "english": "run"
      },
      {
        "word": "跑道",
        "english": "track"
      }
    ],
    "homophones": [
      "跑"
    ],
    "nearPhones": [
      "bao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tiào",
    "base": "tiao",
    "chinese": "跳",
    "english": "jump",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "跳绳",
        "english": "jump rope"
      },
      {
        "word": "跳远",
        "english": "long jump"
      }
    ],
    "homophones": [
      "跳"
    ],
    "nearPhones": [
      "diao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "jiàn",
    "base": "jian",
    "chinese": "健",
    "english": "healthy",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "健康",
        "english": "health"
      },
      {
        "word": "健身",
        "english": "fitness"
      }
    ],
    "homophones": [
      "见",
      "建",
      "健"
    ],
    "nearPhones": [
      "qian",
      "xian"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kāng",
    "base": "kang",
    "chinese": "康",
    "english": "well-being",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "健康",
        "english": "health"
      },
      {
        "word": "安康",
        "english": "safe and well"
      }
    ],
    "homophones": [
      "康"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jīng",
    "base": "jing",
    "chinese": "睛",
    "english": "eyeball",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "眼睛",
        "english": "eyes"
      }
    ],
    "homophones": [
      "精",
      "经",
      "惊",
      "京",
      "睛"
    ],
    "nearPhones": [
      "qing",
      "xing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shuì",
    "base": "shui",
    "chinese": "睡",
    "english": "sleep",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "午睡",
        "english": "nap"
      }
    ],
    "homophones": [
      "税",
      "睡"
    ],
    "nearPhones": [
      "sui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "xǐng",
    "base": "xing",
    "chinese": "醒",
    "english": "wake",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "睡醒",
        "english": "wake up"
      },
      {
        "word": "醒来",
        "english": "wake up"
      }
    ],
    "homophones": [
      "醒"
    ],
    "nearPhones": [
      "jing",
      "qing"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zuǐ",
    "base": "zui",
    "chinese": "嘴",
    "english": "mouth",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "嘴",
        "english": "mouth"
      }
    ],
    "homophones": [
      "嘴"
    ],
    "nearPhones": [
      "zhui"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pàng",
    "base": "pang",
    "chinese": "胖",
    "english": "plump",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "胖胖",
        "english": "chubby"
      }
    ],
    "homophones": [
      "胖"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "báo",
    "base": "bao",
    "chinese": "薄",
    "english": "thin",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "厚薄",
        "english": "thickness"
      },
      {
        "word": "薄纸",
        "english": "thin paper"
      }
    ],
    "homophones": [
      "薄"
    ],
    "nearPhones": [
      "pao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "pào",
    "base": "pao",
    "chinese": "泡",
    "english": "soak",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "泡泡",
        "english": "bubble"
      }
    ],
    "homophones": [
      "泡"
    ],
    "nearPhones": [
      "bao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "nào",
    "base": "nao",
    "chinese": "闹",
    "english": "noisy",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "热闹",
        "english": "lively"
      }
    ],
    "homophones": [
      "闹"
    ],
    "nearPhones": [
      "lao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shéng",
    "base": "sheng",
    "chinese": "绳",
    "english": "rope",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "跳绳",
        "english": "jump rope"
      },
      {
        "word": "绳子",
        "english": "rope"
      }
    ],
    "homophones": [
      "绳"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "miáo",
    "base": "miao",
    "chinese": "苗",
    "english": "seedling",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "树苗",
        "english": "sapling"
      },
      {
        "word": "禾苗",
        "english": "seedling"
      }
    ],
    "homophones": [
      "苗"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "yá",
    "base": "ya",
    "chinese": "芽",
    "english": "sprout",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "发芽",
        "english": "sprout"
      }
    ],
    "homophones": [
      "牙",
      "芽"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "liǔ",
    "base": "liu",
    "chinese": "柳",
    "english": "willow",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "柳树",
        "english": "willow"
      }
    ],
    "homophones": [
      "柳"
    ],
    "nearPhones": [
      "niu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "táo",
    "base": "tao",
    "chinese": "桃",
    "english": "peach",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "桃花",
        "english": "peach blossom"
      },
      {
        "word": "桃子",
        "english": "peach"
      }
    ],
    "homophones": [
      "桃"
    ],
    "nearPhones": [
      "dao"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lí",
    "base": "li",
    "chinese": "梨",
    "english": "pear",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "梨花",
        "english": "pear blossom"
      },
      {
        "word": "梨子",
        "english": "pear"
      }
    ],
    "homophones": [
      "梨"
    ],
    "nearPhones": [
      "ni",
      "ri"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wā",
    "base": "wa",
    "chinese": "蛙",
    "english": "frog",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "青蛙",
        "english": "frog"
      },
      {
        "word": "蛙声",
        "english": "frog croak"
      }
    ],
    "homophones": [
      "洼",
      "蛙"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "dié",
    "base": "die",
    "chinese": "蝶",
    "english": "butterfly",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "蝶舞",
        "english": "butterfly dance"
      }
    ],
    "homophones": [
      "蝶"
    ],
    "nearPhones": [
      "tie"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǐ",
    "base": "yi",
    "chinese": "蚁",
    "english": "ant",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "工蚁",
        "english": "worker ant"
      }
    ],
    "homophones": [
      "已",
      "以",
      "蚁",
      "椅"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "é",
    "base": "e",
    "chinese": "鹅",
    "english": "goose",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "白鹅",
        "english": "white goose"
      },
      {
        "word": "鹅毛",
        "english": "goose feather"
      }
    ],
    "homophones": [
      "鹅"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "guī",
    "base": "gui",
    "chinese": "龟",
    "english": "turtle",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "海龟",
        "english": "sea turtle"
      }
    ],
    "homophones": [
      "归",
      "龟"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hú",
    "base": "hu",
    "chinese": "狐",
    "english": "fox",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "狐尾",
        "english": "fox tail"
      }
    ],
    "homophones": [
      "湖",
      "狐",
      "壶"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lù",
    "base": "lu",
    "chinese": "鹿",
    "english": "deer",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "小鹿",
        "english": "fawn"
      }
    ],
    "homophones": [
      "路",
      "露",
      "陆",
      "鹿"
    ],
    "nearPhones": [
      "nu",
      "ru"
    ]
  }),
  createPinyinEntry({
    "pinyin": "tù",
    "base": "tu",
    "chinese": "兔",
    "english": "rabbit",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "白兔",
        "english": "white rabbit"
      },
      {
        "word": "兔子",
        "english": "rabbit"
      }
    ],
    "homophones": [
      "兔"
    ],
    "nearPhones": [
      "du"
    ]
  }),
  createPinyinEntry({
    "pinyin": "zhuō",
    "base": "zhuo",
    "chinese": "桌",
    "english": "table",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "桌子",
        "english": "table"
      },
      {
        "word": "书桌",
        "english": "desk"
      }
    ],
    "homophones": [
      "桌"
    ],
    "nearPhones": [
      "zuo"
    ]
  }),
  createPinyinEntry({
    "pinyin": "yǐ",
    "base": "yi",
    "chinese": "椅",
    "english": "chair",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "椅子",
        "english": "chair"
      },
      {
        "word": "桌椅",
        "english": "desk and chair"
      }
    ],
    "homophones": [
      "已",
      "以",
      "蚁",
      "椅"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "jí",
    "base": "ji",
    "chinese": "级",
    "english": "grade",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "年级",
        "english": "grade"
      },
      {
        "word": "班级",
        "english": "class"
      }
    ],
    "homophones": [
      "急",
      "极",
      "集",
      "及",
      "吉",
      "级"
    ],
    "nearPhones": [
      "qi",
      "xi"
    ]
  }),
  createPinyinEntry({
    "pinyin": "kū",
    "base": "ku",
    "chinese": "哭",
    "english": "cry",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "哭了",
        "english": "cried"
      },
      {
        "word": "哭声",
        "english": "crying sound"
      }
    ],
    "homophones": [
      "哭"
    ],
    "nearPhones": [
      "gu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lā",
    "base": "la",
    "chinese": "拉",
    "english": "pull",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "拉手",
        "english": "hold hands"
      },
      {
        "word": "拉门",
        "english": "pull door"
      }
    ],
    "homophones": [
      "拉"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "pāi",
    "base": "pai",
    "chinese": "拍",
    "english": "pat",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "拍手",
        "english": "clap hands"
      },
      {
        "word": "拍球",
        "english": "bounce ball"
      }
    ],
    "homophones": [
      "拍"
    ],
    "nearPhones": [
      "bai"
    ]
  }),
  createPinyinEntry({
    "pinyin": "sǎn",
    "base": "san",
    "chinese": "伞",
    "english": "umbrella",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "雨伞",
        "english": "umbrella"
      },
      {
        "word": "打伞",
        "english": "hold umbrella"
      }
    ],
    "homophones": [
      "伞"
    ],
    "nearPhones": [
      "shan"
    ]
  }),
  createPinyinEntry({
    "pinyin": "qún",
    "base": "qun",
    "chinese": "裙",
    "english": "skirt",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "裙子",
        "english": "skirt"
      },
      {
        "word": "长裙",
        "english": "long skirt"
      }
    ],
    "homophones": [
      "裙"
    ],
    "nearPhones": [
      "xun"
    ]
  }),
  createPinyinEntry({
    "pinyin": "wà",
    "base": "wa",
    "chinese": "袜",
    "english": "sock",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "袜子",
        "english": "socks"
      },
      {
        "word": "短袜",
        "english": "short socks"
      }
    ],
    "homophones": [
      "袜"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "mào",
    "base": "mao",
    "chinese": "帽",
    "english": "hat",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "帽子",
        "english": "hat"
      },
      {
        "word": "草帽",
        "english": "straw hat"
      }
    ],
    "homophones": [
      "帽"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "bēi",
    "base": "bei",
    "chinese": "杯",
    "english": "cup",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "水杯",
        "english": "cup"
      },
      {
        "word": "杯子",
        "english": "cup"
      }
    ],
    "homophones": [
      "杯"
    ],
    "nearPhones": []
  }),
  createPinyinEntry({
    "pinyin": "hú",
    "base": "hu",
    "chinese": "壶",
    "english": "pot",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "水壶",
        "english": "kettle"
      },
      {
        "word": "茶壶",
        "english": "teapot"
      }
    ],
    "homophones": [
      "湖",
      "狐",
      "壶"
    ],
    "nearPhones": [
      "fu"
    ]
  }),
  createPinyinEntry({
    "pinyin": "léi",
    "base": "lei",
    "chinese": "雷",
    "english": "thunder",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "雷雨",
        "english": "thunderstorm"
      },
      {
        "word": "打雷",
        "english": "thunder"
      }
    ],
    "homophones": [
      "雷"
    ],
    "nearPhones": [
      "nei"
    ]
  }),
  createPinyinEntry({
    "pinyin": "lóu",
    "base": "lou",
    "chinese": "楼",
    "english": "building",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "楼上",
        "english": "upstairs"
      }
    ],
    "homophones": [
      "楼"
    ],
    "nearPhones": [
      "rou"
    ]
  }),
  createPinyinEntry({
    "pinyin": "shài",
    "base": "shai",
    "chinese": "晒",
    "english": "dry in sun",
    "gradeBand": "二年级",
    "examples": [
      {
        "word": "晒太阳",
        "english": "sunbathe"
      },
      {
        "word": "晒衣服",
        "english": "dry clothes"
      }
    ],
    "homophones": [
      "晒"
    ],
    "nearPhones": []
  })
];
