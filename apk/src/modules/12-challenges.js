/**
 * 12-challenges.js - 单词收集与学习挑战
 * 从 main.js 拆分 (原始行 3401-3817)
 */
const _root = typeof window !== "undefined" ? window : globalThis;
let sessionCorrectStreak = 0;
let sessionWrongStreak = 0;
_root._sessionWordResults = _root._sessionWordResults || [];
let recoveryQuizSession = null;

// --- Bridge play rules ---
const BRIDGE_DEFAULT_CHALLENGE_TYPES = ["translate", "listen", "fill_blank", "multi_blank", "unscramble"];

function getWordSubjectSafe(wordObj) {
    return String(wordObj?.subject || "").trim().toLowerCase();
}

function getWordDisplayPairSafe(wordObj) {
    const pair = _root.BilingualVocab?.getWordDisplayPair?.(wordObj);
    if (pair && (pair.primary || pair.secondary)) return pair;
    const primary = String(wordObj?.en || wordObj?.word || wordObj?.zh || "").trim();
    const secondary = String(wordObj?.zh || wordObj?.chinese || "").trim();
    return { primary, secondary };
}

function getWordKeySafe(wordObj) {
    const key = _root.BilingualVocab?.getWordKey?.(wordObj);
    if (key) return key;
    return String(wordObj?.en || wordObj?.word || wordObj?.zh || "").trim();
}

function getWordModuleSafe(wordObj) {
    return String(wordObj?.module || "").trim();
}

function getWordGradeBandSafe(wordObj) {
    return String(wordObj?.gradeBand || "").trim();
}

function formatBridgeGradeBandLabel(gradeBand) {
    const normalized = String(gradeBand || "").trim();
    if (!normalized) return "";
    const labelMap = {
        "学前": "学前启蒙",
        "一年级": "小学一年级",
        "二年级": "小学二年级",
        "学前-一年级": "学前到小学一年级",
        "学前-二年级": "学前到小学二年级",
        "学前到一年级": "学前到小学一年级",
        "学前到二年级": "学前到小学二年级"
    };
    return labelMap[normalized] || normalized.replace(/-/g, "到");
}

function getCurrentBridgeGradeScopeLabel() {
    const scope = _root.BilingualVocab?.normalizeBridgeGradeScope?.(settings?.bridgeGradeScope || "");
    if (!scope || scope === "all") return "";
    return _root.BilingualVocab?.getBridgeGradeScopeLabel?.(scope) || "";
}

function shouldShowCurrentBridgeGradeScope(wordObj, languageMode) {
    const subject = getWordSubjectSafe(wordObj);
    const mode = languageMode || getLanguageModeSafe();
    return _root.BilingualVocab?.isBridgeMode?.()
        || subject === "language"
        || mode === "chinese"
        || mode === "pinyin";
}

function withBridgeGradeScopeTitle(title, wordObj, languageMode) {
    const safeTitle = String(title || "").trim();
    if (!safeTitle) return "";
    if (!shouldShowCurrentBridgeGradeScope(wordObj, languageMode)) return safeTitle;
    const scopeLabel = getCurrentBridgeGradeScopeLabel();
    return scopeLabel ? `${scopeLabel} · ${safeTitle}` : safeTitle;
}

function getBridgeLearningLabel(wordObj, languageMode, challengeType = "") {
    const moduleName = getWordModuleSafe(wordObj);
    if (isSingleCharacterLearningWord(wordObj) || moduleName === "识字") {
        return challengeType === "hanzi_example" ? "识字组词" : "识字认读";
    }
    if (moduleName === "词语") return languageMode === "pinyin" ? "拼音认读" : "词语认读";
    if (moduleName === "拓展词汇") return languageMode === "pinyin" ? "拼音认读" : "拓展识词";
    if (moduleName === "表达") return "表达练习";
    if (moduleName === "古诗") return "古诗朗读";
    return "";
}

function getChineseTextLength(wordObj) {
    return [...String(wordObj?.chinese || wordObj?.zh || wordObj?.character || "").trim()].length;
}

function getBridgeContextHint(wordObj, languageMode, challengeType = "") {
    const moduleName = getBridgeLearningLabel(wordObj, languageMode || getLanguageModeSafe(), challengeType) || getWordModuleSafe(wordObj);
    const gradeBand = getWordGradeBandSafe(wordObj);
    const scopeLabel = shouldShowCurrentBridgeGradeScope(wordObj, languageMode) ? getCurrentBridgeGradeScopeLabel() : "";
    const scopeHint = scopeLabel ? `当前层级：${scopeLabel}` : "";
    return [scopeHint, moduleName, formatBridgeGradeBandLabel(gradeBand)].filter(Boolean).join(" · ");
}

function getWordPrimaryHanzi(wordObj) {
    return String(wordObj?.character || wordObj?.chinese || wordObj?.zh || "").trim();
}

function isSingleCharacterLearningWord(wordObj) {
    return [...getWordPrimaryHanzi(wordObj)].length === 1;
}

function getAdaptiveChallengeTitle(wordObj, challengeType, languageMode) {
    const subject = getWordSubjectSafe(wordObj);
    const mode = languageMode || getLanguageModeSafe();

    if (subject === "math") return withBridgeGradeScopeTitle("数学闯关", wordObj, mode);
    if (subject === "english") return withBridgeGradeScopeTitle("英语挑战", wordObj, mode);
    if (subject === "language") {
        const moduleLabel = getBridgeLearningLabel(wordObj, mode, challengeType);
        if (moduleLabel) return withBridgeGradeScopeTitle(moduleLabel, wordObj, mode);
        if (mode === "pinyin") return withBridgeGradeScopeTitle("拼音认读", wordObj, mode);
        if (mode === "chinese") return withBridgeGradeScopeTitle("汉字挑战", wordObj, mode);
        return withBridgeGradeScopeTitle("语文挑战", wordObj, mode);
    }
    return mode === "pinyin"
        ? withBridgeGradeScopeTitle("拼音挑战", wordObj, mode)
        : (mode === "chinese" ? withBridgeGradeScopeTitle("汉字挑战", wordObj, mode) : "学习挑战");
}

function getWordCardThemeClass(wordObj) {
    const mode = getLanguageModeSafe();
    const moduleName = getWordModuleSafe(wordObj);
    if (mode === "pinyin") return "word-card-theme-pinyin";
    if (mode === "chinese" || isSingleCharacterLearningWord(wordObj) || moduleName === "识字") return "word-card-theme-chinese";
    return "";
}

function formatChallengePromptWithHint(prefix, payload, hint) {
    const safePrefix = String(prefix || "").trim();
    const safePayload = String(payload || "").trim();
    const safeHint = String(hint || "").trim();
    if (!safePrefix || !safePayload) return "";
    return safeHint ? `${safePrefix} ${safePayload}（${safeHint}）` : `${safePrefix} ${safePayload}`;
}

function getPinyinToHanziPrompt(wordObj, pinyin, hint) {
    const moduleName = getWordModuleSafe(wordObj);
    if (moduleName === "古诗") return `${formatChallengePromptWithHint("根据拼音", pinyin, hint)} 认出诗句片段`;
    if (isSingleCharacterLearningWord(wordObj) || moduleName === "识字") {
        return `${formatChallengePromptWithHint("根据拼音", pinyin, hint)} 选出正确汉字`;
    }
    if (moduleName === "词语" || moduleName === "拓展词汇") {
        return `${formatChallengePromptWithHint("根据拼音", pinyin, hint)} 拼出正确词语`;
    }
    return `${formatChallengePromptWithHint("根据拼音", pinyin, hint)} 选出正确汉字`;
}

function getHanziToPinyinPrompt(wordObj, hanzi, hint) {
    const moduleName = getWordModuleSafe(wordObj);
    if (moduleName === "古诗") return `${formatChallengePromptWithHint("给诗句片段", hanzi, hint)} 选出正确读音`;
    if (moduleName === "词语" || moduleName === "拓展词汇") {
        return `${formatChallengePromptWithHint("给词语", hanzi, hint)} 选出正确读音`;
    }
    return `${formatChallengePromptWithHint("给汉字", hanzi, hint)} 选出正确读音`;
}

function getPinyinTonePrompt(wordObj, base) {
    const moduleName = getWordModuleSafe(wordObj);
    if (moduleName === "词语" || moduleName === "拓展词汇") return `给词语拼音 ${base} 选对声调`;
    return `给拼音 ${base} 选对声调`;
}

function getChineseFillHintText(wordObj) {
    const moduleName = getWordModuleSafe(wordObj);
    if (moduleName === "古诗") return "补全诗句片段";
    if (moduleName === "表达") return "补全完整表达";
    if (moduleName === "词语" || moduleName === "拓展词汇") return "缺少哪个字？";
    return "缺少哪个汉字？";
}

function getKnownHanziCharacters() {
    const pack = Array.isArray(_root.kindergartenHanzi) ? _root.kindergartenHanzi : [];
    return Array.from(new Set(
        pack
            .map(item => String(item?.character || item?.chinese || item?.word || "").trim())
            .filter(Boolean)
    ));
}

function getBridgeChallengeTypePool(wordObj, languageMode) {
    const subject = getWordSubjectSafe(wordObj);
    const isPinyinMode = languageMode === "pinyin";
    const hasHanzi = String(wordObj?.chinese || wordObj?.zh || "").trim();
    const hasPinyin = String(wordObj?.pinyin || "").trim();
    const moduleName = getWordModuleSafe(wordObj);
    const textLength = getChineseTextLength(wordObj);
    const isSingleHanzi = isSingleCharacterLearningWord(wordObj);
    if (subject === "math") return ["math_concept"];
    if (isPinyinMode) {
        if (hasHanzi && hasPinyin) {
            if (isSingleHanzi) {
                return ["pinyin_to_hanzi", "hanzi_to_pinyin"];
            }
            if (moduleName === "古诗" || textLength >= 4) {
                return ["pinyin_to_hanzi", "hanzi_to_pinyin"];
            }
            return ["pinyin_to_hanzi", "pinyin_tone", "hanzi_to_pinyin"];
        }
        return ["listen"];
    }
    if (subject === "english") return ["listen", "fill_blank", "multi_blank", "unscramble", "translate"];
    if (subject === "language") {
        if (languageMode === "pinyin") {
            if (isSingleHanzi) {
                return ["pinyin_to_hanzi", "hanzi_to_pinyin"];
            }
            if (moduleName === "古诗" || textLength >= 4) {
                return ["pinyin_to_hanzi", "hanzi_to_pinyin"];
            }
            return ["pinyin_to_hanzi", "pinyin_tone", "hanzi_to_pinyin"];
        }
        if (languageMode === "chinese") {
            if (isSingleHanzi || moduleName === "识字") {
                return ["hanzi_example", "hanzi_to_pinyin", "listen"];
            }
            if (moduleName === "表达" || moduleName === "古诗" || textLength >= 4) {
                return ["listen", "fill_blank", "hanzi_to_pinyin"];
            }
            return ["hanzi_to_pinyin", "fill_blank", "listen"];
        }
        return ["listen", "translate", "fill_blank"];
    }
    return BRIDGE_DEFAULT_CHALLENGE_TYPES;
}

