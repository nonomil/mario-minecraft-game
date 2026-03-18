/**
 * 10-ui.js - UI覆盖层、游戏结束、复活
 * 从 main.js 拆分 (原始行 2497-2836)
 */
function formatSessionSummaryEntry(primary, secondary, count) {
    primary = String(primary || "").trim();
    secondary = String(secondary || "").trim();
    const safeCount = Number(count) || 0;
    if (!primary || safeCount <= 0) return "";
    if (!secondary || secondary === primary) return `${primary} x${safeCount}`;
    return `${primary}(${secondary}) x${safeCount}`;
}

function getWordDisplayPairSafe(wordObj) {
    const pair = window.BilingualVocab?.getWordDisplayPair?.(wordObj);
    if (pair && (pair.primary || pair.secondary)) return pair;
    const primary = String(wordObj?.en || wordObj?.word || wordObj?.zh || "").trim();
    const secondary = String(wordObj?.zh || wordObj?.chinese || "").trim();
    return { primary, secondary };
}

function getWordKeySafe(wordObj) {
    const key = window.BilingualVocab?.getWordKey?.(wordObj);
    if (key) return key;
    return String(wordObj?.en || wordObj?.word || wordObj?.zh || "").trim();
}

function getSessionWordSummaryHtml(limit = 6) {
    const counts = sessionWordCounts && typeof sessionWordCounts === "object" ? sessionWordCounts : {};
    const entries = Object.entries(counts)
        .filter(([, c]) => Number(c) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, Math.max(1, limit));
    if (!entries.length) return "";

    const wordMap = new Map();
    const uniqueWords = typeof getUniqueSessionWords === "function" ? getUniqueSessionWords() : [];
    uniqueWords.forEach(w => {
        const key = getWordKeySafe(w);
        if (!key) return;
        const pair = getWordDisplayPairSafe(w);
        wordMap.set(key, pair);
    });
    const parts = entries.map(([key, cnt]) => {
        const wordMeta = wordMap.get(key) || {};
        return formatSessionSummaryEntry(wordMeta.primary || key, wordMeta.secondary || "", cnt);
    }).filter(Boolean);
    return `<br><br>🧠 本局高频词: ${parts.join(" · ")}`;
}

function updateStartOverlayButtons() {
    if (overlayMode !== "start") return;
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;

    const btn = document.getElementById("btn-overlay-action");
    const btnSkip = document.getElementById("btn-overlay-skip");
    const btnPick = document.getElementById("btn-overlay-pick-account");
    const btnWrap = overlay.querySelector(".overlay-buttons");

    const introActive = !!document.querySelector(".overlay-page-intro.active");
    const setupActive = !!document.querySelector(".overlay-page-setup.active");

    if (btnWrap) btnWrap.classList.add("overlay-buttons-duo");

    if (btnSkip) btnSkip.style.display = introActive ? "block" : "none";
    if (btnPick) {
        btnPick.style.display = "block";
        btnPick.innerText = setupActive ? "创建新账号" : "选择档案";
    }
    if (btn) btn.style.display = setupActive ? "block" : "none";
}

