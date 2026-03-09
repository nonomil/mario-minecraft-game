/**
 * 12-challenges.js - 单词收集与学习挑战
 * 从 main.js 拆分 (原始行 3401-3817)
 */
function dropItem(type, x, y) {
    if (!inventory[type] && inventory[type] !== 0) inventory[type] = 0;
    inventory[type]++;
    updateInventoryUI();
    const icon = ITEM_ICONS[type] || "+";
    showFloatingText(`${icon} +1`, x, y);
}

function bumpWordDisplay() {
    const el = document.getElementById("word-display");
    if (!el) return;
    el.style.transform = "scale(1.15)";
    setTimeout(() => { el.style.transform = "scale(1)"; }, 160);
}

let challengeStartedAt = 0;

function showWordCard(wordObj) {
    const card = document.getElementById("word-card");
    if (!card) return;
    const en = document.getElementById("word-card-en");
    const zh = document.getElementById("word-card-zh");
    const phraseEl = document.getElementById("word-card-phrase");
    if (en) en.innerText = wordObj.en;
    if (zh) zh.innerText = wordObj.zh;
    if (phraseEl) {
        if (wordObj.phrase) {
            phraseEl.innerText = wordObj.phrase;
            phraseEl.style.display = "block";
        } else {
            phraseEl.style.display = "none";
        }
    }
    updateWordImage(wordObj);
    card.classList.add("visible");
    card.setAttribute("aria-hidden", "false");
    setTimeout(() => {
        card.classList.remove("visible");
        card.setAttribute("aria-hidden", "true");
    }, settings.wordCardDuration || 900);
}

function recordWordProgress(wordObj) {
    if (!wordObj || !wordObj.en) return;
    const en = String(wordObj.en);
    sessionWordCounts[en] = (sessionWordCounts[en] || 0) + 1;

    if (!activeVocabPackId) return;
    const pr = getPackProgress(activeVocabPackId);
    if (!pr.total) pr.total = Array.isArray(wordDatabase) ? wordDatabase.length : 0;
    if (!pr.unique[en]) {
        pr.unique[en] = 1;
        pr.uniqueCount = (pr.uniqueCount || 0) + 1;
        onWordCollected(wordObj);
        if (pr.total && pr.uniqueCount >= pr.total) {
            pr.completed = true;
            saveProgress();
            updateVocabProgressUI();
            const pack = vocabPacks[activeVocabPackId];
            showToast(`${pack?.title || activeVocabPackId} 已完成，切换下一个词库`);
            switchToNextPackInOrder();
            return;
        }
        saveProgress();
        updateVocabProgressUI();
    }
}

function registerCollectedWord(wordObj) {
    if (!wordObj || !wordObj.en) return;
    sessionCollectedWords.push(wordObj);
}

