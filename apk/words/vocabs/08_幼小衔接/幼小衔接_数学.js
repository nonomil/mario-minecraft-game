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

  const TIME_UNITS = ["秒", "分钟", "小时", "天", "周", "月", "年", "上午", "下午", "晚上"];
  const TIME_ACTIONS = ["认识", "排序", "读表", "记录", "换算", "比较", "估算"];
  const MONEY_UNITS = ["元", "角", "分", "人民币", "价格", "找零", "零钱", "纸币", "硬币"];
  const MONEY_ACTIONS = ["认识", "比较", "计算", "换算", "购买", "找零", "预算"];
  const PATTERN_BASE = ["规律", "序列", "重复", "递增", "递减", "循环", "排列", "组合"];
  const PATTERN_ACTIONS = ["发现", "继续", "补全", "判断", "设计", "分类", "推理"];
  const DATA_BASE = ["统计", "记录", "条形图", "饼图", "折线图", "表格", "数据", "信息"];
  const DATA_ACTIONS = ["读取", "比较", "整理", "分析", "总结", "判断", "推断"];

  const EXTRA_MODULES = {
    "时间与货币": buildModuleItems(
      uniqueList([...TIME_UNITS, ...MONEY_UNITS]),
      [[TIME_ACTIONS, TIME_UNITS], [MONEY_ACTIONS, MONEY_UNITS]],
      220
    ),
    "规律与模式": buildModuleItems(
      PATTERN_BASE,
      [[PATTERN_ACTIONS, PATTERN_BASE]],
      200
    ),
    "统计与数据": buildModuleItems(
      DATA_BASE,
      [[DATA_ACTIONS, DATA_BASE]],
      200
    )
  };

  const extraMathEntries = Object.entries(EXTRA_MODULES).flatMap(([moduleName, items]) =>
    items.map(([word, keywords]) => createMathEntry(moduleName, word, { keywords }))
  );

  const target = (typeof BRIDGE_VOCAB_MATH !== "undefined" && Array.isArray(BRIDGE_VOCAB_MATH))
    ? BRIDGE_VOCAB_MATH
    : [];
  extraMathEntries.forEach((item) => target.push(item));
  if (typeof BRIDGE_VOCAB_MATH === "undefined") {
    window.BRIDGE_VOCAB_MATH = target;
  }
  if (typeof BRIDGE_VOCAB_FULL !== "undefined" && Array.isArray(BRIDGE_VOCAB_FULL)) {
    extraMathEntries.forEach((item) => BRIDGE_VOCAB_FULL.push(item));
  }
})();