function pickBridgeWordGateType(wordObj, languageMode) {
    const subject = getWordSubjectSafe(wordObj);
    const moduleName = getWordModuleSafe(wordObj);
    const textLength = getChineseTextLength(wordObj);
    const isSingleHanzi = isSingleCharacterLearningWord(wordObj);
    if (subject === "math") return "math_concept";
    if (subject === "english") return "fill_blank";
    if (subject === "language") {
        if (languageMode === "pinyin") return "pinyin_to_hanzi";
        if (languageMode === "chinese") {
            if (isSingleHanzi || moduleName === "识字") return "hanzi_example";
            if (moduleName === "表达" || moduleName === "古诗" || textLength >= 4) return "listen";
            return wordObj?.pinyin ? "hanzi_to_pinyin" : "fill_blank";
        }
        return "listen";
    }
    const pool = getBridgeChallengeTypePool(wordObj, languageMode);
    return pool[0] || "fill_blank";
}
// --- Bridge play rules end ---

function recordWordResult(wordObj, correct) {
    const pair = getWordDisplayPairSafe(wordObj);
    const key = getWordKeySafe(wordObj);
    if (!key) return;
    _root._sessionWordResults.push({
        key,
        word: String(pair.primary || ""),
        zh: String(pair.secondary || ""),
        correct: !!correct,
        time: Date.now()
    });
}

function shuffleArray(arr) {
    if (typeof shuffle === "function") return shuffle(arr);
    const out = Array.isArray(arr) ? arr.slice() : [];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
    }
    return out;
}

function dropItem(type, x, y) {
    if (!inventory[type] && inventory[type] !== 0) inventory[type] = 0;
    inventory[type]++;
    updateInventoryUI();
    const icon = ITEM_ICONS[type] || "✨";
    showFloatingText(`${icon} +1`, x, y);
}

function bumpWordDisplay() {
    const el = document.getElementById("word-display");
    if (!el) return;
    el.style.transform = "scale(1.15)";
    setTimeout(() => { el.style.transform = "scale(1)"; }, 160);
}

function showWordCard(wordObj) {
    const card = document.getElementById("word-card");
    if (!card) return;
    const subject = String(wordObj?.subject || "").trim();
    card.classList.remove("word-card-theme-chinese", "word-card-theme-pinyin");
    if (subject === "math") {
        card.classList.remove("visible");
        card.setAttribute("aria-hidden", "true");
        return;
    }
    const en = document.getElementById("word-card-en");
    const zh = document.getElementById("word-card-zh");
    const meta = document.getElementById("word-card-meta");
    const phrase = document.getElementById("word-card-phrase");
    const displayContent = getWordDisplayContentSafe(wordObj);
    if (en) en.innerText = displayContent.primaryText || "";
    if (zh) zh.innerText = displayContent.secondaryText || "";
    if (meta) {
        const metaText = formatWordDisplayPair(displayContent.metaText, displayContent.tipText, " · ");
        if (metaText) {
            meta.innerText = metaText;
            meta.style.display = "inline-flex";
        } else {
            meta.innerText = "";
            meta.style.display = "none";
        }
    }
    if (phrase) {
        const phraseText = formatWordDisplayPair(displayContent.phrasePrimary, displayContent.phraseSecondary, " · ");
        if (phraseText) {
            phrase.innerText = phraseText;
            phrase.style.display = "block";
        } else {
            phrase.innerText = "";
            phrase.style.display = "none";
        }
    }
    const themeClass = getWordCardThemeClass(wordObj);
    if (themeClass) card.classList.add(themeClass);
    updateWordImage(wordObj);
    card.classList.add("visible");
    card.setAttribute("aria-hidden", "false");
    const cardDuration = Math.max(300, Number(settings?.wordCardDuration) || 900);
    setTimeout(() => {
        card.classList.remove("visible");
        card.setAttribute("aria-hidden", "true");
    }, cardDuration);
}

function recordWordProgress(wordObj) {
    const key = getWordKeySafe(wordObj);
    if (!key) return;
    sessionWordCounts[key] = (sessionWordCounts[key] || 0) + 1;

    const packId = typeof activeVocabPackId === "undefined" ? "" : activeVocabPackId;
    if (!packId) return;
    const pr = getPackProgress(packId);
    if (!pr.total) pr.total = Array.isArray(wordDatabase) ? wordDatabase.length : 0;
    const hadEntry = !!pr.unique[key];
    const _normalize = typeof normalizeWordEntry === "function" ? normalizeWordEntry : (v) => ({ seen: Math.max(1, Number(v) || 1), correct: 0, wrong: 0, lastSeen: Date.now(), quality: "new" });
    const entry = _normalize(pr.unique[key]);
    entry.seen = hadEntry ? Math.max(1, Number(entry.seen) || 0) + 1 : 1;
    entry.lastSeen = Date.now();
    pr.unique[key] = entry;

    if (!hadEntry) {
        pr.uniqueCount = (pr.uniqueCount || 0) + 1;
        // M1: Record vocab collection event
        if (typeof recordLearningEvent === "function") {
            const pair = getWordDisplayPairSafe(wordObj);
            recordLearningEvent({
                source: "vocab",
                wordKey: key,
                themeKey: packId || "",
                result: "success",
                meta: { type: "collect", primary: pair.primary, secondary: pair.secondary }
            });
        }
        onWordCollected(wordObj);
        if (pr.total && pr.uniqueCount >= pr.total) {
            pr.completed = true;
            saveProgress();
            updateVocabProgressUI();
            const pack = vocabPacks[packId];
            showToast(`${pack?.title || packId} 已完成，切换下一个词库`);
            switchToNextPackInOrder();
            return;
        }
        updateVocabProgressUI();
    }
    saveProgress();
}

function registerCollectedWord(wordObj) {
    const key = getWordKeySafe(wordObj);
    if (!key) return;
    sessionCollectedWords.push(wordObj);
}

