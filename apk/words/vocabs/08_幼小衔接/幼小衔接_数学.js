(() => {
  const BRIDGE_STAGE = "bridge";
  const BRIDGE_DIFFICULTY = "basic";

  function uniqueList(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

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

  function getMathEntryKey(item) {
    const moduleName = String(item?.module || "").trim();
    const word = String(item?.word || item?.chinese || "").trim();
    return `${moduleName}::${word}`;
  }

  function uniqueMathEntries(items) {
    const seen = new Set();
    return (Array.isArray(items) ? items : []).filter((item) => {
      const key = getMathEntryKey(item);
      if (!key || key.endsWith("::")) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildCuratedItems(words) {
    return uniqueModuleItems(
      uniqueList(words).map((word) => [word, [word]])
    );
  }

  function buildMappedItems(baseWords, mappedSpecs) {
    const items = [];
    uniqueList(baseWords).forEach((word) => items.push([word, [word]]));
    mappedSpecs.forEach(([prefix, suffixes]) => {
      uniqueList(suffixes).forEach((suffix) => {
        const word = `${prefix}${suffix}`;
        items.push([word, [prefix, suffix]]);
      });
    });
    return uniqueModuleItems(items);
  }

  const NUMBER_WORDS = [
    "十以内加法", "十以内减法", "二十以内加减", "看算式", "比大小",
    "分一分", "比多少", "数一数", "圈一圈", "摆一摆", "加一加",
    "减一减", "合起来", "分开算", "多几个", "少几个", "一共多少",
    "还剩多少", "比一比", "算一算"
  ];
  const TIME_AND_MONEY_WORDS = [
    "整点", "半点", "几点", "几分", "时针", "分针", "秒针", "钟面", "看钟面", "认钟面",
    "看时间", "认时间", "现在几点", "早上", "上午", "中午", "下午", "晚上", "昨天", "今天",
    "明天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期天",
    "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月",
    "十一月", "十二月", "一元", "五角", "一角", "纸币", "硬币", "钱币", "认钱币",
    "数钱", "换零钱", "找零钱", "买东西", "付钱", "找回", "多少钱", "比价钱", "便宜",
    "贵一点", "一样价", "买文具", "买水果", "买点心", "看价签", "看日历", "看星期",
    "看月份", "星期顺序", "月份顺序", "价钱比较", "购物找零", "时间排序", "购物付款"
  ];
  const TIME_AND_MONEY_EXTRA_WORDS = [
    "认识整点", "认识半点", "看日历", "看星期", "看月份", "比价钱", "比钱数", "哪个更贵", "哪个更便宜",
    "找回零钱", "付钱", "买文具", "买水果", "买点心", "看价签", "按时间排", "按星期排", "按月份排",
    "今天星期几", "明天星期几", "这个月几月", "上午几点", "下午几点", "晚上几点",
    "先付钱", "再找零", "买牛奶", "买面包", "数硬币", "数纸币"
  ];
  const PATTERN_WORDS = [
    "找规律", "看规律", "接着排", "接着画", "补一补", "排顺序", "圈一圈", "连一连",
    "分一分", "配一配", "摆一摆", "涂一涂", "一样的", "不一样的", "大中小", "长短",
    "高矮", "轻重", "颜色排序", "图形排序", "数字排序", "按大小排", "按颜色排",
    "按形状排", "按大小分", "按颜色分", "按形状分", "重复出现", "下一个", "上一组",
    "同一类", "不同类", "找相同", "找不同", "补图形", "补数字", "补颜色", "补位置",
    "规律卡片", "规律积木", "规律珠子", "先后顺序", "左右顺序", "从前到后", "从左到右",
    "颜色接龙", "图形接龙", "数字接龙", "位置接龙", "图形配对", "颜色配对", "数量配对", "位置配对"
  ];
  const PATTERN_EXTRA_WORDS = [
    "按大小规律排", "按颜色分", "按形状分", "按大小分", "按长短排", "按高矮排", "按轻重排",
    "找下一组", "看顺序", "看左右顺序", "看先后顺序", "找颜色规律", "找形状规律", "找数字规律",
    "摆规律", "摆规律积木", "摆规律珠子", "图形配对", "颜色配对", "数量配对", "位置配对"
  ];
  const DATA_WORDS = [
    "数一数", "比多少", "谁最多", "谁最少", "一样多", "分分类", "条形图", "看条形图",
    "排一排", "圈一圈", "画一画", "贴一贴", "数玩具", "数水果", "数铅笔", "数图形",
    "数小动物", "数量比较", "分类摆放", "每类几个", "哪个更多", "哪个更少", "找相同数量",
    "画条形图", "数积木", "数贴纸", "数气球", "数小花", "比数量", "整理卡片", "统计玩具",
    "统计水果", "统计贴纸", "统计气球", "看数量", "分成两类", "分成三类", "数书本", "数杯子",
    "数书包", "玩具分类", "水果分类", "图形分类", "颜色分类", "数量排序", "比较多少", "一样多吗", "找一找"
  ];
  const TIME_AND_MONEY_MAPPED = [
    ["认识", ["整点", "半点", "时针", "分针", "钟面", "一元", "五角", "一角", "纸币", "硬币", "钱币"]],
    ["看", ["时间", "钟面", "日历", "星期", "月份", "价签"]],
    ["比", ["早晚", "先后", "价钱", "钱数", "多少"]],
    ["换", ["零钱", "纸币", "硬币", "钱币"]],
    ["数", ["纸币", "硬币", "零钱", "价钱"]],
    ["买", ["水果", "文具", "点心", "玩具", "图书", "小礼物"]],
    ["付", ["一元", "五角", "一角", "钱"]],
    ["找回", ["零钱", "一角", "五角", "几元"]],
    ["算", ["价钱", "总价", "还差多少", "还剩多少"]],
    ["选", ["便宜的", "贵一点的", "一样价的", "要买的"]]
  ];
  const PATTERN_MAPPED = [
    ["按", ["大小排", "颜色排", "形状排", "长短排", "高矮排", "轻重排", "大小分", "颜色分", "形状分"]],
    ["找", ["规律", "相同", "不同", "下一组", "缺的图形", "缺的颜色", "缺的数字", "缺的位置", "颜色规律", "形状规律", "数字规律", "大小规律"]],
    ["补", ["图形", "数字", "颜色", "位置", "顺序", "下一组"]],
    ["接着", ["排", "画", "数", "摆", "涂"]],
    ["分", ["颜色", "形状", "大小", "长短", "高矮", "轻重", "多少"]],
    ["配", ["颜色", "形状", "数量", "位置", "大小"]],
    ["圈出", ["一样的", "不一样的", "下一组", "同一类", "相同颜色", "相同形状"]],
    ["连", ["相同颜色", "相同形状", "相同数量", "前后顺序", "左右顺序"]],
    ["摆", ["规律积木", "规律珠子", "规律图形"]],
    ["看", ["先后顺序", "左右顺序"]]
  ];
  const SPACE_WORDS = [
    "看位置", "认位置", "找位置", "看方向", "认方向", "上面", "下面", "左边", "右边",
    "前面", "后面", "里面", "外面", "上下", "左右", "前后", "里外",
    "图形拼搭", "图形拼图", "拼图形", "摆图形", "图形摆放"
  ];
  const SPACE_MAPPED = [
    ["看", ["位置", "上面", "下面", "左边", "右边", "前面", "后面"]],
    ["找", ["位置", "左边", "右边", "前面", "后面"]],
    ["摆", ["图形", "积木", "位置"]],
    ["拼", ["图形", "拼图"]],
    ["认", ["位置", "方向"]],
    ["分", ["上下", "左右", "前后", "里面", "外面"]]
  ];
  const DATA_MAPPED = [
    ["数", ["玩具", "水果", "铅笔", "图形", "小动物", "积木", "气球", "贴纸", "小花", "书本", "杯子"]],
    ["统计", ["颜色", "形状", "数量", "玩具", "水果", "积木", "气球", "贴纸", "图形", "小动物"]],
    ["看", ["条形图", "统计图", "数量", "多少", "谁最多", "谁最少"]],
    ["比较", ["数量", "多少", "谁最多", "谁最少", "一样多"]],
    ["分成", ["两类", "三类", "四类", "几类"]],
    ["画", ["条形图", "图形"]],
    ["找", ["最多的", "最少的", "一样多的", "同一类的"]],
    ["排一排", ["图形", "数量"]],
    ["圈出", ["最多的", "最少的", "一样多的", "同一类的"]]
  ];
  const DATA_EXTRA_WORDS = [
    "数玩具", "数水果", "数铅笔", "数图形", "数小动物", "数积木", "数贴纸", "数气球", "数小花",
    "数书本", "数杯子", "数文具", "数图书", "统计玩具", "统计水果", "统计贴纸", "统计气球", "统计图形",
    "统计文具", "统计图书",
    "画条形图", "画点子", "看统计图", "分成两类", "分成三类", "找最多的", "找最少的", "找一样多的",
    "按数量排", "比数量", "比较多少", "哪个更多", "哪个更少", "找相同数量",
    "数盘子", "数鞋子", "数小球", "分成四类", "分成几类", "看谁最多", "看谁最少"
  ];

  const BLOCKED_MATH_WORDS = new Set([
    "应用题", "文字题", "数量关系", "规律卡片", "整理图卡",
    "配卡片", "排一排卡片", "数图卡", "买卡片", "一共几张卡片", "摆出规律卡片",
    "加法题", "减法题", "口算题", "比较题", "分配题", "加减法题", "看图题",
    "上一组", "找上一组", "排一排结果", "比较结果", "画数量点点", "贴一贴数量点点",
    "看看价签", "看看日历", "看看星期表", "看看钟面", "看看先后顺序", "看看左右顺序",
    "看看颜色规律", "看看形状规律", "看看数字规律", "看看大小规律",
    "说说今天", "说说明天", "说说昨天", "说说早上", "说说中午", "说说晚上",
    "整理书包", "整理卡片", "整理文具", "整理水果", "整理玩具", "整理贴纸",
    "价钱比较", "购物付款", "时间排序", "一样价"
  ]);

  const BLOCKED_MATH_FRAGMENTS = [
    "应用", "文字题", "数量关系", "实践活动", "项目任务", "活动计划", "时间安排", "路线图", "任务卡",
    "看看", "说说", "练习", "数量点点", "分类图", "图卡", "卡片", "结果", "整理"
  ];

  function shouldKeepMathEntry(item) {
    const word = String(item?.word || item?.chinese || "").trim();
    if (!word) return false;
    if (BLOCKED_MATH_WORDS.has(word)) return false;
    return !BLOCKED_MATH_FRAGMENTS.some((fragment) => word.includes(fragment));
  }

  const EXTRA_MODULES = {
    "数与运算": buildCuratedItems(NUMBER_WORDS),
    "时间与货币": buildMappedItems([...TIME_AND_MONEY_WORDS, ...TIME_AND_MONEY_EXTRA_WORDS], TIME_AND_MONEY_MAPPED),
    "图形与空间": buildMappedItems(SPACE_WORDS, SPACE_MAPPED),
    "规律与模式": buildMappedItems([...PATTERN_WORDS, ...PATTERN_EXTRA_WORDS], PATTERN_MAPPED),
    "统计与数据": buildMappedItems([...DATA_WORDS, ...DATA_EXTRA_WORDS], DATA_MAPPED)
  };

  const extraMathEntries = Object.entries(EXTRA_MODULES).flatMap(([moduleName, items]) =>
    items.map(([word, keywords]) => createMathEntry(moduleName, word, { keywords }))
  );

  const target = (typeof BRIDGE_VOCAB_MATH !== "undefined" && Array.isArray(BRIDGE_VOCAB_MATH))
    ? BRIDGE_VOCAB_MATH
    : [];
  extraMathEntries.forEach((item) => target.push(item));
  const normalizedTarget = uniqueMathEntries(target).filter(shouldKeepMathEntry);
  target.length = 0;
  normalizedTarget.forEach((item) => target.push(item));
  if (typeof BRIDGE_VOCAB_MATH === "undefined") {
    window.BRIDGE_VOCAB_MATH = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraMathEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    const normalizedFull = uniqueMathEntries(BRIDGE_VOCAB_FULL.filter((item) => item?.subject === "math")).filter(shouldKeepMathEntry);
    const others = BRIDGE_VOCAB_FULL.filter((item) => item?.subject !== "math");
    BRIDGE_VOCAB_FULL.length = 0;
    others.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
    normalizedFull.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
