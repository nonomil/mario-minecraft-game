/**
 * 12-challenges.js - 学习挑战系统
 * v1.8.3 添加村庄挑战支持
 */

// ========== v1.8.3 村庄挑战系统 ==========

/**
 * 启动村庄学习挑战
 * @param {Object} village - 当前村庄实例
 * @param {Function} onComplete - 完成回调
 */
function startVillageChallenge(village, onComplete) {
  if (!village) {
    console.warn('[Village Challenge] No village provided');
    return;
  }

  // 从 villageConfig.challengeQuestionCount 获取题目数量（默认3）
  const questionCount = villageConfig?.challengeQuestionCount || 3;

  // 检测村庄是否已有学习挑战进度
  if (!village.challengeProgress) {
    village.challengeProgress = {
      currentQuestion: 0,
      correctCount: 0,
      wordsSeen: []
    };
  }

  const progress = village.challengeProgress;
  progress.currentQuestion = 0;
  progress.correctCount = 0;

  console.log(`[Village Challenge] Starting challenge for village ${village.id}, questions: ${questionCount}`);

  // 获取群系专属单词
  const biomeWords = typeof getVillageWords === 'function'
    ? getVillageWords(village.biomeId)
    : [];

  if (!biomeWords || biomeWords.length === 0) {
    showToast('📚 当前群系暂无可用单词');
    if (typeof onComplete === 'function') onComplete(0, questionCount);
    return;
  }

  // 随机打乱单词顺序
  const shuffled = [...biomeWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, Math.min(questionCount, shuffled.length));

  if (selectedWords.length === 0) {
    showToast('📚 单词数量不足');
    if (typeof onComplete === 'function') onComplete(0, 0);
    return;
  }

  // 显示挑战开始界面
  showVillageChallengeIntro(village.biomeId, selectedWords.length, () => {
    // 延迟后显示第一题
    setTimeout(() => {
      showVillageQuestion(village, selectedWords, progress, (isCorrect) => {
        if (isCorrect) {
          progress.correctCount++;
        }
        progress.currentQuestion++;

        // 检查是否完成所有题目
        if (progress.currentQuestion >= selectedWords.length) {
          // 全部完成
          finishVillageChallenge(village, progress.correctCount, selectedWords.length, onComplete);
        } else {
          // 显示下一题或结束
          setTimeout(() => {
            if (progress.currentQuestion < selectedWords.length) {
              showVillageQuestion(village, selectedWords, progress, null);
            } else {
              finishVillageChallenge(village, progress.correctCount, selectedWords.length, onComplete);
            }
          }, 500);
        }

        // 记录已见单词
        if (!progress.wordsSeen.includes(progress.currentWord.en)) {
          progress.wordsSeen.push(progress.currentWord.en);
        }
      });
    }, 300);
  });
}

/**
 * 显示村庄挑战开始界面
 * @param {string} biomeId - 群系ID
 * @param {number} count - 题目数量
 * @param {Function} onStart - 开始回调
 */
