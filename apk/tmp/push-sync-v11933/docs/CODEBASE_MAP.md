# Codebase Map: full-codebase-scan

> Generated at: 2026-03-04T20:23
> Scope: src, config, docs

## 模块概览

| 模块 | 文件数 | LOC | 入口点 | 公开函数 | 内部依赖 |
|------|--------|-----|--------|----------|----------|
| `src` | 34 | 21005 |  | 609 | - |

## src

路径: `src`

### 公开函数

- `clone(value)` — src/storage.js:45
- `exportSaveCode()` — src/storage.js:149
- `importSaveCode(code)` — src/storage.js:163
- `loadJsonWithFallback()` — src/config/loader.js:1
- `loadJsonWithFallback(path, fallback)` — src/modules/01-config.js:14
- `mergeDeep(target, source)` — src/modules/02-utils.js:4
- `clamp(value, min, max)` — src/modules/02-utils.js:18
- `parseKeyCodes(raw)` — src/modules/02-utils.js:22
- `ensureAudioContext()` — src/modules/03-audio.js:4
- `ensureSpeechReady()` — src/modules/03-audio.js:11
- `ensureSpeechVoices()` — src/modules/03-audio.js:25
- `pickVoice(langPrefix)` — src/modules/03-audio.js:51
- `getNativeTts()` — src/modules/03-audio.js:59
- `speakNativeTts(tts, text, lang, rate)` — src/modules/03-audio.js:81
- `normalizeSpeechText(primary, fallback)` — src/modules/03-audio.js:100
- `buildOnlineTtsUrl(text, lang)` — src/modules/03-audio.js:109
- `playOnlineTtsSequence(sequence)` — src/modules/03-audio.js:114
- `setupBgm()` — src/modules/03-audio.js:151
- `applyBgmSetting()` — src/modules/03-audio.js:164
- `unlockAudio()` — src/modules/03-audio.js:179
- ... 共 609 个公开函数

---
