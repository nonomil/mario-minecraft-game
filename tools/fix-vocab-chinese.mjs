#!/usr/bin/env node
/**
 * Fix vocabulary chinese definitions:
 * 1. Remove part-of-speech markers (n., v., adj., adv., prep., etc.)
 * 2. Remove person name entries
 * 3. Remove bracket annotations like [经管]
 * 4. Keep only the first 1-2 core meanings
 * 5. Fix phraseTranslation that starts with "例句："
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Simple Chinese translations for kindergarten supplement words
const KINDERGARTEN_OVERRIDES = {
  "and": { chinese: "和", pt: "我喜欢苹果和香蕉。" },
  "away": { chinese: "离开", pt: "小鸟飞走了。" },
  "big": { chinese: "大的", pt: "我看到一只大狗。" },
  "blue": { chinese: "蓝色", pt: "天空是蓝色的。" },
  "can": { chinese: "能，可以", pt: "我会游泳。" },
  "come": { chinese: "来", pt: "请过来。" },
  "down": { chinese: "向下", pt: "请坐下。" },
  "find": { chinese: "找到", pt: "你能找到你的书吗？" },
  "for": { chinese: "为了，给", pt: "这个礼物是给你的。" },
  "funny": { chinese: "有趣的", pt: "这个故事很有趣。" },
  "help": { chinese: "帮助", pt: "我帮助妈妈。" },
  "here": { chinese: "这里", pt: "请到这里来。" },
  "in": { chinese: "在里面", pt: "书在我的书包里。" },
  "is": { chinese: "是", pt: "这是我的英语书。" },
  "it": { chinese: "它", pt: "今天是晴天。" },
  "jump": { chinese: "跳", pt: "兔子会跳。" },
  "little": { chinese: "小的", pt: "我有一个小玩具。" },
  "look": { chinese: "看", pt: "看黑板。" },
  "make": { chinese: "做，制作", pt: "我做了一只纸船。" },
  "me": { chinese: "我", pt: "请帮我解答这个问题。" },
  "my": { chinese: "我的", pt: "我叫莉莉。" },
  "not": { chinese: "不，没有", pt: "我今天没有迟到。" },
  "one": { chinese: "一，一个", pt: "我有一个苹果。" },
  "play": { chinese: "玩，游戏", pt: "我们下课后玩游戏。" },
  "red": { chinese: "红色", pt: "苹果是红色的。" },
  "run": { chinese: "跑", pt: "我在公园里跑步。" },
  "see": { chinese: "看见", pt: "我能看见一只鸟。" },
  "the": { chinese: "这个，那个", pt: "猫在椅子上。" },
  "three": { chinese: "三", pt: "我有三支铅笔。" },
  "to": { chinese: "到，向", pt: "我每天去上学。" },
  "two": { chinese: "二，两个", pt: "我有两本书。" },
  "up": { chinese: "向上，起来", pt: "请站起来。" },
  "we": { chinese: "我们", pt: "我们每天早上一起读书。" },
  "where": { chinese: "哪里", pt: "你的学校在哪里？" },
  "yellow": { chinese: "黄色", pt: "香蕉是黄色的。" },
  "you": { chinese: "你，你们", pt: "你是我最好的朋友。" },
};

/**
 * Simplify a dictionary-style chinese definition to a simple translation.
 * Removes part-of-speech tags, bracket annotations, person names, etc.
 */
function simplifyChinese(chinese, word) {
  if (!chinese || chinese.length < 5) return chinese; // already simple

  // Check if it looks like a dictionary entry (has POS tags)
  const posPattern = /^(n\.|v\.|adj\.|adv\.|prep\.|pron\.|conj\.|aux\.|num\.|int\.|abbr\.|vt\.|vi\.) /;
  const hasPosAnywhere = /(^|[\s；]) *(n\.|v\.|adj\.|adv\.|prep\.|pron\.|conj\.|aux\.|num\.|int\.|abbr\.|vt\.|vi\.) /;

  if (!posPattern.test(chinese) && !hasPosAnywhere.test(chinese)) {
    // No POS tags found - might still have issues
    // Check for patterns like "v. [xxx] ..."
    if (!/^[a-z]+\./.test(chinese)) return chinese;
  }

  // Split by POS boundaries
  // e.g. "n. 能力 adj. 有能力的" -> ["n. 能力", "adj. 有能力的"]
  let segments = chinese.split(/(?=(?:^|\s)(?:n|v|vt|vi|adj|adv|prep|pron|conj|aux|num|int|abbr)\.\s)/);

  let meanings = [];
  for (const seg of segments) {
    let cleaned = seg.trim();
    if (!cleaned) continue;

    // Remove POS tag prefix
    cleaned = cleaned.replace(/^(?:n|v|vt|vi|adj|adv|prep|pron|conj|aux|num|int|abbr)\.\s*/, '');

    // Remove bracket annotations like [经管], [地质]
    cleaned = cleaned.replace(/\[[^\]]*\]\s*/g, '');

    // Remove person name entries: (Xxx)人名；... to end or next semicolon
    cleaned = cleaned.replace(/\([\w\u4e00-\u9fff]+\)人名[^；]*(?:；|$)/g, '');

    // Remove verb form annotations like [came-come], [run-run, running]
    cleaned = cleaned.replace(/\[[a-zA-Z, -]+\]\s*/g, '');

    // Split by Chinese semicolons and take first 1-2 meanings
    let parts = cleaned.split(/[；;，]/).map(s => s.trim()).filter(s => s && s.length > 0);

    // Filter out empty or whitespace-only
    parts = parts.filter(p => /[\u4e00-\u9fff]/.test(p));

    if (parts.length > 0) {
      meanings.push(parts[0]);
      if (parts.length > 1 && meanings.length < 2) {
        meanings.push(parts[1]);
      }
    }

    if (meanings.length >= 2) break;
  }

  if (meanings.length === 0) return chinese; // fallback
  return meanings.join("，");
}

