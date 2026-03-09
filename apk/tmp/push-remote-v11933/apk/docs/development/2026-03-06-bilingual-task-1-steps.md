# Task 1: 拼音生成工具 + 汉字词库

> Worktree: task-1-tools  
> 分支: feat/bilingual-tools  
> 依赖: task-0-migration（`languageMode`、`showPinyin`、数据契约已就绪）

## 任务目标
完成双语模式的词库生产能力建设：提供可批量/增量执行的拼音生成工具、产出一份 50-100 条的汉字专用词库（含完整双语字段），并将新词库包注册到 `manifest.js` 且标记 `mode: "chinese"`。

## 涉及文件
- `tools/add-pinyin.js` - 新建，拼音批量生成与复核清单导出
- `words/vocabs/06_汉字/幼儿园汉字.js` - 新建，汉字专用词库（50-100 条）
- `words/vocabs/manifest.js` - 修改，新增汉字词库包元数据并声明 `mode: "chinese"`

## 实施步骤

### Step 1: 创建 `tools/add-pinyin.js` 的可执行骨架（批量 + 增量）
**文件**: `tools/add-pinyin.js`  
**操作**: 新建 CLI 工具，支持参数 `--input`、`--glob`、`--incremental`、`--dry-run`、`--report`

```javascript
#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const process = require('process');
const glob = require('glob');

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

function resolveFiles(args) {
  const files = new Set(args.input.map((p) => path.resolve(p)));
  for (const pattern of args.glob) {
    const matched = glob.sync(pattern, { nodir: true });
    matched.forEach((m) => files.add(path.resolve(m)));
  }
  return Array.from(files);
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv);
  const files = resolveFiles(args);

  if (files.length === 0) {
    console.error('[add-pinyin] no vocab files found');
    process.exit(1);
  }

  ensureDir(args.report);
  console.log('[add-pinyin] files:', files.length);
  console.log('[add-pinyin] incremental:', args.incremental);
  console.log('[add-pinyin] dryRun:', args.dryRun);
  console.log('[add-pinyin] report:', args.report);

  // Step 2-4 中补齐具体实现
}

main();
```

**验证清单**:
- [ ] `node tools/add-pinyin.js --dry-run` 可执行且能打印默认参数
- [ ] 未传入路径参数时，默认扫描 `words/vocabs/01_幼儿园/*.js`
- [ ] `--input` 与 `--glob` 可混用
- [ ] `--report` 指定目录不存在时可自动创建

---

### Step 2: 实现词库读取/写回（保持 JS 文件可执行）
**文件**: `tools/add-pinyin.js`  
**操作**: 使用 `vm` 安全加载词库数组；写回时仅更新词条对象，不改字段语义

```javascript
const vm = require('vm');

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
```

**验证清单**:
- [ ] 能读取 `module.exports = [...]` 形式的词库文件
- [ ] 文件导出值不是数组时抛出明确错误
- [ ] 写回后文件仍是有效 JS（`module.exports = [...]`）
- [ ] `node -c <词库文件>` 语法检查通过

---

### Step 3: 实现拼音生成核心（含多音字/异常识别）
**文件**: `tools/add-pinyin.js`  
**操作**: 优先使用 `pinyin-pro`，不可用时回退内置映射；记录待人工复核项

```javascript
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
    return normalizePinyin(
      pinyinFn(chinese, {
        toneType: 'symbol',
        type: 'array',
        v: true,
        nonZh: 'consecutive'
      }).join(' ')
    );
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
```

**验证清单**:
- [ ] 安装了 `pinyin-pro` 时，输出带声调拼音
- [ ] 未安装 `pinyin-pro` 时，工具不崩溃，回退到 `FALLBACK_MAP`
- [ ] 含多音字（如“行”、“乐”）会进入复核清单
- [ ] 无声调或空拼音词条会进入复核清单

---

### Step 4: 实现批量处理、增量更新和复核报告输出
**文件**: `tools/add-pinyin.js`  
**操作**: 仅在缺失 `pinyin` 或 `--incremental=false` 时覆盖；输出 JSON 复核报告