function getUniqueSessionWords() {
    const seen = new Set();
    return sessionCollectedWords.filter(w => {
        const key = getWordKeySafe(w);
        if (!key) return false;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function escapeSessionWordText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeSessionWordAttr(value) {
    return escapeSessionWordText(value).replace(/"/g, "&quot;");
}

function speakSessionWordByText(encodedKey) {
    const key = decodeURIComponent(String(encodedKey || ""));
    if (!key) return;
    let picked = null;
    if (Array.isArray(sessionCollectedWords)) {
        for (let i = sessionCollectedWords.length - 1; i >= 0; i--) {
            const word = sessionCollectedWords[i];
            if (word && getWordKeySafe(word) === key) {
                picked = word;
                break;
            }
        }
    }
    if (!picked && Array.isArray(wordDatabase)) {
        picked = wordDatabase.find(word => word && getWordKeySafe(word) === key) || null;
    }
    if (typeof speakWord === "function") {
        speakWord(picked || { en: key, zh: "" });
    }
}

function getWordDisplayContentSafe(wordObj) {
    const displayContent = _root.BilingualVocab?.getDisplayContent?.(wordObj);
    if (displayContent) return displayContent;
    const englishText = normalizeSpeechText(wordObj?.english, wordObj?.en, wordObj?.word);
    const chineseText = normalizeSpeechText(wordObj?.character, wordObj?.zh, wordObj?.chinese);
    const pinyinText = normalizeSpeechText(wordObj?.pinyin, wordObj?.phonetic, wordObj?.romanization);
    const phraseText = String(wordObj?.phrase || "").trim();
    const phraseTranslation = String(wordObj?.phraseZh || wordObj?.phraseTranslation || "").trim();
    const languageMode = getLanguageModeSafe();
    if (languageMode === "chinese") {
        return {
            primaryText: chineseText || englishText,
            secondaryText: englishText,
            phrasePrimary: phraseTranslation,
            phraseSecondary: phraseText
        };
    }
    if (languageMode === "pinyin") {
        return {
            primaryText: chineseText || englishText,
            secondaryText: pinyinText || "",
            phrasePrimary: phraseText,
            phraseSecondary: phraseTranslation
        };
    }
    return {
        primaryText: englishText || chineseText,
        secondaryText: chineseText,
        phrasePrimary: phraseText,
        phraseSecondary: phraseTranslation
    };
}

function formatWordDisplayPair(primary, secondary, separator) {
    const first = String(primary || "").trim();
    const second = String(secondary || "").trim();
    if (first && second) return `${first}${separator}${second}`;
    return first || second;
}

function buildSessionWordsSummary() {
    const words = getUniqueSessionWords();
    if (!words.length) return "";
    const items = words
        .map(word => {
            const key = getWordKeySafe(word);
            if (!key) return "";
            const displayContent = getWordDisplayContentSafe(word);
            const buttonText = String(displayContent.primaryText || key).trim();
            if (!buttonText) return "";
            const encodedKey = encodeURIComponent(key);
            const secondaryText = escapeSessionWordAttr(String(displayContent.secondaryText || "").trim());
            const primaryText = escapeSessionWordText(buttonText);
            return `<button type="button" class="session-word" onclick="speakSessionWordByText('${encodedKey}')" title="${secondaryText}">${primaryText}</button>`;
        })
        .filter(Boolean)
        .join("");
    if (!items) return "";
    return (
        `<div class="session-words-summary">` +
        `<div class="session-words-title">本局接触词汇（共 ${words.length} 个）</div>` +
        `<div class="session-words-list">${items}</div>` +
        `<div class="session-words-hint">点击词条可朗读复习</div>` +
        `</div>`
    );
}

function normalizeChallengeTextSpacing(text) {
    return String(text || "").trim().replace(/\s+/g, " ");
}

function getChallengeWordDisplayClass(text, forcePhrase = false) {
    const normalized = normalizeChallengeTextSpacing(text);
    const wordCount = normalized ? normalized.split(" ").filter(Boolean).length : 0;
    const charCount = normalized.length;
    const classNames = ["challenge-fill-word"];
    if (forcePhrase || wordCount > 1) classNames.push("phrase");
    if (charCount > 26 || wordCount > 5) classNames.push("long");
    if (charCount > 40 || wordCount > 8) classNames.push("xlong");
    return classNames.join(" ");
}

function generatePhraseFillBlankChallenge(wordObj) {
    const phrase = normalizeChallengeTextSpacing(wordObj?.en);
    const tokens = phrase.split(" ").filter(Boolean);
    if (tokens.length < 2) return null;

    const candidateIndexes = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].length >= 2) candidateIndexes.push(i);
    }
    const fallbackIndexes = candidateIndexes.length ? candidateIndexes : tokens.map((_, idx) => idx);
    const missingIndex = fallbackIndexes[Math.floor(Math.random() * fallbackIndexes.length)];
    const answer = tokens[missingIndex];

    const displayTokens = tokens.map((token, idx) => {
        if (idx !== missingIndex) return token;
        const underscoreCount = Math.max(3, Math.min(10, token.length));
        return "_".repeat(underscoreCount);
    });
    const displayText = displayTokens.join(" ");

    const tokenPool = (Array.isArray(wordDatabase) ? wordDatabase : [])
        .map(w => normalizeChallengeTextSpacing(w?.en))
        .filter(Boolean)
        .flatMap(text => text.split(" "))
        .filter(token => /^[a-zA-Z]+$/.test(token));
    const options = [answer];
    let guard = 0;
    while (options.length < 4 && guard < 60) {
        guard++;
        const pick = tokenPool.length
            ? tokenPool[Math.floor(Math.random() * tokenPool.length)]
            : answer;
        if (!pick || options.includes(pick)) continue;
        options.push(pick);
    }
    while (options.length < 4) {
        const fake = answer.split("").sort(() => Math.random() - 0.5).join("");
        if (!fake || options.includes(fake)) continue;
        options.push(fake);
    }

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(displayText, true)}">${displayText}</div>` +
            `<div class="challenge-fill-hint">填入缺少的单词</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffleArray(options).map(option => ({ text: option, value: option, correct: option === answer })),
        answer
    };
}

function generateLetterOptions(correctLetter, count = 4) {
    const options = [correctLetter];
    const similarLetters = {
        a: ["e", "o", "u"],
        b: ["d", "p", "q"],
        c: ["o", "e", "g"],
        d: ["b", "p", "q"],
        e: ["a", "o", "c"],
        i: ["l", "j", "t"],
        l: ["i", "t", "j"],
        m: ["n", "w", "v"],
        n: ["m", "h", "u"],
        o: ["a", "e", "c"],
        p: ["b", "d", "q"],
        q: ["p", "g", "o"],
        s: ["z", "c", "x"],
        t: ["i", "l", "f"],
        u: ["v", "n", "w"],
        v: ["u", "w", "y"],
        w: ["v", "m", "n"],
        z: ["s", "x", "y"]
    };
    const similar = similarLetters[correctLetter] || [];
    for (const letter of similar) {
        if (options.length >= count) break;
        if (!options.includes(letter)) options.push(letter);
    }
    const allLetters = "abcdefghijklmnopqrstuvwxyz";
    while (options.length < count) {
        const rand = allLetters[Math.floor(Math.random() * allLetters.length)];
        if (!options.includes(rand)) options.push(rand);
    }
    return options;
}

function generateFillBlankChallenge(wordObj) {
    // Check language mode - use Chinese character challenges in Chinese mode
    const languageMode = getLanguageModeSafe();
    if (languageMode === "chinese") {
        return generateChineseFillBlankChallenge(wordObj);
    }

    // English mode - original letter-based challenge
    const enRaw = normalizeChallengeTextSpacing(wordObj?.en).toLowerCase();
    if (/\s+/.test(enRaw)) {
        const phrasePayload = generatePhraseFillBlankChallenge(wordObj);
        if (phrasePayload) return phrasePayload;
    }
    const en = enRaw.replace(/[^a-z]/g, "");
    if (!en) return null;
    const minIndex = en.length > 2 ? 1 : 0;
    const maxIndex = en.length > 2 ? en.length - 2 : Math.max(0, en.length - 1);
    const missingIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    const missingLetter = en[missingIndex];
    const wordDisplay = en.split("").map((char, i) => (i === missingIndex ? "_" : char)).join(" ");
    const options = generateLetterOptions(missingLetter, 4);
    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(wordDisplay)}">${wordDisplay}</div>` +
            `<div class="challenge-fill-hint">缺少哪个字母？</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffleArray(options).map(letter => ({ text: letter, value: letter, correct: letter === missingLetter })),
        answer: missingLetter
    };
}


function generateMultiBlankChallenge(wordObj) {
    const enRaw = normalizeChallengeTextSpacing(wordObj?.en).toLowerCase();
    if (/\s+/.test(enRaw)) {
        const phrasePayload = generatePhraseFillBlankChallenge(wordObj);
        if (phrasePayload) return phrasePayload;
    }
    const en = enRaw.replace(/[^a-z]/g, "");
    if (en.length < 4) return generateFillBlankChallenge(wordObj);

    const blankCount = Math.min(2, Math.floor(en.length / 3));
    const available = [];
    for (let i = 1; i < en.length - 1; i++) available.push(i);
    const positions = [];
    while (positions.length < blankCount && available.length) {
        const idx = Math.floor(Math.random() * available.length);
        const pos = available[idx];
        positions.push(pos);
        for (let j = available.length - 1; j >= 0; j--) {
            if (Math.abs(available[j] - pos) <= 1) available.splice(j, 1);
        }
    }
    positions.sort((a, b) => a - b);
    const missing = positions.map(i => en[i]).join("");
    const display = en.split("").map((ch, idx) => (positions.includes(idx) ? "_" : ch)).join(" ");
    const formatMissingWithGaps = (raw, idxList) => {
        if (!raw || !idxList || idxList.length <= 1) return raw;
        let out = raw[0];
        for (let i = 1; i < raw.length; i++) {
            const gap = Math.max(0, (idxList[i] - idxList[i - 1] - 1));
            out += "_".repeat(gap + 1) + raw[i];
        }
        return out;
    };
    const options = [missing];
    let guard = 0;
    while (options.length < 4 && guard < 24) {
        guard++;
        const fake = positions.map(pos => {
            const correct = en[pos];
            const alts = generateLetterOptions(correct, 4).filter(letter => letter !== correct);
            if (!alts.length) return "x";
            const pickIndex = (guard + options.length + pos) % alts.length;
            return alts[pickIndex];
        }).join("");
        if (!options.includes(fake)) options.push(fake);
    }
    let fallbackSeed = 0;
    while (options.length < 4) {
        fallbackSeed++;
        const fake = positions.map((_, idx) => {
            const alphabet = "abcdefghijklmnopqrstuvwxyz";
            return alphabet[(fallbackSeed + idx * 11) % alphabet.length];
        }).join("");
        if (!options.includes(fake)) options.push(fake);
    }
    const missingDisplay = formatMissingWithGaps(missing, positions);

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(display)}">${display}</div>` +
            `<div class="challenge-fill-hint">填入缺少的 ${positions.length} 个字母</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffleArray(options).map(opt => ({
            text: formatMissingWithGaps(opt, positions),
            value: opt,
            correct: opt === missing
        })),
        answer: missing,
        hintLettersDisplay: missingDisplay
    };
}

function generateScrambleDistractors(en, count) {
    const out = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = shuffleArray(pool.filter(w => w?.en && w.en.toLowerCase() !== en && Math.abs(w.en.length - en.length) <= 2));
    for (const c of candidates) {
        if (out.length >= count) break;
        const v = String(c.en || "").toLowerCase();
        if (!out.some(x => x.value === v)) out.push({ text: v, value: v, correct: false });
    }
    while (out.length < count) {
        const fake = shuffleArray(en.split("")).join("");
        if (fake !== en && !out.some(x => x.value === fake)) out.push({ text: fake, value: fake, correct: false });
    }
    return out;
}

function generatePhraseUnscrambleDistractors(correctPhrase, count) {
    const out = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = shuffleArray(
        pool.filter(w => {
            const text = String(w?.en || "").toLowerCase().trim();
            return text && text !== correctPhrase && text.includes(" ");
        })
    );
    for (const c of candidates) {
        if (out.length >= count) break;
        const v = String(c.en || "").toLowerCase().trim();
        if (!out.some(x => x.value === v)) out.push({ text: v, value: v, correct: false });
    }

    const tokens = correctPhrase.split(/\s+/).filter(Boolean);
    const tokenPool = pool
        .map(w => String(w?.en || "").toLowerCase().trim())
        .filter(Boolean)
        .flatMap(text => text.split(/\s+/))
        .filter(t => /^[a-z]+$/.test(t));
    let guard = 0;
    while (out.length < count && guard < 40) {
        guard++;
        const fakeTokens = shuffleArray([...tokens]);
        if (fakeTokens.length && tokenPool.length && Math.random() < 0.5) {
            const idx = Math.floor(Math.random() * fakeTokens.length);
            fakeTokens[idx] = tokenPool[Math.floor(Math.random() * tokenPool.length)];
        }
        const fake = fakeTokens.join(" ").trim();
        if (!fake || fake === correctPhrase || out.some(x => x.value === fake)) continue;
        out.push({ text: fake, value: fake, correct: false });
    }
    return out;
}

function generateUnscrambleChallenge(wordObj) {
    // Check language mode - use Chinese character scrambling in Chinese mode
    const languageMode = getLanguageModeSafe();
    if (languageMode === "chinese") {
        return generateChineseUnscrambleChallenge(wordObj);
    }

    // English mode - original letter-based scrambling
    const enRaw = normalizeChallengeTextSpacing(wordObj?.en).toLowerCase();
    const isPhrase = /\s+/.test(enRaw);

    if (isPhrase) {
        const tokens = enRaw.split(/\s+/).filter(Boolean);
        if (tokens.length < 2) return generateFillBlankChallenge(wordObj);
        let scrambledTokens = shuffleArray([...tokens]);
        let tries = 0;
        while (scrambledTokens.join(" ") === enRaw && tries < 8) {
            scrambledTokens = shuffleArray([...tokens]);
            tries++;
        }
        return {
            mode: "fill_blank",
            questionHtml:
                `<div class="challenge-fill">` +
                `<div class="${getChallengeWordDisplayClass(scrambledTokens.join(" "), true)}" style="color:#FFD54F;">${scrambledTokens.join(" ")}</div>` +
                `<div class="challenge-fill-hint">重新排列单词顺序，拼出正确词组</div>` +
                `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
                `</div>`,
            options: shuffleArray([
                { text: enRaw, value: enRaw, correct: true },
                ...generatePhraseUnscrambleDistractors(enRaw, 3)
            ]),
            answer: enRaw
        };
    }

    const en = enRaw.replace(/[^a-z]/g, "");
    if (en.length < 3) return generateFillBlankChallenge(wordObj);

    let scrambled = shuffleArray(en.split(""));
    let tries = 0;
    while (scrambled.join("") === en && tries < 8) {
        scrambled = shuffleArray(en.split(""));
        tries++;
    }

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(scrambled.join(" "))}" style="letter-spacing:8px;color:#FFD54F;">${scrambled.join(" ")}</div>` +
            `<div class="challenge-fill-hint">重新排列字母，拼出正确单词</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffleArray([
            { text: en, value: en, correct: true },
            ...generateScrambleDistractors(en, 3)
        ]),
        answer: en
    };
}

// Chinese character unscramble challenge for Chinese mode
function generateChineseUnscrambleChallenge(wordObj) {
    const zhRaw = String(wordObj?.zh || wordObj?.chinese || "").trim();
    if (zhRaw.length < 2) return generateChineseFillBlankChallenge(wordObj);

    const chars = zhRaw.split("");
    let scrambled = shuffleArray([...chars]);
    let tries = 0;
    while (scrambled.join("") === zhRaw && tries < 8) {
        scrambled = shuffleArray([...chars]);
        tries++;
    }

    const enHint = wordObj?.en ? String(wordObj.en) : "";

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(scrambled.join(" "))}" style="letter-spacing:8px;color:#FFD54F;">${scrambled.join(" ")}</div>` +
            `<div class="challenge-fill-hint">重新排列汉字，拼出正确词组</div>` +
            `<div class="challenge-fill-zh">${enHint}</div>` +
            `</div>`,
        options: shuffleArray([
            { text: zhRaw, value: zhRaw, correct: true },
            ...generateChineseScrambleDistractors(zhRaw, 3)
        ]),
        answer: zhRaw
    };
}

