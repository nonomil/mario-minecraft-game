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

const FALLBACK_PINYIN_PAIRS = [
  ["没", "méi"],
  ["系", "xì"],
  ["喝", "hē"],
  ["帮", "bāng"],
  ["边", "biān"],
  ["面", "miàn"],
  ["具", "jù"],
  ["耍", "shuǎ"],
  ["两", "liǎng"],
  ["哥", "gē"],
  ["姐", "jiě"],
  ["叔", "shū"],
  ["阿", "ā"],
  ["姨", "yí"],
  ["伯", "bó"],
  ["舅", "jiù"],
  ["姑", "gū"],
  ["婆", "pó"],
  ["孩", "hái"],
  ["嘴", "zuǐ"],
  ["巴", "bā"],
  ["脸", "liǎn"],
  ["脚", "jiǎo"],
  ["丫", "yā"],
  ["肚", "dù"],
  ["操", "cāo"],
  ["图", "tú"],
  ["馆", "guǎn"],
  ["班", "bān"],
  ["级", "jí"],
  ["桌", "zhuō"],
  ["复", "fù"],
  ["习", "xí"],
  ["预", "yù"],
  ["提", "tí"],
  ["朗", "lǎng"],
  ["读", "dú"],
  ["背", "bèi"],
  ["诵", "sòng"],
  ["阅", "yuè"],
  ["拼", "pīn"],
  ["词", "cí"],
  ["语", "yǔ"],
  ["标", "biāo"],
  ["点", "diǎn"],
  ["睡", "shuì"],
  ["觉", "jué"],
  ["休", "xiū"],
  ["息", "xī"],
  ["澡", "zǎo"],
  ["穿", "chuān"],
  ["整", "zhěng"],
  ["扫", "sǎo"],
  ["擦", "cā"],
  ["倒", "dào"],
  ["跑", "pǎo"],
  ["步", "bù"],
  ["跳", "tiào"],
  ["绳", "shéng"],
  ["踢", "tī"],
  ["戏", "xì"],
  ["舞", "wǔ"],
  ["条", "tiáo"],
  ["饺", "jiǎo"],
  ["馒", "mán"],
  ["头", "tóu"],
  ["饼", "bǐng"],
  ["糖", "táng"],
  ["苹", "píng"],
  ["香", "xiāng"],
  ["蕉", "jiāo"],
  ["葡", "pú"],
  ["萄", "táo"],
  ["莓", "méi"],
  ["橙", "chéng"],
  ["梨", "lí"],
  ["桃", "táo"],
  ["蛋", "dàn"],
  ["汁", "zhī"],
  ["豆", "dòu"],
  ["腐", "fǔ"],
  ["萝", "luó"],
  ["卜", "bo"],
  ["椅", "yǐ"],
  ["台", "tái"],
  ["灯", "dēng"],
  ["闹", "nào"],
  ["钟", "zhōng"],
  ["钥", "yào"],
  ["匙", "shí"],
  ["铅", "qiān"],
  ["橡", "xiàng"],
  ["彩", "cǎi"],
  ["剪", "jiǎn"],
  ["肥", "féi"],
  ["伞", "sǎn"],
  ["裤", "kù"],
  ["裙", "qún"],
  ["鞋", "xié"],
  ["袜", "wà"],
  ["帽", "mào"],
  ["套", "tào"],
  ["围", "wéi"],
  ["积", "jī"],
  ["筝", "zhēng"],
  ["厨", "chú"],
  ["客", "kè"],
  ["厅", "tīng"],
  ["卧", "wò"],
  ["卫", "wèi"],
  ["院", "yuàn"],
  ["站", "zhàn"],
  ["害", "hài"],
  ["怕", "pà"],
  ["紧", "jǐn"],
  ["张", "zhāng"],
  ["努", "nǔ"],
  ["耐", "nài"],
  ["礼", "lǐ"],
  ["貌", "mào"],
  ["享", "xiǎng"],
  ["排", "pái"],
  ["识", "shí"],
  ["写", "xiě"],
  ["默", "mò"],
  ["记", "jì"],
  ["周", "zhōu"],
  ["课", "kè"],
  ["代", "dài"],
  ["表", "biǎo"],
  ["园", "yuán"],
  ["地", "dì"],
  ["外", "wài"],
  ["角", "jiǎo"],
  ["领", "lǐng"],
  ["说", "shuō"],
  ["想", "xiǎng"],
  ["打", "dǎ"],
  ["做", "zuò"],
  ["座", "zuò"],
  ["位", "wèi"],
  ["值", "zhí"],
  ["组", "zǔ"],
  ["校", "xiào"],
  ["路", "lù"],
  ["前", "qián"],
  ["准", "zhǔn"],
  ["备", "bèi"],
  ["堂", "táng"],
  ["笔", "bǐ"],
  ["感", "gǎn"],
  ["吧", "ba"],
  ["后", "hòu"],
  ["员", "yuán"],
  ["查", "chá"],
  ["典", "diǎn"],
  ["练", "liàn"],
  ["题", "tí"],
  ["句", "jù"],
  ["抄", "chāo"],
  ["摆", "bǎi"],
  ["卫", "wèi"],
  ["姓", "xìng"],
  ["名", "míng"],
  ["新", "xīn"],
  ["皮", "pí"],
  ["告", "gào"],
  ["健", "jiàn"],
  ["插", "chā"],
  ["圈", "quān"],
  ["段", "duàn"],
  ["短", "duǎn"],
  ["作", "zuò"],
  ["程", "chéng"],
  ["教", "jiào"],
  ["室", "shì"],
  ["录", "lù"],
  ["故", "gù"],
  ["公", "gōng"],
  ["册", "cè"],
  ["纸", "zhǐ"],
  ["队", "duì"],
  ["互", "hù"],
  ["相", "xiāng"],
  ["遵", "zūn"],
  ["守", "shǒu"],
  ["规", "guī"],
  ["则", "zé"],
  ["专", "zhuān"],
  ["环", "huán"],
  ["境", "jìng"],
  ["护", "hù"],
  ["保", "bǎo"],
  ["动", "dòng"],
  ["物", "wù"],
  ["为", "wèi"],
  ["文", "wén"],
  ["明", "míng"],
  ["乐", "lè"],
  ["完", "wán"],
  ["达", "dá"],
  ["睛", "jīng"],
  ["朵", "duǒ"],
  ["齿", "chǐ"],
  ["刷", "shuā"],
  ["汽", "qì"],
  ["房", "fáng"],
  ["只", "zhī"],
  ["卡", "kǎ"],
  ["鸡", "jī"],
  ["宝", "bǎo"],
  ["壳", "ké"],
  ["杯", "bēi"],
  ["瓶", "píng"],
  ["巾", "jīn"],
  ["书", "shū"],
  ["我", "wǒ"],
  ["的", "de"],
  ["示", "shì"],
  ["发", "fā"],
  ["现", "xiàn"],
  ["晨", "chén"],
  ["午", "wǔ"],
  ["交", "jiāo"],
  ["际", "jì"],
  ["借", "jiè"],
  ["架", "jià"],
  ["检", "jiǎn"],
  ["餐", "cān"],
  ["盘", "pán"],
  ["眼", "yǎn"],
  ["岗", "gǎng"],
  ["姿", "zī"],
  ["势", "shì"],
  ["握", "wò"],
  ["评", "píng"],
  ["闯", "chuǎng"],
  ["皂", "zào"],
  ["厕", "cè"],
  ["超", "chāo"],
  ["市", "shì"]
];

