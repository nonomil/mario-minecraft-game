import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function read(relPath) {
  return fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");
}

function runInContext(context, relPath) {
  vm.runInContext(read(relPath), context, { filename: relPath });
}

function loadBridgePack() {
  const context = { console };
  context.window = context;
  vm.createContext(context);
  runInContext(context, "words/vocabs/01_\u5e7c\u513f\u56ed/\u5e7c\u513f\u56ed\u5b8c\u6574\u8bcd\u5e93.js");
  runInContext(context, "words/vocabs/06_\u6c49\u5b57/\u5e7c\u513f\u56ed\u6c49\u5b57.js");
  runInContext(context, "words/vocabs/07_\u62fc\u97f3/\u5e38\u7528\u62fc\u97f3.js");
  runInContext(context, "words/vocabs/08_\u5e7c\u5c0f\u8854\u63a5/\u5e7c\u5c0f\u8854\u63a5\u603b\u8bcd\u5e93.js");
  runInContext(context, "words/vocabs/08_\u5e7c\u5c0f\u8854\u63a5/\u5e7c\u5c0f\u8854\u63a5_\u8bed\u6587.js");
  return vm.runInContext("BRIDGE_VOCAB_FULL", context) || [];
}

const pack = loadBridgePack();
assert.ok(pack.length > 0, "bridge vocab pack should not be empty");

const moduleCounts = {};
for (const entry of pack) {
  if (!entry || !entry.subject || !entry.module) continue;
  const key = `${entry.subject}::${entry.module}`;
  moduleCounts[key] = (moduleCounts[key] || 0) + 1;
}

const requiredCounts = [
  ["language", "词语", 1000],
  ["language", "表达", 600],
  ["language", "古诗", 150],
  ["math", "数与运算", 150],
  ["math", "逻辑推理", 150],
  ["math", "量与统计", 150],
  ["math", "图形与空间", 150],
  ["math", "应用题专项", 150],
  ["math", "综合实践", 150],
  ["english", "字母", 250],
  ["english", "自然拼读", 250],
  ["english", "发音", 250],
  ["english", "单词", 250]
];

for (const [subject, moduleName, minCount] of requiredCounts) {
  const key = `${subject}::${moduleName}`;
  const actual = moduleCounts[key] || 0;
  assert.ok(
    actual >= minCount,
    `${key} should have at least ${minCount} entries, got ${actual}`
  );
}

const duplicateKeys = new Set();
const seenEntryKeys = new Set();
for (const entry of pack) {
  const word = String(entry?.chinese || entry?.word || "").trim();
  const subject = String(entry?.subject || "").trim();
  const moduleName = String(entry?.module || "").trim();
  if (!word || !subject || !moduleName) continue;
  const key = `${subject}::${moduleName}::${word}`;
  if (seenEntryKeys.has(key)) duplicateKeys.add(key);
  seenEntryKeys.add(key);
}
assert.equal(duplicateKeys.size, 0, `bridge vocab should not contain duplicate module entries: ${Array.from(duplicateKeys).slice(0, 10).join(", ")}`);

const bannedFragments = ["传送", "附魔", "出生点", "采集木头"];
const languageWords = new Set();
const allLanguageWords = new Set();
const extensionWords = new Set();
const expressionWords = new Set();
for (const entry of pack) {
  if (String(entry?.subject || "").trim() !== "language") continue;
  const word = String(entry?.chinese || entry?.word || "").trim();
  if (word) allLanguageWords.add(word);
  assert.equal(
    bannedFragments.some((fragment) => word.includes(fragment)),
    false,
    `language entry should not include banned fragment: ${word}`
  );
  if (String(entry?.module || "").trim() === "词语") languageWords.add(word);
  if (String(entry?.module || "").trim() === "拓展词汇") extensionWords.add(word);
  if (String(entry?.module || "").trim() === "表达") expressionWords.add(word);
  if (String(entry?.module || "").trim() === "表达") {
    assert.ok([...word].length <= 6, `language::表达 应限制为 2-6 字短表达: ${word}`);
  }
}

const extensionOverlapWithWords = [...extensionWords].filter((word) => languageWords.has(word));
const extensionOverlapWithExpressions = [...extensionWords].filter((word) => expressionWords.has(word));
assert.ok(languageWords.size >= 2000, `language::词语 应继续扩充到至少 2000 条自然常用词，实际为 ${languageWords.size}`);
assert.ok(extensionWords.size >= 600, `language::拓展词汇 应保留至少 600 条真正可用的新词，实际为 ${extensionWords.size}`);
assert.equal(extensionOverlapWithWords.length, 0, `language::拓展词汇 不应与 language::词语 重复: ${extensionOverlapWithWords.slice(0, 10).join(", ")}`);
assert.equal(extensionOverlapWithExpressions.length, 0, `language::拓展词汇 不应与 language::表达 重复: ${extensionOverlapWithExpressions.slice(0, 10).join(", ")}`);

const abstractExtensionWords = [
  "合作力",
  "观察力",
  "记忆力",
  "想象力",
  "专注力",
  "表达力",
  "判断力",
  "行动力",
  "专心力",
  "执行力",
  "合作感",
  "时间感",
  "空间感",
  "节奏感"
];

for (const banned of abstractExtensionWords) {
  assert.equal(extensionWords.has(banned), false, `language::拓展词汇 不应保留偏抽象超龄词: ${banned}`);
}

for (const required of ["田字格", "拼音本", "生字本", "自然段", "看拼音", "写句子", "课间操", "值日表"]) {
  assert.equal(allLanguageWords.has(required), true, `language 语文包应补充更贴近学前到二年级的高频词: ${required}`);
}

for (const required of ["口琴", "短笛", "花盆", "镜子", "土堆", "水洼", "风扇", "鸟笼", "剪纸", "发夹", "书柜", "小勺", "门铃"]) {
  assert.equal(allLanguageWords.has(required), true, `language 语文包应继续补足更生活化、更贴近低年级场景的词语: ${required}`);
}

for (const required of ["看图写话", "生字卡片", "听写本", "练习册", "值日生", "红领巾", "课文", "段落", "排座位", "课后题"]) {
  assert.equal(allLanguageWords.has(required), true, `language 语文包应继续补充一年级到二年级的高频校园词: ${required}`);
}

for (const required of ["识字表", "写字表", "生字表", "组词本", "默写本", "语文园地", "日记本", "看图说话", "课外阅读", "读书角", "打铃", "上操", "做操"]) {
  assert.equal(allLanguageWords.has(required), true, `language 语文包应继续补充更贴近小学低年级课内外生活的词语: ${required}`);
}

for (const banned of ["一个", "三个", "四个", "五个", "六个", "七个", "八个", "九个", "十个", "蓝球", "白车", "黄车"]) {
  assert.equal(languageWords.has(banned), false, `language::词语 不应保留机械拼接或歧义词: ${banned}`);
}