```javascript
function processFile(filePath, options) {
  const entries = loadVocabEntries(filePath);
  const reviewList = [];
  let updated = 0;

  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const chinese = String(entry.chinese || '').trim();
    if (!chinese) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'missing_chinese'));
      return;
    }

    const shouldUpdate = !options.incremental || !String(entry.pinyin || '').trim();
    if (!shouldUpdate) return;

    const generated = generatePinyin(chinese);
    entry.pinyin = generated;
    updated += 1;

    if (!generated) {
      reviewList.push(buildReviewItem(filePath, index, entry, 'missing_pinyin'));
      return;
    }

    if (!hasToneMark(generated)) {
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

function runBatch(options) {
  const files = resolveFiles(options);
  const allReviews = [];
  let totalUpdated = 0;

  for (const filePath of files) {
    const result = processFile(filePath, options);
    totalUpdated += result.updated;
    allReviews.push(...result.reviewList);
    console.log(`[add-pinyin] ${path.basename(filePath)} updated=${result.updated}/${result.total}`);
  }

  ensureDir(options.report);
  fs.writeFileSync(options.report, `${JSON.stringify(allReviews, null, 2)}\n`, 'utf8');
  console.log(`[add-pinyin] review items=${allReviews.length}`);
  console.log(`[add-pinyin] total updated=${totalUpdated}`);
}
```

**验证清单**:
- [ ] `--incremental true` 时仅补齐缺失拼音，不覆盖已有拼音
- [ ] `--incremental false` 时可强制全量重算
- [ ] `--dry-run` 不写回词库文件，但会输出统计与复核报告
- [ ] 报告文件包含 `file/index/word/chinese/pinyin/reason` 字段

---

### Step 5: 新建汉字专用词库（50-100 条，完整双语字段）
**文件**: `words/vocabs/06_汉字/幼儿园汉字.js`  
**操作**: 新建 60 条词条（两字词 30 + 短句 20 + 成语 10），全部包含 `word/chinese/pinyin/english/phrase/phraseEn/difficulty/stage/mode`

