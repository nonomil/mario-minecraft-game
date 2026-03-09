
结论（先说重点）
你的现象基本不是“单一逻辑 bug”，而是 打包链路 + 运行时 viewport 逻辑 叠加导致的。
我做了对比和实测后，最关键的是这两点：

修复代码没有稳定进入 APK 的真正打包目录（高概率主因）。
1.8.10 的离线包还存在 5 个缺失脚本引用，这是 1.6.5 没有的结构性风险（高风险次因）。
我做了哪些验证

对比了 1.8.10 与 1.6.5 的 src、android-app/web、assets/public。
跑了构建链路：
npm run build
npm run sync
检查了打包后真实入口 index.html 的关键函数段。
检查了离线 HTML 中 <script src=...> 是否都能在包内找到对应文件。
关键发现 1：构建链路确实可能把旧逻辑带进 APK

build 只拷贝到 android-app/web，不直接更新 APK 使用的 assets/public。
证据：sync-web.js (line 16) 到 sync-web.js (line 21)
真正 APK 打包目录是 android/app/src/main/assets/public，需要 cap sync 才更新。
证据：package.json (line 9) 到 package.json (line 12)
这和你描述“之前修了但 APK 还是有问题”完全一致。
关键发现 2：1.8.10 离线包有 5 个缺失脚本（1.6.5 没有）
1.8.10 的 index.html 仍引用：

18-village.js
18-village-render.js
20-enemies-new.js
21-decorations-new.js
12-village-challenges.js
证据位置：

index.html (line 192471)
index.html (line 192472)
index.html (line 192474)
index.html (line 192476)
index.html (line 193491)
而 assets/public 目录实际并没有这些文件（我已验证）。
1.6.5 同样位置检查结果是 TOTAL_SCRIPT_SRC=0（无外链缺失）。

关键发现 3：你说的“前进后卡住”在代码路径上能解释
applySettingsToUI() 在 viewport 改变时会主动 paused = true 并弹暂停层：

09-vocab.js (line 372) 到 09-vocab.js (line 378)
打包后同样逻辑：index.html (line 190036) 到 index.html (line 190040)
Android 上地址栏/系统栏变化会触发 viewport 变化，所以“走一段突然不可控”很像被这段逻辑暂停住。

和 1.6.5 的核心差异（与你现象相关）

1.6.5：离线包无缺失脚本引用。
1.8.10：离线包有 5 个缺失脚本引用（结构更脆弱）。
1.8.10 构建脚本 build-singlefile.js 的模块白名单只到 17-bootstrap.js，没有把新模块纳入内联：
build-singlefile.js (line 82) 到 build-singlefile.js (line 90)
额外验证结果

直接跑 npm run build:apk 在 Windows cmd 下会失败（脚本用了 ./gradlew）：
package.json (line 11)
我改用 gradlew.bat 继续构建时，本机又因 JDK/Gradle 版本不匹配失败（Unsupported class file major version 68），所以这里无法给你“本机成功出包并安装”的最终运行证明。
下一步建议（先不改业务逻辑代码）

先按固定顺序重新打包一次：build -> sync -> assemble，不要跳 sync。
安装前卸载旧 APK 或清除应用数据，避免旧 Web 资源与本地缓存干扰。
如果你愿意，我下一步只做“构建链路修复”（不动游戏玩法）：
修 build-singlefile.js 把 12-village-challenges/18/20/21 纳入内联；
修 package.json 的 Windows 构建命令。
补充：这轮我没有改业务源码，只执行了构建/同步验证；当前工作区有 capacitor sync 生成的两个 Gradle 文件变更。