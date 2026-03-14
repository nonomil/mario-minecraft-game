const BRIDGE_STAGE = "bridge";
const BRIDGE_DIFFICULTY = "basic";

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function withLanguageFields(entry, moduleName, extras = {}) {
  const chinese = String(entry.chinese || entry.character || entry.word || "").trim();
  const pinyin = String(entry.pinyin || "").trim();
  const word = String(entry.word || entry.pinyin || chinese || "").trim();
  return {
    ...entry,
    ...extras,
    subject: "language",
    module: moduleName,
    word,
    chinese,
    pinyin,
    mode: String(entry.mode || "chinese").toLowerCase(),
    difficulty: entry.difficulty || BRIDGE_DIFFICULTY,
    stage: BRIDGE_STAGE
  };
}

const HANZI_SOURCE = normalizeArray(typeof kindergartenHanzi !== "undefined" ? kindergartenHanzi : []);
const PINYIN_SOURCE = normalizeArray(typeof PINYIN_CORE_PACK !== "undefined" ? PINYIN_CORE_PACK : []);
const KINDER_VOCAB_SOURCE = normalizeArray(typeof MERGED_KINDERGARTEN_VOCAB !== "undefined" ? MERGED_KINDERGARTEN_VOCAB : []);

const HANZI_PINYIN_MAP = (() => {
  const map = new Map();
  HANZI_SOURCE.forEach((entry) => {
    const char = String(entry.character || entry.chinese || entry.word || "").trim();
    const pinyin = String(entry.pinyin || "").trim();
    if (char.length === 1 && pinyin) {
      map.set(char, pinyin);
    }
  });
  return map;
})();

const HANZI_RE = /[\u4e00-\u9fff]/;

function toPinyin(text) {
  const out = [];
  for (const char of String(text || "")) {
    if (!HANZI_RE.test(char)) continue;
    const py = HANZI_PINYIN_MAP.get(char);
    if (!py) return "";
    out.push(py);
  }
  return out.join(" ");
}

function createLanguageEntry(word, moduleName, options = {}) {
  const chinese = String(word || "").trim();
  const pinyin = toPinyin(chinese);
  if (!chinese || !pinyin) return null;
  const entry = {
    subject: "language",
    module: moduleName,
    word: chinese,
    chinese,
    pinyin,
    mode: "chinese",
    difficulty: BRIDGE_DIFFICULTY,
    stage: BRIDGE_STAGE
  };
  if (options.tags && options.tags.length) {
    entry.tags = options.tags;
  }
  return entry;
}