function generateChineseScrambleDistractors(correctZh, count) {
    const out = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = shuffleArray(pool.filter(w => {
        const zh = String(w?.zh || w?.chinese || "").trim();
        return zh && zh !== correctZh && Math.abs(zh.length - correctZh.length) <= 1;
    }));

    for (const c of candidates) {
        if (out.length >= count) break;
        const v = String(c.zh || c.chinese || "").trim();
        if (!out.some(x => x.value === v)) out.push({ text: v, value: v, correct: false });
    }

    // Generate fake scrambles if not enough
    while (out.length < count) {
        const fake = shuffleArray(correctZh.split("")).join("");
        if (fake !== correctZh && !out.some(x => x.value === fake)) {
            out.push({ text: fake, value: fake, correct: false });
        }
    }

    return out;
}

function buildTextOptions(correct, candidates, count) {
    const options = [{ text: correct, value: correct, correct: true }];
    const unique = [...new Set(candidates.filter(Boolean))].filter(item => item !== correct);
    const shuffled = shuffleArray(unique);
    for (const text of shuffled) {
        if (options.length >= count) break;
        options.push({ text, value: text, correct: false });
    }
    while (options.length < Math.max(2, count)) {
        options.push({ text: correct, value: correct, correct: false });
    }
    return shuffleArray(options);
}

function normalizeExampleWords(wordObj) {
    return [...new Set(
        (Array.isArray(wordObj?.examples) ? wordObj.examples : [])
            .map(item => String(item?.word || "").trim())
            .filter(Boolean)
    )];
}

function generateHanziExampleChallenge(wordObj) {
    const char = getWordPrimaryHanzi(wordObj);
    if ([...char].length !== 1) return generateHanziToPinyinChallenge(wordObj);

    const exampleWords = normalizeExampleWords(wordObj)
        .filter(word => word.includes(char))
        .filter(word => [...word].length >= 2 && [...word].length <= 4);
    const correct = exampleWords[0] || "";
    if (!correct) return generateHanziToPinyinChallenge(wordObj);

    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const distractors = [];
    for (const entry of pool) {
        if (distractors.length >= 12) break;
        for (const exampleWord of normalizeExampleWords(entry)) {
            const text = String(exampleWord || "").trim();
            if (!text || text === correct || text.includes(char)) continue;
            if (Math.abs([...text].length - [...correct].length) > 1) continue;
            distractors.push(text);
        }
    }

    const pinyin = String(wordObj?.pinyin || "").trim();
    const hint = getBridgeContextHint(wordObj, getLanguageModeSafe(), "hanzi_example");
    const hintText = [pinyin, hint].filter(Boolean).join(" · ");
    return {
        mode: "options",
        question: hintText ? `选择含有“${char}”的正确组词（${hintText}）` : `选择含有“${char}”的正确组词`,
        options: buildTextOptions(correct, distractors, 4),
        answer: correct
    };
}

const PINYIN_TONE_GROUPS = {
    a: ["a", "ā", "á", "ǎ", "à"],
    e: ["e", "ē", "é", "ě", "è"],
    i: ["i", "ī", "í", "ǐ", "ì"],
    o: ["o", "ō", "ó", "ǒ", "ò"],
    u: ["u", "ū", "ú", "ǔ", "ù"],
    v: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
    ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"]
};

const PINYIN_TONE_LOOKUP = new Map(
    Object.entries(PINYIN_TONE_GROUPS).flatMap(([base, list]) =>
        list.map((char, idx) => [char, { base, tone: idx }])
    )
);

function stripPinyinTone(text) {
    return String(text || "")
        .replace(/[1-4]/g, "")
        .split("")
        .map(ch => (PINYIN_TONE_LOOKUP.has(ch) ? PINYIN_TONE_LOOKUP.get(ch).base : ch))
        .join("");
}

function detectPinyinTone(text) {
    const raw = String(text || "");
    const digit = raw.match(/[1-4]/);
    if (digit) return Number(digit[0]);
    for (const ch of raw) {
        const hit = PINYIN_TONE_LOOKUP.get(ch);
        if (hit && hit.tone > 0) return hit.tone;
    }
    return 0;
}

function applyPinyinTone(baseText, tone) {
    if (!tone) return baseText;
    const lower = baseText.toLowerCase();
    let target = "";
    if (lower.includes("a")) target = "a";
    else if (lower.includes("e")) target = "e";
    else if (lower.includes("ou")) target = "o";
    else {
        const vowels = ["a", "e", "i", "o", "u", "v", "ü"];
        for (let i = lower.length - 1; i >= 0; i--) {
            if (vowels.includes(lower[i])) {
                target = lower[i];
                break;
            }
        }
    }
    if (!target) return baseText;
    const markKey = target === "ü" ? "v" : target;
    const marked = PINYIN_TONE_GROUPS[markKey]?.[tone];
    if (!marked) return baseText;
    const regex = new RegExp(target === "ü" ? "ü" : target, "i");
    return baseText.replace(regex, (ch) => (ch === ch.toUpperCase() ? marked.toUpperCase() : marked));
}

function generatePinyinToHanziChallenge(wordObj) {
    const pinyin = String(wordObj?.pinyin || "").trim();
    const hanzi = String(wordObj?.chinese || wordObj?.zh || "").trim();
    if (!pinyin || !hanzi) return null;
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const sameLengthPool = pool
        .map(w => ({
            hanzi: String(w?.chinese || w?.zh || "").trim(),
            pinyin: String(w?.pinyin || "").trim()
        }))
        .filter(item => item.hanzi && item.hanzi !== hanzi && item.pinyin && item.pinyin !== pinyin)
        .filter(item => [...item.hanzi].length === [...hanzi].length);
    const fallbackPool = pool
        .map(w => ({
            hanzi: String(w?.chinese || w?.zh || "").trim(),
            pinyin: String(w?.pinyin || "").trim()
        }))
        .filter(item => item.hanzi && item.hanzi !== hanzi && item.pinyin && item.pinyin !== pinyin);
    const candidates = (sameLengthPool.length >= 3 ? sameLengthPool : fallbackPool).map(item => item.hanzi);
    const hint = [String(wordObj?.english || wordObj?.en || "").trim(), getBridgeContextHint(wordObj, getLanguageModeSafe())].filter(Boolean).join(" · ");
    return {
        mode: "options",
        question: getPinyinToHanziPrompt(wordObj, pinyin, hint),
        options: buildTextOptions(hanzi, candidates, 4),
        answer: hanzi
    };
}

function generateHanziToPinyinChallenge(wordObj) {
    const hanzi = String(wordObj?.chinese || wordObj?.zh || "").trim();
    const pinyin = String(wordObj?.pinyin || "").trim();
    if (!hanzi || !pinyin) return null;
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const syllableCount = pinyin.split(/\s+/).filter(Boolean).length;
    const sameSizeCandidates = pool
        .map(w => String(w?.pinyin || "").trim())
        .filter(v => v && v !== pinyin)
        .filter(v => v.split(/\s+/).filter(Boolean).length === syllableCount);
    const candidates = (sameSizeCandidates.length >= 3 ? sameSizeCandidates : pool
        .map(w => String(w?.pinyin || "").trim())
        .filter(v => v && v !== pinyin));
    const contextHint = getBridgeContextHint(wordObj, getLanguageModeSafe());
    return {
        mode: "options",
        question: getHanziToPinyinPrompt(wordObj, hanzi, contextHint),
        options: buildTextOptions(pinyin, candidates, 4),
        answer: pinyin
    };
}

function generatePinyinToneChallenge(wordObj) {
    const raw = String(wordObj?.pinyin || "").trim();
    if (!raw) return null;
    const base = stripPinyinTone(raw);
    const tone = detectPinyinTone(raw);
    if (!base || !tone) return null;
    const options = [1, 2, 3, 4].map(t => applyPinyinTone(base, t));
    const correct = applyPinyinTone(base, tone);
    return {
        mode: "options",
        question: getPinyinTonePrompt(wordObj, base),
        options: buildTextOptions(correct, options, 4),
        answer: correct
    };
}