```javascript
module.exports = [
  { word: 'smile', chinese: '微笑', pinyin: 'wēi xiào', english: 'smile', phrase: '开心地微笑', phraseEn: 'Smile happily', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'happy', chinese: '高兴', pinyin: 'gāo xìng', english: 'happy', phrase: '我今天很高兴', phraseEn: 'I am very happy today', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'friend', chinese: '朋友', pinyin: 'péng yǒu', english: 'friend', phrase: '我是你的朋友', phraseEn: 'I am your friend', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'teacher', chinese: '老师', pinyin: 'lǎo shī', english: 'teacher', phrase: '老师在教室里', phraseEn: 'The teacher is in the classroom', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'student', chinese: '同学', pinyin: 'tóng xué', english: 'student', phrase: '同学们在排队', phraseEn: 'The students are lining up', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'morning', chinese: '早安', pinyin: 'zǎo ān', english: 'good morning', phrase: '和大家说早安', phraseEn: 'Say good morning to everyone', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'night', chinese: '晚安', pinyin: 'wǎn ān', english: 'good night', phrase: '睡前说晚安', phraseEn: 'Say good night before sleep', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'thanks', chinese: '谢谢', pinyin: 'xiè xie', english: 'thanks', phrase: '谢谢你的帮助', phraseEn: 'Thanks for your help', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'sorry', chinese: '对不起', pinyin: 'duì bu qǐ', english: 'sorry', phrase: '对不起，我迟到了', phraseEn: 'Sorry, I am late', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'please', chinese: '请问', pinyin: 'qǐng wèn', english: 'excuse me', phrase: '请问洗手间在哪', phraseEn: 'Excuse me, where is the restroom?', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },

  { word: 'clean', chinese: '干净', pinyin: 'gān jìng', english: 'clean', phrase: '教室很干净', phraseEn: 'The classroom is clean', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'quiet', chinese: '安静', pinyin: 'ān jìng', english: 'quiet', phrase: '请保持安静', phraseEn: 'Please keep quiet', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'careful', chinese: '小心', pinyin: 'xiǎo xīn', english: 'careful', phrase: '过马路要小心', phraseEn: 'Be careful when crossing the road', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'brave', chinese: '勇敢', pinyin: 'yǒng gǎn', english: 'brave', phrase: '你很勇敢', phraseEn: 'You are brave', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'helpful', chinese: '帮忙', pinyin: 'bāng máng', english: 'help', phrase: '请你帮忙收玩具', phraseEn: 'Please help put away toys', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'study', chinese: '学习', pinyin: 'xué xí', english: 'study', phrase: '我们一起学习', phraseEn: 'Let us study together', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'reading', chinese: '看书', pinyin: 'kàn shū', english: 'read books', phrase: '我喜欢看书', phraseEn: 'I like reading books', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'drawing', chinese: '画画', pinyin: 'huà huà', english: 'draw', phrase: '我在画画', phraseEn: 'I am drawing', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'singing', chinese: '唱歌', pinyin: 'chàng gē', english: 'sing', phrase: '我们一起唱歌', phraseEn: 'Let us sing together', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'dancing', chinese: '跳舞', pinyin: 'tiào wǔ', english: 'dance', phrase: '她在开心跳舞', phraseEn: 'She is dancing happily', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },

  { word: 'sunshine', chinese: '阳光', pinyin: 'yáng guāng', english: 'sunshine', phrase: '阳光照进教室', phraseEn: 'Sunshine shines into the classroom', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'rainbow', chinese: '彩虹', pinyin: 'cǎi hóng', english: 'rainbow', phrase: '天上有彩虹', phraseEn: 'There is a rainbow in the sky', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'flower', chinese: '花朵', pinyin: 'huā duǒ', english: 'flower', phrase: '花朵开得很美', phraseEn: 'The flowers bloom beautifully', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'forest', chinese: '森林', pinyin: 'sēn lín', english: 'forest', phrase: '森林里有小鸟', phraseEn: 'There are birds in the forest', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'river', chinese: '小河', pinyin: 'xiǎo hé', english: 'river', phrase: '小河在流动', phraseEn: 'The river is flowing', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'cloud', chinese: '白云', pinyin: 'bái yún', english: 'cloud', phrase: '白云飘在天上', phraseEn: 'White clouds float in the sky', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'moon', chinese: '月亮', pinyin: 'yuè liàng', english: 'moon', phrase: '月亮挂在夜空', phraseEn: 'The moon hangs in the night sky', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'star', chinese: '星星', pinyin: 'xīng xing', english: 'star', phrase: '星星一闪一闪', phraseEn: 'Stars are twinkling', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'spring', chinese: '春天', pinyin: 'chūn tiān', english: 'spring', phrase: '春天开满花', phraseEn: 'Spring is full of flowers', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'winter', chinese: '冬天', pinyin: 'dōng tiān', english: 'winter', phrase: '冬天要保暖', phraseEn: 'Keep warm in winter', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },

  { word: 'line_up', chinese: '排好队', pinyin: 'pái hǎo duì', english: 'line up', phrase: '小朋友排好队', phraseEn: 'Children line up', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'wash_hands', chinese: '洗洗手', pinyin: 'xǐ xǐ shǒu', english: 'wash hands', phrase: '吃饭前洗洗手', phraseEn: 'Wash your hands before meals', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'drink_water', chinese: '多喝水', pinyin: 'duō hē shuǐ', english: 'drink water', phrase: '运动后多喝水', phraseEn: 'Drink more water after exercise', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'good_habit', chinese: '好习惯', pinyin: 'hǎo xí guàn', english: 'good habit', phrase: '早睡是好习惯', phraseEn: 'Sleeping early is a good habit', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'be_on_time', chinese: '要准时', pinyin: 'yào zhǔn shí', english: 'be on time', phrase: '上课要准时', phraseEn: 'Be on time for class', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'listen_carefully', chinese: '认真听', pinyin: 'rèn zhēn tīng', english: 'listen carefully', phrase: '上课认真听老师讲', phraseEn: 'Listen carefully to the teacher in class', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'speak_politely', chinese: '礼貌说', pinyin: 'lǐ mào shuō', english: 'speak politely', phrase: '请用礼貌说话', phraseEn: 'Please speak politely', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'share_toys', chinese: '分享玩具', pinyin: 'fēn xiǎng wán jù', english: 'share toys', phrase: '和朋友分享玩具', phraseEn: 'Share toys with friends', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'collect_items', chinese: '收拾东西', pinyin: 'shōu shi dōng xi', english: 'put things away', phrase: '下课后收拾东西', phraseEn: 'Put things away after class', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'keep_clean', chinese: '保持整洁', pinyin: 'bǎo chí zhěng jié', english: 'keep tidy', phrase: '一起保持整洁', phraseEn: 'Let us keep things tidy together', difficulty: 'basic', stage: 'kindergarten', mode: 'bilingual' },

  { word: 'love_family', chinese: '爱护家人', pinyin: 'ài hù jiā rén', english: 'care for family', phrase: '我们要爱护家人', phraseEn: 'We should care for our family', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'respect_teacher', chinese: '尊敬老师', pinyin: 'zūn jìng lǎo shī', english: 'respect teachers', phrase: '我们要尊敬老师', phraseEn: 'We should respect teachers', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'help_friends', chinese: '帮助朋友', pinyin: 'bāng zhù péng yǒu', english: 'help friends', phrase: '看到困难要帮助朋友', phraseEn: 'Help friends when they are in trouble', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'protect_nature', chinese: '保护自然', pinyin: 'bǎo hù zì rán', english: 'protect nature', phrase: '我们一起保护自然', phraseEn: 'Let us protect nature together', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'safe_crossing', chinese: '安全过马路', pinyin: 'ān quán guò mǎ lù', english: 'cross safely', phrase: '牵好手安全过马路', phraseEn: 'Hold hands and cross the road safely', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'finish_homework', chinese: '完成作业', pinyin: 'wán chéng zuò yè', english: 'finish homework', phrase: '回家先完成作业', phraseEn: 'Finish homework first at home', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'read_aloud', chinese: '大声朗读', pinyin: 'dà shēng lǎng dú', english: 'read aloud', phrase: '请大声朗读句子', phraseEn: 'Please read the sentence aloud', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'follow_rules', chinese: '遵守规则', pinyin: 'zūn shǒu guī zé', english: 'follow rules', phrase: '游戏时遵守规则', phraseEn: 'Follow the rules during games', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'stay_patient', chinese: '学会等待', pinyin: 'xué huì děng dài', english: 'learn to wait', phrase: '轮到别人时学会等待', phraseEn: 'Learn to wait for your turn', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'express_thanks', chinese: '表达感谢', pinyin: 'biǎo dá gǎn xiè', english: 'express gratitude', phrase: '得到帮助要表达感谢', phraseEn: 'Express thanks when you receive help', difficulty: 'intermediate', stage: 'kindergarten', mode: 'bilingual' },

  { word: 'practice_makes_perfect', chinese: '熟能生巧', pinyin: 'shú néng shēng qiǎo', english: 'practice makes perfect', phrase: '多练习就会熟能生巧', phraseEn: 'With practice, you will get better', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'step_by_step', chinese: '循序渐进', pinyin: 'xún xù jiàn jìn', english: 'step by step', phrase: '学习要循序渐进', phraseEn: 'Learning should be step by step', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'focus_one_mind', chinese: '专心致志', pinyin: 'zhuān xīn zhì zhì', english: 'be fully focused', phrase: '做事要专心致志', phraseEn: 'Stay fully focused when doing things', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'learn_new', chinese: '温故知新', pinyin: 'wēn gù zhī xīn', english: 'review and learn new', phrase: '复习可以温故知新', phraseEn: 'Review helps you learn new things', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'unity_strength', chinese: '团结力量', pinyin: 'tuán jié lì liàng', english: 'unity is strength', phrase: '合作体现团结力量', phraseEn: 'Cooperation shows the power of unity', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'be_honest', chinese: '诚实守信', pinyin: 'chéng shí shǒu xìn', english: 'be honest and trustworthy', phrase: '我们要诚实守信', phraseEn: 'We should be honest and trustworthy', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'diligent_learning', chinese: '勤学好问', pinyin: 'qín xué hào wèn', english: 'study diligently and ask', phrase: '勤学好问进步快', phraseEn: 'Diligent study and questions help you progress', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'careful_thought', chinese: '三思后行', pinyin: 'sān sī hòu xíng', english: 'think before acting', phrase: '做决定前要三思后行', phraseEn: 'Think carefully before making decisions', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'persevere', chinese: '持之以恒', pinyin: 'chí zhī yǐ héng', english: 'persevere', phrase: '学习要持之以恒', phraseEn: 'Learning needs perseverance', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' },
  { word: 'keep_improving', chinese: '精益求精', pinyin: 'jīng yì qiú jīng', english: 'strive for excellence', phrase: '作品要精益求精', phraseEn: 'Keep improving your work', difficulty: 'advanced', stage: 'kindergarten', mode: 'bilingual' }
];
```

