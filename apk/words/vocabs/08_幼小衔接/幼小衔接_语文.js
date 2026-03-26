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
    ["典", "diǎn"],
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
    ["铃", "líng"],
    ["琴", "qín"],
    ["笛", "dí"],
    ["盆", "pén"],
    ["镜", "jìng"],
    ["堆", "duī"],
    ["洼", "wā"],
    ["扇", "shàn"],
    ["笼", "lóng"],
    ["剪", "jiǎn"],
    ["夹", "jiā"],
    ["刷", "shuā"],
    ["柜", "guì"],
    ["棚", "péng"],
    ["勺", "sháo"],
    ["摘", "zhāi"],
    ["抄", "chāo"],
    ["栏", "lán"],
    ["瓶", "píng"],
    ["盒", "hé"],
    ["书", "shū"],
    ["写", "xiě"],
    ["示", "shì"],
    ["发", "fā"],
    ["现", "xiàn"],
    ["课", "kè"],
    ["文", "wén"],
    ["插", "chā"],
    ["交", "jiāo"],
    ["题", "tí"],
    ["晨", "chén"],
    ["午", "wǔ"],
    ["纸", "zhǐ"],
    ["借", "jiè"],
    ["眼", "yǎn"],
    ["护", "hù"],
    ["巾", "jīn"],
    ["岗", "gǎng"],
    ["检", "jiǎn"],
    ["盘", "pán"],
    ["姿", "zī"],
    ["势", "shì"],
    ["握", "wò"],
    ["架", "jià"],
    ["册", "cè"],
    ["评", "píng"],
    ["际", "jì"],
    ["闯", "chuǎng"],
    ["餐", "cān"],
    ["栽", "zāi"],
    ["漂", "piāo"],
    ["审", "shěn"],
    ["圈", "quān"],
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
    ["认", "rèn"],
    ["真", "zhēn"],
    ["听", "tīng"],
    ["讲", "jiǎng"],
    ["齐", "qí"],
    ["遍", "biàn"],
    ["举", "jǔ"],
    ["答", "dá"],
    ["达", "dá"],
    ["补", "bǔ"],
    ["充", "chōng"],
    ["完", "wán"],
    ["法", "fǎ"],
    ["把", "bǎ"],
    ["指", "zhǐ"],
    ["师", "shī"],
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
    return map;
  })();

  const HANZI_RE = /[\u4e00-\u9fff]/;

  const PHRASE_PINYIN_OVERRIDES = new Map([
    ["睡觉", "shuì jiào"],
    ["午觉", "wǔ jiào"],
    ["音乐", "yīn yuè"]
  ]);

  const SHARED_TO_PINYIN = (typeof window !== "undefined" && typeof window.BRIDGE_TO_PINYIN === "function")
    ? window.BRIDGE_TO_PINYIN
    : null;

  function localToPinyin(text) {
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

  function toPinyin(text) {
    if (!SHARED_TO_PINYIN) return localToPinyin(text);
    const shared = String(SHARED_TO_PINYIN(text) || "").trim();
    return shared || localToPinyin(text);
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

  function isAllHanzi(text) {
    const chars = [...String(text || "").trim()];
    return chars.length > 0 && chars.every((char) => HANZI_RE.test(char));
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

  function buildLanguageEntries(words, moduleName, options = {}) {
    return uniqueList(words)
      .map((word) => createLanguageEntry(word, moduleName, options))
      .filter(Boolean);
  }

  function collectChineseWords(entries) {
    const words = [];
    entries.forEach((entry) => {
      const chinese = String(entry?.chinese || entry?.translation || "").trim();
      if (!isBridgeReadyText(chinese, { minLen: 2, maxLen: 4 })) return;
      words.push(chinese);
    });
    return words;
  }

  function collectLanguageTextSet(entries) {
    const out = new Set();
    normalizeArray(entries).forEach((entry) => {
      const text = String(entry?.chinese || entry?.word || "").trim();
      if (text) out.add(text);
    });
    return out;
  }

  function filterNovelLanguageWords(words, existingTexts, { minLen = 2, maxLen = 5 } = {}) {
    return uniqueList(words)
      .map((word) => String(word || "").trim())
      .filter((word) => isBridgeReadyText(word, { minLen, maxLen }))
      .filter((word) => !existingTexts.has(word));
  }

  const EXTENSION_EXCLUDED_WORDS = new Set([
    "合作力", "观察力", "记忆力", "想象力", "专注力", "表达力", "判断力", "行动力",
    "爱护心", "责任心", "自信心", "好奇心", "同理心", "专心力", "执行力", "合作感",
    "时间感", "空间感", "节奏感",
    "观察", "比较", "分类", "整理", "记录", "统计", "排序", "组合", "对称", "规律",
    "发现", "认识", "了解", "表达", "交流", "讨论", "倾听", "复述", "思考", "想象",
    "创造", "探索", "尝试", "准备", "完成", "检查", "改正", "坚持", "专心", "细心",
    "独立", "自理", "负责", "礼让", "尊重", "珍惜", "节约", "环保", "守时", "守信",
    "守纪", "诚实", "友善", "体贴", "互助", "关心", "照顾", "提醒", "计划", "安排",
    "轮流", "等待", "守护", "服务", "感谢", "祝贺", "鼓励", "安慰",
    "整句", "整段", "分段", "分句", "段意", "题意", "图意", "文意"
  ]);

  const INSTITUTIONAL_EXTENSION_WORDS = new Set([
    "语文作业本", "班级课程表", "教室图书角", "阅读记录卡", "校园公告栏", "彩色铅笔盒", "课间值日表", "拼音练习册", "写字练习纸",
    "书写提示", "我的发现", "课文插图", "口语交际", "写字姿势", "握笔姿势", "识字加油站", "字词句运用",
    "课后题", "阅读题", "练习题", "晨读任务", "朗读评价", "读书记录", "识字墙", "词语墙", "拼音游戏", "识字游戏",
    "课前准备", "借助拼音", "读准字音", "课堂任务卡", "朗读任务卡",
    "晨检表", "午餐盘", "护眼操", "借阅架", "成长册", "值日岗", "值日牌", "书包柜", "水壶架", "午休铃", "晨读铃", "坐姿歌", "写字歌", "护眼提示", "阅读架",
    "讲评课", "观察册", "写话单", "阅读单元", "阅读题卡", "讲评卡", "分享栏", "写话栏", "阅读栏", "整理单", "记录册",
    "观察记录", "学习记录", "识字卡片", "拼音卡片", "晨读卡", "拼读本", "组词本", "写话本子", "阅读任务", "展示台", "日积月累",
    "查字典", "部首查字", "音序查字", "分角色读", "我爱阅读", "快乐读书", "读书单", "预习单", "学习单", "读书分享会", "整本书阅读", "课堂展示台", "阅读交流卡", "快乐读书吧",
    "记录表", "提示卡", "午睡室", "题卡", "词卡", "图示卡", "读书卡", "读书台", "告示栏", "摘抄栏",
    "查词卡", "保健室", "值班室", "公交卡", "朗读卡", "拼读卡", "词句卡", "图表", "词语条", "读书条", "朗读条", "拼读条",
    "服务台", "售票处", "候车亭", "管理员", "保育员", "清洁工", "服务员", "座位表", "轮流表", "分组表", "值日册", "队列表", "点名册",
    "任务卡", "记录卡", "评价表", "打卡表", "通知单", "请假条", "阅读表", "阅读台", "句式表", "朗读单", "练习单", "实验单",
    "句式卡", "好词卡", "好句卡", "摘抄卡", "留言卡", "展示栏", "作品栏", "图书漂流", "读书分享会", "课堂展示台"
  ]);

  const INSTITUTIONAL_EXTENSION_FRAGMENTS = [
    "课程表", "作息表", "值日表", "记录卡", "任务卡", "任务单", "评价表", "打卡表", "公告栏", "通知单", "请假条",
    "借阅", "讲评", "阅读交流", "读书分享", "整本书", "读书吧", "轮流表", "分组表", "早读表", "值日册", "句式表", "阅读表", "阅读台",
    "图书漂流", "留言板", "黑板报", "服务台", "售票处", "候车亭", "评比栏", "点名册", "座位表", "校门队", "队列表",
    "记录表", "提示卡", "午睡室", "题卡", "词卡", "图示卡", "读书卡", "读书台", "告示栏", "摘抄栏",
    "查词卡", "保健室", "值班室", "记录册", "分享栏", "写话栏", "阅读栏", "流程图", "路线图",
    "图表", "词语条", "读书条", "朗读条", "拼读条",
    "展示台", "评分"
  ];

  const BLOCKED_LANGUAGE_WORDS = new Set([
    "代表", "交流", "探索", "整理", "分享", "单纯", "单位", "快捷栏",
    "课代表", "晨检表", "部首表", "音序表", "值日表", "值日组", "阅读单",
    "生字表", "识字表", "词语表", "一张卡片", "两张卡片", "记录表", "记录卡",
    "任务卡", "评价表", "打卡表", "讲评卡", "讲评课", "点名册", "阅读表",
    "课堂笔记", "阅读笔记", "读书笔记", "练习题", "默写练习", "短文练习",
    "组词练习", "词语练习", "写话练习", "拼音练习", "写字练习", "听写练习",
    "句子练习", "朗读课文", "审题", "圈词", "抄词", "摘句", "写段",
    "听写本", "默写本", "阅读课"
  ]);

  const BLOCKED_LANGUAGE_FRAGMENTS = [
    "晨检", "值日表", "值日册", "值日卡", "阅读单", "记录卡", "记录表", "任务卡", "评价表", "打卡表",
    "讲评", "分享会", "部首表", "音序表", "图书漂流", "点名册", "告示栏", "展示台"
  ];

  const BLOCKED_LANGUAGE_EXPRESSIONS = new Set([
    "我来分享", "我来记录", "我来做分享", "请完整表达",
    "请帮我整理书包", "请给我整理书包", "我爱整理", "我爱整理书包",
    "我会整理", "我会整理书包", "我能整理书包", "我喜欢整理", "我喜欢整理书包",
    "我想要整理书包", "我要整理书包", "请给我课外书", "我爱课外书",
    "我喜欢课外书", "我想要课外书", "我要课外书", "分享玩具",
    "请你跟读", "先想再回答", "请说完整句", "请补充一句", "说说你发现",
    "请说说想法", "先读再回答", "请听我补充", "请把话说完"
  ]);

  function isBlockedLanguageExpression(word) {
    const normalized = String(word || "").trim();
    if (!normalized) return true;
    if (BLOCKED_LANGUAGE_EXPRESSIONS.has(normalized)) return true;
    return /(上课|下课|课本|听写|默写)/.test(normalized);
  }

  function isBlockedLanguageWord(word) {
    const normalized = String(word || "").trim();
    if (!normalized) return true;
    if (BLOCKED_LANGUAGE_WORDS.has(normalized)) return true;
    return BLOCKED_LANGUAGE_FRAGMENTS.some((fragment) => normalized.includes(fragment));
  }

  function isConcreteExtensionWord(word) {
    const normalized = String(word || "").trim();
    if (!normalized) return false;
    if (EXTENSION_EXCLUDED_WORDS.has(normalized)) return false;
    if (INSTITUTIONAL_EXTENSION_WORDS.has(normalized)) return false;
    if (INSTITUTIONAL_EXTENSION_FRAGMENTS.some((fragment) => normalized.includes(fragment))) return false;
    if (isBlockedLanguageWord(normalized)) return false;
    return !/(力|感)$/.test(normalized);
  }

  function shouldKeepLanguageEntry(item) {
    const moduleName = String(item?.module || "").trim();
    const word = String(item?.word || item?.chinese || "").trim();
    if (!word) return false;
    if (moduleName === "识字" || moduleName === "拼音" || [...word].length <= 1) return true;
    if (moduleName === "表达") return !isBlockedLanguageExpression(word);
    return !isBlockedLanguageWord(word);
  }

  function getEntryIdentityKey(item) {
    const subject = String(item?.subject || "").trim();
    const moduleName = String(item?.module || "").trim();
    const mode = String(item?.mode || "").trim().toLowerCase();
    const isPinyin = mode === "pinyin" || moduleName === "拼音";
    const word = isPinyin
      ? String(item?.chinese || item?.character || item?.word || "").trim()
      : String(item?.word || item?.chinese || "").trim();
    return `${subject}::${moduleName}::${word}`;
  }

  function uniqueByEntry(items) {
    const seen = new Set();
    const out = [];
    items.forEach((item) => {
      const key = getEntryIdentityKey(item);
      if (!key || key.endsWith("::")) return;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(item);
    });
    return out;
  }

  const EXISTING_LANGUAGE_TARGET = (typeof BRIDGE_VOCAB_LANGUAGE !== "undefined" && Array.isArray(BRIDGE_VOCAB_LANGUAGE))
    ? BRIDGE_VOCAB_LANGUAGE
    : [];
  const EXISTING_LANGUAGE_TEXTS = collectLanguageTextSet(EXISTING_LANGUAGE_TARGET);

  const EXTENSION_CANDIDATE_WORDS = [
    "祝福", "清晨", "规则", "交通", "图书", "美术", "笔记本", "练习册", "课程表", "作息表",
    "值日表", "故事书", "图画书", "资料袋", "文件夹", "订书机", "削笔刀", "圆珠笔", "记号笔", "双面胶",
    "透明胶", "便利贴", "图书角", "书架", "阅览室", "广播站", "医务室", "休息区", "书包柜", "水壶架",
    "储物柜", "饮水机", "洗手液", "消毒水", "体温计", "急救箱", "创可贴", "放大镜", "望远镜", "计算器",
    "机器人", "玩具熊", "玩具车", "滑滑梯", "跷跷板", "游乐场", "停车场", "公交车", "自行车", "电动车",
    "出租车", "红绿灯", "斑马线", "人行道", "十字路", "路牌", "门把手", "安全带", "安全帽", "消防员",
    "值日生", "领奖台", "升旗台", "医务室", "小书架", "借书袋", "图书袋", "书包柜", "门铃", "书架",
    "花瓣", "花蕾", "花盆", "叶片", "树枝", "树干", "树根", "草丛", "果实", "果园",
    "菜园", "竹林", "松林", "荷叶", "荷塘", "溪流", "河岸", "湖边", "海边", "山坡",
    "山谷", "平原", "田野", "泥地", "石块", "沙粒", "沙丘", "海浪", "浪花", "贝壳",
    "露珠", "晨雾", "朝霞", "晚霞", "月牙", "满月", "星光", "雷声", "闪电", "微风",
    "凉风", "春雨", "夏雨", "秋风", "冬雪", "晴天", "阴天", "多云", "阵雨", "雷雨",
    "温度", "气温", "季节", "日历", "星期", "整点", "半点", "时针", "分针", "秒针",
    "观察", "比较", "分类", "整理", "记录", "统计", "排序", "组合", "对称", "规律",
    "发现", "认识", "了解", "表达", "交流", "讨论", "倾听", "复述", "思考", "想象",
    "创造", "探索", "尝试", "准备", "完成", "检查", "改正", "坚持", "专心", "细心",
    "独立", "自理", "负责", "礼让", "尊重", "珍惜", "节约", "环保", "守时", "守信",
    "守纪", "诚实", "友善", "体贴", "互助", "关心", "照顾", "提醒", "计划", "安排",
    "轮流", "等待", "守护", "服务", "感谢", "祝贺", "鼓励", "安慰", "合作力", "观察力",
    "记忆力", "想象力", "专注力", "表达力", "判断力", "行动力", "节奏", "旋律", "乐曲", "音符",
    "合唱", "独唱", "琴声", "鼓点", "画册", "画架", "剪贴", "折叠", "拼贴", "泥塑",
    "彩泥", "涂色", "描红", "控笔", "勾线", "着色", "手工", "拍球", "运球", "传球",
    "接球", "投球", "跳远", "立定", "平衡", "弯腰", "伸展", "热身", "踏步", "队列",
    "口令", "集合", "解散", "晨练", "早操", "体操", "舞步", "乐器", "冰箱", "电视机",
    "洗衣机", "吹风机", "电风扇", "保温杯", "卫生纸", "纸飞机", "纸盒子", "铅笔刀", "小镜子", "梳子",
    "毛刷", "拖把", "扫把", "抹布", "围裙", "雨靴", "牙杯", "肥皂盒", "洗衣液", "药水",
    "药箱", "绷带", "口哨", "手电筒", "遥控器", "充电器", "门铃", "窗帘", "地板", "天花板",
    "楼梯口", "扶手", "台阶", "小水滴", "回收箱", "垃圾袋", "可回收", "不可回收", "节能灯", "球体",
    "立方体", "圆柱体", "边角", "顶点", "曲线", "折线", "图表", "表格", "刻度", "数量",
    "总数", "顺序", "位置", "方向", "左右手", "前后排", "里外边", "上中下", "远和近", "轻和重",
    "大小号", "长和短", "高和矮", "快和慢", "粗和细", "宽和窄", "厚和薄", "软和硬", "深和浅", "动和静",
    "冷和热", "香和臭", "甜和酸", "清和浑", "明和暗", "开和关", "推和拉", "拿和放", "抬和搬", "抱一抱",
    "拍一拍", "看一看", "说一说", "试一试", "想一想", "画一画", "跳一跳", "比一比", "数一数", "读一读",
    "阅读角", "图书角", "读书角", "作品栏", "整理箱", "玩具箱", "任务卡", "记录表", "提示卡", "小课桌",
    "小书桌", "小黑板", "水彩笔", "手工纸", "音乐课", "体育课", "科学课", "活动区", "午睡室", "游戏区",
    "洗手池", "饮水处", "小药箱", "护眼灯", "日光灯", "纸风车", "气球车", "手影戏", "影子画", "石头路",
    "花草地", "小树苗", "小花坛", "果树园", "菜地里", "花园里", "小雨点", "小雪人", "大太阳", "月光下",
    "星星灯", "云朵画", "观察表", "计划表", "评分表", "爱阅读", "爱思考", "爱劳动", "爱清洁", "爱分享",
    "会观察", "会记录", "会整理", "会表达", "会合作", "会等待", "懂礼让", "懂规则", "懂安全", "讲文明",
    "讲卫生", "讲安全", "有耐心", "有爱心", "有勇气", "有责任", "守次序", "拍皮球", "踢足球", "打篮球",
    "丢沙包", "跳皮筋", "做游戏", "讲故事", "听故事", "看图书", "做手工", "种植物", "洗水果", "晒太阳",
    "看月亮", "数星星", "认方向", "学合作", "学整理", "学观察", "学记录", "学表达", "学分享", "学礼貌",
    "量身高", "量体温", "认时钟", "看日历", "做比较", "找不同", "找相同", "看路线", "认路牌", "学过马路",
    "借书卡", "书签", "题卡", "词卡", "字卡", "诗歌本", "日记本", "读物袋", "文件袋", "收纳盒",
    "收纳箱", "书立", "标签纸", "姓名牌", "班级牌", "提示牌", "告示牌", "留言板", "黑板报", "白板笔",
    "展示板", "讲台", "讲桌", "点名册", "通知单", "请假条", "打卡表", "评价表", "值日册", "借阅卡",
    "蜡笔", "油画棒", "颜料", "调色盘", "调色板", "画板", "画框", "剪纸画", "折纸船", "纸花朵",
    "手工包", "工具盒", "拼图板", "黏土", "印章", "印泥", "贴画", "贴纸书", "美工刀", "小剪夹",
    "篮球架", "足球门", "呼啦圈", "接力棒", "平衡木", "独木桥", "沙包", "跳绳圈", "号码牌", "裁判哨",
    "起跑线", "终点线", "队伍牌", "集合点", "热身操", "体能课", "球拍", "羽毛球", "乒乓球", "门球",
    "放大图", "观察瓶", "实验盒", "种子袋", "发芽盒", "叶脉画", "松果", "枫叶", "柳叶", "稻田",
    "麦田", "花海", "草地", "小溪边", "河面", "河水", "河堤", "石桥", "木桥", "果皮",
    "果核", "花苞", "花枝", "花香", "浪潮", "云海", "晨光", "暮色", "雾气", "雨点",
    "雪花片", "冰块", "冰花", "风铃", "日影", "树影", "影子", "影子戏", "月相", "星座图",
    "方向盘", "站牌", "停车位", "警示牌", "指示牌", "安全线", "安全门", "消防车", "救护车", "警报器",
    "减速带", "小路口", "楼道口", "扶梯", "扶栏", "台灯光", "地垫", "门垫", "小挂钩", "晾衣架",
    "衣架", "晒衣夹", "整理篮", "纸巾盒", "水龙头", "洗脸盆", "小水盆", "浴巾", "毛线球", "针线盒",
    "小药瓶", "退热贴", "药勺", "量杯", "沙漏", "秒表", "时刻表", "温差", "刻度尺", "刻度线",
    "计数器", "分类盒", "分组卡", "顺序卡", "位置图", "路线图", "流程图", "地图册", "图示卡", "图标",
    "爱护心", "责任心", "自信心", "好奇心", "同理心", "专心力", "执行力", "合作感", "时间感", "空间感",
    "节拍", "鼓声", "铃声", "合奏", "独奏", "节奏感", "音量", "高音", "低音", "儿歌本",
    "体育角", "美工区", "积木区", "表演区", "建构区", "阅读区", "科学角", "自然角", "植物角", "值日角"
  ];

  const LOW_GRADE_LITERACY_WORDS = [
    "田字格", "拼音本", "生字本", "写字本", "练字本", "练字纸", "听写本", "默写本", "读书卡", "借书证",
    "生字卡", "词语卡", "句子卡", "方格本", "拼音课", "识字课", "写字课", "朗读课", "课文", "课题",
    "课间", "课间操", "早读", "午读", "自读", "领读", "齐读", "跟读", "听写", "默写",
    "看拼音", "读拼音", "写拼音", "认拼音", "认生字", "写生字", "写句子", "读句子", "看图", "看图写话",
    "写话", "插图", "标题", "目录", "封面", "页码", "自然段", "段落", "句号", "逗号",
    "问号", "冒号", "引号", "声母", "韵母", "音节", "整体认读", "笔顺", "笔画", "部首",
    "偏旁", "造句", "短文", "日记", "周记", "留言条", "通知单", "请假条", "学习单", "观察单"
  ];

  const LOW_GRADE_CLASSROOM_WORDS = [
    "同桌", "前排", "后排", "小队", "队长", "值日", "小组", "分组", "组长", "班级",
    "班牌", "校牌", "校门口", "走廊", "楼道", "操场", "跑道", "看台", "旗台", "升旗",
    "队礼", "队歌", "广播操", "课后", "下课", "上课", "放学", "班会", "黑板擦", "白板擦",
    "粉笔盒", "图书柜", "展示角", "书角", "作业本", "语文书", "数学书", "音乐书", "美术书", "科学书",
    "活动课", "阅读课", "写字台", "讲台桌", "值日卡", "课桌椅", "收作业", "发本子", "交作业", "整理柜"
  ];

  const LOW_GRADE_DAILY_WORDS = [
    "早餐", "午饭", "晚饭", "点心", "热水", "水杯", "饭盒", "毛巾架", "牙刷杯", "洗脸",
    "洗脚", "洗头", "漱口", "梳头", "叠被子", "铺床", "睡醒", "午睡", "早睡", "早起",
    "背书包", "穿校服", "系鞋带", "拉拉链", "扣扣子", "扫地", "拖地", "擦桌子", "擦黑板", "收衣服",
    "晾衣服", "喝热水", "吃早餐", "吃午饭", "吃晚饭", "排排坐", "慢慢走", "轻轻放", "小闹钟", "保温饭盒",
    "收纳袋", "卫生角", "洗手歌", "值日布", "床单", "被子", "枕头", "小脸盆"
  ];

  const LOW_GRADE_READING_WORDS = [
    "儿歌本", "童话书", "寓言书", "谜语书", "故事会", "读书会", "书法", "练字帖", "作文纸", "日记本",
    "周记本", "阅读卡", "借阅证", "目录页", "封底", "页码", "插图页", "图画文", "看图书", "读后想",
    "古诗文", "童诗", "诗配画", "讲故事", "听故事", "故事卡", "词语本", "句子本", "拼读卡", "朗读卡",
    "阅读单", "识字表", "词语表", "生字表", "写话本", "观察本", "记录本", "复述卡", "思维图", "看图卡",
    "拼音卡", "田字本", "词语条", "句子条", "阅读角"
  ];

  const LOW_GRADE_NATURE_WORDS = [
    "蝴蝶", "蜻蜓", "蚂蚁", "青蛙", "白鹅", "乌龟", "狐狸", "小鹿", "树苗", "发芽",
    "嫩芽", "柳树", "桃花", "梨花", "花苞", "花蕊", "叶脉", "果肉", "果核", "池塘",
    "河边", "海洋", "桥边", "小桥", "石桥", "木船", "船头", "船尾", "沙滩", "海风",
    "暖风", "晴空", "雪人", "晨光", "晚风", "日出", "日落", "星空", "月牙", "白云",
    "绿草", "草地", "稻苗", "麦苗", "菜苗", "花开", "花落", "小溪", "溪水", "河水",
    "山路", "山坡", "海边石", "树叶", "松果", "鹅卵石", "风向", "雨衣", "雨鞋", "雨伞"
  ];

  const LOW_GRADE_COMMUNITY_WORDS = [
    "普通话", "礼貌语", "红领巾", "少先队", "队旗下", "让座", "问路", "看站牌", "站牌", "校车",
    "天桥", "路灯", "路口", "过马路", "警察叔叔", "消防员", "救护车", "医务角", "图书馆", "博物馆",
    "文化馆", "少年宫", "活动站", "公交卡", "门铃声", "电梯口", "楼梯间", "提醒牌", "提示牌", "节日卡",
    "春游", "秋游", "参观", "集合点", "解散点"
  ];

  const PRIORITY_EXTENSION_WORDS = [
    "口琴", "短笛", "花盆", "镜子", "土堆", "水洼", "风扇", "鸟笼", "剪纸", "发夹",
    "书柜", "小勺", "雨棚", "门铃", "铃声", "琴声", "笛子", "眼镜",
    "图画故事书", "故事书", "拼音卡", "生字卡", "词语卡", "图画卡", "阅读角"
  ];

  const SECOND_GRADE_ACTIVITY_WORDS = [
    "观察日记", "阅读笔记", "写话练习", "词语练习", "短文练习", "拼音练习", "写字练习", "听写练习", "默写练习", "组词练习",
    "朗读比赛", "故事表演", "诗歌朗诵", "看图说话", "阅读分享", "词语接龙", "成语故事", "查字表", "识字卡片", "拼音卡片",
    "晨读卡", "拼读本", "组词本", "句子练习", "课外书", "故事本", "读书笔记", "写话本子", "观察记录", "学习记录",
    "小书架", "小笔筒", "小白板", "小粉笔", "小队旗", "小红花", "小卡片", "小纸条", "小饭盒", "小水壶",
    "小毛巾", "小牙刷", "小脸盆", "小雨衣", "小雨靴", "小床单", "小被子", "小枕头", "小书柜", "小画架",
    "小展板", "小讲台", "小跑道", "小看台", "小池塘", "小草地", "小花盆", "小柳树", "小桃花", "小梨花",
    "小木船", "小纸船", "小海风", "小暖风", "小晨光", "小晚风", "礼貌歌", "安全歌", "队歌本", "队旗角",
    "字词句", "故事时间", "读书时间", "分享卡", "安静牌", "排队牌", "阅读本", "朗读本", "看图本", "拼音纸",
    "白兔", "兔子", "桌子", "桌椅", "水壶", "茶壶", "雨伞", "帽子", "袜子", "裙子",
    "打雷", "雷雨天", "拍手歌", "拉拉手", "班级牌", "年级卡", "小书桌", "小椅子", "小水杯", "小帽子",
    "小袜子", "小雨伞", "小茶壶", "小白兔"
  ];

  const SECOND_GRADE_SCENE_WORDS = [
    "门铃", "铃声", "口琴", "琴声", "笛子", "短笛", "花盆", "水盆", "镜子", "眼镜",
    "土堆", "石堆", "水洼", "小水洼", "扇子", "风扇", "笼子", "鸟笼", "剪纸", "剪刀",
    "发夹", "夹子", "牙刷", "书柜", "柜子", "勺子", "小勺", "车棚", "雨棚", "盆栽",
    "种植角", "观察瓶", "观察盒", "昆虫盒", "采集盒", "借书袋", "识字条", "拼音条", "写话卡", "说话卡",
    "生字条", "词语表", "课桌角", "图书袋"
  ];

  const SECOND_GRADE_READING_WORDS = [
    "题目", "读题", "圈词", "找词", "抄词", "摘词", "摘句", "短句", "长句", "连句",
    "写段", "句子条", "段落卡", "自然段", "写话纸", "读书条", "朗读条", "朗读卡", "复述条", "复述卡",
    "识字表", "识字本", "生字条", "词语条", "阅读角", "写字板", "展示栏", "作品栏", "好词本", "好句本",
    "查字表", "拼读条"
  ];

  const FIRST_GRADE_SUPPORT_WORDS = [
    "书写提示", "我的发现", "课文插图", "口语交际", "写字姿势", "握笔姿势",
    "识字加油站", "字词句运用", "课后题", "阅读题", "练习题", "晨读任务",
    "朗读评价", "读书记录", "识字墙", "词语墙", "拼音游戏", "识字游戏",
    "语文作业本", "图画故事书", "彩色铅笔盒", "拼音练习册",
    "课前准备", "朗读课文", "借助拼音", "读准字音"
  ];

  const CAMPUS_SERVICE_WORDS = [
    "午餐盘", "餐巾纸", "洗手台", "护眼操", "借阅架",
    "坐姿歌", "写字歌", "阅读架", "图书袋", "借书袋", "小水杯", "小帽子",
    "小袜子", "小雨伞", "小书桌", "小椅子", "小水壶", "小饭盒",
    "小毛巾", "小牙刷"
  ];

  const SECOND_GRADE_PROGRESS_WORDS = [
    "故事复述", "看图表达", "句子接龙", "词语接龙", "识字闯关", "拼音闯关",
    "阅读闯关", "观察日记", "阅读笔记", "写话练习", "词语练习", "短文练习", "拼音练习",
    "写字练习", "听写练习", "默写练习", "组词练习", "朗读比赛", "故事表演",
    "诗歌朗诵", "看图说话", "阅读分享", "成语故事", "句子练习", "读书笔记",
    "观察小记", "阅读小记", "识字卡片", "拼音卡片", "晨读卡", "拼读本",
    "组词本", "写话本子", "字词句", "故事时间", "读书时间", "阅读本",
    "朗读本", "看图本", "拼音纸", "写话卡", "说话卡",
    "语文园地", "日积月累", "查字典", "部首查字", "音序查字", "分角色读",
    "图书角", "故事书", "图画书", "借书袋", "书架", "阅读角"
  ];

  const EXTENSION_CANDIDATE_POOL = uniqueList([
    ...PRIORITY_EXTENSION_WORDS,
    ...EXTENSION_CANDIDATE_WORDS,
    ...LOW_GRADE_LITERACY_WORDS,
    ...LOW_GRADE_CLASSROOM_WORDS,
    ...LOW_GRADE_DAILY_WORDS,
    ...LOW_GRADE_READING_WORDS,
    ...LOW_GRADE_NATURE_WORDS,
    ...LOW_GRADE_COMMUNITY_WORDS,
    ...SECOND_GRADE_ACTIVITY_WORDS,
    ...SECOND_GRADE_SCENE_WORDS,
    ...SECOND_GRADE_READING_WORDS
  ]);

  const LANGUAGE_EXTRA_WORDS = uniqueList([
    "门铃", "花盆", "镜子", "水洼", "风扇", "书柜", "剪纸", "发夹", "眼镜", "短笛",
    "口琴", "图书角", "读书角", "图书", "练习册", "讲台", "讲桌", "扫把", "围裙", "纸巾盒",
    "盆栽", "桌椅", "图书馆", "课间操", "午睡", "扫地", "课文", "插图", "标题", "班级"
  ]).filter((word) => isConcreteExtensionWord(word));

  const GRADE1_CURATED_EXTENSION_WORDS = uniqueList([
    "语文书", "门铃", "花盆", "镜子", "水洼", "风扇", "书柜", "剪纸", "发夹", "眼镜",
    "图书角", "读书角", "图书", "练习册", "讲台", "讲桌", "扫把", "围裙", "纸巾盒", "盆栽",
    "桌椅", "课间操", "午睡", "扫地", "前排", "后排", "班级", "课文", "插图", "标题"
  ]).filter((word) => isConcreteExtensionWord(word));

  const GRADE12_CURATED_EXTENSION_WORDS = uniqueList([
    "拼音本", "生字本", "写字本", "听写本", "默写本", "组词本", "自然段", "段落", "看拼音", "读拼音",
    "写句子", "看图写话", "读题", "审题", "圈词", "抄词", "摘句", "短句", "写段", "课外书",
    "课后题", "阅读课", "朗读课文", "课文插图", "词语表", "生字卡", "词语卡", "句子卡", "拼音卡",
    "图画本",
    "读书笔记"
  ]).filter((word) => isConcreteExtensionWord(word));

  const EXTRA_OBJECTS = uniqueList([
    "水", "牛奶", "果汁", "面包", "米饭", "苹果", "香蕉", "葡萄", "草莓", "西瓜", "鸡蛋",
    "书包", "铅笔", "橡皮", "尺子", "彩笔", "画笔", "纸", "玩具", "积木", "球"
  ]);

  const EXTRA_SKILL_ACTIONS = uniqueList([
    "唱歌", "跳舞", "画画", "写字", "数数", "跑步", "读书", "写拼音", "认汉字",
    "整理书包", "收拾玩具", "洗手", "刷牙", "穿衣"
  ]);

  const EXTRA_GROUP_ACTIONS = uniqueList([
    "玩耍", "学习", "读书", "写字", "画画", "唱歌", "跳舞", "跑步", "吃饭", "喝水"
  ]);

  const EXTRA_HELP_ACTIONS = uniqueList([
    "开门", "关门", "系鞋带", "拿书包", "找老师", "找妈妈", "找爸爸", "收拾玩具"
  ]);

  const GRADE1_CLASSROOM_EXPRESSIONS = uniqueList([
    "我会写字", "我来写字", "一起朗读", "请轻声说", "我先回答", "我读给你听", "请你跟读",
    "我会讲故事", "我会写拼音", "我会认生字", "我来读句子", "我来写句子",
    "请你先说", "我来回答", "请再读一遍", "我来读一读", "我们一起读", "我来说一句", "请你跟我读", "请先看图", "我来指一指"
  ]);

  const GRADE12_CLASSROOM_EXPRESSIONS = uniqueList([
    "我会造句", "我会看图", "请先读一读", "先看题目", "请你读一段", "我能找词语", "我来写短句",
    "先想再回答", "一起读日记", "我来讲画面", "请说完整句", "我会看插图", "我们一起观察",
    "我来圈生字", "我先读一段", "请补充一句", "我来讲一讲", "说说你发现",
    "请说说想法", "先读再回答", "我来读短文", "请听我补充", "我先看插图", "我能分段读", "我会读整句", "请把话说完",
    "一起讲故事", "看看这幅图", "我来读题", "请说一句完整的话"
  ]);

  const GENERAL_EXTRA_EXPRESSIONS = uniqueList([
    "我可以吗", "我来试试", "请再来一次", "我们一起玩", "我们一起学", "我想帮助你", "请等一下",
    ...combine(["我想要", "我要", "请给我", "我喜欢"], EXTRA_OBJECTS.slice(0, 16)),
    ...combine(["我想吃"], EXTRA_OBJECTS.filter((w) => ["面包", "米饭", "苹果", "香蕉", "葡萄", "草莓", "西瓜", "鸡蛋"].includes(w))),
    ...combine(["我想喝"], EXTRA_OBJECTS.filter((w) => ["水", "牛奶", "果汁"].includes(w))),
    ...combine(["我会", "我能"], EXTRA_SKILL_ACTIONS),
    ...combine(["请帮我"], EXTRA_HELP_ACTIONS),
    ...combine(["我们一起"], EXTRA_GROUP_ACTIONS),
    ...combine(["在家", "在学校", "在公园", "在教室"], EXTRA_GROUP_ACTIONS)
  ]).slice(0, 2000);

  const EXTRA_POEM_TITLES = uniqueList([
    "咏鹅", "春晓", "静夜思", "悯农", "画", "江南", "池上", "小池", "所见", "村居",
    "梅花", "风", "画鸡", "蜂", "古朗月行", "寻隐者不遇", "赠汪伦", "登鹳雀楼", "鹿柴", "江雪"
  ]);

  const extraLanguageEntries = [
    ...buildLanguageEntries(GRADE1_CURATED_EXTENSION_WORDS, "拓展词汇", { gradeBand: "学前-一年级" }),
    ...buildLanguageEntries(GRADE12_CURATED_EXTENSION_WORDS, "拓展词汇", { gradeBand: "一年级-二年级" }),
    ...buildLanguageEntries(LANGUAGE_EXTRA_WORDS, "拓展词汇", { gradeBand: "学前-二年级" }),
    ...buildLanguageEntries(GRADE1_CLASSROOM_EXPRESSIONS, "表达", { tags: ["口语"], gradeBand: "学前-一年级" }),
    ...buildLanguageEntries(GRADE12_CLASSROOM_EXPRESSIONS, "表达", { tags: ["口语"], gradeBand: "一年级-二年级" }),
    ...buildLanguageEntries(GENERAL_EXTRA_EXPRESSIONS, "表达", { tags: ["口语"], gradeBand: "学前-一年级" }),
    ...buildLanguageEntries(EXTRA_POEM_TITLES, "古诗", { gradeBand: "学前-二年级" })
  ];

  const target = EXISTING_LANGUAGE_TARGET;
  const merged = uniqueByEntry([...target, ...extraLanguageEntries]).filter(shouldKeepLanguageEntry);
  if (target !== merged) {
    target.length = 0;
    merged.forEach((item) => target.push(item));
  }
  if (typeof BRIDGE_VOCAB_LANGUAGE === "undefined") {
    window.BRIDGE_VOCAB_LANGUAGE = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraLanguageEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    const languageEntries = uniqueByEntry(BRIDGE_VOCAB_FULL.filter((item) => item?.subject === "language")).filter(shouldKeepLanguageEntry);
    const others = BRIDGE_VOCAB_FULL.filter((item) => item?.subject !== "language");
    BRIDGE_VOCAB_FULL.length = 0;
    others.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    languageEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
