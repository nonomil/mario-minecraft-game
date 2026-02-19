/**
 * 12-village-challenges.js - Village-specific quiz flow
 * Uses a dedicated modal to avoid interfering with generic learning challenge DOM.
 */

let villageChallengeSession = null;

function getVillageChallengeModal() {
  let modal = document.getElementById("village-challenge-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "village-challenge-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "background:rgba(0,0,0,0.55)",
    "z-index:1400",
    "padding:16px"
  ].join(";");
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
    <div style="width:min(92vw,680px);max-height:86vh;overflow:auto;background:#202832;border:2px solid #546E7A;border-radius:12px;padding:20px;color:#FFF;box-shadow:0 14px 40px rgba(0,0,0,0.45);">
      ${innerHtml}
    </div>
  `;
  modal.style.display = "flex";
}

function hideVillageChallengeModal() {
  const modal = document.getElementById("village-challenge-modal");
  if (!modal) return;
  modal.style.display = "none";
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

function buildVillageChallengeWords(village, questionCount) {
  const biomeWords = typeof getVillageWords === "function" ? getVillageWords(village.biomeId) : [];
  if (!Array.isArray(biomeWords) || !biomeWords.length) return [];
  const normalized = biomeWords
    .map(resolveVillageChallengeWord)
    .filter((w) => !!w && !!String(w.en || "").trim());
  if (!normalized.length) return [];
  const shuffled = [...normalized].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(questionCount, shuffled.length));
}

function buildLetterChoices(correctLetter) {
  const options = [correctLetter];
  const allLetters = "abcdefghijklmnopqrstuvwxyz";
  while (options.length < 4) {
    const rand = allLetters[Math.floor(Math.random() * allLetters.length)];
    if (!options.includes(rand)) options.push(rand);
  }
  return options.sort(() => Math.random() - 0.5);
}

/**
 * 启动村庄学习挑战
 * @param {Object} village - 当前村庄实例
 * @param {Function} onComplete - 完成回调
 */
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

  const questionCount = Math.max(1, Number(villageConfig?.challengeQuestionCount) || 3);
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
    currentWord: null
  };
  village.challengeProgress = progress;

  console.log(`[Village Challenge] Starting challenge for village ${village.id}, questions: ${selectedWords.length}`);

  showVillageChallengeIntro(session, village.biomeId, selectedWords.length, () => {
    if (!isVillageChallengeActive(session)) return;

    function handleAnswer(isCorrect) {
      if (!isVillageChallengeActive(session)) return;
      if (isCorrect) progress.correctCount++;
      progress.currentQuestion++;
      if (progress.currentWord?.en && !progress.wordsSeen.includes(progress.currentWord.en)) {
        progress.wordsSeen.push(progress.currentWord.en);
      }

      if (progress.currentQuestion >= selectedWords.length) {
        finishVillageChallenge(session, village, progress.correctCount, selectedWords.length);
      } else {
        setTimeout(() => {
          if (!isVillageChallengeActive(session)) return;
          showVillageQuestion(session, selectedWords, progress, handleAnswer);
        }, 350);
      }
    }

    showVillageQuestion(session, selectedWords, progress, handleAnswer);
  });
}

function showVillageChallengeIntro(session, biomeId, count, onStart) {
  if (!isVillageChallengeActive(session)) return;
  const biomeName = typeof getBiomeName === "function" ? getBiomeName(biomeId) : biomeId;
  showVillageChallengeModal(`
    <div style="text-align:center;">
      <div style="font-size:34px; margin-bottom:8px;">📚</div>
      <h3 style="color:#FFD54F; margin:8px 0;">${biomeName}村庄 · 单词挑战</h3>
      <p style="color:#EEE; font-size:14px;">回答 ${count} 道单词题</p>
      <p style="color:#AEEA00; font-size:12px;">全对奖励：💎×1 + 🪙×100 + 群系道具</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
        <button id="btn-village-challenge-start" style="padding:10px 24px; font-size:16px; background:#4CAF50; color:#FFF; border:none; border-radius:8px; cursor:pointer;">开始挑战</button>
        <button id="btn-village-challenge-cancel" style="padding:10px 24px; font-size:16px; background:#555; color:#FFF; border:none; border-radius:8px; cursor:pointer;">退出</button>
      </div>
    </div>
  `);

  const modal = getVillageChallengeModal();
  const btnStart = modal.querySelector("#btn-village-challenge-start");
  const btnCancel = modal.querySelector("#btn-village-challenge-cancel");

  if (btnStart) {
    btnStart.addEventListener("click", () => {
      if (!isVillageChallengeActive(session)) return;
      if (typeof onStart === "function") onStart();
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener("click", () => cancelVillageChallenge(session, "已退出村庄挑战"));
  }
}

function showVillageQuestion(session, words, progress, onAnswer) {
  if (!isVillageChallengeActive(session)) return;

  const word = words[progress.currentQuestion];
  if (!word) {
    finishVillageChallenge(session, session.village, progress.correctCount, progress.currentQuestion);
    return;
  }
  progress.currentWord = word;

  const enRaw = String(word.en || "").trim().toLowerCase();
  const enLetters = enRaw.replace(/[^a-z]/g, "");
  if (!enLetters) {
    progress.currentQuestion++;
    setTimeout(() => {
      if (!isVillageChallengeActive(session)) return;
      showVillageQuestion(session, words, progress, onAnswer);
    }, 0);
    return;
  }

  const hideIndex = Math.floor(Math.random() * enLetters.length);
  const displayed = enLetters.split("").map((ch, i) => (i === hideIndex ? "_" : ch));
  const correctLetter = enLetters[hideIndex];
  const options = buildLetterChoices(correctLetter);
  const zh = String(word.zh || "").trim();

  showVillageChallengeModal(`
    <div style="text-align:center;">
      <p style="color:#AAA; font-size:12px; margin-bottom:8px;">第 ${progress.currentQuestion + 1} / ${words.length} 题 · 选择正确的字母填空</p>
      <div style="font-size:28px; color:#FFF; letter-spacing:4px; margin:12px 0; font-family:monospace;">
        ${displayed.join("")}
      </div>
      <p style="color:#FFD54F; font-size:14px; margin-bottom:16px; min-height:20px;">${zh || "请选择正确字母"}</p>
      <div id="village-challenge-options" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        ${options.map((opt) => `
          <button class="village-opt-btn" data-letter="${opt}" style="width:50px; height:50px; font-size:22px; font-family:monospace; background:#37474F; color:#FFF; border:2px solid #546E7A; border-radius:8px; cursor:pointer;">
            ${opt}
          </button>
        `).join("")}
      </div>
      <button id="btn-village-challenge-exit" style="margin-top:16px; padding:8px 16px; font-size:13px; background:#666; color:#FFF; border:none; border-radius:6px; cursor:pointer;">退出挑战</button>
    </div>
  `);

  const modal = getVillageChallengeModal();
  const btnExit = modal.querySelector("#btn-village-challenge-exit");
  if (btnExit) {
    btnExit.addEventListener("click", () => cancelVillageChallenge(session, "已退出村庄挑战"));
  }

  const btns = modal.querySelectorAll(".village-opt-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isVillageChallengeActive(session)) return;
      const selected = btn.dataset.letter;
      const isCorrect = selected === correctLetter;

      btns.forEach((b) => {
        b.style.pointerEvents = "none";
        if (b.dataset.letter === correctLetter) {
          b.style.background = "#4CAF50";
          b.style.borderColor = "#66BB6A";
        } else if (b === btn && !isCorrect) {
          b.style.background = "#F44336";
          b.style.borderColor = "#EF5350";
        }
      });

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
        showFloatingText(
          isCorrect ? "✅ Correct!" : `❌ ${enLetters}`,
          player?.x || 120,
          (player?.y || 120) - 30
        );

        setTimeout(() => {
          if (!isVillageChallengeActive(session)) return;
          if (typeof onAnswer === "function") onAnswer(isCorrect);
        }, 650);
      }, 250);
    });
  });
}

function finishVillageChallenge(session, village, correct, total) {
  if (!isVillageChallengeActive(session)) return;

  const reward = villageConfig?.challengeReward || {};
  const isPerfect = correct === total;
  const rewardText = isPerfect
    ? `🎉 全对! +${reward.perfect?.score || 100}🪙 +${reward.perfect?.diamonds || 1}💎`
    : `📝 ${correct}/${total} +${reward.partial?.score || 50}🪙`;

  showVillageChallengeModal(`
    <div style="text-align:center;">
      <div style="font-size:40px; margin-bottom:10px;">${isPerfect ? "🏆" : "📖"}</div>
      <h3 style="color:${isPerfect ? "#FFD54F" : "#EEE"}; margin:8px 0;">${isPerfect ? "完美通关!" : "挑战完成"}</h3>
      <p style="color:#AEA; font-size:16px;">${correct} / ${total} 正确</p>
      <p style="color:#FFD54F; font-size:14px; margin-top:8px;">${rewardText}</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
        <button id="btn-village-challenge-done" style="padding:10px 24px; font-size:16px; background:#4CAF50; color:#FFF; border:none; border-radius:8px; cursor:pointer;">继续冒险</button>
      </div>
    </div>
  `);

  const modal = getVillageChallengeModal();
  const btnDone = modal.querySelector("#btn-village-challenge-done");
  if (!btnDone) return;

  btnDone.addEventListener("click", () => {
    if (!isVillageChallengeActive(session)) return;

    if (!inventory || typeof inventory !== "object") inventory = {};
    if (typeof inventory.diamond !== "number") inventory.diamond = Number(inventory.diamond) || 0;

    if (isPerfect) {
      score += reward.perfect?.score || 100;
      inventory.diamond += reward.perfect?.diamonds || 1;
    } else {
      score += reward.partial?.score || 50;
    }

    if (typeof updateDiamondUI === "function") updateDiamondUI();
    else if (typeof updateInventoryUI === "function") updateInventoryUI();

    if (typeof grantBiomeReward === "function") grantBiomeReward(village.biomeId);

    closeVillageChallengeSession(session, {
      callComplete: true,
      correct,
      total
    });
  });
}