function uniqueList(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function combine(prefixes, suffixes) {
  const out = [];
  prefixes.forEach((p) => {
    suffixes.forEach((s) => out.push(`${p}${s}`));
  });
  return out;
}

function collectExampleWords(entries) {
  const words = [];
  entries.forEach((entry) => {
    if (!Array.isArray(entry?.examples)) return;
    entry.examples.forEach((example) => {
      const word = String(example?.word || "").trim();
      if (word) words.push(word);
    });
  });
  return words;
}

function collectKindergartenWords(entries) {
  const words = [];
  entries.forEach((entry) => {
    const chinese = String(entry?.chinese || "").trim();
    if (!chinese || chinese.length < 2 || chinese.length > 4) return;
    if (!toPinyin(chinese)) return;
    words.push(chinese);
  });
  return words;
}

const EXAMPLE_WORDS = uniqueList(collectExampleWords(HANZI_SOURCE))
  .filter((word) => word.length >= 2 && word.length <= 4);
const KINDER_CHINESE_WORDS = uniqueList(collectKindergartenWords(KINDER_VOCAB_SOURCE));
const COMBINED_WORDS = uniqueList([...EXAMPLE_WORDS, ...KINDER_CHINESE_WORDS]);

const LANGUAGE_WORDS = COMBINED_WORDS.slice(0, 1200);

const EXPRESSION_BASE = [
  "你好", "早上好", "晚上好", "午安", "晚安", "再见", "谢谢", "不客气", "对不起", "没关系",
  "请问", "请进", "请坐", "请慢走", "你好吗", "你真棒", "别着急", "慢慢来", "请等一下",
  "再试一次", "生日快乐", "节日快乐", "新年快乐", "我爱你", "我想你", "请安静", "请排队",
  "我们开始", "我们结束", "可以吗", "不可以", "谢谢老师", "谢谢妈妈", "请帮忙", "我明白了"
];

const EXPRESSION_PREFIXES = [
  "我想要", "我喜欢", "我要", "请给我", "请帮我", "我想吃", "我想喝", "我想玩", "我想去",
  "我们一起", "你能给我", "请告诉我", "我们一起做", "我来", "你来", "我来帮忙", "我们去"
];

const EXPRESSION_VERBS = [
  "我要", "我想", "我会", "我能", "我来", "一起", "请你", "请帮", "我们去", "我们来"
];

const EXPRESSION_SCENES = [
  "在家", "在学校", "在操场", "在公园", "在教室", "在路上", "在图书馆", "在食堂"
];

const EXPRESSION_SUFFIXES = [
  "好吗", "可以吗", "行吗", "一起吧", "马上吧", "慢慢来", "别着急"
];

const EXPRESSION_ITEMS = COMBINED_WORDS.slice(0, 360);

const LANGUAGE_EXPRESSIONS = uniqueList([
  ...EXPRESSION_BASE,
  ...combine(EXPRESSION_PREFIXES, EXPRESSION_ITEMS),
  ...combine(EXPRESSION_VERBS, EXPRESSION_ITEMS),
  ...combine(EXPRESSION_SCENES, EXPRESSION_ITEMS),
  ...combine(EXPRESSION_ITEMS, EXPRESSION_SUFFIXES)
]).slice(0, 900);

const SEASONS = ["春", "夏", "秋", "冬"];
const TIMES = ["晨", "夜", "晚", "朝", "暮"];
const NATURE = ["风", "雨", "雪", "月", "花", "水", "山", "云", "星", "林", "溪", "田", "草", "鸟", "松"];
const SCENES = ["江", "湖", "海", "田", "园", "村", "桥", "路", "竹", "柳", "河", "岭", "泉", "石", "沙"];
const POEM_ACTIONS = ["行", "歌", "望", "游", "梦", "思", "吟", "听", "看", "归", "行旅"];
const POEM_EXTRA = [
  "山水", "江南", "小池", "梅花", "春晓", "秋思", "月夜", "风雨", "花香", "渔歌",
  "牧童", "静夜", "春风", "秋月", "夏雨", "冬雪", "松风", "竹影", "清泉", "归舟",
  "夜雨", "晨露", "晚霞", "乡愁", "渔火"
];

const POEM_TITLES = uniqueList([
  ...combine(SEASONS, NATURE),
  ...combine(SEASONS, SCENES),
  ...combine(TIMES, NATURE),
  ...combine(TIMES, SCENES),
  ...combine(NATURE, SCENES),
  ...combine(SCENES, POEM_ACTIONS),
  ...POEM_EXTRA
]).slice(0, 220);

const BRIDGE_LANGUAGE_WORDS = LANGUAGE_WORDS
  .map((word, index) => {
    const tags = index < 40 ? ["控笔"] : (index < 80 ? ["描红"] : null);
    return createLanguageEntry(word, "词语", { tags });
  })
  .filter(Boolean);

const BRIDGE_LANGUAGE_EXPRESSIONS = LANGUAGE_EXPRESSIONS
  .map((word) => createLanguageEntry(word, "表达", { tags: ["口语"] }))
  .filter(Boolean);

const BRIDGE_LANGUAGE_POEMS = POEM_TITLES
  .map((word) => createLanguageEntry(word, "古诗"))
  .filter(Boolean);

const BRIDGE_LANGUAGE_PACK = [
  ...HANZI_SOURCE.map((entry) => withLanguageFields(entry, "识字")),
  ...PINYIN_SOURCE.map((entry) => withLanguageFields(entry, "拼音", { mode: "pinyin" })),
  ...BRIDGE_LANGUAGE_WORDS,
  ...BRIDGE_LANGUAGE_EXPRESSIONS,
  ...BRIDGE_LANGUAGE_POEMS
];

function createMathEntry(moduleName, word, options = {}) {
  return {
    subject: "math",
    module: moduleName,
    word,
    chinese: word,
    mode: "chinese",
    concept: options.concept || word,
    keywords: options.keywords || [],
    difficulty: BRIDGE_DIFFICULTY,
    stage: BRIDGE_STAGE,
    examples: []
  };
}

function uniqueModuleItems(items) {
  const seen = new Set();
  return items.filter(([word]) => {
    if (seen.has(word)) return false;
    seen.add(word);
    return true;
  });
}

function buildModuleItems(baseWords, comboSpecs, limit) {
  const items = [];
  baseWords.forEach((word) => items.push([word, [word]]));
  comboSpecs.forEach(([prefixes, suffixes]) => {
    prefixes.forEach((p) => {
      suffixes.forEach((s) => {
        const word = `${p}${s}`;
        items.push([word, [p, s]]);
      });
    });
  });
  return uniqueModuleItems(items).slice(0, limit);
}

const NUM_LIMITS = ["十以内", "二十以内", "三十以内", "五十以内", "一百以内", "两位数", "三位数"];
const NUM_OPERATIONS = ["加法", "减法", "加减", "连加", "连减", "比较", "排序", "倍数", "凑整", "平均", "口算", "心算"];
const NUM_TASKS = ["练习", "题", "计算", "应用"];
const NUM_BASE = [
  "数数", "数一数", "数一数有几", "多少", "一共", "合并", "拆分", "等于", "大于", "小于",
  "多一些", "少一些", "相等", "顺序", "单位", "整数", "奇数", "偶数", "凑十", "进位",
  "退位", "借位", "进位加法", "退位减法", "加倍", "分成", "平分", "平均分", "分组",
  "比较大小", "排列", "数位", "个位", "十位", "百位"
];

const LOGIC_BASE = [
  "分类", "配对", "规律", "推理", "判断", "推断", "条件", "结果", "可能", "一定",
  "相同", "不同", "比较", "排序", "对应", "组合", "拆分", "对称", "位置", "方向",
  "先后", "左右", "前后", "里外", "因果", "顺序", "递推", "联想", "选择", "排除",
  "猜测", "验证"
];
const LOGIC_PREFIXES = ["规律", "条件", "逻辑", "推理", "分类", "排序", "比较", "判断", "组合", "对应", "位置", "方向"];
const LOGIC_SUFFIXES = ["关系", "问题", "练习", "任务", "游戏", "方法", "顺序", "规则", "图", "表"];

const MEASURE_BASE = [
  "长短", "高低", "轻重", "快慢", "早晚", "冷热", "多少", "时间表", "统计图", "表格",
  "图表", "对比", "记录", "统计", "换算", "估算"
];
const MEASURES = ["长度", "高度", "重量", "速度", "时间", "温度", "面积", "体积", "容量", "距离", "钱币", "日期", "星期", "月份"];
const MEASURE_ACTIONS = ["比较", "测量", "记录", "统计", "估算", "换算", "读数", "排序", "整理", "对比", "观察", "选择"];

const SHAPE_BASE = [
  "图形", "空间", "形状", "边数", "角数", "立体图形", "平面图形", "对称轴", "方向感", "坐标"
];
const SHAPES = ["圆形", "三角形", "正方形", "长方形", "梯形", "菱形", "圆柱", "圆锥", "球体", "立方体", "长方体", "平面", "直线", "曲线", "角", "边", "顶点"];
const SHAPE_ACTIONS = ["识别", "分类", "拼搭", "对称", "旋转", "平移", "比较", "组合", "拆分", "观察", "位置", "方向"];

const STORY_BASE = [
  "应用题", "文字题", "看图题", "数量关系", "求一共", "求还剩", "求差", "求和",
  "比较题", "分配题", "加减法题", "多多少少"
];
const STORY_VERBS = ["买了", "用了", "还剩", "一共", "平均", "每个", "每份", "分给", "多了", "少了", "增加", "减少", "合起来", "去掉", "剩下", "多几个", "少几个", "比一比"];
const STORY_OBJECTS = ["苹果", "糖果", "铅笔", "玩具", "书", "小朋友", "气球", "花", "鱼", "饼干", "金币", "积木", "球", "橡皮", "贴纸"];

const PRACTICE_BASE = [
  "小实验", "实践活动", "项目任务", "调查表", "观察表", "记录表", "活动计划", "时间安排", "路线图", "任务卡"
];
const PRACTICE_TASKS = ["统计", "记录", "整理", "分类", "测量", "观察", "调查", "计划", "安排", "实验", "制作", "绘图", "对比", "总结", "分享", "实践", "探索"];
const PRACTICE_CONTEXTS = ["天气", "植物", "动物", "玩具", "家庭", "时间", "路线", "购物", "运动", "校园", "节日", "交通", "社区", "食物", "安全"];

const MATH_MODULES = {
  "数与运算": buildModuleItems(NUM_BASE, [[NUM_LIMITS, NUM_OPERATIONS], [NUM_OPERATIONS, NUM_TASKS]], 180),
  "逻辑推理": buildModuleItems(LOGIC_BASE, [[LOGIC_PREFIXES, LOGIC_SUFFIXES]], 180),
  "量与统计": buildModuleItems(MEASURE_BASE, [[MEASURES, MEASURE_ACTIONS]], 180),
  "图形与空间": buildModuleItems(SHAPE_BASE, [[SHAPES, SHAPE_ACTIONS]], 180),
  "应用题专项": buildModuleItems(STORY_BASE, [[STORY_VERBS, STORY_OBJECTS]], 180),
  "综合实践": buildModuleItems(PRACTICE_BASE, [[PRACTICE_TASKS, PRACTICE_CONTEXTS]], 180)
};

const BRIDGE_MATH_PACK = Object.entries(MATH_MODULES).flatMap(([moduleName, items]) =>
  items.map(([word, keywords]) => createMathEntry(moduleName, word, { keywords }))
);

function createEnglishEntry(word, moduleName, options = {}) {
  return {
    subject: "english",
    module: moduleName,
    word,
    english: word,
    mode: "english",
    phonics: options.phonics || "",
    difficulty: BRIDGE_DIFFICULTY,
    stage: BRIDGE_STAGE,
    examples: []
  };
}

function toPhonics(word) {
  return String(word || "").split("").join("-");
}

function collectEnglishWords(entries) {
  const words = [];
  entries.forEach((entry) => {
    const word = String(entry?.word || "").trim().toLowerCase();
    if (!word) return;
    if (!/^[a-z]+$/.test(word)) return;
    if (word.length < 2 || word.length > 8) return;
    words.push(word);
  });
  return words;
}

function isCvc(word) {
  if (!/^[a-z]{3}$/.test(word)) return false;
  const vowels = new Set(["a", "e", "i", "o", "u"]);
  return !vowels.has(word[0]) && vowels.has(word[1]) && !vowels.has(word[2]);
}

function isSimplePhonics(word) {
  if (!/^[a-z]{3,5}$/.test(word)) return false;
  return /[aeiou]/.test(word);
}

const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ENGLISH_LETTERS_LOWER = "abcdefghijklmnopqrstuvwxyz".split("");
const ENGLISH_LETTER_FORMS = ENGLISH_LETTERS.map((letter) => `${letter}${letter.toLowerCase()}`);

const ENGLISH_SOUND_PATTERNS = [
  "sh", "ch", "th", "ph", "wh", "qu", "ee", "oo", "ea", "ai",
  "ay", "oa", "oe", "ou", "ow", "ie", "igh", "ar", "er", "ir",
  "or", "ur", "ng", "nk", "ck", "ll", "ss", "ff", "zz", "tch",
  "dge", "tion", "sion", "ing", "ed", "er", "est"
];

const ENGLISH_BLEND_ONSETS = [
  "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr",
  "gr", "pr", "tr", "sk", "sp", "st", "sm", "sn", "sw", "tw",
  "spr", "spl", "str"
];

const ENGLISH_RIMES = [
  "at", "an", "ap", "ad", "ag", "am", "en", "et", "eg", "ed",
  "in", "it", "ig", "id", "ip", "og", "od", "op", "ot", "ug",
  "un", "up"
];

const ENGLISH_VOWELS = ["a", "e", "i", "o", "u"];
const ENGLISH_ONSETS = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z"];
const ENGLISH_SYLLABLES = combine(ENGLISH_ONSETS, ENGLISH_VOWELS);

const ENGLISH_WORDS_BASE = [
  "apple", "banana", "orange", "grape", "pear", "peach", "milk", "bread", "rice", "water",
  "juice", "tea", "cat", "dog", "bird", "fish", "rabbit", "panda", "tiger", "lion",
  "sun", "moon", "star", "rain", "snow", "wind", "tree", "flower", "school", "teacher",
  "student", "book", "pencil", "bag", "chair", "table", "family", "mother", "father", "friend"
];

const KINDER_ENGLISH_WORDS = uniqueList(collectEnglishWords(KINDER_VOCAB_SOURCE));
const ENGLISH_WORD_POOL = KINDER_ENGLISH_WORDS.length ? KINDER_ENGLISH_WORDS : ENGLISH_WORDS_BASE;

const ENGLISH_LETTER_COMBOS = uniqueList([
  ...ENGLISH_SOUND_PATTERNS,
  ...ENGLISH_BLEND_ONSETS,
  ...ENGLISH_RIMES,
  ...ENGLISH_SYLLABLES
]);

const ENGLISH_LETTER_MODULE = uniqueList([
  ...ENGLISH_LETTERS,
  ...ENGLISH_LETTERS_LOWER,
  ...ENGLISH_LETTER_FORMS,
  ...ENGLISH_LETTER_COMBOS
]).slice(0, 320);

const FALLBACK_CVC = [
  "cat", "dog", "pig", "hat", "bag", "cup", "pen", "bed", "red", "sun",
  "man", "fan", "pan", "map", "cap", "tap", "bat", "mat", "sit", "hit",
  "fit", "big", "dig", "log", "fox", "box", "hen", "ten", "jam", "ram",
  "web", "van", "zip", "yak", "kid", "lip", "bug", "mud", "nut", "net"
];

const ENGLISH_PHONICS_WORDS = uniqueList([
  ...FALLBACK_CVC,
  ...ENGLISH_WORD_POOL.filter(isCvc),
  ...ENGLISH_WORD_POOL.filter(isSimplePhonics)
]).slice(0, 320);

const ENGLISH_SOUND_ITEMS = uniqueList([
  ...ENGLISH_SOUND_PATTERNS,
  ...ENGLISH_BLEND_ONSETS,
  ...ENGLISH_RIMES,
  ...combine(ENGLISH_BLEND_ONSETS, ENGLISH_RIMES)
]).slice(0, 320);

const ENGLISH_WORDS = uniqueList(ENGLISH_WORD_POOL).slice(0, 320);

const BRIDGE_ENGLISH_PACK = [
  ...ENGLISH_LETTER_MODULE.map((letter) => createEnglishEntry(letter, "字母")),
  ...ENGLISH_PHONICS_WORDS.map((word) => createEnglishEntry(word, "自然拼读", { phonics: toPhonics(word) })),
  ...ENGLISH_SOUND_ITEMS.map((sound) => createEnglishEntry(sound, "发音", { phonics: sound })),
  ...ENGLISH_WORDS.map((word) => createEnglishEntry(word, "单词"))
];

const BRIDGE_VOCAB_FULL = [
  ...BRIDGE_LANGUAGE_PACK,
  ...BRIDGE_MATH_PACK,
  ...BRIDGE_ENGLISH_PACK
];