// From kindergarten vocab (MERGED_KINDERGARTEN_VOCAB) chinese translations that were filtered out due to
// missing single-character pinyin mappings.
const KINDER_TRANSLATION_PINYIN_PAIRS = [
  ["丛", "cóng"],
  ["串", "chuàn"],
  ["丽", "lì"],
  ["么", "me"],
  ["乌", "wū"],
  ["些", "xiē"],
  ["亮", "liàng"],
  ["什", "shén"],
  ["仓", "cāng"],
  ["仔", "zǎi"],
  ["仪", "yí"],
  ["企", "qǐ"],
  ["侄", "zhí"],
  ["值", "zhí"],
  ["做", "zuò"],
  ["偶", "ǒu"],
  ["傍", "bàng"],
  ["傲", "ào"],
  ["克", "kè"],
  ["兔", "tù"],
  ["兰", "lán"],
  ["击", "jī"],
  ["刺", "cì"],
  ["剧", "jù"],
  ["勺", "sháo"],
  ["升", "shēng"],
  ["叉", "chā"],
  ["叠", "dié"],
  ["吵", "chǎo"],
  ["吸", "xī"],
  ["吻", "wěn"],
  ["员", "yuán"],
  ["哈", "hā"],
  ["哪", "nǎ"],
  ["唇", "chún"],
  ["喷", "pēn"],
  ["器", "qì"],
  ["嚏", "tì"],
  ["圾", "jī"],
  ["坏", "huài"],
  ["坐", "zuò"],
  ["垃", "lā"],
  ["垫", "diàn"],
  ["塔", "tǎ"],
  ["壤", "rǎng"],
  ["壶", "hú"],
  ["夹", "jiā"],
  ["奋", "fèn"],
  ["娃", "wá"],
  ["孔", "kǒng"],
  ["孤", "gū"],
  ["宠", "chǒng"],
  ["宫", "gōng"],
  ["岩", "yán"],
  ["崽", "zǎi"],
  ["帐", "zhàng"],
  ["帚", "zhǒu"],
  ["带", "dài"],
  ["幼", "yòu"],
  ["底", "dǐ"],
  ["御", "yù"],
  ["微", "wēi"],
  ["怎", "zěn"],
  ["恐", "kǒng"],
  ["恤", "xù"],
  ["惑", "huò"],
  ["慢", "màn"],
  ["扮", "bàn"],
  ["扰", "rǎo"],
  ["找", "zhǎo"],
  ["把", "bǎ"],
  ["折", "zhé"],
  ["披", "pī"],
  ["担", "dān"],
  ["拇", "mǔ"],
  ["拉", "lā"],
  ["拍", "pāi"],
  ["拖", "tuō"],
  ["拥", "yōng"],
  ["挖", "wā"],
  ["换", "huàn"],
  ["捷", "jié"],
  ["掌", "zhǎng"],
  ["掘", "jué"],
  ["摸", "mō"],
  ["攻", "gōng"],
  ["斑", "bān"],
  ["旋", "xuán"],
  ["昆", "kūn"],
  ["晨", "chén"],
  ["术", "shù"],
  ["板", "bǎn"],
  ["枕", "zhěn"],
  ["架", "jià"],
  ["柔", "róu"],
  ["柜", "guì"],
  ["柠", "níng"],
  ["柱", "zhù"],
  ["栏", "lán"],
  ["样", "yàng"],
  ["桶", "tǒng"],
  ["梯", "tī"],
  ["梳", "shū"],
  ["棒", "bàng"],
  ["棕", "zōng"],
  ["森", "sēn"],
  ["椭", "tuǒ"],
  ["椰", "yē"],
  ["模", "mó"],
  ["樱", "yīng"],
  ["檬", "méng"],
  ["欠", "qiàn"],
  ["毯", "tǎn"],
  ["池", "chí"],
  ["沙", "shā"],
  ["泥", "ní"],
  ["泰", "tài"],
  ["泳", "yǒng"],
  ["浴", "yù"],
  ["涂", "tú"],
  ["淋", "lín"],
  ["渴", "kě"],
  ["湿", "shī"],
  ["滑", "huá"],
  ["滩", "tān"],
  ["漂", "piāo"],
  ["漠", "mò"],
  ["灰", "huī"],
  ["炉", "lú"],
  ["烤", "kǎo"],
  ["照", "zhào"],
  ["熊", "xióng"],
  ["爽", "shuǎng"],
  ["状", "zhuàng"],
  ["狐", "hú"],
  ["狮", "shī"],
  ["狸", "lí"],
  ["猕", "mí"],
  ["猬", "wèi"],
  ["猴", "hóu"],
  ["玫", "méi"],
  ["珠", "zhū"],
  ["琴", "qín"],
  ["瑰", "guī"],
  ["瓢", "piáo"],
  ["甜", "tián"],
  ["甲", "jiǎ"],
  ["疗", "liáo"],
  ["盒", "hé"],
  ["盖", "gài"],
  ["盘", "pán"],
  ["眉", "méi"],
  ["眨", "zhǎ"],
  ["矮", "ǎi"],
  ["磁", "cí"],
  ["称", "chēng"],
  ["稀", "xī"],
  ["箭", "jiàn"],
  ["箱", "xiāng"],
  ["篷", "péng"],
  ["粉", "fěn"],
  ["糕", "gāo"],
  ["索", "suǒ"],
  ["紫", "zǐ"],
  ["累", "lèi"],
  ["绒", "róng"],
  ["缸", "gāng"],
  ["罩", "zhào"],
  ["置", "zhì"],
  ["羞", "xiū"],
  ["肌", "jī"],
  ["肘", "zhǒu"],
  ["肤", "fū"],
  ["肩", "jiān"],
  ["胎", "tāi"],
  ["胞", "bāo"],
  ["胡", "hú"],
  ["胶", "jiāo"],
  ["脏", "zàng"],
  ["脑", "nǎo"],
  ["脖", "bó"],
  ["腕", "wàn"],
  ["腰", "yāo"],
  ["膀", "bǎng"],
  ["膏", "gāo"],
  ["膝", "xī"],
  ["臂", "bì"],
  ["芒", "máng"],
  ["茄", "jiā"],
  ["菇", "gū"],
  ["菠", "bō"],
  ["菱", "líng"],
  ["萨", "sà"],
  ["葱", "cōng"],
  ["葵", "kuí"],
  ["蒜", "suàn"],
  ["蓝", "lán"],
  ["藏", "cáng"],
  ["蘑", "mó"],
  ["虹", "hóng"],
  ["蚁", "yǐ"],
  ["蚂", "mǎ"],
  ["蛙", "wā"],
  ["蛛", "zhū"],
  ["蜂", "fēng"],
  ["蜗", "wō"],
  ["蜘", "zhī"],
  ["蜜", "mì"],
  ["蜡", "là"],
  ["蝴", "hú"],
  ["蝶", "dié"],
  ["螃", "páng"],
  ["螺", "luó"],
  ["蟹", "xiè"],
  ["蠕", "rú"],
  ["衫", "shān"],
  ["衬", "chèn"],
  ["袋", "dài"],
  ["装", "zhuāng"],
  ["触", "chù"],
  ["警", "jǐng"],
  ["讶", "yà"],
  ["豚", "tún"],
  ["象", "xiàng"],
  ["贴", "tiē"],
  ["趾", "zhǐ"],
  ["跟", "gēn"],
  ["跷", "qiāo"],
  ["踝", "huái"],
  ["蹈", "dǎo"],
  ["躲", "duǒ"],
  ["软", "ruǎn"],
  ["轴", "zhóu"],
  ["迪", "dí"],
  ["迷", "mí"],
  ["酸", "suān"],
  ["钢", "gāng"],
  ["锥", "zhuī"],
  ["锯", "jù"],
  ["镜", "jìng"],
  ["闪", "shǎn"],
  ["附", "fù"],
  ["险", "xiǎn"],
  ["隧", "suì"],
  ["雀", "què"],
  ["靴", "xuē"],
  ["颈", "jǐng"],
  ["颊", "jiá"],
  ["颜", "yán"],
  ["额", "é"],
  ["餐", "cān"],
  ["饥", "jī"],
  ["饿", "è"],
  ["骄", "jiāo"],
  ["验", "yàn"],
  ["魔", "mó"],
  ["鲨", "shā"],
  ["鲸", "jīng"],
  ["鳄", "è"],
  ["鸭", "yā"],
  ["鹅", "é"],
  ["鹉", "wǔ"],
  ["鹦", "yīng"],
  ["鹰", "yīng"],
  ["鹿", "lù"],
  ["鼠", "shǔ"],
  ["龙", "lóng"],
  ["龟", "guī"]
];