**验证清单**:
- [ ] 词条数量在 50-100（本计划目标：60）
- [ ] 每条都含 `word/chinese/pinyin/english/phrase/phraseEn/difficulty/stage/mode`
- [ ] `mode` 全部为 `"bilingual"`
- [ ] 至少包含三层难度：`basic`、`intermediate`、`advanced`
- [ ] `node -e "const v=require('./words/vocabs/06_汉字/幼儿园汉字.js'); console.log(v.length)"` 输出 `60`

---

### Step 6: 更新词库清单 `manifest.js`，注册汉字包并标记中文模式
**文件**: `words/vocabs/manifest.js`  
**操作**: 新增汉字词库包定义，确保可被加载流程识别；新增 `mode: "chinese"`

```javascript
module.exports = [
  // ... existing packs
  {
    id: 'vocab.kindergarten.hanzi',
    name: '幼儿园汉字',
    stage: 'kindergarten',
    mode: 'chinese',
    type: 'hanzi',
    path: 'words/vocabs/06_汉字/幼儿园汉字.js',
    enabled: true,
    version: '1.0.0'
  }
];
```

**验证清单**:
- [ ] `manifest.js` 含 `id: 'vocab.kindergarten.hanzi'`
- [ ] 新包 `mode` 为 `"chinese"`
- [ ] `path` 指向 `words/vocabs/06_汉字/幼儿园汉字.js`
- [ ] 不影响已有英语包的加载配置

