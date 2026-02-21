/**
 * 12-village-challenges.js - Village-specific quiz flow
 * Uses a dedicated modal and question style to avoid interfering with generic learning challenge DOM.
 */

let villageChallengeSession = null;

function getVillageChallengeModal() {
  let modal = document.getElementById("village-challenge-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "village-challenge-modal";
  modal.className = "village-challenge-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.addEventListener("click", (e) => {
    if (e.target !== modal) return;
    if (!villageChallengeSession) return;
    cancelVillageChallenge(villageChallengeSession, "已退出村庄挑战");
  });
  document.body.appendChild(modal);
  return modal;
}

function showVillageChallengeModal(innerHtml) {
  const modal = getVillageChallengeModal();
  modal.innerHTML = `
    <div class="village-challenge-panel">
      ${innerHtml}
    </div>
  `;
  modal.classList.add("visible");
}

function hideVillageChallengeModal() {
  const modal = document.getElementById("village-challenge-modal");
  if (!modal) return;
  modal.classList.remove("visible");
  modal.innerHTML = "";
}

function isVillageChallengeActive(session) {
  return !!session && !!villageChallengeSession && villageChallengeSession.id === session.id;
}

function restorePauseStateFromSession(session) {
  if (!session) return;
  if (session.prevPaused) {
    paused = true;
    pausedByModal = !!session.prevPausedByModal;
    if (!pausedByModal && typeof setOverlay === "function") setOverlay(true, "pause");
    return;
  }
  paused = false;
  pausedByModal = false;
  if (typeof setOverlay === "function") setOverlay(false);
}

function closeVillageChallengeSession(session, opts = {}) {
  if (!isVillageChallengeActive(session)) return;
  const village = session.village;
  if (village) village._challengeRunning = false;
  hideVillageChallengeModal();
  restorePauseStateFromSession(session);
  villageChallengeSession = null;
  if (opts.callComplete && typeof session.onComplete === "function") {
    session.onComplete(opts.correct || 0, opts.total || 0);
  }
}

function cancelVillageChallenge(session, toastText) {
  if (!isVillageChallengeActive(session)) return;
  if (toastText) showToast(toastText);
  closeVillageChallengeSession(session, { callComplete: false });
}

