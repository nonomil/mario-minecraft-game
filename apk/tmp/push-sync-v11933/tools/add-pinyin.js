#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const process = require('process');
const vm = require('vm');

let globLib = null;
try {
  globLib = require('glob');
} catch (e) {
  globLib = null;
}

let pinyinFn = null;
try {
  ({ pinyin: pinyinFn } = require('pinyin-pro'));
} catch (e) {
  pinyinFn = null;
}

const FALLBACK_MAP = {
  微笑: 'wei xiao',
  高兴: 'gao xing',
  谢谢: 'xie xie',
  早安: 'zao an',
  老师: 'lao shi',
  同学: 'tong xue'
};

const POLYPHONIC_CHARS = new Set(['行', '长', '乐', '重', '好', '干', '觉', '还', '得', '着']);

function parseArgs(argv) {
  const args = {
    input: [],
    glob: [],
    incremental: true,
    dryRun: false,
    report: 'reports/pinyin-review-list.json'
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--input') args.input.push(argv[++i]);
    else if (token === '--glob') args.glob.push(argv[++i]);
    else if (token === '--incremental') args.incremental = argv[++i] !== 'false';
    else if (token === '--dry-run') args.dryRun = true;
    else if (token === '--report') args.report = argv[++i];
  }

  if (args.input.length === 0 && args.glob.length === 0) {
    args.glob.push('words/vocabs/01_幼儿园/*.js');
  }

  return args;
}

function globToRegex(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const withDouble = escaped.replace(/\\\*\\\*/g, '::DOUBLE_STAR::');
  const withSingle = withDouble.replace(/\\\*/g, '[^/\\\\]*');
  const withQuestion = withSingle.replace(/\\\?/g, '.');
  const full = withQuestion.replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${full}$`);
}

function guessGlobBase(pattern) {
  const normalized = pattern.replace(/\\/g, '/');
  const wildcardIndex = normalized.search(/[\*\?]/);
  if (wildcardIndex < 0) {
    return path.dirname(pattern);
  }
  const prefix = normalized.slice(0, wildcardIndex);
  const cut = prefix.lastIndexOf('/');
  const base = cut >= 0 ? prefix.slice(0, cut) : '.';
  return base || '.';
}

function walkFiles(baseDir) {
  const out = [];
  if (!fs.existsSync(baseDir)) return out;

  const stack = [baseDir];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile()) out.push(fullPath);
    }
  }

  return out;
}

function resolveGlobFallback(pattern) {
  const baseDir = path.resolve(guessGlobBase(pattern));
  const regex = globToRegex(path.resolve(pattern).replace(/\\/g, '/'));
  const all = walkFiles(baseDir);
  return all.filter((f) => regex.test(path.resolve(f).replace(/\\/g, '/')));
}

function resolveFiles(args) {
  const files = new Set(args.input.map((p) => path.resolve(p)));
  for (const pattern of args.glob) {
    let matched = [];
    if (globLib && typeof globLib.sync === 'function') {
      matched = globLib.sync(pattern, { nodir: true });
    } else {
      matched = resolveGlobFallback(pattern);
    }
    matched.forEach((m) => files.add(path.resolve(m)));
  }
  return Array.from(files);
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function loadVocabEntries(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const sandbox = {
    module: { exports: [] },
    exports: {},
    require,
    __dirname: path.dirname(filePath),
    __filename: filePath
  };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: filePath, timeout: 2000 });

  const entries = sandbox.module.exports;
  if (!Array.isArray(entries)) {
    throw new Error(`vocab file must export array: ${filePath}`);
  }
  return entries;
}

function saveVocabEntries(filePath, entries) {
  const content = `${JSON.stringify(entries, null, 2)}\n`;
  const wrapped = `module.exports = ${content};`;
  fs.writeFileSync(filePath, wrapped, 'utf8');
}

function hasPolyphonicChar(text) {
  return [...text].some((ch) => POLYPHONIC_CHARS.has(ch));
}

function hasToneMark(pinyinText) {
  return /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(pinyinText);
}

function normalizePinyin(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/\bu:/g, 'v')
    .trim();
}

function generatePinyin(chinese) {
  if (!chinese || typeof chinese !== 'string') return '';

  if (pinyinFn) {
    const py = pinyinFn(chinese, {
      toneType: 'symbol',
      type: 'array',
      v: true,
      nonZh: 'consecutive'
    });

    return normalizePinyin(Array.isArray(py) ? py.join(' ') : py);
  }

  return FALLBACK_MAP[chinese] || '';
}

function buildReviewItem(filePath, index, entry, reason) {
  return {
    file: filePath,
    index,
    word: entry.word || '',
    chinese: entry.chinese || '',
    pinyin: entry.pinyin || '',
    reason
  };
}

function processFile(filePath, options) {
  const entries = loadVocabEntries(filePath);
  const reviewList = [];
  let updated = 0;

  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;

    const chinese = String(entry.chinese || '').trim();
    const currentPinyin = String(entry.pinyin || '').trim();

    if (!chinese) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'missing_chinese'));
      return;
    }

    const shouldUpdate = !options.incremental || !currentPinyin;
    if (shouldUpdate) {
      entry.pinyin = generatePinyin(chinese);
      updated += 1;
    }

    const finalPinyin = String(entry.pinyin || '').trim();
    if (!finalPinyin) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'missing_pinyin'));
      return;
    }

    if (!hasToneMark(finalPinyin)) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'tone_mark_missing'));
    }

    if (hasPolyphonicChar(chinese)) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'polyphonic_char'));
    }
  });

  if (!options.dryRun) {
    saveVocabEntries(filePath, entries);
  }

  return { filePath, updated, reviewList, total: entries.length };
}

function writeReport(reportPath, options, perFile, allReviews, totalUpdated) {
  ensureDir(reportPath);
  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      incremental: options.incremental,
      dryRun: options.dryRun,
      report: options.report
    },
    summary: {
      files: perFile.length,
      totalUpdated,
      reviewItems: allReviews.length
    },
    files: perFile,
    items: allReviews
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function runBatch(options) {
  const files = resolveFiles(options);
  const allReviews = [];
  const perFile = [];
  let totalUpdated = 0;

  if (files.length === 0) {
    console.warn('[add-pinyin] no vocab files found, writing empty report');
    writeReport(options.report, options, [], [], 0);
    return;
  }

  for (const filePath of files) {
    const result = processFile(filePath, options);
    totalUpdated += result.updated;
    allReviews.push(...result.reviewList);
    perFile.push({
      file: filePath,
      updated: result.updated,
      total: result.total,
      reviewItems: result.reviewList.length
    });
    console.log(`[add-pinyin] ${path.basename(filePath)} updated=${result.updated}/${result.total}`);
  }

  writeReport(options.report, options, perFile, allReviews, totalUpdated);
  console.log(`[add-pinyin] review items=${allReviews.length}`);
  console.log(`[add-pinyin] total updated=${totalUpdated}`);
}

function main() {
  const args = parseArgs(process.argv);
  console.log('[add-pinyin] incremental:', args.incremental);
  console.log('[add-pinyin] dryRun:', args.dryRun);
  console.log('[add-pinyin] report:', args.report);

  runBatch(args);
}

main();