/**
 * Process a .js vocab file: read, fix chinese fields, write back.
 */
function processFile(filePath, isKindergarten = false) {
  const content = readFileSync(filePath, 'utf-8');

  // Extract the variable declaration line and the JSON array
  const match = content.match(/^(\/\/[^\n]*\n)?(const\s+\w+\s*=\s*)\[/m);
  if (!match) {
    console.log(`  SKIP: no array found in ${filePath}`);
    return { total: 0, fixed: 0 };
  }

  const prefix = (match[1] || '') + match[2];
  // Find the array content between first [ and last ];
  const startIdx = content.indexOf('[', content.indexOf(match[2]));
  const endIdx = content.lastIndexOf('];');
  if (startIdx < 0 || endIdx < 0) {
    console.log(`  SKIP: can't find array bounds in ${filePath}`);
    return { total: 0, fixed: 0 };
  }

  const arrayStr = content.substring(startIdx, endIdx + 1);
  let entries;
  try {
    entries = JSON.parse(arrayStr);
  } catch (e) {
    console.log(`  ERROR parsing JSON in ${filePath}: ${e.message}`);
    return { total: 0, fixed: 0 };
  }

  let fixedCount = 0;
  for (const entry of entries) {
    const wordKey = (entry.word || '').toLowerCase();

    if (isKindergarten && KINDERGARTEN_OVERRIDES[wordKey]) {
      const override = KINDERGARTEN_OVERRIDES[wordKey];
      if (entry.chinese !== override.chinese) {
        entry.chinese = override.chinese;
        fixedCount++;
      }
      if (override.pt && entry.phraseTranslation !== override.pt) {
        entry.phraseTranslation = override.pt;
      }
      continue;
    }

    // Simplify chinese field
    const original = entry.chinese;
    const simplified = simplifyChinese(original, entry.word);
    if (simplified !== original) {
      entry.chinese = simplified;
      fixedCount++;
    }

    // Fix phraseTranslation that starts with "例句："
    if (entry.phraseTranslation && entry.phraseTranslation.startsWith('例句：')) {
      // Remove the "例句：" prefix - leave the English phrase as-is
      // since we can't auto-translate, but at least clean up the format
      entry.phraseTranslation = '';
    }
  }

  // Write back
  const jsonStr = JSON.stringify(entries, null, 2);
  const header = (match[1] || '');
  const varDecl = match[2];
  const output = header + varDecl + jsonStr + ';\n';
  writeFileSync(filePath, output, 'utf-8');

  return { total: entries.length, fixed: fixedCount };
}

// --- Main ---
const BASE = resolve(import.meta.dirname, '..');

const files = [
  {
    path: 'apk/words/vocabs/01_幼儿园/kindergarten_supplement_external_20260221.js',
    kindergarten: true,
  },
  { path: 'apk/words/vocabs/05_初中/junior_high_basic.js' },
  { path: 'apk/words/vocabs/05_初中/junior_high_intermediate.js' },
  { path: 'apk/words/vocabs/05_初中/junior_high_advanced.js' },
  { path: 'apk/words/vocabs/05_初中/junior_high_full.js' },
];

// Also check for words/vocabs counterparts
const extraPaths = [
  {
    path: 'words/vocabs/01_kindergarten/kindergarten_supplement_external_20260221.js',
    kindergarten: true,
  },
];

console.log('=== Fixing vocabulary chinese definitions ===\n');

let totalFiles = 0;
let totalFixed = 0;

for (const f of [...files, ...extraPaths]) {
  const fullPath = resolve(BASE, f.path);
  try {
    readFileSync(fullPath); // check exists
  } catch {
    console.log(`  SKIP (not found): ${f.path}`);
    continue;
  }
  console.log(`Processing: ${f.path}`);
  const result = processFile(fullPath, f.kindergarten || false);
  console.log(`  ${result.total} words, ${result.fixed} chinese fields fixed\n`);
  totalFiles++;
  totalFixed += result.fixed;
}

console.log(`\nDone! Processed ${totalFiles} files, fixed ${totalFixed} definitions.`);