---

### Step 7: 本地验证与回归检查
**文件**: `tools/add-pinyin.js`、`words/vocabs/06_汉字/幼儿园汉字.js`、`words/vocabs/manifest.js`  
**操作**: 进行语法、功能、增量与复核输出验证

```bash
# 1) 语法检查
node -c tools/add-pinyin.js
node -c words/vocabs/06_汉字/幼儿园汉字.js
node -c words/vocabs/manifest.js

# 2) 干跑 + 复核输出
node tools/add-pinyin.js --glob "words/vocabs/01_幼儿园/*.js" --dry-run --report reports/pinyin-review-list.json

# 3) 增量更新（仅补缺）
node tools/add-pinyin.js --glob "words/vocabs/01_幼儿园/*.js" --incremental true --report reports/pinyin-review-list.json

# 4) 全量重算
node tools/add-pinyin.js --glob "words/vocabs/01_幼儿园/*.js" --incremental false --report reports/pinyin-review-list-full.json

# 5) 检查汉字词库数量
node -e "const v=require('./words/vocabs/06_汉字/幼儿园汉字.js'); console.log('count=', v.length);"
```

**验证清单**:
- [ ] 三个文件 `node -c` 全部通过
- [ ] `dry-run` 不修改词库文件内容
- [ ] `incremental=true` 仅补齐空 `pinyin`
- [ ] `incremental=false` 可重算全部拼音
- [ ] 复核报告可生成且含多音字/异常标调条目

---

## 测试用例

### Case 1: 基础生成（缺失拼音补齐）
- 前置: 词条有 `chinese` 无 `pinyin`
- 操作: `node tools/add-pinyin.js --input words/vocabs/01_幼儿园/xxx.js --incremental true`
- 预期:
- [ ] 缺失 `pinyin` 的词条被补齐
- [ ] 已有 `pinyin` 的词条不被覆盖

### Case 2: 多音字复核
- 前置: 存在 `chinese: "快乐"`、`"银行"`、`"长大"`
- 操作: 运行工具并输出报告
- 预期:
- [ ] 复核报告出现 `reason: "polyphonic_char"`
- [ ] 条目带 `file/index/chinese/pinyin`

### Case 3: 异常标调复核
- 前置: fallback 模式或异常输出导致无声调拼音
- 操作: 运行工具并输出报告
- 预期:
- [ ] 复核报告出现 `reason: "tone_mark_missing"` 或 `"missing_pinyin"`

### Case 4: 批量处理
- 前置: 至少 3 个词库文件
- 操作: `node tools/add-pinyin.js --glob "words/vocabs/01_幼儿园/*.js"`
- 预期:
- [ ] 所有匹配文件都处理
- [ ] 控制台输出每文件更新计数

### Case 5: 汉字词库契约完整性
- 前置: `words/vocabs/06_汉字/幼儿园汉字.js` 已创建
- 操作: 
  - `node -e "const v=require('./words/vocabs/06_汉字/幼儿园汉字.js'); console.log(v.every(x => ['word','chinese','pinyin','english','phrase','phraseEn','difficulty','stage','mode'].every(k => k in x)))"`
- 预期:
- [ ] 输出 `true`
- [ ] `v.length` 在 50-100

### Case 6: manifest 注册
- 前置: `manifest.js` 已更新
- 操作: 加载 manifest 并查找 `vocab.kindergarten.hanzi`
- 预期:
- [ ] 找到目标包
- [ ] `mode === 'chinese'`
- [ ] `path` 指向新汉字词库

## 验收标准
- [ ] `tools/add-pinyin.js` 支持批量 + 增量 + dry-run + 报告导出
- [ ] 工具可处理多音字与异常拼音，并输出“待人工复核清单”
- [ ] `words/vocabs/06_汉字/幼儿园汉字.js` 包含 50-100 条完整双语词条
- [ ] 词条字段完整且满足约定：`word/chinese/pinyin/english/phrase/phraseEn/difficulty/stage/mode`
- [ ] `words/vocabs/manifest.js` 已新增汉字词库包，且 `mode: "chinese"`
- [ ] 语法检查与测试用例执行通过，无阻断性错误