function setOverlay(visible, mode) {
    const overlay = document.getElementById("screen-overlay");
    if (!overlay) return;
    const title = document.getElementById("overlay-title");
    const text = document.getElementById("overlay-text");
    const btn = document.getElementById("btn-overlay-action");
    const btnSkip = document.getElementById("btn-overlay-skip");
    const btnPick = document.getElementById("btn-overlay-pick-account");
    const btnScoreRevive = document.getElementById("btn-overlay-score-revive");
    const btnLearningReport = document.getElementById("btn-overlay-learning-report");
    const btnLeaderboard = document.getElementById("btn-overlay-leaderboard");
    const btnWrap = overlay.querySelector(".overlay-buttons");

    const hideStartButtons = () => {
        if (btnSkip) btnSkip.style.display = "none";
        if (btnPick) btnPick.style.display = "none";
        if (btnWrap) btnWrap.classList.remove("overlay-buttons-duo");
    };
    if (visible) {
        overlay.classList.add("visible");
        overlay.setAttribute("aria-hidden", "false");
        overlayMode = mode || "pause";
        if (mode === "start") {
            startOverlayActive = true;
            ensureStartOverlayContent();
            renderStartOverlayAccounts();
            updateStartOverlayActionState();
            setStartOverlayPage("intro");
            clearStartOverlayTimer();
            wireIntroConfirmButton();
            if (title) title.innerText = "Minecraft 单词游戏";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLearningReport) btnLearningReport.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            updateStartOverlayButtons();
        } else if (mode === "pause") {
            if (title) title.innerText = "已暂停";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "继续";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLearningReport) btnLearningReport.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
        } else if (mode === "error") {
            if (title) title.innerText = "Error";
            if (text) {
                const raw = (typeof window !== "undefined" && window.__MMWG_LAST_ERROR) ? String(window.__MMWG_LAST_ERROR) : "";
                const safe = raw ? raw.replace(/&/g, "&amp;").replace(/</g, "&lt;") : "";
                const detail = safe
                    ? `<pre style="text-align:left;white-space:pre-wrap;max-height:40vh;overflow:auto;margin:10px 0 0;padding:10px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.25)">${safe}</pre>`
                    : "";
                text.innerHTML = "A fatal error occurred. The game is paused. Please reload." + detail;
            }
            if (btn) btn.innerText = "Reload";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLearningReport) btnLearningReport.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
        } else if (mode === "gameover") {
            const diamonds = getDiamondCount();
            if (title) title.innerText = "💀 游戏结束";
            if (text) {
                const level = Math.max(1, Math.floor(score / 1000) + 1);
                const sessionSummary = typeof buildSessionWordsSummary === "function"
                    ? buildSessionWordsSummary()
                    : getSessionWordSummaryHtml();
                text.innerHTML =
                    `📚 学习单词: ${getLearnedWordCount()}<br>` +
                    `💎 钻石: ${diamonds}<br>` +
                    `⭐ 当前积分: ${score}<br>` +
                    `⚔️ 击杀敌人: ${enemyKillStats.total || 0}<br>` +
                    `🏅 玩家等级: ${level}<br>` +
                    `📘 单词测验：答对全部题目可满血复活<br>` +
                    `⭐ 积分复活仅恢复1格血` +
                    sessionSummary;
            }
            if (btn) {
                const cfg = getReviveConfig();
                const diamondCost = Number(cfg.diamondCost) || 10;
                btn.innerText = diamonds >= diamondCost ? `💎${diamondCost} 满血复活` : "重新开始";
                btn.style.display = "block";
            }
            if (btnScoreRevive) {
                const cfg = getReviveConfig();
                const scoreCost = Number(cfg.scoreCost) || 500;
                const enoughScore = score >= scoreCost;
                btnScoreRevive.style.display = "block";
                btnScoreRevive.disabled = !enoughScore;
                btnScoreRevive.innerText = enoughScore
                    ? `积分复活 (${scoreCost}分 / 1格血)`
                    : `积分复活 (需要${scoreCost}分 / 1格血)`;
            }
            if (btnLearningReport) btnLearningReport.style.display = "block";
            // Show leaderboard button on gameover
            if (btnLeaderboard) btnLeaderboard.style.display = "block";
            hideStartButtons();
        } else {
            if (title) title.innerText = "准备开始";
            if (text) text.innerHTML = START_OVERLAY_HINT_HTML;
            if (btn) btn.innerText = "开始游戏";
            if (btn) btn.style.display = "block";
            if (btnScoreRevive) btnScoreRevive.style.display = "none";
            if (btnLearningReport) btnLearningReport.style.display = "none";
            if (btnLeaderboard) btnLeaderboard.style.display = "none";
            hideStartButtons();
        }
    } else {
        overlay.classList.remove("visible");
        overlay.setAttribute("aria-hidden", "true");
        if (overlayMode === "start") {
            clearStartOverlayTimer();
            startOverlayActive = false;
        }
        overlayMode = "start";
        if (btnScoreRevive) btnScoreRevive.style.display = "none";
        if (btnLearningReport) btnLearningReport.style.display = "none";
        if (btnLeaderboard) btnLeaderboard.style.display = "none";
        hideStartButtons();
    }
}