function addPinyinIfMissing(map, char, pinyin) {
  const normalizedChar = String(char || "").trim();
  const normalizedPinyin = String(pinyin || "").trim();
  if (normalizedChar.length !== 1 || !normalizedPinyin) return;
  if (map.has(normalizedChar)) return;
  map.set(normalizedChar, normalizedPinyin);
}

const HANZI_PINYIN_MAP = (() => {
  const map = new Map();
  HANZI_SOURCE.forEach((entry) => {
    const char = String(entry.character || entry.chinese || entry.word || "").trim();
    const pinyin = String(entry.pinyin || "").trim();
    addPinyinIfMissing(map, char, pinyin);
  });
  PINYIN_SOURCE.forEach((entry) => {
    const char = String(entry.chinese || entry.word || "").trim();
    const pinyin = String(entry.pinyin || "").trim();
    addPinyinIfMissing(map, char, pinyin);

    const homophones = Array.isArray(entry.homophones) ? entry.homophones : [];
    homophones.forEach((homophone) => {
      addPinyinIfMissing(map, homophone, pinyin);
    });
  });
  FALLBACK_PINYIN_PAIRS.forEach(([char, pinyin]) => addPinyinIfMissing(map, char, pinyin));
  KINDER_TRANSLATION_PINYIN_PAIRS.forEach(([char, pinyin]) => addPinyinIfMissing(map, char, pinyin));
  return map;
})();

const HANZI_RE = /[\u4e00-\u9fff]/;

const PHRASE_PINYIN_OVERRIDES = new Map([
  ["睡觉", "shuì jiào"],
  ["午觉", "wǔ jiào"],
  ["音乐", "yīn yuè"]
]);

function toPinyin(text) {
  const normalized = String(text || "").trim();
  const override = PHRASE_PINYIN_OVERRIDES.get(normalized);
  if (override) return override;
  const out = [];
  for (const char of normalized) {
    if (!HANZI_RE.test(char)) continue;
    const py = HANZI_PINYIN_MAP.get(char);
    if (!py) return "";
    out.push(py);
  }
  return out.join(" ");
}

if (typeof window !== "undefined") {
  window.BRIDGE_HANZI_PINYIN_MAP = HANZI_PINYIN_MAP;
  window.BRIDGE_TO_PINYIN = toPinyin;
}