function generateMathConceptChallenge(wordObj) {
    const concept = String(wordObj?.concept || wordObj?.word || wordObj?.chinese || "").trim();
    const keywords = Array.isArray(wordObj?.keywords) ? wordObj.keywords.map(k => String(k || "").trim()).filter(Boolean) : [];
    const correct = String(keywords[0] || wordObj?.module || "").trim();
    if (!concept || !correct) return null;
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = pool.flatMap(w => {
        if (String(w?.subject || "").trim() !== "math") return [];
        const list = Array.isArray(w?.keywords) ? w.keywords : [];
        const moduleName = String(w?.module || "").trim();
        return [...list, moduleName].map(item => String(item || "").trim());
    }).filter(v => v && v !== correct);
    return {
        mode: "options",
        question: `选择概念 ${concept} 的相关描述`,
        options: buildTextOptions(correct, candidates, 4),
        answer: correct
    };
}

const PINYIN_CHALLENGE_TYPE_KEYS = ["pinyin_to_hanzi", "hanzi_to_pinyin", "pinyin_tone"];

const CHALLENGE_TYPES = {
    translate(wordObj) {
        const promptText = getChallengeOptionValue(wordObj, "primary");
        const answerText = getChallengeOptionValue(wordObj, "secondary") || promptText;
        const options = generateChallengeOptions(wordObj, "secondary", LEARNING_CONFIG.challenge.baseOptions);
        const mode = getLanguageModeSafe();
        const question = mode === "pinyin" ? "请选择合适的拼音" : `Translate \"${promptText}\"`;
        return {
            mode: "options",
            question,
            options,
            answer: answerText
        };
    },
    listen(wordObj) {
        const answerText = getChallengeOptionValue(wordObj, "primary");
        const options = generateChallengeOptions(wordObj, "primary", LEARNING_CONFIG.challenge.baseOptions);
        return {
            mode: "options",
            question: "听音选择正确的词语",
            options,
            answer: answerText
        };
    },
    fill_blank(wordObj) {
        return generateFillBlankChallenge(wordObj);
    },
    multi_blank(wordObj) {
        return generateMultiBlankChallenge(wordObj);
    }, 
    unscramble(wordObj) {
        return generateUnscrambleChallenge(wordObj);
    },
    hanzi_example(wordObj) {
        return generateHanziExampleChallenge(wordObj);
    },
    pinyin_to_hanzi(wordObj) {
        return generatePinyinToHanziChallenge(wordObj);
    },
    hanzi_to_pinyin(wordObj) {
        return generateHanziToPinyinChallenge(wordObj);
    },
    pinyin_tone(wordObj) {
        return generatePinyinToneChallenge(wordObj);
    },
    math_concept(wordObj) {
        return generateMathConceptChallenge(wordObj);
    }
};

const CHALLENGE_TYPE_KEYS = ["translate", "listen", "fill_blank", "multi_blank", "unscramble"];

function generateChallengeOptions(wordObj, key, count) {
    const distinct = pickDistinctWords(wordObj, count);
    const baseValue = getChallengeOptionValue(wordObj, key);
    const optionLang = getChallengeOptionLang(key);
    const options = [{ text: baseValue, value: baseValue, correct: true, lang: optionLang }];
    distinct.forEach(entry => {
        const value = getChallengeOptionValue(entry, key);
        if (!value) return;
        options.push({ text: value, value, correct: false, lang: optionLang });
    });
    return shuffleArray(options).slice(0, Math.max(2, options.length));
}

function getChallengeOptionValue(wordObj, key) {
    const displayContent = getWordDisplayContentSafe(wordObj);
    if (key === "primary") return String(displayContent.primaryText || "").trim();
    if (key === "secondary") return String(displayContent.secondaryText || "").trim();
    if (key === "zh") return String(wordObj?.zh || wordObj?.en || "").trim();
    return String(wordObj?.en || wordObj?.zh || "").trim();
}

function getChallengeOptionLang(key) {
    const mode = getLanguageModeSafe();
    if (key === "primary") {
        return (mode === "chinese" || mode === "pinyin") ? "zh-CN" : "en-US";
    }
    if (key === "secondary") {
        return mode === "chinese" ? "en-US" : "zh-CN";
    }
    return key === "zh" ? "zh-CN" : "en-US";
}

function pickDistinctWords(wordObj, count) {
    if (!Array.isArray(wordDatabase) || !wordDatabase.length) return [];
    const pool = wordDatabase.filter(w => w && w.en && w.en !== wordObj.en);
    return shuffleArray(pool).slice(0, Math.max(0, count));
}

// Chinese character fill_blank challenge for Chinese mode
function generateChineseFillBlankChallenge(wordObj) {
    const zhRaw = String(wordObj?.zh || wordObj?.chinese || "").trim();

    // If it's a phrase (multiple characters), handle as phrase
    if (zhRaw.length > 1) {
        return generateChinesePhraseFillBlankChallenge(wordObj);
    }

    // Single character - not suitable for fill_blank
    return null;
}

function generateChinesePhraseFillBlankChallenge(wordObj) {
    const zhRaw = String(wordObj?.zh || wordObj?.chinese || "").trim();
    if (zhRaw.length < 2) return null;

    const chars = zhRaw.split("");
    const minIndex = chars.length > 2 ? 1 : 0;
    const maxIndex = chars.length > 2 ? chars.length - 2 : Math.max(0, chars.length - 1);
    const missingIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
    const missingChar = chars[missingIndex];

    const wordDisplay = chars.map((char, i) => (i === missingIndex ? "_" : char)).join(" ");

    // Generate similar Chinese character options
    const options = generateChineseCharOptions(missingChar, zhRaw, 4);

    const enHint = [wordObj?.en ? String(wordObj.en) : "", getBridgeContextHint(wordObj, getLanguageModeSafe())].filter(Boolean).join(" · ");

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="${getChallengeWordDisplayClass(wordDisplay)}">${wordDisplay}</div>` +
            `<div class="challenge-fill-hint">${getChineseFillHintText(wordObj)}</div>` +
            `<div class="challenge-fill-zh">${enHint}</div>` +
            `</div>`,
        options: shuffleArray(options).map(char => ({ text: char, value: char, correct: char === missingChar })),
        answer: missingChar
    };
}

function generateChineseCharOptions(correctChar, fullWord, count) {
    const options = [correctChar];

    // Try to get similar characters from vocabulary
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = [];

    for (const w of pool) {
        const zh = String(w?.zh || w?.chinese || "").trim();
        if (!zh) continue;
        for (const char of zh.split("")) {
            if (char !== correctChar && !candidates.includes(char) && !fullWord.includes(char)) {
                candidates.push(char);
            }
        }
    }

    // Shuffle and pick random characters
    const shuffled = shuffleArray(candidates);
    for (const char of shuffled) {
        if (options.length >= count) break;
        if (!options.includes(char)) options.push(char);
    }

    const fallbackChars = getKnownHanziCharacters();
    for (const char of fallbackChars) {
        if (options.length >= count) break;
        if (!options.includes(char) && !fullWord.includes(char)) {
            options.push(char);
        }
    }

    return options;
}

function shouldTriggerLearningChallenge(wordObj) {
    if (!settings.learningMode) return false;
    if (!settings.challengeEnabled || currentLearningChallenge) return false;
    const key = getWordKeySafe(wordObj);
    if (!key) return false;

    const dynamicState = (typeof getDifficultyState === "function") ? getDifficultyState() : null;
    const rawFreq = Number(dynamicState?.effectiveChallengeFrequency ?? settings.challengeFrequency ?? 0.3);
    const freq = Math.max(0.05, Math.min(0.9, rawFreq));
    const seenCount = sessionWordCounts[key] || 0;
    let quality = null;
    if (wordPicker && typeof wordPicker.getWordStats === "function") {
        const stats = wordPicker.getWordStats(key) || wordPicker.getWordStats(wordObj.en);
        quality = stats?.quality || null;
    } else if (wordPicker && typeof wordPicker.getWordQuality === "function") {
        quality = wordPicker.getWordQuality(key) || wordPicker.getWordQuality(wordObj.en) || null;
    }

    // First encounter: reduce interruptions and allow initial exposure.
    if (seenCount <= 1) return Math.random() < Math.max(0.05, freq * 0.4);
    // Wrong-quality words: increase challenge frequency for remediation.
    if (quality === "wrong") return Math.random() < Math.min(0.85, freq * 2);
    // Fast mastered words: reduce challenge frequency to avoid over-repetition.
    if (quality === "correct_fast") return Math.random() < Math.max(0.05, freq * 0.6);

    return Math.random() < freq;
}

function maybeTriggerLearningChallenge(wordObj) {
    if (!getWordKeySafe(wordObj)) return;
    registerCollectedWord(wordObj);
    if (!shouldTriggerLearningChallenge(wordObj)) return;
    startLearningChallenge(wordObj);
}

function pickChallengeType(forced, wordObj) {
    if (forced && CHALLENGE_TYPES[forced]) return forced;
    const dynamicState = (typeof getDifficultyState === "function") ? getDifficultyState() : null;
    const adaptiveForced = dynamicState?.forcedChallengeType;
    if (adaptiveForced && CHALLENGE_TYPES[adaptiveForced]) return adaptiveForced;
    const mode = getLanguageModeSafe();
    if (_root.BilingualVocab?.isBridgeMode?.()) {
        const pool = getBridgeChallengeTypePool(wordObj, mode);
        if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    }
    if (isSingleCharacterLearningWord(wordObj)) {
        if (mode === "chinese") {
            const pool = ["hanzi_example", "hanzi_to_pinyin", "listen"];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        if (mode === "pinyin") {
            const pool = ["pinyin_to_hanzi", "hanzi_to_pinyin"];
            return pool[Math.floor(Math.random() * pool.length)];
        }
    }
    const pool = mode === "pinyin" ? PINYIN_CHALLENGE_TYPE_KEYS : CHALLENGE_TYPE_KEYS;
    return pool[Math.floor(Math.random() * pool.length)];
}

function buildRecoveryQuizWords(words, questionCount) {
    const count = Math.max(1, Number(questionCount) || 1);
    const seen = new Set();
    const pool = [];
    (Array.isArray(words) ? words : []).forEach((wordObj) => {
        const key = getWordKeySafe(wordObj);
        if (!key || seen.has(key)) return;
        seen.add(key);
        pool.push(wordObj);
    });
    return shuffleArray(pool).slice(0, count);
}

function getRecoveryQuizTypePool(wordObj) {
    const subject = getWordSubjectSafe(wordObj);
    const mode = getLanguageModeSafe();
    if (subject === "math") return ["math_concept"];
    if (subject === "english") return ["listen", "fill_blank", "multi_blank", "unscramble"];
    if (_root.BilingualVocab?.isBridgeMode?.()) {
        const pool = getBridgeChallengeTypePool(wordObj, mode);
        if (Array.isArray(pool) && pool.length) {
            const filteredPool = pool.filter(type => type !== "translate");
            if (filteredPool.length) return filteredPool;
        }
    }
    if (isSingleCharacterLearningWord(wordObj)) {
        if (mode === "chinese") return ["hanzi_example", "hanzi_to_pinyin", "listen"];
        if (mode === "pinyin") return ["pinyin_to_hanzi", "hanzi_to_pinyin"];
    }
    if (mode === "pinyin") return ["pinyin_to_hanzi", "hanzi_to_pinyin", "pinyin_tone"];
    if (subject === "language" && mode === "chinese") return ["hanzi_to_pinyin", "fill_blank", "listen"];
    return ["listen", "fill_blank", "multi_blank", "unscramble"];
}

function buildRecoveryQuizTitle(session) {
    if (!session) return "恢复测验";
    const prefix = session.context === "boss_emergency" ? "BOSS急救测验" : "复活测验";
    return `${prefix} ${session.currentIndex + 1}/${session.questionCount}`;
}

function launchRecoveryQuizStep(session) {
    if (!session) return false;
    const wordObj = session.words[session.currentIndex];
    if (!wordObj) return false;
    const pool = getRecoveryQuizTypePool(wordObj);
    const forcedType = pool[session.currentIndex % pool.length] || pickChallengeType(null, wordObj);
    startLearningChallenge(wordObj, forcedType, {
        type: "recovery_quiz",
        sessionId: session.id,
        context: session.context,
        title: buildRecoveryQuizTitle(session)
    });
    return true;
}

function startRecoveryQuizSession(options = {}) {
    if (currentLearningChallenge) return false;
    const questionCount = Math.max(1, Number(options.questionCount) || 1);
    const words = buildRecoveryQuizWords(options.words, questionCount);
    if (words.length < questionCount) return false;
    recoveryQuizSession = {
        id: `recovery_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        context: String(options.context || "death"),
        currentIndex: 0,
        correctCount: 0,
        questionCount: words.length,
        words,
        onSuccess: typeof options.onSuccess === "function" ? options.onSuccess : null,
        onFailure: typeof options.onFailure === "function" ? options.onFailure : null
    };
    return launchRecoveryQuizStep(recoveryQuizSession);
}

