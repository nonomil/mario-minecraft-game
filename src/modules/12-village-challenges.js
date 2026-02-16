/**
 * 12-village-challenges.js - 村庄学习挑战 (v1.9.0)
 * 复用 12-challenges.js 的模式，提供村庄专属学习挑战
 */

let villageChallenge = null;
let villageChallengeCallback = null;

function getVillageWords(village, count) {
    const biome = village.biome || "forest";
    const biomeWords = (villageConfig && villageConfig.biomeWords && villageConfig.biomeWords[biome]) || [];
    // 尝试从词库中找匹配的完整词条
    const matched = [];
    if (Array.isArray(wordDatabase)) {
        biomeWords.forEach(bw => {
            const found = wordDatabase.find(w => w.en && w.en.toLowerCase() === bw.toLowerCase());
            if (found) matched.push(found);
        });
    }
    // 不够则从词库随机补充
    while (matched.length < count && Array.isArray(wordDatabase) && wordDatabase.length > 0) {
        const rw = wordDatabase[Math.floor(Math.random() * wordDatabase.length)];
        if (!matched.find(m => m.en === rw.en)) matched.push(rw);
    }
    return matched.slice(0, count);
}

function startVillageChallenge(village, callback) {
    if (villageChallenge) return;
    const qCount = (villageConfig && villageConfig.challengeQuestionCount) || 3;
    const words = getVillageWords(village, qCount);
    if (words.length === 0) { callback("partial"); return; }

    villageChallengeCallback = callback;
    villageChallenge = {
        words, current: 0, correct: 0, total: words.length
    };
    paused = true;
    pausedByModal = true;
    showVillageChallengeQuestion();
}

function showVillageChallengeQuestion() {
    if (!villageChallenge) return;
    const vc = villageChallenge;
    if (vc.current >= vc.total) { finishVillageChallenge(); return; }

    const word = vc.words[vc.current];
    const modal = document.getElementById("challenge-modal");
    const qEl = document.getElementById("challenge-question");
    const optEl = document.getElementById("challenge-options");
    const inputWrapper = document.getElementById("challenge-input-wrapper");
    if (!modal || !qEl || !optEl) return;

    if (inputWrapper) inputWrapper.style.display = "none";
    qEl.textContent = `${word.en} 的意思是？ (${vc.current + 1}/${vc.total})`;

    // 生成4个选项
    const options = [word.zh];
    while (options.length < 4 && Array.isArray(wordDatabase)) {
        const rw = wordDatabase[Math.floor(Math.random() * wordDatabase.length)];
        if (rw.zh && !options.includes(rw.zh)) options.push(rw.zh);
    }
    // 打乱
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    optEl.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "learning-modal-option";
        btn.textContent = opt;
        btn.onclick = () => handleVillageChallengeAnswer(opt, word.zh);
        optEl.appendChild(btn);
    });

    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "flex";

    if (typeof speakWord === 'function') speakWord(word.en);
}
function handleVillageChallengeAnswer(selected, correct) {
    if (!villageChallenge) return;
    const isCorrect = selected === correct;
    if (isCorrect) villageChallenge.correct++;

    // 视觉反馈
    const optEl = document.getElementById("challenge-options");
    if (optEl) {
        Array.from(optEl.children).forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correct) btn.style.background = "#4CAF50";
            else if (btn.textContent === selected && !isCorrect) btn.style.background = "#F44336";
        });
    }

    setTimeout(() => {
        villageChallenge.current++;
        showVillageChallengeQuestion();
    }, 800);
}

function finishVillageChallenge() {
    const vc = villageChallenge;
    const modal = document.getElementById("challenge-modal");
    if (modal) {
        modal.setAttribute("aria-hidden", "true");
        modal.style.display = "none";
    }

    paused = false;
    pausedByModal = false;

    let result = "partial";
    if (vc && vc.correct === vc.total) result = "perfect";

    if (vc) {
        showToast(`答对 ${vc.correct}/${vc.total} 题`);
    }

    villageChallenge = null;
    if (villageChallengeCallback) {
        villageChallengeCallback(result);
        villageChallengeCallback = null;
    }
}