function beginVillageChallengeSession(village, onComplete) {
  if (!village || villageChallengeSession || village._challengeRunning) return null;
  const session = {
    id: `village_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    village,
    onComplete: typeof onComplete === "function" ? onComplete : null,
    prevPaused: !!paused,
    prevPausedByModal: !!pausedByModal
  };
  villageChallengeSession = session;
  village._challengeRunning = true;
  paused = true;
  pausedByModal = true;
  return session;
}

function resolveVillageChallengeWord(rawWord) {
  let en = "";
  let zh = "";
  let phrase = "";
  let phraseTranslation = "";

  if (typeof rawWord === "string") {
    en = rawWord.trim();
  } else if (rawWord && typeof rawWord === "object") {
    en = String(rawWord.en || rawWord.word || rawWord.english || rawWord.standardized || "").trim();
    zh = String(rawWord.zh || rawWord.chinese || rawWord.translation || "").trim();
    phrase = String(rawWord.phrase || "").trim();
    phraseTranslation = String(rawWord.phraseTranslation || rawWord.phraseZh || "").trim();
  }
  if (!en) return null;

  const needle = en.toLowerCase();
  const fromDb = Array.isArray(wordDatabase)
    ? wordDatabase.find((w) => {
        const dbEn = String(w?.en || w?.word || "").trim().toLowerCase();
        return dbEn === needle;
      })
    : null;

  if (fromDb) {
    if (!zh) zh = String(fromDb.zh || fromDb.chinese || fromDb.translation || "").trim();
    if (!phrase) phrase = String(fromDb.phrase || "").trim();
    if (!phraseTranslation) phraseTranslation = String(fromDb.phraseTranslation || fromDb.phraseZh || "").trim();
  }

  return { en, zh, phrase, phraseTranslation };
}

function getVillageQuestionCount() {
  if (typeof getVillageConfig === "function") {
    const cfg = getVillageConfig();
    return Math.max(1, Number(cfg?.challengeQuestionCount) || 10);
  }
  return Math.max(1, Number(villageConfig?.challengeQuestionCount) || 10);
}

function getVillageRewardConfig() {
  if (typeof getVillageConfig === "function") {
    return getVillageConfig()?.challengeReward || {};
  }
  return villageConfig?.challengeReward || {};
}

function buildVillageChallengeWords(village, questionCount) {
  const biomeWords = typeof getVillageWords === "function" ? getVillageWords(village.biomeId) : [];
  const normalized = Array.isArray(biomeWords)
    ? biomeWords.map(resolveVillageChallengeWord).filter((w) => !!w && !!String(w.en || "").trim())
    : [];

  const fallback = Array.isArray(wordDatabase)
    ? wordDatabase.map(resolveVillageChallengeWord).filter((w) => !!w && !!String(w.en || "").trim())
    : [];

  const pool = normalized.length ? normalized : fallback;
  if (!pool.length) return [];

  const selected = [];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  let idx = 0;
  while (selected.length < questionCount) {
    if (idx >= shuffledPool.length) {
      idx = 0;
      shuffledPool.sort(() => Math.random() - 0.5);
    }
    selected.push(shuffledPool[idx]);
    idx++;
  }
  return selected;
}

function buildVillageZhOptions(correctWord, wordsPool) {
  const correct = String(correctWord?.zh || "").trim() || String(correctWord?.en || "").trim();
  const distractorPool = (Array.isArray(wordsPool) ? wordsPool : [])
    .map((w) => String(w?.zh || "").trim())
    .filter((zh) => zh && zh !== correct);

  const unique = [...new Set(distractorPool)].sort(() => Math.random() - 0.5).slice(0, 3);
  while (unique.length < 3) {
    unique.push(`干扰项${unique.length + 1}`);
  }

  return [{ text: correct, value: correct, correct: true }, ...unique.map((text) => ({ text, value: text, correct: false }))]
    .sort(() => Math.random() - 0.5);
}

function startVillageChallenge(village, onComplete) {
  if (!village) {
    console.warn("[Village Challenge] No village provided");
    return;
  }
  if (currentLearningChallenge) {
    showToast("学习挑战进行中，请稍后再试");
    return;
  }

  const session = beginVillageChallengeSession(village, onComplete);
  if (!session) {
    showToast("村庄挑战进行中");
    return;
  }

  const questionCount = getVillageQuestionCount();
  const selectedWords = buildVillageChallengeWords(village, questionCount);
  if (!selectedWords.length) {
    showToast("当前群系暂无可用单词");
    closeVillageChallengeSession(session, { callComplete: false });
    return;
  }

  const progress = {
    currentQuestion: 0,
    correctCount: 0,
    wordsSeen: [],
    currentWord: null,
    roundDiamonds: 0,
    hintUsedCurrent: false
  };
  village.challengeProgress = progress;

  showVillageChallengeIntro(session, village.biomeId, selectedWords.length, () => {
    if (!isVillageChallengeActive(session)) return;

    function handleAnswer(isCorrect) {
      if (!isVillageChallengeActive(session)) return;
      if (isCorrect) {
        progress.correctCount++;
        inventory.diamond = (Number(inventory?.diamond) || 0) + 1;
        progress.roundDiamonds += 1;
        if (typeof updateInventoryUI === "function") updateInventoryUI();
        showFloatingText("💎 +1", player?.x || 120, (player?.y || 120) - 30, "#FFD54F");
      }
      progress.currentQuestion++;
      if (progress.currentWord?.en && !progress.wordsSeen.includes(progress.currentWord.en)) {
        progress.wordsSeen.push(progress.currentWord.en);
      }

      if (progress.currentQuestion >= selectedWords.length) {
        finishVillageChallenge(session, village, progress.correctCount, selectedWords.length, progress.roundDiamonds);
      } else {
        setTimeout(() => {
          if (!isVillageChallengeActive(session)) return;
          showVillageQuestion(session, selectedWords, progress, handleAnswer);
        }, 280);
      }
    }

    showVillageQuestion(session, selectedWords, progress, handleAnswer);
  });
}

function showVillageChallengeIntro(session, biomeId, count, onStart) {
  if (!isVillageChallengeActive(session)) return;
  const biomeName = typeof getBiomeName === "function" ? getBiomeName(biomeId) : biomeId;
  showVillageChallengeModal(`
    <div class="village-challenge-intro">
      <div class="village-challenge-emoji">📚</div>
      <h3 class="village-challenge-title">${biomeName}村庄 · 单词挑战</h3>
      <p class="village-challenge-subtitle">共 ${count} 题，题型：英文词义选择</p>
      <p class="village-challenge-tip">每题答对奖励：💎 x1</p>
      <div class="village-challenge-actions">
        <button id="btn-village-challenge-start" class="game-btn">开始挑战</button>
        <button id="btn-village-challenge-cancel" class="game-btn village-btn-muted">退出</button>
      </div>
    </div>
  `);

  const modal = getVillageChallengeModal();
  modal.querySelector("#btn-village-challenge-start")?.addEventListener("click", () => {
    if (!isVillageChallengeActive(session)) return;
    if (typeof onStart === "function") onStart();
  });

  modal.querySelector("#btn-village-challenge-cancel")?.addEventListener("click", () => {
    cancelVillageChallenge(session, "已退出村庄挑战");
  });
}

function showVillageQuestion(session, words, progress, onAnswer) {
  if (!isVillageChallengeActive(session)) return;

  const word = words[progress.currentQuestion];
  if (!word) {
    finishVillageChallenge(session, session.village, progress.correctCount, progress.currentQuestion, progress.roundDiamonds);
    return;
  }
  progress.currentWord = word;
  progress.hintUsedCurrent = false;

  const questionEn = String(word.en || "").trim();
  const options = buildVillageZhOptions(word, words);

  showVillageChallengeModal(`
    <div class="village-question-wrap">
      <p class="village-question-progress">第 ${progress.currentQuestion + 1} / ${words.length} 题</p>
      <div class="village-question-word">${questionEn}</div>
      <p class="village-question-hint">请选择对应的中文含义</p>
      <div class="village-question-controls">
        <button id="btn-village-question-hint" class="game-btn game-btn-small">提示</button>
        <button id="btn-village-challenge-exit" class="game-btn game-btn-small village-btn-muted">退出挑战</button>
      </div>
      <div id="village-challenge-options" class="village-options-grid">
        ${options.map((opt) => `
          <button class="village-opt-btn" data-correct="${opt.correct ? "1" : "0"}">${opt.text}</button>
        `).join("")}
      </div>
    </div>
  `);

  const modal = getVillageChallengeModal();
  modal.querySelector("#btn-village-challenge-exit")?.addEventListener("click", () => {
    cancelVillageChallenge(session, "已退出村庄挑战");
  });

  const btnHint = modal.querySelector("#btn-village-question-hint");
  const optionButtons = Array.from(modal.querySelectorAll(".village-opt-btn"));

  btnHint?.addEventListener("click", () => {
    if (!isVillageChallengeActive(session) || progress.hintUsedCurrent) return;
    progress.hintUsedCurrent = true;
    const wrongButtons = optionButtons.filter((b) => b.dataset.correct !== "1");
    wrongButtons.sort(() => Math.random() - 0.5).slice(0, 2).forEach((b) => {
      b.disabled = true;
      b.classList.add("hint-removed");
    });
    if (btnHint) btnHint.disabled = true;
  });

  optionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isVillageChallengeActive(session)) return;
      const isCorrect = btn.dataset.correct === "1";

      optionButtons.forEach((b) => {
        b.disabled = true;
        if (b.dataset.correct === "1") b.classList.add("correct");
      });
      if (!isCorrect) btn.classList.add("wrong");

      if (typeof speakWord === "function") {
        speakWord({
          en: word.en,
          zh: word.zh,
          phrase: word.phrase,
          phraseZh: word.phraseTranslation,
          phraseTranslation: word.phraseTranslation
        });
      }

      setTimeout(() => {
        if (!isVillageChallengeActive(session)) return;
        showFloatingText(isCorrect ? "✅ 正确" : "❌ 错误", player?.x || 120, (player?.y || 120) - 30);
        setTimeout(() => {
          if (!isVillageChallengeActive(session)) return;
          if (typeof onAnswer === "function") onAnswer(isCorrect);
        }, 420);
      }, 200);
    });
  });
}

function finishVillageChallenge(session, village, correct, total, diamondsEarned) {
  if (!isVillageChallengeActive(session)) return;

  const reward = getVillageRewardConfig();
  const isPerfect = correct === total;
  const scoreReward = isPerfect ? (reward.perfect?.score || 100) : (reward.partial?.score || 50);

  showVillageChallengeModal(`
    <div class="village-challenge-result">
      <div class="village-challenge-emoji">${isPerfect ? "🏆" : "📖"}</div>
      <h3 class="village-challenge-title">${isPerfect ? "完美通关" : "挑战完成"}</h3>
      <p class="village-challenge-subtitle">正确 ${correct} / ${total}</p>
      <p class="village-challenge-tip">本局奖励：💎 ${diamondsEarned}，积分 +${scoreReward}</p>
      <div class="village-challenge-actions">
        <button id="btn-village-challenge-done" class="game-btn">继续冒险</button>
      </div>
    </div>
  `);

  const modal = getVillageChallengeModal();
  modal.querySelector("#btn-village-challenge-done")?.addEventListener("click", () => {
    if (!isVillageChallengeActive(session)) return;

    score += scoreReward;
    if (typeof updateInventoryUI === "function") updateInventoryUI();
    if (typeof grantBiomeReward === "function") grantBiomeReward(village.biomeId);

    closeVillageChallengeSession(session, {
      callComplete: true,
      correct,
      total
    });
  });
}