function getUniqueSessionWords() {
    const seen = new Set();
    return sessionCollectedWords.filter(w => {
        if (!w || !w.en) return false;
        if (seen.has(w.en)) return false;
        seen.add(w.en);
        return true;
    });
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
    const enRaw = String(wordObj?.en || "").toLowerCase();
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
            `<div class="challenge-fill-word">${wordDisplay}</div>` +
            `<div class="challenge-fill-hint">缺少哪个字母？</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffle(options).map(letter => ({ text: letter, value: letter, correct: letter === missingLetter })),
        answer: missingLetter
    };
}

function generateMultiBlankChallenge(wordObj) {
    const enRaw = String(wordObj?.en || "").toLowerCase();
    const en = enRaw.replace(/[^a-z]/g, "");
    if (en.length < 4) return generateFillBlankChallenge(wordObj);
    const blankCount = Math.min(2, Math.floor(en.length / 3));
    const positions = [];
    const available = [];
    for (let i = 1; i < en.length - 1; i++) available.push(i);
    for (let b = 0; b < blankCount && available.length > 0; b++) {
        const idx = Math.floor(Math.random() * available.length);
        const pos = available[idx];
        positions.push(pos);
        available.splice(idx, 1);
        const adjPrev = available.indexOf(pos - 1);
        if (adjPrev >= 0) available.splice(adjPrev, 1);
        const adjNext = available.indexOf(pos + 1);
        if (adjNext >= 0) available.splice(adjNext, 1);
    }
    positions.sort((a, b) => a - b);
    const missingLetters = positions.map(i => en[i]);
    const wordDisplay = en.split("").map((ch, i) => (positions.includes(i) ? "_" : ch)).join(" ");
    const correctAnswer = missingLetters.join("");
    const options = [correctAnswer];
    while (options.length < 4) {
        const fake = missingLetters.map(() => {
            const all = "abcdefghijklmnopqrstuvwxyz";
            return all[Math.floor(Math.random() * all.length)];
        }).join("");
        if (!options.includes(fake)) options.push(fake);
    }
    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="challenge-fill-word">${wordDisplay}</div>` +
            `<div class="challenge-fill-hint">填入缺少的${blankCount}个字母</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || ""}</div>` +
            `</div>`,
        options: shuffle(options).map(opt => ({ text: opt, value: opt, correct: opt === correctAnswer })),
        answer: correctAnswer
    };
}

function generateScrambleDistractors(en, count) {
    const distractors = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = pool.filter(w => w.en && w.en !== en && Math.abs(w.en.length - en.length) <= 2);
    const picked = shuffle(candidates).slice(0, count);
    picked.forEach(w => {
        distractors.push({ text: w.en.toLowerCase(), value: w.en.toLowerCase(), correct: false });
    });
    while (distractors.length < count) {
        const fake = shuffle(en.split("")).join("");
        if (fake !== en && !distractors.find(d => d.text === fake)) {
            distractors.push({ text: fake, value: fake, correct: false });
        }
    }
    return distractors;
}