function createLanguageEntry(word, moduleName, options = {}) {
  const chinese = String(word || "").trim();
  if (!chinese || containsExcludedBridgeFragment(chinese)) return null;
  if (moduleName === "表达" && !isBridgeExpression(chinese)) return null;
  const pinyin = toPinyin(chinese);
  if (!pinyin) return null;
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
  if (options.gradeBand) {
    entry.gradeBand = String(options.gradeBand).trim();
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

function collectKindergartenExpressions(entries) {
  const phrases = [];
  entries.forEach((entry) => {
    const phrase = String(entry?.phraseTranslation || "").trim();
    if (!isBridgeExpression(phrase)) return;
    phrases.push(phrase);
  });
  return phrases;
}

function isAllHanzi(text) {
  const chars = [...String(text || "").trim()];
  return chars.length > 0 && chars.every((char) => HANZI_RE.test(char));
}

const BRIDGE_EXCLUDED_FRAGMENTS = [
  "传送",
  "附魔",
  "出生点",
  "采集木头",
  "坐标",
  "上方",
  "下方",
  "餐厅",
  "收音机"
];

function containsExcludedBridgeFragment(text) {
  const normalized = String(text || "").trim();
  return Boolean(normalized) && BRIDGE_EXCLUDED_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

function hasLengthInRange(text, minLen, maxLen) {
  const length = [...String(text || "").trim()].length;
  return length >= minLen && length <= maxLen;
}

function isBridgeReadyText(text, { minLen = 1, maxLen = 99 } = {}) {
  const normalized = String(text || "").trim();
  return Boolean(normalized)
    && hasLengthInRange(normalized, minLen, maxLen)
    && isAllHanzi(normalized)
    && !containsExcludedBridgeFragment(normalized)
    && Boolean(toPinyin(normalized));
}

const BRIDGE_EXPRESSION_FIXED_TEXTS = new Set([
  "你好", "早上好", "晚上好", "午安", "晚安", "再见", "谢谢", "不客气", "对不起",
  "请问", "请进", "请坐", "请慢走", "你好吗", "你真棒", "别着急", "慢慢来", "请等一下",
  "再试一次", "生日快乐", "节日快乐", "新年快乐", "我爱你", "我想你", "请安静", "请排队",
  "我们开始", "我们结束", "可以吗", "不可以", "我明白了", "我知道了"
]);

const BRIDGE_EXPRESSION_ALLOWED_PREFIXES = [
  "我", "我们", "请", "请你", "请老师", "请妈妈", "一起", "在家", "在学校", "在操场",
  "在公园", "在教室", "在图书馆", "去", "先", "再", "慢慢", "别", "谢谢", "对不起",
  "你好", "早上好", "晚上好", "午安", "晚安", "再见"
];

const BRIDGE_EXPRESSION_ALLOWED_TOKENS = [
  "读", "写", "说", "讲", "听", "看", "问", "答", "朗读", "跟读", "回答", "补充",
  "表达", "分享", "查字典", "读书", "写字", "画画", "唱歌", "跳舞", "跑步", "走路",
  "排队", "安静", "开始", "结束", "休息", "洗手", "洗脸", "洗澡", "穿衣", "吃饭",
  "喝水", "整理", "收拾", "开门", "关门", "上学", "上课", "下课", "放学", "举手",
  "游泳", "买", "给"
];

const BRIDGE_EXPRESSION_ALLOWED_POSSESSIVE_PREFIXES = [
  "我的", "你的", "我们的", "谢谢你的"
];

const BRIDGE_EXPRESSION_ALLOWED_NOUN_PHRASES = new Set([
  "我的家人", "我的同学", "我的朋友"
]);

const BRIDGE_EXPRESSION_ALLOWED_NUMERIC_PREFIXES = [
  "我想要", "我要", "请给我", "我喜欢"
];

function isBridgeExpression(text) {
  const normalized = String(text || "").trim();
  if (!isBridgeReadyText(normalized, { minLen: 2, maxLen: 8 })) return false;
  if (BRIDGE_EXPRESSION_FIXED_TEXTS.has(normalized)) return true;
  if (BRIDGE_EXPRESSION_ALLOWED_NOUN_PHRASES.has(normalized)) return true;
  if (normalized.includes("的") && !BRIDGE_EXPRESSION_ALLOWED_POSSESSIVE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  if ((normalized.startsWith("我的") || normalized.startsWith("你的") || normalized.startsWith("我们的"))
    && !BRIDGE_EXPRESSION_ALLOWED_NOUN_PHRASES.has(normalized)) {
    return false;
  }
  if (/^(一|二|三|四|五|六|七|八|九|十|两|几|第)/.test(normalized)
    && !BRIDGE_EXPRESSION_ALLOWED_NUMERIC_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  if (normalized.endsWith("天气") && !normalized.startsWith("今天天气")) {
    return false;
  }
  if (BRIDGE_EXPRESSION_ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized.startsWith("请")
      || normalized.startsWith("谢谢")
      || normalized.startsWith("对不起")
      || BRIDGE_EXPRESSION_ALLOWED_TOKENS.some((token) => normalized.includes(token));
  }
  return BRIDGE_EXPRESSION_ALLOWED_TOKENS.some((token) => normalized.includes(token));
}

function filterPinyinReadyWords(words, { minLen = 1, maxLen = 99 } = {}) {
  return uniqueList(words)
    .map((word) => String(word || "").trim())
    .filter((word) => isBridgeReadyText(word, { minLen, maxLen }));
}

const EXAMPLE_WORDS = uniqueList([
  ...collectExampleWords(HANZI_SOURCE),
  ...collectExampleWords(PINYIN_SOURCE)
]).filter((word) => word.length >= 2 && word.length <= 4);
const KINDER_CHINESE_WORDS = uniqueList(collectKindergartenWords(KINDER_VOCAB_SOURCE));
const KINDER_EXPRESSIONS = uniqueList(collectKindergartenExpressions(KINDER_VOCAB_SOURCE));

const EXTRA_SEASONS = ["春", "夏", "秋", "冬"];
const EXTRA_WEATHER = ["天", "风", "雨", "雪"];
const EXTRA_SIZE_PREFIXES = ["小", "大"];
const EXTRA_ANIMALS = [
  "狗", "猫", "鱼", "鸟", "兔", "马", "牛", "羊", "鸡", "鸭", "熊", "虎",
  "熊猫", "袋鼠", "仓鼠", "孔雀", "企鹅", "海豚", "鳄鱼", "乌龟",
  "狐狸", "狮子", "刺猬", "松鼠",
  "蝴蝶", "蜜蜂", "蚂蚁", "瓢虫", "蜘蛛", "蜗牛", "螃蟹",
  "鲨鱼", "鲸鱼", "鹦鹉", "老鹰"
];
const EXTRA_NATURE_OBJECTS = ["山", "河", "海", "树", "花", "草", "云", "星", "月", "日"];
const EXTRA_NUM_PREFIXES = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const EXTRA_NUM_SUFFIXES = ["月"];
const EXTRA_COLORS = ["红", "黄", "蓝", "绿", "白"];
const EXTRA_COLOR_OBJECTS = ["花", "球", "车", "书包", "风筝", "帽", "伞", "鞋", "衣服"];
const EXTRA_COUNT_PREFIXES = ["一只", "两只", "三只"];
const EXTRA_COUNT_OBJECTS = [
  "小狗", "小猫", "小鸟", "小兔", "小鱼", "小鸡", "小鸭",
  "熊猫", "乌龟", "蝴蝶", "蜜蜂", "蜗牛"
];

const EXTRA_MEASURE_PHRASES = uniqueList([
  ...combine(["一朵", "两朵"], ["花", "白云", "雪花"]),
  ...combine(["一张", "两张"], ["纸", "画", "卡片"]),
  ...combine(["一条", "两条"], ["鱼", "绳子", "毛巾", "围巾"]),
  ...combine(["一件", "两件"], ["衣服", "外套", "礼物"]),
  ...combine(["一杯", "两杯"], ["水", "牛奶", "果汁"]),
  ...combine(["一瓶", "两瓶"], ["水", "牛奶", "果汁"]),
  ...combine(["一碗", "两碗"], ["米饭", "面条"]),
  ...combine(["一把", "两把"], ["伞", "钥匙", "剪刀", "铅笔"]),
  ...combine(["一双", "两双"], ["鞋", "袜", "手套"]),
  ...combine(["一本", "两本"], ["书", "课本", "本子"]),
  ...combine(["一支", "两支"], ["笔", "铅笔", "彩笔"])
]);
const EXTRA_SIZED_NOUNS = [
  "书包", "课本", "本子", "玩具", "积木", "皮球", "风筝",
  "水杯", "毛巾", "牙刷", "雨伞", "雨衣",
  "桌子", "椅子", "房间", "教室", "操场", "公园", "超市", "医院",
  "书桌", "书架", "黑板", "讲台", "窗户", "门口",
  "地毯", "毛毯", "枕头", "柜子", "盒子", "盘子", "水壶",
  "扫帚", "围巾", "手套", "外套", "衬衫", "泳衣",
  "礼物", "蛋糕", "饼干", "糖果",
  "玩偶", "娃娃", "拼图",
  "卡片", "贴纸", "画纸",
  "书柜", "水桶", "箱子", "浴缸",
  "雨靴", "拖鞋",
  "柠檬", "樱桃", "菠萝", "蘑菇", "蜂蜜",
  "机器人", "玩具车", "口罩", "面具",
  "杯子", "纸杯", "香皂", "牙膏", "拖把",
  "钢琴", "相机", "铅笔盒", "橡皮擦"
];

const EXTRA_FAMILY_WORDS = [
  "家人", "家庭", "父母", "家长", "亲人",
  "爸爸", "妈妈", "爷爷", "奶奶", "外公", "外婆",
  "哥哥", "姐姐", "弟弟", "妹妹", "叔叔", "阿姨", "伯伯", "舅舅", "姑姑",
  "孩子", "宝宝", "朋友"
];

const EXTRA_BODY_WORDS = [
  "身体", "头发", "眼睛", "耳朵", "鼻子", "嘴巴", "牙齿", "脸蛋",
  "小手", "手心", "手指", "小脚", "脚丫", "肚子"
];

const EXTRA_SCHOOL_WORDS = [
  "学校", "教室", "操场", "图书馆", "课堂", "课间", "班级", "同桌",
  "老师", "同学", "学生",
  "书包", "课本", "本子", "作业", "练习", "复习", "预习",
  "听讲", "回答", "提问", "问题", "朗读", "背诵", "阅读", "写作",
  "拼音", "汉字", "词语", "句子", "标点", "故事", "童话", "儿歌"
];

const EXTRA_DAILY_WORDS = [
  "起床", "睡觉", "午休", "休息", "洗手", "洗脸", "洗澡", "刷牙", "穿衣", "脱衣",
  "吃饭", "喝水", "饮水", "整理", "收拾", "打扫", "擦桌", "倒水",
  "运动", "散步", "跑步", "跳绳", "踢球", "打球", "游戏", "玩耍",
  "唱歌", "跳舞", "画画", "写字", "读书"
];

const EXTRA_FOOD_WORDS = [
  "米饭", "面包", "面条", "饺子", "包子", "馒头", "饼干", "糖果",
  "水果", "苹果", "香蕉", "葡萄", "草莓", "西瓜", "橙子", "梨子", "桃子",
  "鸡蛋", "牛奶", "果汁", "豆腐", "青菜", "土豆", "萝卜",
  "柠檬", "樱桃", "菠萝", "蘑菇", "蜂蜜", "酸奶",
  "芒果", "茄子", "蒜头", "葱花", "月饼"
];

const EXTRA_OBJECT_WORDS = [
  "桌子", "椅子", "书桌", "台灯", "闹钟", "钥匙",
  "铅笔", "橡皮", "尺子", "文具", "彩笔", "画笔", "剪刀",
  "粉笔", "黑板擦", "橡皮擦", "铅笔盒", "卡片", "贴纸",
  "水杯", "毛巾", "纸巾", "肥皂", "牙刷", "雨伞", "雨衣",
  "纸杯", "杯子", "拖把", "香皂", "牙膏", "扫帚",
  "衣服", "裤子", "裙子", "鞋子", "袜子", "帽子", "手套", "围巾",
  "口罩", "面具", "相机", "钢琴",
  "枕头", "毛毯", "地毯", "帐篷", "浴缸",
  "盘子", "盒子", "柜子", "水壶", "小勺",
  "玩具", "积木", "皮球", "风筝"
];

const EXTRA_PLACE_WORDS = [
  "家里", "房间", "厨房", "客厅", "卧室", "卫生间", "厕所",
  "公园", "超市", "医院", "马路", "车站"
];

const EXTRA_EMOTION_WORDS = [
  "开心", "快乐", "高兴", "难过", "伤心", "生气", "害怕", "紧张", "放心", "着急",
  "勇敢", "认真", "努力", "耐心", "礼貌", "分享", "合作", "帮助", "排队",
  "兴奋", "骄傲", "害羞", "困惑", "担心"
];

const EXTRA_4CHAR_PHRASES = [
  "互相帮助", "团结友爱", "遵守规则", "认真听讲", "专心学习", "文明礼貌",
  "早睡早起", "爱护环境", "保护动物", "开开心心", "助人为乐"
];

const EXTRA_GRADE12_LANGUAGE_WORDS = [
  "语文书", "生字卡", "生字卡片", "识字卡", "拼音卡", "写字本", "练字本", "听写本", "作文本", "阅读卡",
  "田字本", "方格本", "横线格", "拼音格", "练习册", "练习题", "口算本", "口算题", "算式", "题目",
  "课文", "课题", "课后题", "段落", "自然段", "词组", "组词", "造句", "写话", "看图",
  "看图写话", "读拼音", "认读", "拼读", "跟读", "齐读", "领读", "晨读", "早读", "午读",
  "背课文", "抄生字", "写生字", "学拼音", "声母", "韵母", "声调", "整体认读", "句号", "逗号",
  "问号", "感叹号", "标点符号", "书写提示", "我的发现", "课文插图", "口语交际", "阅读题",
  "展示台", "日积月累", "课前准备", "朗读课文", "借助拼音", "读准字音", "分角色读", "查字典",
  "音序表", "部首表", "阅读交流", "课堂展示"
];

const EXTRA_CAMPUS_SCENE_WORDS = [
  "值日", "值日生", "值日表", "课程表", "作息表", "座位", "座位表", "排座位", "换座位", "班长",
  "组长", "小组长", "课代表", "同学们", "老师好", "红领巾", "队礼", "队旗", "升旗", "校服",
  "校门", "进校门", "出校门", "教室门", "走廊", "楼梯", "楼道", "图书角", "黑板报", "书架",
  "领奖台", "讲故事", "听故事", "读故事", "故事书", "童话书", "图画书", "课外书", "借书卡", "借书",
  "还书", "文具盒", "书皮", "包书皮", "削铅笔", "装书包", "整理书包", "收作业", "发作业", "交作业",
  "改作业", "讲题", "答题", "提问题", "做眼操", "广播操", "眼保健操", "排队走", "排好队", "站整齐",
  "坐端正", "举小手", "写姓名", "晨检表", "午餐盘", "借阅架", "餐巾纸", "护眼操"
];

const EXTRA_LIFE_PLAY_WORDS = [
  "小水壶", "小饭盒", "保温杯", "餐巾纸", "湿纸巾", "洗手液", "洗脸盆", "小板凳", "小桌灯", "小书架",
  "削笔刀", "转笔刀", "订书机", "透明胶", "双面胶", "彩泥", "橡皮泥", "蜡笔", "水彩笔", "图画纸",
  "折纸船", "折飞机", "折星星", "拍皮球", "丢沙包", "跳房子", "滑滑梯", "荡秋千", "捉迷藏", "过家家",
  "木头人", "小火车", "老鹰捉鸡", "拔河", "接力跑", "吹泡泡", "搭积木", "拼拼图", "玩水枪", "洗袜子",
  "叠衣服", "叠被子", "铺被子", "扫地", "拖地", "擦黑板", "擦桌子", "倒垃圾", "扔垃圾", "收玩具",
  "摆椅子", "端水杯", "开水龙头", "关水龙头"
];

const EXTRA_READING_WRITING_WORDS = [
  "识字表", "写字表", "生字表", "组词本", "默写本", "写话本", "日记本", "周记本", "语文园地", "看图说话",
  "课外阅读", "读书角", "朗读本", "阅读本", "拼读本", "写字纸", "生字卡", "词语表", "句子本", "课堂笔记",
  "阅读单", "小练笔", "读后感", "背课文", "抄词语", "查字表", "查词卡", "句子条", "词语条", "识字卡",
  "听写词", "默写词", "读一读", "写一写", "说一说", "想一想", "写日记", "做笔记", "读课文", "写词语",
  "语文园地", "日积月累", "故事时间", "读书时间", "故事书", "图画书", "图书角", "借书袋", "书架", "观察日记",
  "查字典", "部首查字", "音序查字", "课前准备", "朗读课文", "借助拼音", "读准字音", "分角色读",
  "音序表", "部首表", "阅读交流", "课堂展示",
  "讲评课", "观察日记", "阅读笔记", "写话练习", "词语练习", "短文练习", "听写练习", "默写练习", "组词练习"
];

const EXTRA_CLASS_ROUTINE_WORDS = [
  "打铃", "上操", "做操", "小队长", "值日组", "排座位", "换座位", "进教室", "出教室", "回座位",
  "放学路队", "排队走", "站整齐", "坐端正", "举小手", "写姓名", "发新书", "包书皮", "交本子", "收本子",
  "摆桌椅", "清洁区", "卫生角", "图书角", "图书袋", "黑板报", "书架", "上课铃", "下课铃", "预备铃",
  "眼保健操", "进校园", "出校园", "小组合作", "合作学习", "发本子"
];

const EXTRA_STUDY_ACTION_WORDS = [
  "课前准备", "课后题", "读课文", "学课文", "认生字", "读词语", "写短句", "看插图", "找词语", "圈生字",
  "分段落", "找段意", "读题目", "看题目", "听老师", "看黑板", "讲故事", "读故事", "写作业", "改作业",
  "看课本", "翻课本", "写拼音", "读拼音", "写生字", "读句子", "写句子", "找自然段", "读短文", "写短文"
];

const EXTRA_CURATED_COLOR_WORDS = [
  "红花", "红旗", "红灯", "红叶", "黄花", "黄豆", "黄瓜", "蓝天", "白云", "白雪",
  "白兔", "绿草", "绿叶", "绿树", "彩笔", "彩纸"
];

const BRIDGE_LANGUAGE_WORD_BLACKLIST = new Set([
  "一个", "三个", "四个", "五个", "六个", "七个", "八个", "九个", "十个",
  "蓝球", "白车", "黄车",
  "大云", "小云", "大星", "小星", "大月", "小月", "大日", "小日",
  "大医院", "小医院", "大超市", "小超市", "大公园", "小公园", "大操场", "小操场",
  "大教室", "小教室", "大门口", "小门口", "大香皂", "小香皂", "大牙膏", "小牙膏",
  "大蜂蜜", "小蜂蜜",
  "课程表", "作息表", "座位表", "公告栏", "告示栏", "借阅架", "借书卡", "阅读卡", "查词卡",
  "记录表", "提示卡", "题卡", "词卡", "图示卡", "读书卡", "读书台", "摘抄栏",
  "午睡室", "保健室", "值班室", "公交卡",
  "观察册", "写话单", "记录册", "预习单", "学习单", "读书单", "任务单", "任务卡",
  "记录卡", "阅读交流卡", "课堂展示台", "读书分享会", "整本书阅读", "图书漂流", "评价表",
  "打卡表", "值日册", "点名册", "通知单", "请假条", "校门队", "队列表", "评比栏",
  "轮流表", "分组表", "早读表", "句式表", "阅读表", "阅读台", "展示台", "课堂展示",
  "阅读交流", "讲评课", "讲评卡", "阅读栏", "写话栏", "分享栏", "观察表", "计划表",
  "评分表", "朗读单", "练习单", "实验单", "句式卡", "好词卡", "好句卡", "摘抄卡",
  "词语条", "读书条", "朗读条", "拼读条",
  "留言卡", "展示栏", "作品栏", "阅读任务", "观察记录", "学习记录", "阅读题卡", "整理单"
]);

const BRIDGE_LANGUAGE_WORD_FRAGMENT_BLACKLIST = [
  "公告栏", "告示栏", "课程表", "作息表", "座位表", "记录表", "提示卡", "题卡", "词卡",
  "图示卡", "读书卡", "读书台", "摘抄栏", "借阅架", "保健室", "值班室", "午睡室",
  "服务台", "售票处", "候车亭", "管理员", "保育员", "清洁工", "任务单", "记录卡",
  "评价表", "打卡表", "轮流表", "分组表", "值日册", "队列表", "点名册", "流程图", "路线图",
  "阅读交流卡", "讲评卡", "读书分享", "整本书", "讲评", "评分", "词语条", "读书条", "朗读条", "拼读条"
];

function isNaturalLanguageWord(word) {
  const value = String(word || "").trim();
  if (!value) return false;
  if (BRIDGE_LANGUAGE_WORD_BLACKLIST.has(value)) return false;
  if (BRIDGE_LANGUAGE_WORD_FRAGMENT_BLACKLIST.some((fragment) => value.includes(fragment))) return false;
  return !/^[一二三四五六七八九十]个$/.test(value);
}

const EXTRA_LANGUAGE_WORDS = filterPinyinReadyWords(
  [
    // 常用礼貌/课堂口令
    "你好", "早上好", "晚上好", "午安", "晚安", "再见", "谢谢", "不客气", "对不起", "没关系",
    "请问", "请进", "请坐", "请慢走", "别着急", "慢慢来", "请等一下", "再试一次",
    "生日快乐", "节日快乐", "新年快乐", "你真棒", "我爱你", "我想你", "我明白了", "我知道了",
    "谢谢老师", "谢谢妈妈", "请帮忙",
    "请安静", "请排队", "我们开始", "我们结束", "可以吗", "不可以",

    // 家庭/校园
    ...EXTRA_FAMILY_WORDS,
    ...EXTRA_SCHOOL_WORDS,
    "公园",
    "黑板", "上学", "放学", "上课", "下课", "学习", "走路",

    // 时间/自然
    "今天", "明天", "昨天", "早上", "晚上", "中午", "上午", "下午",
    "太阳", "明月", "月光", "星星", "白云", "蓝天", "下雨", "下雪", "大风",
    "彩虹", "沙滩", "沙漠", "丛林", "森林", "岩石", "土壤", "星空", "月亮",
    ...combine(EXTRA_SEASONS, EXTRA_WEATHER),

    // 颜色/形状/方位
    "红色", "黄色", "蓝色", "绿色", "黑色", "白色",
    "橙色", "粉色", "紫色", "棕色", "灰色", "彩色",
    "圆形", "方形", "三角形", "长方形", "大小", "高低", "长短", "多少", "远近", "早晚", "冷热", "轻重",
    "椭圆形", "菱形", "梯形", "星形", "五角星",
    "左右", "前后", "里面", "外面", "上面", "下面", "中间",

    // 生活动作/习惯
    ...EXTRA_DAILY_WORDS,
    "开门", "关门", "系鞋", "系鞋带", "打哈欠", "打扮", "拥抱", "亲吻",

    // 食物/物品（尽量短且高频）
    ...EXTRA_FOOD_WORDS,
    ...EXTRA_OBJECT_WORDS,
    "粉笔", "黑板擦", "胶水", "剪纸", "折纸",
    "枕头", "盒子", "盘子", "柜子", "地毯", "毛毯", "帐篷", "水壶",
    "垃圾", "垃圾桶",
    ...EXTRA_BODY_WORDS,
    ...EXTRA_PLACE_WORDS,
    ...EXTRA_EMOTION_WORDS,
    ...EXTRA_4CHAR_PHRASES,
    ...EXTRA_GRADE12_LANGUAGE_WORDS,
    ...EXTRA_CAMPUS_SCENE_WORDS,
    ...EXTRA_LIFE_PLAY_WORDS,
    ...EXTRA_READING_WRITING_WORDS,
    ...EXTRA_CLASS_ROUTINE_WORDS,
    ...EXTRA_STUDY_ACTION_WORDS,
    ...EXTRA_CURATED_COLOR_WORDS,
    ...EXTRA_MEASURE_PHRASES,

    // 动物/常见事物（生成）
    ...combine(EXTRA_SIZE_PREFIXES, EXTRA_ANIMALS),
    ...combine(EXTRA_SIZE_PREFIXES, EXTRA_NATURE_OBJECTS),
    ...combine(EXTRA_SIZE_PREFIXES, EXTRA_SIZED_NOUNS),
    ...combine(EXTRA_COUNT_PREFIXES, EXTRA_COUNT_OBJECTS),
    ...combine(EXTRA_NUM_PREFIXES, EXTRA_NUM_SUFFIXES),
    ...combine(EXTRA_COLORS, EXTRA_COLOR_OBJECTS)
  ],
  { minLen: 2, maxLen: 4 }
).filter(isNaturalLanguageWord);

const COMBINED_WORDS = uniqueList([...EXAMPLE_WORDS, ...KINDER_CHINESE_WORDS, ...EXTRA_LANGUAGE_WORDS])
  .filter(isNaturalLanguageWord);

const LANGUAGE_WORDS = filterPinyinReadyWords(COMBINED_WORDS, { minLen: 2, maxLen: 4 }).slice(0, 2000);

const GRADE1_TAGGED_LANGUAGE_WORDS = new Set(filterPinyinReadyWords(uniqueList([
  "语文书", "生字卡", "拼音卡", "写字本", "练字本", "听写本", "阅读卡", "田字本", "练习册", "课文",
  "课后题", "看图写话", "晨读", "早读", "午读", "值日表", "课程表", "作息表", "排座位", "红领巾",
  "队礼", "升旗", "校服", "走廊", "楼梯", "图书角", "文具盒", "书皮", "整理书包", "收作业",
  "发作业", "交作业", "做眼操", "眼保健操", "排队走", "站整齐", "坐端正", "举小手", "写姓名",
  "上课铃", "下课铃", "预备铃", "书写提示", "我的发现", "课文插图", "口语交际", "课前准备", "朗读课文",
  "借助拼音", "读准字音", "晨检表",
  "午餐盘", "借阅架", "护眼操", "餐巾纸"
]), { minLen: 2, maxLen: 4 }).filter(isNaturalLanguageWord));

const GRADE12_TAGGED_LANGUAGE_WORDS = new Set(filterPinyinReadyWords(uniqueList([
  "识字表", "写字表", "生字表", "组词本", "默写本", "语文园地", "日记本", "周记本", "看图说话", "课外阅读",
  "读书角", "朗读本", "阅读本", "拼读本", "写字纸", "词语表", "句子本", "阅读单", "小练笔", "读后感",
  "查字表", "查词卡", "句子条", "词语条", "故事复述", "看图表达", "句子接龙", "词语接龙", "阅读题", "练习题",
  "语文园地", "日积月累", "故事时间", "读书时间", "故事书", "图画书", "图书角", "借书袋", "书架", "观察日记",
  "查字典", "部首查字", "音序查字", "分角色读", "音序表", "部首表", "阅读交流", "课堂展示",
  "讲评课", "观察日记", "阅读笔记", "写话练习", "词语练习", "短文练习", "听写练习", "默写练习", "组词练习",
  "识字卡片", "拼音卡片"
]), { minLen: 2, maxLen: 4 }).filter(isNaturalLanguageWord));

const EXPRESSION_BASE = filterPinyinReadyWords(
  [
    "你好", "早上好", "晚上好", "午安", "晚安", "再见", "谢谢", "不客气", "对不起",
    "请问", "请进", "请坐", "请慢走", "你好吗", "你真棒", "别着急", "慢慢来", "请等一下",
    "再试一次", "生日快乐", "节日快乐", "新年快乐", "我爱你", "我想你", "请安静", "请排队",
    "我们开始", "我们结束", "可以吗", "不可以", "我明白了", "我知道了"
  ],
  { minLen: 2, maxLen: 8 }
);

function isLikelyObjectWord(word) {
  const value = String(word || "").trim();
  if (!value || value.length < 2 || value.length > 4) return false;
  const endings = [
    "子", "车", "书", "包", "衣", "鞋", "帽", "花", "鱼", "鸟", "猫", "狗", "兔",
    "马", "牛", "羊", "鸡", "鸭", "果", "菜", "饭", "面", "水", "奶", "汁", "灯", "球"
  ];
  return endings.some((ending) => value.endsWith(ending));
}

const REQUEST_PREFIXES = filterPinyinReadyWords(["我想要", "我要", "请给我"], { minLen: 2, maxLen: 4 });
const LIKE_PREFIXES = filterPinyinReadyWords(["我喜欢", "我爱"], { minLen: 2, maxLen: 4 });

const ABILITY_PREFIXES = filterPinyinReadyWords(["我会", "我能"], { minLen: 2, maxLen: 2 });
const GROUP_PREFIXES = filterPinyinReadyWords(["我们一起", "我们来", "一起"], { minLen: 1, maxLen: 4 });
const GO_PREFIXES = filterPinyinReadyWords(["我想去", "我们去", "去"], { minLen: 1, maxLen: 4 });
const SCENE_PREFIXES = filterPinyinReadyWords(["在家", "在学校", "在操场", "在公园", "在教室", "在图书馆"], { minLen: 2, maxLen: 4 });
const POLITE_PREFIXES = filterPinyinReadyWords(["请", "请你", "请老师", "请妈妈"], { minLen: 1, maxLen: 4 });

const PLACE_WORDS = filterPinyinReadyWords(["家", "学校", "操场", "公园", "教室", "图书馆"], { minLen: 1, maxLen: 4 });

const ACTION_WORDS = filterPinyinReadyWords(
  [
    "学习", "上学", "上课", "下课", "放学", "读书", "写字", "画画", "唱歌", "跳舞", "跑步", "走路",
    "排队", "安静", "坐下", "站好", "举手", "开始", "结束", "休息",
    "洗手", "洗脸", "洗澡", "穿衣", "吃饭", "饮水", "整理", "收拾", "开门", "关门"
  ],
  { minLen: 2, maxLen: 4 }
);

const WANT_OBJECT_WORDS = filterPinyinReadyWords(
  [
    "水", "米饭", "面包", "水果", "苹果", "香蕉", "葡萄", "草莓", "西瓜", "鸡蛋", "牛奶", "果汁",
    "书包", "课本", "本子", "纸", "桌子", "椅子", "黑板",
    ...combine(EXTRA_SIZE_PREFIXES, EXTRA_ANIMALS),
    ...combine(EXTRA_COLORS, EXTRA_COLOR_OBJECTS),
    ...LANGUAGE_WORDS.filter(isLikelyObjectWord).slice(0, 260)
  ],
  { minLen: 1, maxLen: 4 }
);

const LIKE_OBJECT_WORDS = filterPinyinReadyWords(
  [
    ...WANT_OBJECT_WORDS,
    ...PLACE_WORDS,
    ...ACTION_WORDS,
    "太阳", "明月", "月光", "星星", "白云", "蓝天", "下雨", "下雪", "春天", "夏天", "秋天", "冬天"
  ],
  { minLen: 1, maxLen: 4 }
);

const POLITE_ACTIONS = filterPinyinReadyWords(
  ["开门", "关门", "坐下", "坐好", "站好", "排队", "安静", "等一下", "再试一次", "慢慢来"],
  { minLen: 2, maxLen: 4 }
);

const LANGUAGE_EXPRESSIONS = uniqueList([
  ...EXPRESSION_BASE,
  ...KINDER_EXPRESSIONS,
  ...combine(REQUEST_PREFIXES, WANT_OBJECT_WORDS),
  ...combine(LIKE_PREFIXES, LIKE_OBJECT_WORDS),
  ...combine(ABILITY_PREFIXES, ACTION_WORDS),
  ...combine(GROUP_PREFIXES, ACTION_WORDS),
  ...combine(GO_PREFIXES, PLACE_WORDS),
  ...combine(SCENE_PREFIXES, ACTION_WORDS),
  ...combine(POLITE_PREFIXES, POLITE_ACTIONS)
])
  .filter((text) => isBridgeExpression(text))
  .slice(0, 2000);

const POEM_EXTRA = [
  "山水", "江南", "小池", "梅花", "春晓", "秋思", "月夜", "风雨", "花香", "渔歌",
  "牧童", "静夜", "春风", "秋月", "夏雨", "冬雪", "松风", "竹影", "清泉", "归舟",
  "夜雨", "晨露", "晚霞", "乡愁", "渔火"
];

const POEM_TITLES = uniqueList([
  "咏鹅", "春晓", "静夜思", "悯农", "画", "江南", "池上", "小池", "所见", "村居",
  "梅花", "风", "画鸡", "蜂", "古朗月行", "寻隐者不遇", "登鹳雀楼", "赠汪伦",
  "夜宿山寺", "早发白帝城", "望庐山瀑布", "绝句", "山行", "清明", "相思", "鹿柴",
  "鸟鸣涧", "游子吟", "赋得古原草送别", "九月九日忆山东兄弟", "江雪", "夜雨寄北",
  ...POEM_EXTRA
]).slice(0, 80);

const BRIDGE_LANGUAGE_WORDS = LANGUAGE_WORDS
  .map((word, index) => {
    const tags = index < 40 ? ["控笔"] : (index < 80 ? ["描红"] : null);
    const gradeBand = GRADE1_TAGGED_LANGUAGE_WORDS.has(word)
      ? "学前-一年级"
      : (GRADE12_TAGGED_LANGUAGE_WORDS.has(word) ? "一年级-二年级" : "");
    return createLanguageEntry(word, "词语", { tags, gradeBand });
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

const BRIDGE_MATH_WORD_BLACKLIST = new Set([
  "统计",
  "换算",
  "估算",
  "对称",
  "组合",
  "验证",
  "项目任务",
  "活动计划",
  "时间安排",
  "路线图",
  "调查表",
  "观察表",
  "记录表",
  "任务卡"
]);

const BRIDGE_MATH_WORD_FRAGMENT_BLACKLIST = [
  "方法",
  "规则",
  "项目",
  "计划",
  "安排",
  "路线图",
  "调查表",
  "观察表",
  "记录表",
  "任务卡"
];

function isConcreteMathWord(word) {
  const normalized = String(word || "").trim();
  if (!normalized) return false;
  if (BRIDGE_MATH_WORD_BLACKLIST.has(normalized)) return false;
  return !BRIDGE_MATH_WORD_FRAGMENT_BLACKLIST.some((fragment) => normalized.includes(fragment));
}

function buildCuratedModuleItems(words, limit) {
  return uniqueModuleItems(
    uniqueList(words).map((word) => [word, [word]])
  )
    .filter(([word]) => isConcreteMathWord(word))
    .slice(0, limit);
}

function buildMappedModuleItems(baseWords, mappedSpecs, limit) {
  const items = [];
  baseWords.forEach((word) => items.push([word, [word]]));
  mappedSpecs.forEach(([prefix, suffixes]) => {
    normalizeArray(suffixes).forEach((suffix) => {
      const word = `${prefix}${suffix}`;
      items.push([word, [prefix, suffix]]);
    });
  });
  return uniqueModuleItems(items)
    .filter(([word]) => isConcreteMathWord(word))
    .slice(0, limit);
}

const NUM_BASE = [
  "数数", "数一数", "数一数有几", "几个", "多少", "一共", "合起来", "分一分", "分成", "平分",
  "等于", "大于", "小于", "相等", "多一些", "少一些", "同样多", "比较大小", "排序", "顺序",
  "个位", "十位", "凑十", "加法", "减法", "连加", "连减", "口算", "比大小", "按顺序排",
  "十以内", "二十以内", "一百以内", "两位数", "排第几", "第几个", "前一个", "后一个",
  "多1", "少1", "多2", "少2", "十个一", "一个十"
];
const NUM_MAPPED = [
  ["十以内", ["加减", "比较"]],
  ["二十以内", ["加减", "比较", "进位"]],
  ["一百以内", ["加减", "比较"]],
  ["两位数", ["比较", "排序"]],
  ["比", ["大小", "多少"]]
];

const LOGIC_WORDS = [
  "找规律", "看规律", "接着排", "接着画", "补一补", "排顺序", "圈一圈", "连一连",
  "分一分", "配一配", "摆一摆", "找相同", "找不同", "同一类", "不同类", "大中小",
  "长短", "高矮", "轻重", "前后", "左右", "里外", "上面", "下面", "中间",
  "看位置", "认方向", "先后顺序", "左右顺序", "前后位置", "按大小规律", "按颜色分",
  "按形状分", "按长短排", "按高矮排", "按轻重排", "颜色配对", "图形配对", "数量配对",
  "下一组", "缺的图形", "缺的数字", "缺的位置", "规律积木", "规律珠子", "规律图形"
];

const MEASURE_WORDS = [
  "长短", "高低", "轻重", "快慢", "早晚", "冷热", "比多少", "整点", "半点", "几点",
  "几分", "时针", "分针", "钟面", "看钟面", "认钟面", "看时间", "认时间", "现在几点",
  "早上", "上午", "中午", "下午", "晚上", "昨天", "今天", "明天", "看日历", "看星期",
  "看月份", "星期顺序", "月份顺序", "一元", "五角", "一角", "纸币", "硬币", "认钱币",
  "数钱", "换零钱", "找零钱", "比价钱", "看价签", "买东西", "买文具", "买水果", "付钱",
  "找回", "数一数", "分一分", "看条形图", "画条形图", "数玩具", "数水果", "数铅笔", "数图形", "数小动物"
];

const SHAPE_WORDS = [
  "图形", "形状", "圆形", "三角形", "正方形", "长方形", "直线", "曲线",
  "角", "边", "图形分类", "图形配对", "图形拼搭", "图形拼图", "拼图形", "摆图形", "找图形",
  "数图形", "分图形", "看位置", "认方向", "左右", "前后", "上面", "下面", "里面",
  "外面", "图形比较", "小房子", "小火箭", "七巧板"
];

const STORY_BASE = [
  "圈出最多的", "圈出最少的", "圈出一样多的", "分给几个小朋友", "分给几个同学", "分给几个伙伴",
  "分成两份", "分成三份", "分成四份", "分成五份",
  "苹果比梨多几个", "苹果比梨少几个", "糖果比饼干多几个", "糖果比饼干少几个",
  "铅笔比橡皮多几个", "铅笔比橡皮少几个", "积木比气球多几个", "积木比气球少几个",
  "图书比玩具多几个", "图书比玩具少几个", "小花比小树多几个", "小花比小树少几个"
];
const STORY_COUNT_ITEMS = [
  "几个苹果", "几颗糖果", "几支铅笔", "几块积木", "几个气球", "几本图书", "几朵小花",
  "几个玩具", "几块饼干", "几个梨", "几根香蕉", "几只小鸭", "几个皮球", "几个桃子"
];
const STORY_SHARE_ITEMS = [
  "几个苹果", "几颗糖果", "几支铅笔", "几块积木", "几个气球", "几本图书", "几块饼干", "几根香蕉"
];
const STORY_COMPARE_ITEMS = [
  "苹果和梨", "糖果和饼干", "铅笔和橡皮", "积木和气球", "图书和玩具", "小花和小树"
];
const STORY_MAPPED = [
  ["一共有", STORY_COUNT_ITEMS],
  ["还剩", STORY_COUNT_ITEMS],
  ["又来了", STORY_COUNT_ITEMS],
  ["拿走", STORY_COUNT_ITEMS],
  ["还差", STORY_COUNT_ITEMS],
  ["合起来", STORY_COUNT_ITEMS],
  ["每人分", STORY_SHARE_ITEMS],
  ["每份放", STORY_SHARE_ITEMS],
  ["比一比", STORY_COMPARE_ITEMS]
];

const PRACTICE_WORDS = [
  "量一量", "比一比", "数一数玩具", "数一数水果", "数一数积木", "数一数贴纸", "分一分水果", "分一分玩具",
  "分一分贴纸", "摆一摆积木", "摆一摆图形", "拼一拼图形", "拼七巧板", "看日历", "看星期", "看月份",
  "认时钟", "认钱币", "看价签", "买文具", "买水果", "付钱", "找零钱", "看钟面",
  "数气球", "数小花", "数铅笔", "分水果", "分糖果", "摆图形", "找规律", "看位置",
  "画条形图", "比长短", "比高矮", "按颜色分", "按形状分"
];

const MATH_MODULES = {
  "数与运算": buildMappedModuleItems(NUM_BASE, NUM_MAPPED, 180),
  "逻辑推理": buildCuratedModuleItems(LOGIC_WORDS, 180),
  "量与统计": buildCuratedModuleItems(MEASURE_WORDS, 180),
  "图形与空间": buildCuratedModuleItems(SHAPE_WORDS, 180),
  "应用题专项": buildMappedModuleItems(STORY_BASE, STORY_MAPPED, 180),
  "综合实践": buildCuratedModuleItems(PRACTICE_WORDS, 180)
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
  "ing", "ed", "er", "est"
];

const ENGLISH_BLEND_ONSETS = [
  "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr",
  "gr", "pr", "tr", "sk", "sp", "st", "sm", "sn", "sw", "tw", "spr", "str"
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

function isSoundExampleWord(word) {
  return ENGLISH_SOUND_PATTERNS.some((pattern) => word.includes(pattern))
    || ENGLISH_BLEND_ONSETS.some((onset) => word.startsWith(onset))
    || ENGLISH_RIMES.some((rime) => word.endsWith(rime));
}

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

const ENGLISH_SOUND_EXAMPLE_WORDS = uniqueList(
  ENGLISH_WORD_POOL
    .filter((word) => /^[a-z]{2,8}$/.test(word))
    .filter((word) => word.length >= 2)
    .filter(isSoundExampleWord)
);

const ENGLISH_SOUND_ITEMS = uniqueList([
  ...ENGLISH_SOUND_PATTERNS,
  ...ENGLISH_BLEND_ONSETS,
  ...ENGLISH_RIMES,
  ...ENGLISH_SOUND_EXAMPLE_WORDS
]).slice(0, 320);

const ENGLISH_WORDS = uniqueList(ENGLISH_WORD_POOL).slice(0, 320);

const BRIDGE_ENGLISH_PACK = [
  ...ENGLISH_LETTER_MODULE.map((letter) => createEnglishEntry(letter, "字母")),
  ...ENGLISH_PHONICS_WORDS.map((word) => createEnglishEntry(word, "自然拼读", { phonics: toPhonics(word) })),
  ...ENGLISH_SOUND_ITEMS.map((sound) => createEnglishEntry(sound, "发音", { phonics: sound })),
  ...ENGLISH_WORDS.map((word) => createEnglishEntry(word, "单词"))
];

const BRIDGE_VOCAB_LANGUAGE = [...BRIDGE_LANGUAGE_PACK];
const BRIDGE_VOCAB_MATH = [...BRIDGE_MATH_PACK];
const BRIDGE_VOCAB_ENGLISH = [...BRIDGE_ENGLISH_PACK];

const BRIDGE_VOCAB_FULL = [
  ...BRIDGE_VOCAB_LANGUAGE,
  ...BRIDGE_VOCAB_MATH,
  ...BRIDGE_VOCAB_ENGLISH
];
