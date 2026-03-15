(() => {
  const BRIDGE_STAGE = "bridge";
  const BRIDGE_DIFFICULTY = "basic";

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
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

  const HANZI_SOURCE = normalizeArray(typeof kindergartenHanzi !== "undefined" ? kindergartenHanzi : []);
  const PINYIN_SOURCE = normalizeArray(typeof PINYIN_CORE_PACK !== "undefined" ? PINYIN_CORE_PACK : []);
  const KINDER_VOCAB_SOURCE = normalizeArray(typeof MERGED_KINDERGARTEN_VOCAB !== "undefined" ? MERGED_KINDERGARTEN_VOCAB : []);

  const HANZI_PINYIN_MAP = (() => {
    const map = new Map();
    HANZI_SOURCE.forEach((entry) => {
      const char = String(entry.character || entry.chinese || entry.word || "").trim();
      const pinyin = String(entry.pinyin || "").trim();
      if (char.length === 1 && pinyin && !map.has(char)) {
        map.set(char, pinyin);
      }
    });
    PINYIN_SOURCE.forEach((entry) => {
      const char = String(entry.chinese || entry.word || "").trim();
      const pinyin = String(entry.pinyin || "").trim();
      if (char.length === 1 && pinyin && !map.has(char)) {
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

  function collectChineseWords(entries) {
    const words = [];
    entries.forEach((entry) => {
      const chinese = String(entry?.chinese || entry?.translation || "").trim();
      if (!chinese || chinese.length < 2 || chinese.length > 4) return;
      if (!toPinyin(chinese)) return;
      words.push(chinese);
    });
    return words;
  }

  function uniqueByWord(items) {
    const seen = new Set();
    const out = [];
    items.forEach((item) => {
      const key = String(item?.word || item?.chinese || "").trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
    return out;
  }

  const EXTRA_BASE_WORDS = [
    "家庭", "父母", "爸爸", "妈妈", "爷爷", "奶奶", "哥哥", "姐姐", "弟弟", "妹妹",
    "老师", "同学", "学校", "教室", "操场", "书包", "课本", "作业", "上课", "下课",
    "朋友", "邻居", "礼貌", "分享", "排队", "合作", "帮助", "谢谢", "对不起", "没关系",
    "快乐", "生气", "害怕", "勇敢", "耐心", "微笑", "礼物", "祝福", "节日", "生日",
    "春天", "夏天", "秋天", "冬天", "清晨", "傍晚", "夜晚", "天气", "彩虹", "月亮",
    "苹果", "香蕉", "葡萄", "草莓", "西瓜", "牛奶", "面包", "米饭", "青菜", "鸡蛋",
    "红色", "黄色", "蓝色", "绿色", "白色", "黑色", "彩色", "大小", "高低", "快慢",
    "安全", "规则", "交通", "公园", "超市", "医院", "图书", "音乐", "美术", "运动"
  ];

  const PREFIXES = ["小", "大", "好", "爱", "新", "旧", "早", "晚", "上", "下", "前", "后", "左", "右"];
  const SUFFIXES = ["朋友", "老师", "同学", "星星", "故事", "花园", "世界", "动物", "植物", "家"];
  const COMBOS = uniqueList(combine(PREFIXES, SUFFIXES));

  const KINDER_WORDS = uniqueList(collectChineseWords(KINDER_VOCAB_SOURCE)).slice(0, 360);
  const LANGUAGE_EXTRA_WORDS = uniqueList([
    ...KINDER_WORDS,
    ...EXTRA_BASE_WORDS,
    ...COMBOS
  ]).slice(0, 600);

  const EXTRA_EXPRESSIONS = uniqueList([
    "我可以吗", "我来试试", "请再来一次", "我们一起玩", "我们一起学", "我想帮助你",
    ...combine(["我想", "我会", "我能", "我喜欢", "我需要"], LANGUAGE_EXTRA_WORDS.slice(0, 120)),
    ...combine(["在家", "在学校", "在公园", "在教室"], LANGUAGE_EXTRA_WORDS.slice(0, 80))
  ]).slice(0, 520);

  const EXTRA_POEM_TITLES = uniqueList([
    "春风", "秋雨", "月夜", "晨光", "晚霞", "荷花", "柳树", "松林", "小桥", "远山",
    "山川", "江河", "田园", "溪水", "白云", "清风", "花香", "竹影", "渔歌", "牧童"
  ]);

  const extraLanguageEntries = [
    ...LANGUAGE_EXTRA_WORDS.map((word) => createLanguageEntry(word, "拓展词汇")).filter(Boolean),
    ...EXTRA_EXPRESSIONS.map((word) => createLanguageEntry(word, "表达", { tags: ["口语"] })).filter(Boolean),
    ...EXTRA_POEM_TITLES.map((word) => createLanguageEntry(word, "古诗")).filter(Boolean)
  ];

  const target = (typeof BRIDGE_VOCAB_LANGUAGE !== "undefined" && Array.isArray(BRIDGE_VOCAB_LANGUAGE))
    ? BRIDGE_VOCAB_LANGUAGE
    : [];
  const merged = uniqueByWord([...target, ...extraLanguageEntries]);
  if (target !== merged) {
    target.length = 0;
    merged.forEach((item) => target.push(item));
  }
  if (typeof BRIDGE_VOCAB_LANGUAGE === "undefined") {
    window.BRIDGE_VOCAB_LANGUAGE = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraLanguageEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