function generateUnscrambleChallenge(wordObj) {
    const enRaw = String(wordObj?.en || "").toLowerCase();
    const en = enRaw.replace(/[^a-z]/g, "");
    if (en.length < 3) return generateFillBlankChallenge(wordObj);
    let scrambled = shuffle(en.split(""));
    let tries = 0;
    while (scrambled.join("") === en && tries < 10) {
        scrambled = shuffle(en.split(""));
        tries++;
    }
    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="challenge-fill-word" style="letter-spacing:8px; color:#FFD54F;">${scrambled.join(" ")}</div>` +
            `<div class="challenge-fill-hint">重新排列字母，拼出正确单词</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || ""}</div>` +
            `</div>`,
        options: shuffle([
            { text: en, value: en, correct: true },
            ...generateScrambleDistractors(en, 3)
        ]),
        answer: en
    };
}

const CHALLENGE_TYPES = {
    translate(wordObj) {
        const options = generateChallengeOptions(wordObj, "zh", LEARNING_CONFIG.challenge.baseOptions);
        return {
            mode: "options",
            question: `Translate "${wordObj.en}"`,
            options,
            answer: wordObj.zh || wordObj.en
        };
    },
    listen(wordObj) {
        const options = generateChallengeOptions(wordObj, "en", LEARNING_CONFIG.challenge.baseOptions);
        return {
            mode: "options",
            question: "听音选择正确的单词",
            options,
            answer: wordObj.en
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
    }
};

const CHALLENGE_TYPE_KEYS = ["translate", "listen", "fill_blank", "multi_blank", "unscramble"];

function generateChallengeOptions(wordObj, key, count) {
    const distinct = pickDistinctWords(wordObj, count);
    const baseValue = key === "zh" ? wordObj.zh || wordObj.en : wordObj.en;
    const options = [{ text: baseValue, value: baseValue, correct: true }];
    distinct.forEach(entry => {
        const value = key === "zh" ? entry.zh || entry.en : entry.en || entry.zh;
        if (!value) return;
        options.push({ text: value, value, correct: false });
    });
    return shuffle(options).slice(0, Math.max(2, options.length));
}

function pickDistinctWords(wordObj, count) {
    if (!Array.isArray(wordDatabase) || !wordDatabase.length) return [];
    const pool = wordDatabase.filter(w => w && w.en && w.en !== wordObj.en);
    return shuffle(pool).slice(0, Math.max(0, count));
}

function shouldTriggerLearningChallenge(wordObj) {
    if (!settings.learningMode) return false;
    if (!settings.challengeEnabled || currentLearningChallenge) return false;
    if (!wordObj || !wordObj.en) return false;
    const freq = Number(settings.challengeFrequency ?? 0.3);
    if (Math.random() >= Math.max(0.1, Math.min(0.9, freq))) return false;
    return true;
}

function maybeTriggerLearningChallenge(wordObj) {
    if (!wordObj || !wordObj.en) return;
    registerCollectedWord(wordObj);

    // === v1.6.1 新增：如果宝箱学习已开启，不再随机弹出 Challenge ===
    // 避免双重打断心流，保留 WordGate 触发不受影响
    if (settings.chestLearningEnabled) {
        return;
    }
    // === v1.6.1 结束 ===

    if (!shouldTriggerLearningChallenge(wordObj)) return;
    startLearningChallenge(wordObj);
}

function pickChallengeType(forced) {
    if (forced && CHALLENGE_TYPES[forced]) return forced;
    return CHALLENGE_TYPE_KEYS[Math.floor(Math.random() * CHALLENGE_TYPE_KEYS.length)];
}

function startLearningChallenge(wordObj, forcedType, origin) {
    const type = pickChallengeType(forcedType);
    const handler = CHALLENGE_TYPES[type];
    if (!handler) return;
    const payload = handler(wordObj);
    if (!payload) return;
    payload.type = type;
    payload.wordObj = wordObj;
    currentLearningChallenge = payload;
    challengeOrigin = origin || null;
    challengePausedBefore = paused;
    paused = true;
    challengeStartedAt = Date.now();
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
    if (challengeModalEl) challengeModalEl.classList.remove("visible");
    if (challengeInputEl) challengeInputEl.value = "";
}

function showChallengeCorrection(wordObj) {
    if (!wordObj || !challengeQuestionEl) return;
    const existed = challengeQuestionEl.querySelector(".challenge-correction");
    if (existed) existed.remove();
    const correctionDiv = document.createElement("div");
    correctionDiv.className = "challenge-correction";
    correctionDiv.innerHTML =
        `<div style="margin-top:12px; padding:8px; background:rgba(76,175,80,0.2); border-radius:8px;">` +
        `<div style="color:#4CAF50; font-size:14px;">正确答案:</div>` +
        `<div style="color:#FFF; font-size:18px; font-weight:bold; margin-top:4px;">${wordObj.en} = ${wordObj.zh || ""}</div>` +
        (wordObj.phrase ? `<div style="color:#FFD54F; font-size:12px; margin-top:4px;">${wordObj.phrase}</div>` : "") +
        `</div>`;
    challengeQuestionEl.appendChild(correctionDiv);
    if (challengeOptionsEl) {
        challengeOptionsEl.querySelectorAll("button").forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        });
    }
    if (typeof speakWord === "function") speakWord(wordObj);
}

function completeLearningChallenge(correct) {
    if (!currentLearningChallenge) return;
    clearLearningChallengeTimer();
    const reward = LEARNING_CONFIG.challenge.rewards;
    const wordObj = currentLearningChallenge.wordObj;

    // === 新增：记录答题统计 (v1.6.0) ===
    const wordEn = currentLearningChallenge?.wordObj?.en;
    if (wordEn) {
        if (!progress.challengeStats) progress.challengeStats = {};
        const stat = progress.challengeStats[wordEn] || {
            correct: 0,
            wrong: 0,
            lastSeen: 0
        };

        if (correct) {
            stat.correct++;
        } else {
            stat.wrong++;
        }
        stat.lastSeen = Date.now();

        progress.challengeStats[wordEn] = stat;
        saveProgress();
    }
    // === 记录结束 ===

    // === v1.6.3 新增：处理复习来源（必须在 paused 恢复之前） ===
    if (challengeOrigin && challengeOrigin._isReview) {
        // 记录复习结果
        reviewResults.push({
            word: currentLearningChallenge.wordObj.en,
            correct: correct
        });

        // 移到下一个单词
        reviewIndex++;

        // 清理状态
        currentLearningChallenge = null;
        challengeOrigin = null;
        hideLearningChallenge();

        // 短暂延迟后显示下一个（不恢复 paused）
        setTimeout(() => showReviewWord(), 600);

        return;  // 提前返回，不执行后面的逻辑
    }
    // === v1.6.3 复习处理结束 ===

    if (correct) {
        addScore(reward.correct.score);
        inventory.diamond = (inventory.diamond || 0) + (reward.correct.diamond || 0);
        updateInventoryUI();
        showFloatingText("🎉 挑战成功", player.x, player.y - 40);

        // === WordGate 分支 ===
        if (challengeOrigin && challengeOrigin instanceof WordGate) {
            challengeOrigin.locked = false;
            challengeOrigin.remove = true;
            showToast("💠 词语闸门已解锁！");
        }

        // === v1.6.1 新增：Chest 分支 ===
        if (challengeOrigin && challengeOrigin instanceof Chest) {
            // 答对：标记提升稀有度
            challengeOrigin._rarityBoost = true;
            challengeOrigin.open();
            showToast("🎁 答对了！宝箱奖励升级！", 2000);
        }
        // === v1.6.1 结束 ===

    } else {
        addScore(-reward.wrong.scorePenalty);
        showFloatingText("❌ 挑战失败", player.x, player.y - 40);

        // === WordGate 分支 ===
        if (challengeOrigin && challengeOrigin instanceof WordGate) {
            challengeOrigin.cooldown = 180;
        }

        // === v1.6.1 新增：Chest 分支 ===
        if (challengeOrigin && challengeOrigin instanceof Chest) {
            // 答错也开箱，只是不提升稀有度
            challengeOrigin.open();
            showToast("💼 答错了，但还是可以开箱", 2000);
        }
        // === v1.6.1 结束 ===
    }
    paused = challengePausedBefore;
    currentLearningChallenge = null;
    challengeOrigin = null;
}

function triggerWordGateChallenge(gate) {
    if (!gate || !gate.wordObj || gate.locked === false) return;
    if (currentLearningChallenge) return;
    startLearningChallenge(gate.wordObj, "fill_blank", gate);
    gate.cooldown = 60;
}

function updateWordUI(wordObj) {
    const el = document.getElementById("word-display");
    if (!el) return;
    el.innerText = wordObj ? [wordObj.en, wordObj.zh].filter(Boolean).join(" ") : "Start!";
}

function speakWord(wordObj) {
    lastWord = wordObj;
    updateWordUI(wordObj);
    bumpWordDisplay();
    showWordCard(wordObj);

    if (!settings.speechEnabled) return;
    const enText = normalizeSpeechText(wordObj?.en, wordObj?.word);
    const zhText = settings.speechZhEnabled ? normalizeSpeechText(wordObj?.zh, "") : "";
    if (!enText && !zhText) return;

    const nativeTts = getNativeTts();
    if (!audioUnlocked && !nativeTts) {
        speechPendingUnlockWord = wordObj;
        return;
    }
    if (nativeTts) {
        const speak = () => {
            const enRate = clamp(Number(settings.speechEnRate) || 1.0, 0.5, 2.0);
            const zhRate = clamp(Number(settings.speechZhRate) || 1.0, 0.5, 2.0);
            let ok = false;
            if (enText) {
                ok = speakNativeTts(nativeTts, enText, "en-US", enRate, "QUEUE_FLUSH") || ok;
            }
            if (zhText) {
                ok = speakNativeTts(nativeTts, zhText, "zh-CN", zhRate, "QUEUE_ADD") || ok;
            }
            return ok || false;
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

            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();

            if (!enText && zhText) {
                const onlyZh = new SpeechSynthesisUtterance(zhText);
                onlyZh.lang = "zh-CN";
                const zhVoice = pickVoice("zh");
                if (zhVoice) onlyZh.voice = zhVoice;
                onlyZh.rate = clamp(Number(settings.speechZhRate) || 0.9, 0.5, 2.0);
                window.speechSynthesis.speak(onlyZh);
                return;
            }

            const uEn = new SpeechSynthesisUtterance(enText);
            uEn.lang = "en-US";
            const enVoice = pickVoice("en");
            if (enVoice) uEn.voice = enVoice;
            uEn.rate = clamp(Number(settings.speechEnRate) || 1.0, 0.5, 2.0);

            if (zhText) {
                const uZh = new SpeechSynthesisUtterance(zhText);
                uZh.lang = "zh-CN";
                const zhVoice = pickVoice("zh");
                if (zhVoice) uZh.voice = zhVoice;
                uZh.rate = clamp(Number(settings.speechZhRate) || 0.9, 0.5, 2.0);
                uEn.onend = () => {
                    try { window.speechSynthesis.speak(uZh); } catch {}
                };
            }

            window.speechSynthesis.speak(uEn);
            return;
        } catch {
            // Fall back to online audio below.
        }
    }

    // Online fallback (may be blocked by autoplay policies until the first user gesture).
    playOnlineTtsSequence([
        enText ? { text: enText, lang: "en" } : null,
        zhText ? { text: zhText, lang: "zh-CN" } : null
    ]);
}

// ==================== v1.6.3 复习系统 ====================

// 复习系统全局状态
let reviewActive = false;
let reviewWords = [];
let reviewIndex = 0;
let reviewResults = [];

/**
 * 检查并启动复习流程
 */
function maybeShowReview() {
    // 安全检查：不与其他系统冲突
    if (reviewActive || currentLearningChallenge || paused) return;

    // 获取需要复习的单词
    const words = getWordsForReview(3);
    if (words.length === 0) return;

    // 初始化复习状态
    reviewActive = true;
    reviewWords = words;
    reviewIndex = 0;
    reviewResults = [];
    paused = true;

    showToast("📚 快速复习！", 1000);
    setTimeout(() => showReviewWord(), 500);
}

/**
 * 显示当前复习单词
 */
function showReviewWord() {
    if (reviewIndex >= reviewWords.length) {
        finishReview();
        return;
    }

    const wordObj = reviewWords[reviewIndex];

    // 复用现有的 Challenge 系统来显示题目
    // origin 传入特殊标记对象
    startLearningChallenge(wordObj, "translate", {
        _isReview: true,
        _reviewIndex: reviewIndex
    });
}

/**
 * 完成复习流程，显示结果和奖励
 */
function finishReview() {
    reviewActive = false;

    const correct = reviewResults.filter(r => r.correct).length;
    const total = reviewResults.length;

    // 更新统计（已在 completeLearningChallenge 中记录）

    // 计算奖励
    addScore(correct * 30);

    if (correct === total && total > 0) {
        // 全对奖励
        inventory.diamond = (inventory.diamond || 0) + 1;
        updateInventoryUI();
        showToast(`📚 复习完成！全对！+${correct * 30}分 +1💎`, 2500);
    } else {
        showToast(`📚 复习完成！${correct}/${total} +${correct * 30}分`, 2000);
    }

    // 恢复游戏状态
    paused = false;
}

