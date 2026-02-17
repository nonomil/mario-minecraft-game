/**
 * 12-challenges.js - 单词收集与学习挑战
 * 从 main.js 拆分 (原始行 3401-3817)
 */
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
    const en = document.getElementById("word-card-en");
    const zh = document.getElementById("word-card-zh");
    const phrase = document.getElementById("word-card-phrase");
    if (en) en.innerText = wordObj.en;
    if (zh) zh.innerText = wordObj.zh;
    if (phrase) {
        const phraseText = String(wordObj?.phrase || "").trim();
        const phraseZh = String(wordObj?.phraseZh || "").trim();
        if (phraseText) {
            phrase.innerText = phraseZh ? `${phraseText} · ${phraseZh}` : phraseText;
            phrase.style.display = "block";
        } else {
            phrase.innerText = "";
            phrase.style.display = "none";
        }
    }
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
    const options = [missing];
    while (options.length < 4) {
        const fake = positions.map(() => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]).join("");
        if (!options.includes(fake)) options.push(fake);
    }

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="challenge-fill-word">${display}</div>` +
            `<div class="challenge-fill-hint">填入缺少的 ${positions.length} 个字母</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
            `</div>`,
        options: shuffle(options).map(opt => ({ text: opt, value: opt, correct: opt === missing })),
        answer: missing
    };
}

function generateScrambleDistractors(en, count) {
    const out = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = shuffle(pool.filter(w => w?.en && w.en.toLowerCase() !== en && Math.abs(w.en.length - en.length) <= 2));
    for (const c of candidates) {
        if (out.length >= count) break;
        const v = String(c.en || "").toLowerCase();
        if (!out.some(x => x.value === v)) out.push({ text: v, value: v, correct: false });
    }
    while (out.length < count) {
        const fake = shuffle(en.split("")).join("");
        if (fake !== en && !out.some(x => x.value === fake)) out.push({ text: fake, value: fake, correct: false });
    }
    return out;
}

