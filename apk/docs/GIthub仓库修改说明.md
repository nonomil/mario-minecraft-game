不建议把仓库“主目录去掉”，但很建议把“主入口”做成指向 `apk/`。

**为什么不建议去掉主目录**
- GitHub 仓库必须有根目录；你说的“只需要 `/apk`”本质上是两种选择：要么把 `apk/` 的内容提升为仓库根，要么拆成一个新仓库。
- 现在这个仓库根目录里不只有 `apk/`：还有 CI（`.github/workflows`）、Android 工程（`android-app/`）、脚本/测试/资源等。直接“只留 `/apk`”会让构建链路和工程组织断掉（除非做一次完整迁移）。

**更好的做法（推荐）**
- 保留主目录，但把根 `README.md` 精简成“项目一句话 + 安装/构建入口 + 直接链接到 `apk/README.md`”，把详细玩法/机制全部放在 `apk/README.md`（也就是你现在在补的这份）。
- 这样访问 `https://github.com/nonomil/mario-minecraft-game` 的人也能一眼点到真正的文档入口：`/tree/main/apk`。

**如果你坚持“仓库只保留 apk”**
- 方案 A：新建一个仓库（例如 `mario-minecraft-apk`），把当前 `apk/` 独立成一个 repo（最干净，历史也清晰）。
- 方案 B：把当前仓库做成“以 apk 为根”的历史重写迁移（需要 `git filter-repo` 之类工具），然后把 CI/Android 工程等也一起搬到新根目录里。

我的建议是：先按“推荐方案”做（成本最低、效果最好），除非你明确想把仓库定位成“只存 apk 游戏源码”，否则不值得为了入口体验去做历史重写/拆仓库。


ctions 自动编译 APK 并发布到 Release。你想保留这套流程，但不想让源码公开。

**核心问题**：GitHub Actions 在**私有仓库**里是可以正常运行的，Release 页面对私有仓库来说**只有登录且有权限的人才能看到**，无法做到"私有仓库但 Release 公开"。

所以最佳方案还是**双仓库**，但可以完全自动化，你几乎感受不到变化：

------

## 推荐方案：私有仓库开发 + 公开仓库发布 Release

**结构：**

- `mario-minecraft-game`（改为**私有**）：存放所有源码，CI 在这里编译 APK
- `mario-minecraft-game-release`（新建**公开**）：只放 README，所有 Release 发布到这里

**操作步骤：**

**第一步：把当前仓库改为私有**

进入仓库 → Settings → 最底部 Danger Zone → **Change visibility → Private**

**第二步：新建一个公开仓库**

只需要一个 README，用来展示和发布 Release。

**第三步：在私有仓库里创建一个 Token**

去 GitHub → Settings → Developer settings → Personal access tokens → 生成一个有 `repo` 权限的 token，然后在私有仓库的 **Settings → Secrets** 里添加，命名为 `PUBLIC_REPO_TOKEN`。

**第四步：修改私有仓库的 `.github/workflows/android.yml`**

把最后发布 Release 的步骤，改为发布到公开仓库：

```yaml
- name: Release to public repo
  uses: softprops/action-gh-release@v1
  with:
    repository: nonomil/mario-minecraft-game-release  # 改成你的公开仓库名
    token: ${{ secrets.PUBLIC_REPO_TOKEN }}
    tag_name: ${{ github.ref_name }}
    files: |
      android-app/android/app/build/outputs/apk/debug/*.apk
      android-app/android/app/build/outputs/apk/release/*.apk
```

------

这样之后：

- 你正常往**私有仓库**推代码，Actions 自动编译
- APK 自动发布到**公开仓库**的 Release 页面
- 任何人都能访问公开仓库下载 APK，但看不到源码