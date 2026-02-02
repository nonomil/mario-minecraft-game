# Android APK锛圕apacitor锛夊湪绾挎瀯寤轰笌鍙戝竷

鍩轰簬椹噷濂ョ殑妯増杩囧叧娓告垙锛岃瀺鍚堟垜鐨勪笘鐣屼富棰樺厓绱狅紝鍦ㄦ父鎴忎腑瀛︿範鑻辫鍗曡瘝銆傛敮鎸?Android 骞冲彴锛屽彲鍦ㄧ嚎鑷姩缂栬瘧 APK銆侫 side-scrolling platformer inspired by Super Mario, featuring Minecraft-themed graphics and integrated English vocabulary learning gameplay. Built for Android with automated APK compilation.

## 鐩爣
- 灏?`apk/` 涓嬬殑 HTML + JS 娓告垙閫氳繃 Capacitor 鎵撳寘涓?Android APK
- 鏀寔鎵嬫満/骞虫澘鏄剧ず妯″紡鍒囨崲锛坄deviceMode: auto/mobile/tablet`锛?
- GitHub Actions 鍦?`main` 鍙樻洿鎴栨墜鍔ㄨЕ鍙戞椂鑷姩鏋勫缓 Debug/Release APK锛屽苟鍙戝竷鍒?`apk-latest` Release

## 鐩綍缁撴瀯锛堜粨搴撴牴鍗?apk/锛?
- `src/`銆乣config/`銆乣words/`锛氭父鎴忔簮鐮佷笌璧勬簮
- `tools/build-singlefile.js`锛氱敓鎴愮绾垮崟鏂囦欢鍒?`out/Game.offline.html`
- `scripts/sync-web.js`锛氱敓鎴愮绾垮崟鏂囦欢骞跺悓姝ュ埌 `android-app/web/index.html`
- `android-app/`锛欳apacitor 椤圭洰涓?Android 宸ョ▼
- `.github/workflows/android.yml`锛欳I 鏋勫缓涓庡彂甯冩祦绋?

## 鐜瑕佹眰
- Node.js 20+锛圕apacitor CLI 闇€瑕侊級
- JDK 21锛圕I 浣跨敤 Temurin 21锛涙湰鍦板彲鐢ㄧ郴缁?JDK 21 鎴栦粨搴撳唴鐨?`.jdk/temurin21`锛?
- 鏈湴鏋勫缓闇€瑕?Android SDK锛圕I 浼氳嚜鍔ㄥ畨瑁咃級

## 鏈湴娴佺▼
1. 瀹夎渚濊禆
   - `cd android-app && npm ci`
2. 鐢熸垚绂荤嚎鍗曟枃浠跺苟鍚屾鍒?Capacitor webDir
   - `cd .. && node scripts/sync-web.js`
3. 鍚屾鍒?Android 宸ョ▼
   - `cd android-app && npx cap sync android`
4. 鏈湴鏋勫缓 APK锛堥渶瑕佸凡瀹夎 Android SDK锛?
   - 鍦?`android-app/android/local.properties` 閰嶇疆 `sdk.dir=...`锛堣鏂囦欢涓嶆彁浜わ級
   - `cd android-app/android && ./gradlew assembleDebug`

## 璁惧妯″紡
- 榛樿 `deviceMode` 涓?`auto`锛堣 `src/defaults.js`锛?
- UI 涓彲鍒囨崲鎵嬫満/骞虫澘妯″紡锛屼富瑕佸奖鍝嶇缉鏀句笌瑙︽帶鎺т欢鏄剧ず锛堣 `src/main.js`銆乣Game.html`锛?

## GitHub Actions锛堝湪绾挎瀯寤猴級
- workflow锛歚.github/workflows/android.yml`
- 鏋勫缓浜х墿锛?
  - Debug锛歚android-app/android/app/build/outputs/apk/debug/*.apk`
  - Release锛堟湭绛惧悕锛夛細`android-app/android/app/build/outputs/apk/release/*.apk`
- 鍙戝竷浣嶇疆锛歚apk-latest` Release锛堝悓鍚?tag 浼氳鏇存柊锛?

## Release 绛惧悕锛堝彲閫夛級
鍦ㄤ粨搴?Settings 鈫?Secrets 涓坊鍔狅細
- `ANDROID_KEYSTORE_BASE64`锛坆ase64锛?
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

workflow 鍙€氳繃 `-Pandroid.injected.signing.*` 鍙傛暟娉ㄥ叆绛惧悕淇℃伅杩涜 Release 鏋勫缓涓庡彂甯冦€?