function generatePhraseUnscrambleDistractors(correctPhrase, count) {
    const out = [];
    const pool = Array.isArray(wordDatabase) ? wordDatabase : [];
    const candidates = shuffle(
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
        const fakeTokens = shuffle([...tokens]);
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
    const enRaw = String(wordObj?.en || "").toLowerCase().trim();
    const isPhrase = /\s+/.test(enRaw);

    if (isPhrase) {
        const tokens = enRaw.split(/\s+/).filter(Boolean);
        if (tokens.length < 2) return generateFillBlankChallenge(wordObj);
        let scrambledTokens = shuffle([...tokens]);
        let tries = 0;
        while (scrambledTokens.join(" ") === enRaw && tries < 8) {
            scrambledTokens = shuffle([...tokens]);
            tries++;
        }
        return {
            mode: "fill_blank",
            questionHtml:
                `<div class="challenge-fill">` +
                `<div class="challenge-fill-word phrase" style="color:#FFD54F;">${scrambledTokens.join(" ")}</div>` +
                `<div class="challenge-fill-hint">重新排列单词顺序，拼出正确词组</div>` +
                `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
                `</div>`,
            options: shuffle([
                { text: enRaw, value: enRaw, correct: true },
                ...generatePhraseUnscrambleDistractors(enRaw, 3)
            ]),
            answer: enRaw
        };
    }

    const en = enRaw.replace(/[^a-z]/g, "");
    if (en.length < 3) return generateFillBlankChallenge(wordObj);

    let scrambled = shuffle(en.split(""));
    let tries = 0;
    while (scrambled.join("") === en && tries < 8) {
        scrambled = shuffle(en.split(""));
        tries++;
    }

    return {
        mode: "fill_blank",
        questionHtml:
            `<div class="challenge-fill">` +
            `<div class="challenge-fill-word" style="letter-spacing:8px;color:#FFD54F;">${scrambled.join(" ")}</div>` +
            `<div class="challenge-fill-hint">重新排列字母，拼出正确单词</div>` +
            `<div class="challenge-fill-zh">${wordObj?.zh || wordObj?.en || ""}</div>` +
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
                // P1-5: 自适应字体缩放
                const len = option.text.length;
                if (len > 20) btn.style.fontSize = '10px';
                else if (len > 15) btn.style.fontSize = '12px';
                else if (len > 10) btn.style.fontSize = '14px';
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
    if (!challengeQuestionEl || !wordObj) return;
    const existing = challengeQuestionEl.querySelector(".challenge-correction");
    if (existing) existing.remove();
    const correctionDiv = document.createElement("div");
    correctionDiv.className = "challenge-correction";
    correctionDiv.style.marginTop = "12px";
    correctionDiv.style.padding = "8px";
    correctionDiv.style.borderRadius = "8px";
    correctionDiv.style.background = "rgba(76,175,80,0.2)";

    const en = String(wordObj.en || "").trim();
    const zh = String(wordObj.zh || "").trim();
    const phrase = String(wordObj.phrase || "").trim();
    const phraseZh = String(wordObj.phraseZh || "").trim();

    correctionDiv.innerHTML =
        `<div style="color:#4CAF50;font-size:14px;">正确答案</div>` +
        `<div style="color:#FFF;font-size:18px;font-weight:bold;margin-top:4px;">${en}${zh ? ` = ${zh}` : ""}</div>` +
        (phrase ? `<div style="color:#FFD54F;font-size:12px;margin-top:4px;">${phrase}${phraseZh ? ` · ${phraseZh}` : ""}</div>` : "");
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
    const timeLimit = LEARNING_CONFIG.challenge.timeLimit || 10000;
    const elapsed = Math.max(0, timeLimit - Math.max(0, challengeDeadline - Date.now()));
    if (correct) {
        if (wordPicker && typeof wordPicker.updateWordQuality === "function" && wordObj?.en) {
            wordPicker.updateWordQuality(wordObj.en, elapsed < 3000 ? "correct_fast" : "correct_slow");
        }
        hideLearningChallenge();
        addScore(reward.correct.score);
        inventory.diamond = (inventory.diamond || 0) + (reward.correct.diamond || 0);
        updateInventoryUI();
        showFloatingText("🎉 挑战成功", player.x, player.y - 40);
        if (challengeOrigin && challengeOrigin instanceof WordGate) {
            challengeOrigin.locked = false;
            challengeOrigin.remove = true;
            showToast("💠 词语闸门已解锁！");
        }
        paused = challengePausedBefore;
        currentLearningChallenge = null;
        challengeOrigin = null;
    } else {
        if (wordPicker && typeof wordPicker.updateWordQuality === "function" && wordObj?.en) {
            wordPicker.updateWordQuality(wordObj.en, "wrong");
        }
        if (settings.learningMode) {
            const retryWord = wordObj;
            const resumePausedState = challengePausedBefore;
            const savedOrigin = challengeOrigin;
            showChallengeCorrection(retryWord);
            showFloatingText("📕 再试一次", player.x, player.y - 40);
            setTimeout(() => {
                hideLearningChallenge();
                currentLearningChallenge = null;
                challengeOrigin = null;
                paused = resumePausedState;
                startLearningChallenge(retryWord, null, savedOrigin);
            }, 2500);
            return;
        }
        addScore(-reward.wrong.scorePenalty);
        showFloatingText("❌ 挑战失败", player.x, player.y - 40);
        if (challengeOrigin && challengeOrigin instanceof WordGate) {
            challengeOrigin.cooldown = 180;
        }
        showChallengeCorrection(wordObj);
        setTimeout(() => {
            hideLearningChallenge();
            paused = challengePausedBefore;
            currentLearningChallenge = null;
            challengeOrigin = null;
        }, 2000);
        return;
    }
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
            // 先说英文，英文结束后再说中文
            if (enText) {
                const enPromise = speakNativeTts(nativeTts, enText, "en-US", enRate);
                if (enPromise && zhText) {
                    enPromise.then(() => {
                        speakNativeTts(nativeTts, zhText, "zh-CN", zhRate);
                    }).catch(() => {
                        // 英文失败也尝试说中文
                        speakNativeTts(nativeTts, zhText, "zh-CN", zhRate);
                    });
                    return true;
                } else if (enPromise) {
                    return true;
                }
            }
            if (zhText) {
                return !!speakNativeTts(nativeTts, zhText, "zh-CN", zhRate);
            }
            return false;
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