function showVillageChallengeIntro(biomeId, count, onStart) {
  const modal = document.getElementById('challenge-modal');
  if (!modal) {
    console.warn('[Village Challenge] Challenge modal not found');
    return;
  }

  // 暂停游戏
  pausedByModal = !paused;
  paused = true;

  const biomeName = getBiomeName(biomeId);

  modal.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div style="font-size:32px; margin-bottom:10px;">📚</div>
      <h3 style="color:#FFD54F; margin:8px 0;">${biomeName}村庄 · 单词挑战</h3>
      <p style="color:#EEE; font-size:14px;">回答 ${count} 道单词题</p>
      <p style="color:#AEA; font-size:12px;">全对奖励：💎×1 + 🪙×100 + 群系道具</p>
      <button id="btn-village-challenge-start"
              style="margin-top:16px; padding:10px 30px; font-size:16px;
                     background:#4CAF50; color:#FFF; border:none; border-radius:8px;
                     cursor:pointer;">
        开始挑战
      </button>
    </div>
  `;
  modal.style.display = 'flex';

  const btnStart = document.getElementById('btn-village-challenge-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      modal.style.display = 'none';
      // 恢复游戏
      if (pausedByModal) paused = false;
      pausedByModal = false;
      if (typeof onStart === 'function') onStart();
    });
  }
}

/**
 * 显示村庄单词题目（字母填空选择题）
 * @param {Object} village - 村庄实例
 * @param {Array} words - 单词列表
 * @param {Object} progress - 进度对象
 * @param {Function} onAnswer - 答题回调
 */
function showVillageQuestion(village, words, progress, onAnswer) {
  const modal = document.getElementById('challenge-modal');
  if (!modal) return;

  pausedByModal = !paused;
  paused = true;

  const word = words[progress.currentQuestion];
  progress.currentWord = word;

  const en = (word.en || word.english || '').toLowerCase();
  const zh = word.zh || word.chinese || '';

  // 随机隐藏一个字母
  const hideIndex = Math.floor(Math.random() * en.length);
  const displayed = en.split('').map((ch, i) => i === hideIndex ? '_' : ch);
  const correctLetter = en[hideIndex];

  // 生成选项（正确答案 + 3 个干扰项）
  const allLetters = 'abcdefghijklmnopqrstuvwxyz';
  const options = [correctLetter];
  while (options.length < 4) {
    const rand = allLetters[Math.floor(Math.random() * 26)];
    if (!options.includes(rand)) options.push(rand);
  }
  options.sort(() => Math.random() - 0.5);

  modal.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <p style="color:#AAA; font-size:12px; margin-bottom:8px;">选择正确的字母填空</p>
      <div style="font-size:28px; color:#FFF; letter-spacing:4px; margin:12px 0; font-family:monospace;">
        ${displayed.join('')}
      </div>
      <p style="color:#FFD54F; font-size:14px; margin-bottom:16px;">${zh}</p>
      <div id="village-challenge-options" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
        ${options.map(opt => `
          <button class="village-opt-btn"
                  data-letter="${opt}"
                  style="width:50px; height:50px; font-size:22px; font-family:monospace;
                         background:#37474F; color:#FFF; border:2px solid #546E7A;
                         border-radius:8px; cursor:pointer;">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;
  modal.style.display = 'flex';

  // 绑定选项点击
  setTimeout(() => {
    const btns = modal.querySelectorAll('.village-opt-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.letter;
        const isCorrect = selected === correctLetter;

        // 视觉反馈
        btns.forEach(b => {
          b.style.pointerEvents = 'none';
          if (b.dataset.letter === correctLetter) {
            b.style.background = '#4CAF50';
            b.style.borderColor = '#66BB6A';
          } else if (b === btn && !isCorrect) {
            b.style.background = '#F44336';
            b.style.borderColor = '#EF5350';
          }
        });

        // 播放单词发音
        if (typeof speakWord === 'function') {
          speakWord(en);
        }

        // 显示反馈
        setTimeout(() => {
          if (isCorrect) {
            showFloatingText('✅ Correct!', player.x, player.y - 30);
          } else {
            showFloatingText(`❌ ${en}`, player.x, player.y - 30);
          }

          // 显示完整单词
          setTimeout(() => {
            const fullWordEl = document.createElement('div');
            fullWordEl.style.cssText = 'color:#FFD54F; font-size:14px; margin-top:8px;';
            fullWordEl.textContent = `${en} - ${zh}`;
            modal.appendChild(fullWordEl);

            setTimeout(() => {
              if (typeof onAnswer === 'function') onAnswer(isCorrect);
              fullWordEl.remove();
            }, 800);
          }, 200);
        }, 300);
      });
    });
  }, 100);
}

/**
 * 村庄挑战完成结算
 * @param {Object} village - 村庄实例
 * @param {number} correct - 正确数量
 * @param {number} total - 总题数
 * @param {Function} onComplete - 完成回调
 */
function finishVillageChallenge(village, correct, total, onComplete) {
  const modal = document.getElementById('challenge-modal');
  if (!modal) return;

  const reward = villageConfig?.challengeReward || {};
  const isPerfect = correct === total;

  const rewardText = isPerfect
    ? `🎉 全对! +${reward.perfect?.score || 100}🪙 +${reward.perfect?.diamonds || 1}💎`
    : `📝 ${correct}/${total} +${reward.partial?.score || 50}🪙`;

  modal.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <div style="font-size:40px; margin-bottom:10px;">${isPerfect ? '🏆' : '📖'}</div>
      <h3 style="color:${isPerfect ? '#FFD54F' : '#EEE'}; margin:8px 0;">
        ${isPerfect ? '完美通关!' : '挑战完成'}
      </h3>
      <p style="color:#AEA; font-size:16px;">${correct} / ${total} 正确</p>
      <p style="color:#FFD54F; font-size:14px; margin-top:8px;">${rewardText}</p>
      <button id="btn-village-challenge-done"
              style="margin-top:16px; padding:10px 30px; font-size:16px;
                     background:#4CAF50; color:#FFF; border:none; border-radius:8px;
                     cursor:pointer;">
        继续冒险
      </button>
    </div>
  `;
  modal.style.display = 'flex';

  const btnDone = document.getElementById('btn-village-challenge-done');
  if (btnDone) {
    btnDone.addEventListener('click', () => {
      modal.style.display = 'none';
      // 发放奖励
      if (isPerfect) {
        score += reward.perfect?.score || 100;
        diamonds += reward.perfect?.diamonds || 1;
      } else {
        score += reward.partial?.score || 50;
      }
      updateScoreUI();
      updateDiamondUI();

      // 群系专属道具奖励
      if (typeof grantBiomeReward === 'function') {
        grantBiomeReward(village.biomeId);
      }

      // 恢复游戏
      if (pausedByModal) paused = false;
      pausedByModal = false;

      if (typeof onComplete === 'function') onComplete(correct, total);
    });
  }
}