function isRecoveryQuizOrigin(origin) {
    return !!(origin && origin.type === "recovery_quiz" && recoveryQuizSession && recoveryQuizSession.id === origin.sessionId);
}

function clearActiveChallengeState() {
    hideLearningChallenge();
    currentLearningChallenge = null;
    challengeOrigin = null;
    if (typeof popPause === "function") popPause();
    else paused = false;
    if (typeof setInputLocked === "function") setInputLocked(false);
}

function finishRecoveryQuizSession(success, wordObj) {
    const session = recoveryQuizSession;
    recoveryQuizSession = null;
    const callback = success ? session?.onSuccess : session?.onFailure;
    if (typeof callback === "function") {
        callback({
            context: session?.context || "",
            correctCount: session?.correctCount || 0,
            totalQuestions: session?.questionCount || 0,
            wordObj: wordObj || null
        });
    }
}

function handleRecoveryQuizChallengeResult(correct, wordObj) {
    if (!(challengeOrigin && challengeOrigin.type === "recovery_quiz")) return false;
    if (!isRecoveryQuizOrigin(challengeOrigin)) return true;
    const session = recoveryQuizSession;
    if (!session) return true;

    if (correct) {
        session.correctCount += 1;
        const solved = session.currentIndex + 1;
        const isLastQuestion = solved >= session.questionCount;
        showFloatingText(`✅ ${solved}/${session.questionCount}`, player?.x || 120, (player?.y || 120) - 36, "#66BB6A");
        setTimeout(() => {
            clearActiveChallengeState();
            if (isLastQuestion) {
                finishRecoveryQuizSession(true, wordObj);
                return;
            }
            session.currentIndex += 1;
            launchRecoveryQuizStep(session);
        }, 680);
        return true;
    }

    showChallengeCorrection(wordObj);
    setTimeout(() => {
        clearActiveChallengeState();
        finishRecoveryQuizSession(false, wordObj);
    }, 1800);
    return true;
}

function startLearningChallenge(wordObj, forcedType, origin) {
    const type = pickChallengeType(forcedType, wordObj);
    const handler = CHALLENGE_TYPES[type];
    if (!handler) return;
    const payload = handler(wordObj);
    if (!payload) return;
    payload.type = type;
    payload.wordObj = wordObj;
    currentLearningChallenge = payload;
    challengeOrigin = origin || null;
    if (typeof setInputLocked === "function") setInputLocked(true);
    if (typeof pushPause === "function") pushPause();
    else paused = true;
    showLearningChallenge(payload);
    challengeDeadline = Date.now() + (LEARNING_CONFIG.challenge.timeLimit || 10000);
    updateChallengeTimerDisplay();
    clearLearningChallengeTimer();
    challengeTimerId = setInterval(() => {
        const remaining = challengeDeadline - Date.now();
        if (remaining <= 0) {
            completeLearningChallenge(false);
        } else {
            updateChallengeTimerDisplay();
        }
    }, 250);
}

function showLearningChallenge(challenge) {
    if (!challengeModalEl) return;
    challengeModalEl.classList.add("visible");
    challengeModalEl.setAttribute("aria-hidden", "false");
    const titleEl = challengeModalEl.querySelector("#challenge-title");
    if (titleEl) {
        if (challengeOrigin && challengeOrigin.type === "recovery_quiz" && challengeOrigin.title) {
            titleEl.innerText = challengeOrigin.title;
        } else {
            const mode = getLanguageModeSafe();
            titleEl.innerText = getAdaptiveChallengeTitle(challenge.wordObj, challenge.type, mode);
        }
    }
    if (challengeQuestionEl) {
        if (challenge.questionHtml) {
            challengeQuestionEl.innerHTML = challenge.questionHtml;
        } else {
            challengeQuestionEl.innerText = challenge.question || "";
        }
    }
    const isInput = challenge.mode === "input";
    if (challengeInputWrapperEl) {
        challengeInputWrapperEl.classList.toggle("active", isInput);
        if (isInput && challengeInputEl) {
            challengeInputEl.value = "";
            challengeInputEl.focus();
        }
    }
    if (challengeOptionsEl) {
        challengeOptionsEl.innerHTML = "";
        if (challenge.options && challenge.options.length && !isInput) {
            challenge.options.forEach(option => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.innerText = option.text;
                btn.className = challenge.mode === "fill_blank"
                    ? "challenge-option letter-option"
                    : "challenge-option";
                // P1-5: 自适应字体缩放
                const len = option.text.length;
                if (len > 20) btn.style.fontSize = '10px';
                else if (len > 15) btn.style.fontSize = '12px';
                else if (len > 10) btn.style.fontSize = '14px';

                // Add hover/focus event to speak the option
                const speakOption = () => {
                    if (!settings.speechEnabled) return;
                    const text = option.text;
                    const optionLang = typeof option.lang === "string" && option.lang
                        ? option.lang
                        : (/^[\u3400-\u9FFF]+$/.test(String(text || "").trim()) ? "zh-CN" : "en-US");

                    if (_root.MMWG_TTS && typeof _root.MMWG_TTS.speak === "function") {
                        const rate = String(optionLang).toLowerCase().startsWith("zh")
                            ? clamp(Number(settings.speechZhRate) || 1.0, 0.5, 2.0)
                            : clamp(Number(settings.speechEnRate) || 1.0, 0.5, 2.0);
                        _root.MMWG_TTS.speak(text, optionLang, { rate });
                    }
                };

                btn.addEventListener("mouseenter", speakOption);
                btn.addEventListener("focus", speakOption);
                btn.addEventListener("click", () => {
                    completeLearningChallenge(option.correct);
                });
                challengeOptionsEl.appendChild(btn);
            });
        }
    }
    if (challengeRepeatBtn) {
        challengeRepeatBtn.style.display = challenge.type === "listen" ? "inline-flex" : "none";
    }
    // 提示按钮初始隐藏，10秒后显示
    if (challengeHintBtn) {
        challengeHintBtn.style.display = "none";
        challengeHintBtn.disabled = false;

        // 清除旧的提示按钮定时器
        if (_root._challengeHintTimerId) {
            clearTimeout(_root._challengeHintTimerId);
        }

        // 10秒后显示提示按钮
        _root._challengeHintTimerId = setTimeout(() => {
            if (challengeHintBtn && currentLearningChallenge) {
                challengeHintBtn.style.display = "inline-flex";
            }
        }, 10000);
    }
}

function updateChallengeTimerDisplay() {
    if (!challengeTimerEl || !currentLearningChallenge) return;
    const remaining = Math.max(0, Math.ceil((challengeDeadline - Date.now()) / 1000));
    challengeTimerEl.innerText = String(remaining);
}

function clearLearningChallengeTimer() {
    if (challengeTimerId) {
        clearInterval(challengeTimerId);
        challengeTimerId = null;
    }
}

function hideLearningChallenge() {
    if (challengeModalEl) {
        challengeModalEl.classList.remove("visible");
        challengeModalEl.setAttribute("aria-hidden", "true");
    }
    if (challengeInputEl) challengeInputEl.value = "";

    // 清除提示按钮定时器
    if (_root._challengeHintTimerId) {
        clearTimeout(_root._challengeHintTimerId);
        _root._challengeHintTimerId = null;
    }
}