function escapeLearningReportHtml(raw) {
    return String(raw ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatLearningReportCnDate(dayKey) {
    const parts = String(dayKey || "").split("-").map(Number);
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return "";
    return `${year}年${month}月${day}日`;
}

function getLearningReportTodaySnapshot() {
    const state = typeof ensureLearningReportState === "function"
        ? ensureLearningReportState()
        : (progress?.learningReport || null);
    const todayKey = typeof getLocalDayKey === "function"
        ? getLocalDayKey()
        : (() => {
            const d = new Date();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${d.getFullYear()}-${m}-${day}`;
        })();

    const day = state?.days?.[todayKey];
    const words = day?.words && typeof day.words === "object" ? day.words : {};
    const wordEntries = Object.entries(words).map(([key, entry]) => {
        const safeEntry = entry && typeof entry === "object" ? entry : {};
        const primary = String(safeEntry.primary || "").trim() || key;
        const secondary = String(safeEntry.secondary || "").trim();
        return {
            key,
            primary,
            secondary: secondary || "(暂无释义)",
            seen: Math.max(0, Number(safeEntry.seen) || 0),
            correct: Math.max(0, Number(safeEntry.correct) || 0),
            wrong: Math.max(0, Number(safeEntry.wrong) || 0),
            lastTs: Math.max(0, Number(safeEntry.lastTs) || 0)
        };
    });

    const challengeSuccess = Math.max(0, Number(day?.challenge?.success) || 0);
    const challengeFail = Math.max(0, Number(day?.challenge?.fail) || 0);
    const challengeTotal = challengeSuccess + challengeFail;
    const accuracy = challengeTotal > 0 ? Math.round((challengeSuccess / challengeTotal) * 100) : null;

    const uniqueWords = wordEntries.length;
    const playSeconds = Math.max(0, Number(day?.playSeconds) || 0);
    const playMinutes = playSeconds > 0 ? Math.max(1, Math.ceil(playSeconds / 60)) : (uniqueWords > 0 ? 1 : 0);

    const correctWords = wordEntries
        .filter(w => w.correct > 0)
        .sort((a, b) => (b.correct - a.correct) || (b.lastTs - a.lastTs));

    const wrongWords = wordEntries
        .filter(w => w.wrong > 0)
        .sort((a, b) => (b.wrong - a.wrong) || (b.lastTs - a.lastTs));

    const streakDays = Math.max(0, Number(state?.streak?.current) || 0);

    return {
        state,
        todayKey,
        uniqueWords,
        accuracy,
        challengeSuccess,
        challengeFail,
        playMinutes,
        playSeconds,
        streakDays,
        correctWords,
        wrongWords
    };
}

function buildLearningReportWordRowHtml(word, tagText, tagClass) {
    const primary = escapeLearningReportHtml(word?.primary || word?.key || "");
    const secondary = escapeLearningReportHtml(word?.secondary || "");
    return `
        <div class="learning-report-word-row">
            <div class="learning-report-word-text">
                <div class="learning-report-word-primary">${primary}</div>
                <div class="learning-report-word-secondary">${secondary}</div>
            </div>
            <span class="learning-report-tag ${tagClass}">${escapeLearningReportHtml(tagText)}</span>
        </div>
    `;
}

function buildLearningReportWordSectionHtml(title, words, opts) {
    const list = Array.isArray(words) ? words : [];
    const safeTitle = escapeLearningReportHtml(title);
    const tagText = opts?.tagText || "";
    const tagClass = opts?.tagClass || "";
    const limit = Math.max(0, Number(opts?.limit) || 0);
    const sectionKey = String(opts?.sectionKey || "").trim();

    if (list.length === 0) {
        const emptyText = escapeLearningReportHtml(opts?.emptyText || "完成一次挑战后会显示。");
        return `
            <div class="learning-report-card">
                <div class="learning-report-section-title"><span>${safeTitle}</span></div>
                <div style="color:#6B7280;font-size:13px;line-height:1.6;">${emptyText}</div>
            </div>
        `;
    }

    const shouldCollapse = limit > 0 && list.length > limit && sectionKey;
    const visible = shouldCollapse ? list.slice(0, limit) : list;
    const hidden = shouldCollapse ? list.slice(limit) : [];

    const visibleHtml = visible.map(w => buildLearningReportWordRowHtml(w, tagText, tagClass)).join("");
    const hiddenHtml = hidden.map(w => buildLearningReportWordRowHtml(w, tagText, tagClass)).join("");

    const toggleHtml = shouldCollapse
        ? `<button class="learning-report-more" data-lr-toggle="${escapeLearningReportHtml(sectionKey)}" data-lr-expanded="0">还有 ${hidden.length} 个…</button>`
        : "";

    return `
        <div class="learning-report-card" data-lr-section="${escapeLearningReportHtml(sectionKey)}">
            <div class="learning-report-section-title"><span>${safeTitle}</span></div>
            <div class="learning-report-word-list">
                ${visibleHtml}
            </div>
            ${shouldCollapse ? `<div class="learning-report-word-list" data-lr-hidden="1" style="display:none;">${hiddenHtml}</div>` : ""}
            ${toggleHtml}
        </div>
    `;
}

function buildLearningReportTrendHtml(state, todayKey) {
    const safeState = state && typeof state === "object" ? state : { days: {} };
    const days = safeState.days && typeof safeState.days === "object" ? safeState.days : {};
    const rows = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const entry = days[key];
        const wordCount = entry?.words && typeof entry.words === "object" ? Object.keys(entry.words).length : 0;
        rows.push({
            key,
            label: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
            count: Math.max(0, Number(wordCount) || 0)
        });
    }

    const maxCount = Math.max(1, ...rows.map(r => r.count));
    const itemsHtml = rows.map(r => {
        const width = Math.round((r.count / maxCount) * 100);
        const isToday = r.key === todayKey;
        return `
            <div class="learning-report-trend-row ${isToday ? "is-today" : ""}">
                <div class="learning-report-trend-label">${escapeLearningReportHtml(r.label)}${isToday ? " · 今天" : ""}</div>
                <div class="learning-report-trend-bar"><span style="width:${width}%;"></span></div>
                <div class="learning-report-trend-value">${r.count}</div>
            </div>
        `;
    }).join("");

    return `
        <div class="learning-report-card">
            <div class="learning-report-section-title"><span>本周学习/答题趋势</span></div>
            <div class="learning-report-trend">${itemsHtml}</div>
        </div>
    `;
}

function buildLearningReportShareText(snapshot) {
    const title = currentAccount?.username ? `${currentAccount.username}的学习报告` : "今日学习报告";
    const dateText = formatLearningReportCnDate(snapshot?.todayKey) || String(snapshot?.todayKey || "");
    const uniqueWords = Number(snapshot?.uniqueWords) || 0;
    const playMinutes = Number(snapshot?.playMinutes) || 0;
    const acc = snapshot?.accuracy == null ? "—" : `${snapshot.accuracy}%`;

    const wrongTop = Array.isArray(snapshot?.wrongWords) ? snapshot.wrongWords.slice(0, 6) : [];
    const wrongText = wrongTop.length
        ? wrongTop.map(w => `${w.primary}${w.secondary ? `（${w.secondary}）` : ""}`).join("、")
        : "无";

    return [
        title,
        `${dateText} · 今天`,
        `单词遇见：${uniqueWords}`,
        `答对率：${acc}`,
        `游戏分钟：${playMinutes}`,
        `还需练习：${wrongText}`
    ].join("\n");
}

function renderLearningReportModal() {
    const modal = document.getElementById("learning-report-modal");
    const titleEl = document.getElementById("learning-report-title");
    const subtitleEl = document.getElementById("learning-report-subtitle");
    const contentEl = document.getElementById("learning-report-content");
    const shareBtn = document.getElementById("btn-learning-report-share");
    if (!modal || !titleEl || !subtitleEl || !contentEl) return;

    const snapshot = getLearningReportTodaySnapshot();
    modal.dataset.lrTodayKey = snapshot.todayKey;

    const titleText = currentAccount?.username ? `${currentAccount.username}的学习报告` : "今日学习报告";
    titleEl.innerText = titleText;
    subtitleEl.innerText = `${formatLearningReportCnDate(snapshot.todayKey) || snapshot.todayKey} · 今天`;

    const hasAnyLearning = snapshot.uniqueWords > 0 || snapshot.playSeconds > 0 || (snapshot.challengeSuccess + snapshot.challengeFail) > 0;
    if (!hasAnyLearning) {
        contentEl.innerHTML = `
            <div class="learning-report-card learning-report-empty">
                <div class="learning-report-empty-title">今天还没有学习记录</div>
                <div class="learning-report-empty-desc">先玩一局并完成一次挑战，报告会自动生成。</div>
                <button class="game-btn" id="btn-learning-report-back">返回游戏</button>
            </div>
        `;
        if (shareBtn) shareBtn.disabled = true;
        return;
    }

    const accText = snapshot.accuracy == null ? "—" : `${snapshot.accuracy}%`;
    const minutesText = snapshot.playMinutes > 0 ? `${snapshot.playMinutes}` : "—";

    const kpiHtml = `
        <div class="learning-report-kpis">
            <div class="learning-report-card">
                <div class="learning-report-kpi-value">${snapshot.uniqueWords}</div>
                <div class="learning-report-kpi-label">单词遇见</div>
            </div>
            <div class="learning-report-card">
                <div class="learning-report-kpi-value">${escapeLearningReportHtml(accText)}</div>
                <div class="learning-report-kpi-label">答对率</div>
            </div>
            <div class="learning-report-card">
                <div class="learning-report-kpi-value">${escapeLearningReportHtml(minutesText)}</div>
                <div class="learning-report-kpi-label">游戏分钟</div>
            </div>
        </div>
    `;

    const streakHtml = `
        <div class="learning-report-card">
            <div class="learning-report-streak">
                <div class="learning-report-streak-left">
                    <div style="font-size:18px;">🔥</div>
                    <div>
                        <div style="font-weight:800;">连续学习</div>
                        <div style="font-size:13px;color:#6B7280;">保持下去！</div>
                    </div>
                </div>
                <div class="learning-report-streak-days">${snapshot.streakDays}天</div>
            </div>
        </div>
    `;

    const correctTitle = `答对的词（${snapshot.correctWords.length}个）`;
    const wrongTitle = `还需练习（${snapshot.wrongWords.length}个）`;
    const challengeTotal = snapshot.challengeSuccess + snapshot.challengeFail;
    const correctEmptyText = challengeTotal > 0 ? "今天还没有答对的词，再试一次挑战吧！" : "完成一次挑战后会显示。";
    const wrongEmptyText = challengeTotal > 0 ? "今天没有答错的词，继续保持！" : "完成一次挑战后会显示。";
    const correctHtml = buildLearningReportWordSectionHtml(correctTitle, snapshot.correctWords, {
        tagText: "答对",
        tagClass: "ok",
        limit: 3,
        sectionKey: "correct",
        emptyText: correctEmptyText
    });
    const wrongHtml = buildLearningReportWordSectionHtml(wrongTitle, snapshot.wrongWords, {
        tagText: "答错",
        tagClass: "bad",
        limit: 5,
        sectionKey: "wrong",
        emptyText: wrongEmptyText
    });

    const trendHtml = buildLearningReportTrendHtml(snapshot.state, snapshot.todayKey);

    contentEl.innerHTML = kpiHtml + streakHtml + correctHtml + wrongHtml + trendHtml;
    if (shareBtn) shareBtn.disabled = false;
}

function wireLearningReportModal() {
    const modal = document.getElementById("learning-report-modal");
    if (!modal || modal.dataset.wired) return;
    modal.dataset.wired = "1";

    const btnClose = document.getElementById("btn-learning-report-close");
    const btnShare = document.getElementById("btn-learning-report-share");

    if (btnClose) btnClose.addEventListener("click", hideLearningReportModal);
    if (btnShare) {
        btnShare.addEventListener("click", async () => {
            const snapshot = getLearningReportTodaySnapshot();
            const text = buildLearningReportShareText(snapshot);
            let copied = false;
            try {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    copied = true;
                }
            } catch {
                copied = false;
            }
            if (typeof showToast === "function") {
                showToast(copied ? "✅ 已复制学习摘要，建议截图分享" : "请使用系统截图功能分享（复制摘要失败）");
            }
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) hideLearningReportModal();
    });

    modal.addEventListener("click", (e) => {
        const target = e.target;
        const toggleKey = target && target.dataset ? String(target.dataset.lrToggle || "").trim() : "";
        if (!toggleKey) return;
        const section = modal.querySelector(`[data-lr-section="${toggleKey}"]`);
        if (!section) return;
        const hidden = section.querySelector(`[data-lr-hidden="1"]`);
        if (!hidden) return;
        const expanded = String(target.dataset.lrExpanded || "0") === "1";
        hidden.style.display = expanded ? "none" : "";
        target.dataset.lrExpanded = expanded ? "0" : "1";
        if (!expanded) target.innerText = "收起";
        else {
            const count = hidden.querySelectorAll(".learning-report-word-row").length;
            target.innerText = `还有 ${count} 个…`;
        }
    });

    modal.addEventListener("click", (e) => {
        const backBtn = e.target && e.target.id === "btn-learning-report-back" ? e.target : null;
        if (!backBtn) return;
        hideLearningReportModal();
    });
}

function showLearningReportModal() {
    const modal = document.getElementById("learning-report-modal");
    if (!modal) return;
    wireLearningReportModal();
    renderLearningReportModal();
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");

    const overlay = document.getElementById("screen-overlay");
    const overlayVisible = !!(overlay && overlay.classList.contains("visible"));
    if (overlayVisible) return;

    if (typeof pushPause === "function") pushPause();
    else paused = true;
}

function hideLearningReportModal() {
    const modal = document.getElementById("learning-report-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");

    const overlay = document.getElementById("screen-overlay");
    const overlayVisible = !!(overlay && overlay.classList.contains("visible"));
    if (overlayVisible) return;

    if (typeof popPause === "function") popPause();
    else paused = false;
}
function wireIntroConfirmButton() {
    const btn = document.getElementById("btn-overlay-intro-confirm");
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
        setStartOverlayPage("setup");
        wireStartOverlayAccountActions();
        renderStartOverlayAccounts();
        const input = document.getElementById("overlay-username-input");
        if (input) setTimeout(() => input.focus(), 100);
    });
}
function proceedToGameOver() {
    setOverlay(true, "gameover");
}

function showGameReview(results) {
    const screen = document.getElementById("review-screen");
    const list = document.getElementById("review-word-list");
    const flash = document.getElementById("review-flash-cards");
    const btn = document.getElementById("review-continue-btn");
    const rows = Array.isArray(results) ? results : [];
    if (!screen || !list || !flash || !btn || rows.length === 0) {
        proceedToGameOver();
        return;
    }

    list.innerHTML = rows.map((item) => {
        const ok = !!item.correct;
        const bg = ok ? "#1f6f3d" : "#7a2f2f";
        const text = String(item.word || "");
        return `<span style="padding:6px 10px;border-radius:8px;background:${bg};">${text} ${ok ? "✓" : "✗"}</span>`;
    }).join("");

    const wrongRows = rows.filter(item => !item.correct);
    let idx = 0;
    const flashWrong = () => {
        if (idx >= wrongRows.length) {
            flash.innerHTML = "";
            return;
        }
        const item = wrongRows[idx++];
        flash.innerHTML = `<div style="font-size:26px;font-weight:700;">${item.word || ""}</div><div style="opacity:.75;">${item.zh || ""}</div>`;
        setTimeout(flashWrong, 1200);
    };
    if (wrongRows.length > 0) flashWrong();
    else flash.innerHTML = `<div style="opacity:.9;">本局答题表现不错，继续冲刺！</div>`;

    screen.style.display = "block";
    const closeReview = () => {
        screen.style.display = "none";
        window._sessionWordResults = [];
        proceedToGameOver();
    };
    btn.onclick = closeReview;
    setTimeout(() => {
        if (screen.style.display !== "none") closeReview();
    }, 8000);
}
window.showGameReview = showGameReview;

function triggerGameOver() {
    paused = true;
    showToast("💀 生命耗尽");
    onGameOver();
    if (maybeLaunchWordMatchRevive()) {
        return;
    }
    showGameReview(window._sessionWordResults || []);
}
function maybeLaunchWordMatchRevive() {
    if (!settings.wordMatchEnabled || typeof startRecoveryQuizSession !== "function") return false;
    const words = getUniqueSessionWords();
    const questionCount = Math.max(1, Number(LEARNING_CONFIG?.reviveQuiz?.deathQuestionCount) || 4);
    if (words.length < questionCount) return false;
    return !!startRecoveryQuizSession({
        context: "death",
        words,
        questionCount,
        onSuccess: () => {
            const cfg = getReviveConfig();
            playerHp = playerMaxHp;
            updateHpUI();
            playerInvincibleTimer = Number(cfg.invincibleFrames) || 180;
            paused = false;
            startedOnce = true;
            setOverlay(false);
            showToast(UI_TEXTS.reviveSuccess);
        },
        onFailure: () => {
            setOverlay(true, "gameover");
        }
    });
}

function maybeOfferBossEmergencyQuiz() {
    if (typeof bossArena === "undefined" || !bossArena?.active || !bossArena?.boss?.alive) return false;
    if (bossArena.emergencyQuizUsed) return false;
    if (playerHp <= 0 || playerHp >= Math.min(3, playerMaxHp)) return false;
    if (typeof startRecoveryQuizSession !== "function" || currentLearningChallenge) return false;
    const words = getUniqueSessionWords();
    const questionCount = Math.max(1, Number(LEARNING_CONFIG?.reviveQuiz?.bossQuestionCount) || 3);
    if (words.length < questionCount) return false;
    const started = startRecoveryQuizSession({
        context: "boss_emergency",
        words,
        questionCount,
        onSuccess: () => {
            playerHp = playerMaxHp;
            updateHpUI();
            playerInvincibleTimer = Math.max(Number(playerInvincibleTimer) || 0, 120);
            showToast("答对全部题目，生命已回满");
        },
        onFailure: () => {
            showToast("急救测验未通过，继续坚持");
        }
    });
    if (started) bossArena.emergencyQuizUsed = true;
    return !!started;
}

function buildWordMatchItems(words) {
    const items = [];
    const seenKeys = new Set();
    const seenSecondary = new Set();
    const mode = settings?.languageMode;
    words.forEach(word => {
        const key = getWordKeySafe(word);
        if (!key || seenKeys.has(key)) return;
        const pair = getWordDisplayPairSafe(word);
        const primary = pair.primary || key;
        const secondary = pair.secondary || pair.primary || key;
        if (!primary || !secondary) return;
        const subject = String(word?.subject || "").trim();
        if (subject === "language" && (mode === "pinyin" || mode === "chinese")) {
            if (seenSecondary.has(secondary)) return;
            seenSecondary.add(secondary);
        }
        seenKeys.add(key);
        items.push({ id: key, left: primary, right: secondary, word });
    });
    return items;
}

function getWordMatchHint(words) {
    const subjects = new Set(words.map(w => String(w?.subject || "").trim()).filter(Boolean));
    if (subjects.size !== 1) return "将左侧与右侧全部正确配对才能复活，错配会自动消失";
    const subject = [...subjects][0];
    const mode = settings.languageMode;
    if (subject === "language") {
        if (mode === "pinyin") return "将拼音与汉字全部连对才能复活，错配会自动消失";
        if (mode === "chinese") return "将汉字与拼音全部连对才能复活，错配会自动消失";
        return "将词语与释义全部连对才能复活，错配会自动消失";
    }
    if (subject === "math") return "将概念与关键词全部连对才能复活，错配会自动消失";
    if (subject === "english") return "将英文与拼读全部连对才能复活，错配会自动消失";
    return "将左侧与右侧全部正确配对才能复活，错配会自动消失";
}

class WordMatchGame {
    constructor(words) {
        const entries = buildWordMatchItems(words);
        this.entries = shuffle(entries).slice(0, Math.max(1, LEARNING_CONFIG.wordMatch.wordCount || 5));
        this.words = this.entries.map(item => item.word);
        this.leftItems = shuffle(this.entries.map(item => ({ id: item.id, text: item.left, word: item.word })));
        this.rightItems = shuffle(this.entries.map(item => ({ id: item.id, text: item.right, word: item.word })));
        this.matchHint = getWordMatchHint(this.words);
        this.connections = [];
        this.lockedIds = new Set();
        this.selectedLeftId = null;
        this.timerMs = LEARNING_CONFIG.wordMatch.timeLimit || 30000;
        this.timerEndAt = 0;
        this.finished = false;
        this.attempts = 0;
        this.maxAttempts = 1;
        this.hasInteracted = false;
        this.timerPaused = false;
        this.pausedAt = 0;
    }

    start() {
        if (!wordMatchScreenEl) return;
        if (this.attempts >= this.maxAttempts) {
            showToast(UI_TEXTS.reviveUsed);
            setOverlay(true, "gameover");
            return;
        }
        this.attempts++;
        this.hasInteracted = false;
        this.timerPaused = false;
        this.pausedAt = 0;
        wordMatchActive = true;
        wordMatchScreenEl.classList.add("visible");
        this.render();
        this.startTimer();
    }

    pauseTimerOnFirstInteraction() {
        if (this.hasInteracted || this.timerPaused || this.finished) return;
        this.hasInteracted = true;
        this.timerPaused = true;
        this.pausedAt = Date.now();
        this.stopTimer();
        if (matchTimerEl) {
            matchTimerEl.innerText = "⏸";
            matchTimerEl.style.color = "#FFA726";
        }
        if (matchSubtitleEl) {
            matchSubtitleEl.innerText = "计时已暂停，请仔细匹配";
        }
    }

    render() {
        if (!matchLeftEl || !matchRightEl || !matchTotalEl) return;
        if (matchResultEl) {
            matchResultEl.classList.remove("visible");
            matchResultEl.innerText = "";
        }
        if (matchSubtitleEl) matchSubtitleEl.innerText = this.matchHint || "将左侧与右侧全部正确配对才能复活，错配会自动消失";
        matchLeftEl.innerHTML = this.leftItems.map(item => `<div class="match-item${this.lockedIds.has(item.id) ? " correct" : ""}" data-id="${item.id}" data-type="en">${item.text}</div>`).join("");
        matchRightEl.innerHTML = this.rightItems.map(item => `<div class="match-item${this.lockedIds.has(item.id) ? " correct" : ""}" data-id="${item.id}" data-type="zh">${item.text}</div>`).join("");
        matchTotalEl.innerText = String(this.words.length);
        this.bindEvents();
        this.updateMatchCount();
        this.drawLines();
        if (matchSubmitBtn) matchSubmitBtn.disabled = false;
    }

    bindEvents() {
        if (matchLeftEl) {
            matchLeftEl.querySelectorAll(".match-item").forEach(el => {
                el.addEventListener("click", () => this.selectLeft(el));
            });
        }
        if (matchRightEl) {
            matchRightEl.querySelectorAll(".match-item").forEach(el => {
                el.addEventListener("click", () => this.selectRight(el));
            });
        }
    }

    selectLeft(el) {
        if (!el) return;
        this.pauseTimerOnFirstInteraction();
        if (this.lockedIds.has(el.dataset.id)) return;
        this.selectedLeftId = el.dataset.id;
        this.clearSelectedLeft();
        el.classList.add("selected");
    }

    selectRight(el) {
        if (!el || !this.selectedLeftId) return;
        this.pauseTimerOnFirstInteraction();
        const leftId = this.selectedLeftId;
        const rightId = el.dataset.id;
        this.selectedLeftId = null;
        this.clearSelectedLeft();
        if (this.lockedIds.has(leftId) || this.lockedIds.has(rightId)) return;
        if (leftId !== rightId) {
            this.flashWrongPair(leftId, rightId);
            return;
        }
        const existingIndex = this.connections.findIndex(conn => conn.left === leftId || conn.right === rightId);
        if (existingIndex >= 0) this.connections.splice(existingIndex, 1);
        this.connections.push({ left: leftId, right: rightId });
        this.lockedIds.add(leftId);
        this.markCorrectPair(leftId, rightId);
        this.drawLines();
        this.updateMatchCount();
    }

    clearSelectedLeft() {
        matchLeftEl?.querySelectorAll(".match-item").forEach(item => item.classList.remove("selected"));
    }

    getMatchItem(container, id) {
        if (!container || !id) return null;
        return container.querySelector(`[data-id="${id}"]`);
    }

    markCorrectPair(leftId, rightId) {
        const leftEl = this.getMatchItem(matchLeftEl, leftId);
        const rightEl = this.getMatchItem(matchRightEl, rightId);
        [leftEl, rightEl].forEach(item => {
            item?.classList.remove("wrong");
            item?.classList.add("correct");
        });
    }

    flashWrongPair(leftId, rightId) {
        const leftEl = this.getMatchItem(matchLeftEl, leftId);
        const rightEl = this.getMatchItem(matchRightEl, rightId);
        [leftEl, rightEl].forEach(item => {
            item?.classList.remove("selected");
            item?.classList.add("wrong");
        });
        setTimeout(() => {
            [leftEl, rightEl].forEach(item => item?.classList.remove("wrong"));
        }, 360);
    }

    drawLines() {
        if (!matchLinesEl || !matchLeftEl || !matchRightEl) return;
        const container = document.querySelector(".match-container");
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const lines = this.connections.map(conn => {
            const leftEl = matchLeftEl.querySelector(`[data-id="${conn.left}"]`);
            const rightEl = matchRightEl.querySelector(`[data-id="${conn.right}"]`);
            if (!leftEl || !rightEl) return "";
            const leftRect = leftEl.getBoundingClientRect();
            const rightRect = rightEl.getBoundingClientRect();
            const x1 = leftRect.right - containerRect.left;
            const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
            const x2 = rightRect.left - containerRect.left;
            const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4CAF50" stroke-width="3"/>`;
        }).join("");
        matchLinesEl.innerHTML = lines;
    }

    updateMatchCount() {
        if (matchCountEl) matchCountEl.innerText = String(this.connections.length);
    }

    startTimer() {
        this.stopTimer();
        this.timerEndAt = Date.now() + this.timerMs;
        if (matchTimerEl) matchTimerEl.innerText = String(Math.ceil(this.timerMs / 1000));
        wordMatchTimer = setInterval(() => {
            const remaining = this.timerEndAt - Date.now();
            if (matchTimerEl) matchTimerEl.innerText = String(Math.max(0, Math.ceil(remaining / 1000)));
            if (remaining <= 0) {
                this.submit();
            }
        }, 100);
    }

    stopTimer() {
        if (wordMatchTimer) {
            clearInterval(wordMatchTimer);
            wordMatchTimer = null;
        }
    }

    submit() {
        if (this.finished) return;
        this.finished = true;
        this.stopTimer();
        if (matchSubmitBtn) matchSubmitBtn.disabled = true;
        const correct = this.connections.filter(conn => conn.left === conn.right).length;
        const success = correct >= this.words.length;
        this.showResult(success, correct);
    }

    showResult(success, correctCount) {
        if (matchResultEl) {
            matchResultEl.classList.add("visible");
            matchResultEl.innerText = success
                ? `✅ 正确 ${correctCount} 道，祝你复活！`
                : `❌ 正确 ${correctCount} 道，复活失败`;
        }
        if (matchSubtitleEl) {
            matchSubtitleEl.innerText = success ? "继续前行！" : "重整旗鼓再来一次";
        }
        if (success) {
            playerHp = playerMaxHp;
            addScore(correctCount * (LEARNING_CONFIG.wordMatch.bonusPerMatch || 10));
            updateHpUI();
            showToast(UI_TEXTS.reviveSuccess);
            setTimeout(() => this.cleanup(true), 1200);
        } else {
            setTimeout(() => {
                this.cleanup(false);
                setOverlay(true, "gameover");
            }, 1400);
        }
    }

    cleanup(success) {
        this.stopTimer();
        wordMatchActive = false;
        activeWordMatch = null;
        if (matchResultEl) matchResultEl.classList.remove("visible");
        if (wordMatchScreenEl) wordMatchScreenEl.classList.remove("visible");
        if (success) {
            paused = false;
            setOverlay(false);
        }
    }
}
function resumeGameFromOverlay() {
    // Prevent an immediate mobile viewport change from reopening the start overlay.
    viewportIgnoreUntilMs = nowMs() + 2000;
    if (overlayMode === "start") {
        // If still on intro page, don't skip - user must click confirm
        const introPage = document.querySelector(".overlay-page-intro.active");
        if (introPage) return;
        if (!currentAccount) {
            showToast("请先选择或创建档案");
            setStartOverlayPage("setup");
            const input = document.getElementById("overlay-username-input");
            input?.focus();
            return;
        }
        if (!startedOnce) {
            bootGameLoopIfNeeded();
        } else {
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            setOverlay(false);
        }
    } else if (overlayMode === "gameover") {
        if (getDiamondCount() >= 10) {
            inventory.diamond -= 10;
            playerHp = playerMaxHp;
            updateHpUI();
            updateDiamondUI();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        } else {
            initGame();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else if (overlayMode === "error") {
        try {
            location.reload();
        } catch {
            initGame();
            if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
            else paused = false;
            startedOnce = true;
            setOverlay(false);
        }
    } else {
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
        else paused = false;
        startedOnce = true;
        setOverlay(false);
    }
    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) btnMix.innerText = "🔊 重读";
    repeatPauseState = "repeat";
}

function skipStartOverlay() {
    // "跳过" is allowed to bypass intro + account selection.
    viewportIgnoreUntilMs = nowMs() + 2000;
    if (overlayMode !== "start") {
        resumeGameFromOverlay();
        return;
    }

    if (!startedOnce) {
        bootGameLoopIfNeeded();
    } else {
        if (typeof clearModalPauseStack === "function") clearModalPauseStack(true);
        else paused = false;
        setOverlay(false);
    }

    const btnMix = document.getElementById("btn-repeat-pause");
    if (btnMix) btnMix.innerText = "🔊 重读";
    repeatPauseState = "repeat";
}

function getReviveConfig() {
    const revive = (gameConfig && gameConfig.revive) || {};
    return {
        diamondCost: revive.diamondCost ?? 10,
        scoreCost: revive.scoreCost ?? 500,
        scoreReviveHp: revive.scoreReviveHp ?? 1,
        invincibleFrames: revive.invincibleFrames ?? 180
    };
}

function reviveWithScore() {
    const cfg = getReviveConfig();
    const cost = Number(cfg.scoreCost) || 500;
    if (score < cost) {
        showToast(`积分不足（需要 ${cost} 分）`);
        return;
    }
    score -= cost;
    if (score < 0) score = 0;
    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.innerText = score;
    playerHp = Math.min(playerMaxHp, Math.max(1, Number(cfg.scoreReviveHp) || 1));
    updateHpUI();
    playerInvincibleTimer = Number(cfg.invincibleFrames) || 180;
    paused = false;
    startedOnce = true;
    setOverlay(false);
    const px = player ? player.x : cameraX;
    const py = player ? player.y - 50 : canvas.height / 2;
    showFloatingText("积分复活", px, py);
    showToast("积分复活成功，仅恢复1格血");
}

function keyLabel(code) {
    if (!code) return "";
    if (code === "Space") return "空格";
    if (code.startsWith("Key") && code.length === 4) return code.slice(3);
    if (code.startsWith("Arrow")) return code.replace("Arrow", "方向");
    return code;
}

// Leaderboard functions
function showLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    if (!modal) return;
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    const saveSection = document.getElementById("leaderboard-save-section");
    if (saveSection) saveSection.style.display = "";
    renderLeaderboard();
    // Pre-fill name input with current account username
    const nameInput = document.getElementById("leaderboard-name-input");
    if (nameInput && currentAccount) {
        nameInput.value = currentAccount.username || "";
    }
}

function hideLeaderboardModal() {
    const modal = document.getElementById("leaderboard-modal");
    if (!modal) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
}

function saveToLeaderboard() {
    const nameInput = document.getElementById("leaderboard-name-input");
    const name = (nameInput?.value || "匿名玩家").trim().slice(0, 20);
    const record = {
        name: name,
        score: score,
        wordsLearned: getLearnedWordCount(),
        enemiesKilled: enemyKillStats.total || 0,
        date: Date.now()
    };
    MMWG_STORAGE.saveToLeaderboard(record);
    showToast("📝 成绩已保存到排行榜");
    renderLeaderboard();
    // Hide the save section after saving
    const saveSection = document.getElementById("leaderboard-save-section");
    if (saveSection) saveSection.style.display = "none";
}

function saveProfileScoreToLeaderboard() {
    if (typeof saveCurrentProgress === "function") saveCurrentProgress();
    const nameInput = document.getElementById("leaderboard-name-input");
    if (nameInput && currentAccount?.username) nameInput.value = currentAccount.username;
    if (typeof hideProfileModal === "function") hideProfileModal();
    showLeaderboardModal();
    saveToLeaderboard();
}

function renderLeaderboard() {
    const listEl = document.getElementById("leaderboard-list");
    if (!listEl) return;
    const leaderboard = MMWG_STORAGE.getLeaderboard();
    if (leaderboard.length === 0) {
        listEl.innerHTML = "<div style='text-align:center; padding:20px; color:#888;'>暂无记录</div>";
        return;
    }
    listEl.innerHTML = leaderboard.map((record, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : "";
        const rankIcon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
        const dateStr = new Date(record.date).toLocaleDateString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        return `
            <div class="leaderboard-item ${rankClass}">
                <div class="leaderboard-rank leaderboard-rank-${rank}">${rankIcon}</div>
                <div class="leaderboard-name">${escapeHtml(record.name)}</div>
                <div class="leaderboard-stats">
                    <span class="leaderboard-score">${record.score}分</span>
                    <span class="leaderboard-words">📚${record.wordsLearned}</span>
                </div>
                <div class="leaderboard-date">${dateStr}</div>
            </div>
        `;
    }).join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 消耗品槽 UI 更新（新增）
// ============================================

/**
 * 更新消耗品槽 UI 显示
 */
function updateConsumableUI() {
    const statusEl = document.getElementById("consumable-status");
    const iconEl = document.getElementById("consumable-icon");
    const nameEl = document.getElementById("consumable-name");
    const countEl = document.getElementById("consumable-count");

    // 未装备消耗品时隐藏
    if (!equippedConsumable.itemKey) {
        if (statusEl) {
            statusEl.style.display = "none";
            statusEl.classList.remove("active");
        }
        return;
    }

    // 获取配置
    const config = CONSUMABLES_CONFIG[equippedConsumable.itemKey];
    if (!config) {
        console.warn('[UI] Unknown consumable:', equippedConsumable.itemKey);
        return;
    }

    // 更新 UI 元素
    if (statusEl) {
        statusEl.style.display = "block";
        statusEl.classList.add("active");
    }
    if (iconEl) iconEl.innerText = config.icon;
    if (nameEl) nameEl.innerText = config.name;
    if (countEl) countEl.innerText = `x${equippedConsumable.count}`;
}
