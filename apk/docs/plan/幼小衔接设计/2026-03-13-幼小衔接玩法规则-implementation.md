﻿# 幼小衔接玩法规则重设（全学科适配）- Implementation

版本：2026-03-13

## 变更概要
- BilingualVocab 增强：支持 subject/module/keywords/phonics，桥接模式下输出学科主/次字段。
- 词语闸门/学习挑战：按学科与语言模式挑选题型。
- 复活连线/单词书/回顾：统一使用主/次字段显示与配对。

## 关键实现点
1. 09-vocab.js
   - 增加 isBridgeMode + getBridgeDisplayContent
   - normalizeRawWord/normalizeWordContent 支持 subject/module/keywords/phonics
   - 新增 getWordDisplayPair / getWordKey
2. 12-challenges.js
   - 新增 Bridge play rules 区域与挑战池
   - 新增 pinyin_to_hanzi / hanzi_to_pinyin / pinyin_tone / math_concept
   - 词语闸门强制题型按学科选择
   - 会话词条与回顾统一使用 getWordKey/getWordDisplayPair
3. 10-ui.js
   - 复活连线左右栏改为主/次字段
   - 连线提示语随学科变化
4. 12-village-challenges.js
   - 村庄挑战题干/选项使用主/次字段
   - 题型提示语按学科调整
5. 14-renderer-main.js / 15-entities-base.js
   - 闸门标题显示学科标签
   - 词卡浮字使用主/次字段

## 测试
- 单元测试：bridge-play-display / bridge-play-rules
- 回归单测：bridge-vocab-pack / bridge-vocab-coverage / pinyin-display-mode 等
- Playwright Debug：词语闸门/拼音测验/词库切换等场景