function showChallengeCorrection(wordObj) {
    if (!challengeQuestionEl || !wordObj) return;
    const existing = challengeQuestionEl.querySelector(".challenge-correction");
    if (existing) existing.remove();
    const correctionDiv = document.createElement("div");
    correctionDiv.className = "challenge-correction";
    correctionDiv.style.marginTop = "12px";
    correctionDiv.style.padding = "8px";
    correctionDiv.style.borderRadius = "8px";
    correctionDiv.style.background = "rgba(76,175,80,0.2)";

    const displayContent = getWordDisplayContentSafe(wordObj);
    const answerText = formatWordDisplayPair(displayContent.primaryText, displayContent.secondaryText, " = ");
    const phraseText = formatWordDisplayPair(displayContent.phrasePrimary, displayContent.phraseSecondary, " · ");
    const hintLetters = String(currentLearningChallenge?.hintLettersDisplay || "").trim();
    const hintLine = hintLetters ? `<div style="color:#90CAF9;font-size:12px;margin-top:4px;">缺失字母: ${hintLetters}</div>` : "";

    correctionDiv.innerHTML =
        `<div style="color:#4CAF50;font-size:14px;">正确答案</div>` +
        `<div style="color:#FFF;font-size:18px;font-weight:bold;margin-top:4px;">${answerText}</div>` +
        hintLine +
        (phraseText ? `<div style="color:#FFD54F;font-size:12px;margin-top:4px;">${phraseText}</div>` : "");
    challengeQuestionEl.appendChild(correctionDiv);

    if (challengeOptionsEl) {
        challengeOptionsEl.querySelectorAll("button").forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });
    }
    if (typeof speakWord === "function") speakWord(wordObj);
}

function useLearningChallengeHint() {
    if (!currentLearningChallenge?.wordObj) return;
    if (challengeHintBtn) challengeHintBtn.disabled = true;
    showChallengeCorrection(currentLearningChallenge.wordObj);
    setTimeout(() => {
        completeLearningChallenge(true);
    }, 2000);
}

function writeChallengeResultToProgress(wordObj, quality) {
    const key = getWordKeySafe(wordObj);
    const packId = typeof activeVocabPackId === "undefined" ? "" : activeVocabPackId;
    if (!key || !packId) return;
    const pr = getPackProgress(packId);
    const isNew = !pr.unique[key];
    const _normalize = typeof normalizeWordEntry === "function" ? normalizeWordEntry : (v) => ({ seen: Math.max(1, Number(v) || 1), correct: 0, wrong: 0, lastSeen: Date.now(), quality: "new" });
    const entry = _normalize(pr.unique[key]);
    entry.seen = Math.max(1, Number(entry.seen) || 1);
    entry.lastSeen = Date.now();
    if (quality === "wrong") {
        entry.wrong = (Number(entry.wrong) || 0) + 1;
        entry.quality = "wrong";
    } else {
        entry.correct = (Number(entry.correct) || 0) + 1;
        entry.quality = quality === "correct_fast" ? "correct_fast" : "correct_slow";
    }
    pr.unique[key] = entry;
    if (isNew) {
        pr.uniqueCount = (pr.uniqueCount || 0) + 1;
    }
    if (typeof saveProgress === "function") saveProgress();
}

function completeLearningChallenge(correct) {
    if (!currentLearningChallenge) return;
    clearLearningChallengeTimer();
    const reward = LEARNING_CONFIG.challenge.rewards;
    const wordObj = currentLearningChallenge.wordObj;
    const packId = typeof activeVocabPackId === "undefined" ? "" : activeVocabPackId;
    recordWordResult(wordObj, !!correct);
    const timeLimit = LEARNING_CONFIG.challenge.timeLimit || 10000;
    const elapsed = Math.max(0, timeLimit - Math.max(0, challengeDeadline - Date.now()));
    if (correct) {
        sessionCorrectStreak++;
        sessionWrongStreak = 0;
        if (typeof playChallengeCorrectSfx === "function") playChallengeCorrectSfx();
        const quality = elapsed < 3000 ? "correct_fast" : "correct_slow";
        writeChallengeResultToProgress(wordObj, quality);
        if (wordPicker && typeof wordPicker.updateWordQuality === "function" && wordObj?.en) {
            wordPicker.updateWordQuality(wordObj.en, quality);
        }
        // M1: Record challenge success event
        if (typeof recordLearningEvent === "function") {
            const pair = getWordDisplayPairSafe(wordObj);
            recordLearningEvent({
                source: "challenge",
                wordKey: getWordKeySafe(wordObj),
                themeKey: packId || "",
                result: "success",
                meta: { type: "translate", primary: pair.primary, secondary: pair.secondary }
            });
        }
        if (handleRecoveryQuizChallengeResult(true, wordObj)) return;
        hideLearningChallenge();
        addScore(reward.correct.score);
        inventory.diamond = (inventory.diamond || 0) + (reward.correct.diamond || 0);
        updateInventoryUI();

        // Track challenge success count
        if (typeof progress !== "undefined" && progress) {
            if (!progress.challengeSuccessCount) progress.challengeSuccessCount = 0;
            progress.challengeSuccessCount++;
            if (typeof saveProgress === "function") saveProgress();
            if (typeof checkChallengeMilestoneRewards === "function") {
                checkChallengeMilestoneRewards(progress.challengeSuccessCount);
            }
        }

        showFloatingText("🎉 挑战成功", player.x, player.y - 40);
        if (challengeOrigin && challengeOrigin instanceof WordGate) {
            challengeOrigin.locked = false;
            challengeOrigin.remove = true;
            showToast("💠 词语闸门已解锁！");
        }
        if (typeof popPause === "function") popPause();
        else paused = false;
        if (typeof setInputLocked === "function") setInputLocked(false);
        currentLearningChallenge = null;
        challengeOrigin = null;
    } else {
        sessionWrongStreak++;
        sessionCorrectStreak = 0;
        if (typeof playChallengeWrongSfx === "function") playChallengeWrongSfx();
        writeChallengeResultToProgress(wordObj, "wrong");
        if (wordPicker && typeof wordPicker.updateWordQuality === "function" && wordObj?.en) {
            wordPicker.updateWordQuality(wordObj.en, "wrong");
        }
        // M1: Record challenge fail event
        if (typeof recordLearningEvent === "function") {
            const pair = getWordDisplayPairSafe(wordObj);
            recordLearningEvent({
                source: "challenge",
                wordKey: getWordKeySafe(wordObj),
                themeKey: packId || "",
                result: "fail",
                meta: { type: "translate", primary: pair.primary, secondary: pair.secondary }
            });
        }
        if (handleRecoveryQuizChallengeResult(false, wordObj)) return;
        const penalty = Number(reward?.wrong?.scorePenalty) || 0;
        if (settings.challengeMode && penalty > 0) {
            addScore(-penalty);
            showFloatingText("❌ 挑战失败", player.x, player.y - 40);
        } else {
            showFloatingText("📕 再试一次", player.x, player.y - 40);
        }
        const retryWord = wordObj;
        const savedOrigin = challengeOrigin;
        showChallengeCorrection(retryWord);
        setTimeout(() => {
            hideLearningChallenge();
            currentLearningChallenge = null;
            challengeOrigin = null;
            if (typeof popPause === "function") popPause();
            else paused = false;
            if (typeof setInputLocked === "function") setInputLocked(false);
            startLearningChallenge(retryWord, null, savedOrigin);
        }, 2500);
        return;
    }
}

function getLearningStreaks() {
    return { correct: sessionCorrectStreak, wrong: sessionWrongStreak };
}

function resetLearningStreaks() {
    sessionCorrectStreak = 0;
    sessionWrongStreak = 0;
}

function triggerWordGateChallenge(gate) {
    if (!gate || !gate.wordObj || gate.locked === false) return;
    if (currentLearningChallenge) return;

    // Speak the word when word gate is triggered
    if (settings.speechEnabled && gate.wordObj) {
        speakWord(gate.wordObj);
    }

    const mode = getLanguageModeSafe();
    const forced = _root.BilingualVocab?.isBridgeMode?.()
        ? pickBridgeWordGateType(gate.wordObj, mode)
        : (mode === "pinyin" ? "pinyin_to_hanzi" : "fill_blank");
    startLearningChallenge(gate.wordObj, forced, gate);
    gate.cooldown = 60;
}

function updateWordUI(wordObj) {
    const el = document.getElementById("word-display");
    if (!el) return;

    // Use bilingual display functions to get correct content based on language mode
    const displayContent = _root.BilingualVocab?.getDisplayContent?.(wordObj);

    if (displayContent) {
        // In Chinese mode: primaryText is Chinese, secondaryText is English
        // In English mode: primaryText is English, secondaryText is Chinese
        el.innerText = displayContent.primaryText || "Start!";

        const zhEl = document.getElementById("word-display-zh");
        if (zhEl) zhEl.innerText = displayContent.secondaryText || "";
        const metaEl = document.getElementById("word-display-meta");
        if (metaEl) {
            const metaText = formatWordDisplayPair(displayContent.metaText, displayContent.tipText, " · ");
            metaEl.innerText = metaText || "";
            metaEl.style.display = metaText ? "block" : "none";
        }
    } else {
        // Fallback to old behavior if BilingualVocab not available
        const en = wordObj?.en ? String(wordObj.en) : "Start!";
        const zh = wordObj?.zh ? String(wordObj.zh) : "";
        el.innerText = en;

        const zhEl = document.getElementById("word-display-zh");
        if (zhEl) zhEl.innerText = zh;
        const metaEl = document.getElementById("word-display-meta");
        if (metaEl) {
            metaEl.innerText = "";
            metaEl.style.display = "none";
        }
    }

    const block = document.getElementById("word-display-block");
    if (block) {
        block.classList.remove("word-display-animate");
        // Force a reflow to restart animation.
        // eslint-disable-next-line no-unused-expressions
        block.offsetHeight;
        block.classList.add("word-display-animate");
    }
}

function getLanguageModeSafe() {
    const mode = settings.languageMode || "english";
    if (mode === "chinese") return "chinese";
    if (mode === "pinyin") return "pinyin";
    return "english";
}

