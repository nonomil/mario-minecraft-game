# Release Notes - v1.19.38

## 摘要
本次更新引入“拼音 + 汉字”学习路线与测验路由，并完成 M1/M2/M3 学习主线能力整合：统一学习事件骨架、词门微学习护盾机制与飞龙蛋成长系统。同时修复了战斗与词库边界问题，并补充了验收报告。

## 变更详情

### 核心功能 (Features)
- **拼音学习系统**: 新增拼音词库包、拼音模式选择、拼音测验路由，并补全拼音与汉字关系数据。
- **M1 学习事件骨架**: 落地统一学习事件主骨架，便于后续各学习模式共享流程与状态。
- **M2 词门微学习**: 实现词门微学习，并加入护盾增益反馈机制。
- **M3 飞龙蛋成长**: 增加飞龙蛋成长系统，与学习主线能力对齐并可扩展到后续节奏设计。

### 修复 (Bug Fixes)
- **战斗武器切换**: 修复 BOSS 战中武器切换异常，避免战斗状态下的错配。
- **学习状态重复实现**: 移除重复的 learningState 实现，降低状态漂移风险。
- **词库边界与数据质量**: 扩充幼儿园汉字词库并修复边界情况，同时完善拼音词库关系的边界处理。

## Git 提交记录 (v1.19.37..HEAD)
- `88ff567`: codex: expand pinyin pack and relations
- `0ad6a9e`: claude-review: fix edge cases in kindergarten hanzi pack
- `3c9a85d`: codex: initial implementation of pinyin quiz routing
- `498cbbe`: codex: initial implementation of hanzi and pinyin relations
- `75d743a`: codex: initial implementation of pinyin vocab pack
- `c937902`: docs: add pinyin hanzi learning plan
- `3bfb4bc`: codex: initial implementation of pinyin mode selection
- `4e0ce4d`: fix: expand kindergarten hanzi vocab to 800 chars
- `7c7205d`: checkpoint: 15:33
- `c3ff34e`: checkpoint: 14:56
- `bf2c58b`: checkpoint: 14:10
- `9017204`: docs: add MVP test verification report with 7/7 passing tests
- `36ce521`: docs: add MVP learning integration completion report
- `68431c8`: merge: M3 dragon egg growth feature
- `b9e1eb5`: feat(m3): implement dragon egg growth system
- `7d9dd0d`: merge: M2 gate microlearn feature
- `c4678e4`: feat(m2): implement gate microlearn with shield buff
- `a228f4d`: fix(m1): remove duplicate learningState implementation
- `c448802`: checkpoint: 11:36
- `ddc6405`: merge: M1 unified learning event spine into main
- `fd90445`: feat(m1): implement unified learning event spine
- `5e9914b`: checkpoint: 11:26
- `25e1b7a`: checkpoint: 11:22
- `3fe4cc6`: codex: add mvp learning integration design and plan
- `bd6f967`: fix: resolve boss weapon switch in combat (src/modules/04-weapons.js)