function checkChallengeMilestoneRewards(count) {
    if (!LEARNING_CONFIG.challenge.milestones) return;

    const milestones = LEARNING_CONFIG.challenge.milestones;
    const milestone = milestones.find(m => m.count === count);

    if (!milestone) return;

    const reward = milestone.reward;

    if (reward.type === "item") {
        // Award item
        if (!inventory[reward.item]) inventory[reward.item] = 0;
        inventory[reward.item] += reward.amount || 1;
        updateInventoryUI();
        showToast(reward.message);
        showFloatingText(`🎁 ${reward.amount}x`, player.x, player.y - 60, "#FFD700");
    } else if (reward.type === "armor") {
        // Award armor
        if (typeof addArmorToInventory === "function") {
            addArmorToInventory(reward.armorId);
            showToast(reward.message);
            showFloatingText("🛡️ 新盔甲!", player.x, player.y - 60, "#FFD700");
        }
    }

    // Show special celebration for major milestones
    if (count >= 100) {
        for (let i = 0; i < 20; i++) {
            if (typeof emitGameParticle === "function") {
                emitGameParticle("ember", player.x + Math.random() * player.width, player.y + Math.random() * player.height);
            }
        }
    }
}

function getSpeakPayload(wordObj) {
    return getSpeakSequence(wordObj)[0] || { text: "", lang: "en-US", rate: 1.0 };
}

function getSpeakSequence(wordObj) {
    const mode = getLanguageModeSafe();
    const englishText = normalizeSpeechText(wordObj?.english, wordObj?.en, wordObj?.word);
    const chineseText = normalizeSpeechText(wordObj?.character, wordObj?.zh, wordObj?.chinese);
    const pinyinText = normalizeSpeechText(wordObj?.pinyin, wordObj?.phonetic, wordObj?.romanization);
    const englishRate = clamp(Number(settings.speechEnRate) || 1.0, 0.5, 2.0);
    const chineseRate = clamp(Number(settings.speechZhRate) || 1.0, 0.5, 2.0);
    const sequence = [];

    if (mode === "chinese") {
        if (chineseText) sequence.push({ text: chineseText, lang: "zh-CN", rate: chineseRate });
        if (settings.speechZhEnabled && englishText) sequence.push({ text: englishText, lang: "en-US", rate: englishRate });
        if (!sequence.length && englishText) sequence.push({ text: englishText, lang: "en-US", rate: englishRate });
        return sequence;
    }
    if (mode === "pinyin") {
        if (chineseText) sequence.push({ text: chineseText, lang: "zh-CN", rate: chineseRate });
        if (!sequence.length && englishText) sequence.push({ text: englishText, lang: "en-US", rate: englishRate });
        return sequence;
    }

    if (englishText) sequence.push({ text: englishText, lang: "en-US", rate: englishRate });
    if (settings.speechZhEnabled && chineseText) sequence.push({ text: chineseText, lang: "zh-CN", rate: chineseRate });
    if (!sequence.length && chineseText) sequence.push({ text: chineseText, lang: "zh-CN", rate: chineseRate });
    return sequence;
}

function speakWithProviderSequence(sequence) {
    return sequence.reduce(
        (chain, item) => chain.then(() => _root.MMWG_TTS.speak(item.text, item.lang, { rate: item.rate })),
        Promise.resolve()
    );
}

function speakWord(wordObj) {
    lastWord = wordObj;
    updateWordUI(wordObj);
    bumpWordDisplay();
    showWordCard(wordObj);

    if (!settings.speechEnabled) return;

    const sequence = getSpeakSequence(wordObj);
    if (!sequence.length) return;

    if (_root.MMWG_TTS && typeof _root.MMWG_TTS.speak === "function") {
        speakWithProviderSequence(sequence).catch(() => legacySpeakWord(wordObj, sequence));
        return;
    }

    legacySpeakWord(wordObj, sequence);
}

// ============ M2: Gate Microlearn ============

function triggerGateMicrolearn(fromBiome, toBiome) {
    if (!fromBiome || !toBiome) return { questionShown: false, reason: "Invalid biomes" };
    if (gateMicrolearnState.active) return { questionShown: false, reason: "Already active" };
    if (currentLearningChallenge) return { questionShown: false, reason: "Challenge already active" };

    // Pick a random word from current vocab pack
    const pool = Array.isArray(wordDatabase) ? wordDatabase.filter(w => w?.en) : [];
    if (!pool.length) return { questionShown: false, reason: "No words available" };

    const wordObj = pool[Math.floor(Math.random() * pool.length)];

    // Use the existing translate challenge generator
    const translateHandler = CHALLENGE_TYPES.translate;
    if (!translateHandler) return { questionShown: false, reason: "Translate handler not found" };

    const challenge = translateHandler(wordObj);
    if (!challenge) return { questionShown: false, reason: "Challenge generation failed" };

    gateMicrolearnState.active = true;
    gateMicrolearnState.fromBiome = fromBiome;
    gateMicrolearnState.toBiome = toBiome;
    gateMicrolearnState.questionData = { wordObj, challenge };
    gateMicrolearnState.answered = false;
    gateMicrolearnState.correct = false;
    gateMicrolearnState.shieldGranted = false;

    // Show challenge with 6 second time limit
    currentLearningChallenge = {
        wordObj,
        type: "translate",
        timeLimit: 6,
        ...challenge
    };
    challengeOrigin = { type: "gate_microlearn", fromBiome, toBiome };

    if (typeof pushPause === "function") pushPause();
    else paused = true;
    if (typeof setInputLocked === "function") setInputLocked(true);

    showLearningChallenge(currentLearningChallenge);
    challengeDeadline = Date.now() + (currentLearningChallenge.timeLimit * 1000);
    challengeTimerId = setInterval(() => {
        updateChallengeTimerDisplay();
        if (Date.now() >= challengeDeadline) {
            clearLearningChallengeTimer();
            completeGateMicrolearn(false);
        }
    }, 100);

    return { questionShown: true, wordKey: wordObj.en, fromBiome, toBiome };
}

function completeGateMicrolearn(correct) {
    if (!gateMicrolearnState.active) return { completed: false, reason: "Not active" };
    if (gateMicrolearnState.answered) return { completed: false, reason: "Already answered" };

    gateMicrolearnState.answered = true;
    gateMicrolearnState.correct = correct;

    clearLearningChallengeTimer();

    const wordObj = gateMicrolearnState.questionData?.wordObj;

    // Record learning event
    if (typeof recordLearningEvent === "function" && wordObj) {
        const pair = getWordDisplayPairSafe(wordObj);
        recordLearningEvent({
            source: "challenge",
            wordKey: getWordKeySafe(wordObj),
            themeKey: (typeof activeVocabPackId === "undefined" ? "" : activeVocabPackId) || "",
            result: correct ? "success" : "fail",
            meta: { type: "gate_microlearn", primary: pair.primary, secondary: pair.secondary }
        });
    }

    // Grant shield if correct
    if (correct) {
        if (typeof playerShieldLayers === "undefined") _root.playerShieldLayers = 0;
        playerShieldLayers = (playerShieldLayers || 0) + 1;
        gateMicrolearnState.shieldGranted = true;
        showFloatingText("🛡️ 护盾 +1", player.x, player.y - 40, "#4FC3F7");
        showToast("答对了！获得1层护盾");
    } else {
        showFloatingText("❌ 答错了", player.x, player.y - 40, "#FF5252");
        showToast("答错了，没有护盾");
    }

    // Hide challenge and continue to gate
    setTimeout(() => {
        hideLearningChallenge();
        currentLearningChallenge = null;
        challengeOrigin = null;
        if (typeof popPause === "function") popPause();
        else paused = false;
        if (typeof setInputLocked === "function") setInputLocked(false);

        // Reset state
        gateMicrolearnState.active = false;

        // Continue to biome gate
        if (typeof continueGateAfterMicrolearn === "function") {
            continueGateAfterMicrolearn();
        }
    }, 1500);

    return { completed: true, correct, shieldGranted: gateMicrolearnState.shieldGranted };
}

function answerGateMicrolearn(correct) {
    return completeGateMicrolearn(correct);
}

function getGateMicrolearnState() {
    return {
        active: gateMicrolearnState.active,
        fromBiome: gateMicrolearnState.fromBiome,
        toBiome: gateMicrolearnState.toBiome,
        answered: gateMicrolearnState.answered,
        correct: gateMicrolearnState.correct,
        shieldGranted: gateMicrolearnState.shieldGranted
    };
}

function legacySpeakWord(wordObj, sequence) {
    const speakItems = Array.isArray(sequence) ? sequence.filter(item => item && item.text) : [];
    if (!speakItems.length) return;
    const nativeTts = getNativeTts();
    if (!audioUnlocked && !nativeTts) {
        speechPendingUnlockWord = wordObj;
        return;
    }
    if (nativeTts) {
        const speakAt = index => {
            const item = speakItems[index];
            if (!item) return Promise.resolve(true);
            const promise = speakNativeTts(nativeTts, item.text, item.lang, item.rate);
            if (!promise) return Promise.resolve(false);
            return Promise.resolve(promise)
                .then(() => speakAt(index + 1))
                .catch(() => (index + 1 < speakItems.length ? speakAt(index + 1) : false));
        };
        const speak = () => {
            speakAt(0);
            return true;
        };
        try {
            if (typeof nativeTts.stop === "function") {
                const p = nativeTts.stop();
                if (p && typeof p.finally === "function") {
                    p.finally(speak);
                    return;
                } else {
                    if (speak()) return;
                }
            } else if (speak()) {
                return;
            }
        } catch {
            if (speak()) return;
        }
    }

    // Web Speech is the best offline fallback on browsers (some WebViews return empty voices but can still speak).
    const hasSpeech = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    if (hasSpeech) {
        try {
            ensureSpeechReady();
            // Still listen for voiceschanged so we can pick better voices later, but do not block speaking on it.
            ensureSpeechVoices();

            _root.speechSynthesis.cancel();
            _root.speechSynthesis.resume();

            const utterances = speakItems.map(item => {
                const utterance = new SpeechSynthesisUtterance(item.text);
                utterance.lang = item.lang;
                const voice = pickVoice(String(item.lang || "").toLowerCase().startsWith("zh") ? "zh" : "en");
                if (voice) utterance.voice = voice;
                utterance.rate = typeof item.rate === "number" ? item.rate : 1.0;
                return utterance;
            });
            const speakUtteranceAt = index => {
                const utterance = utterances[index];
                if (!utterance) return;
                utterance.onend = () => speakUtteranceAt(index + 1);
                utterance.onerror = () => speakUtteranceAt(index + 1);
                _root.speechSynthesis.speak(utterance);
            };

            speakUtteranceAt(0);
            return;
        } catch {
            // Fall back to online audio below.
        }
    }

    // Online fallback (may be blocked by autoplay policies until the first user gesture).
    playOnlineTtsSequence(speakItems.map(item => ({ text: item.text, lang: item.lang })));
}


