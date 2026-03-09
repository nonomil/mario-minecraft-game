@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 学习系统优化 - 自动化提交脚本 (Windows)
REM 使用方法：commit-version.bat v1.6.0

set VERSION=%1

if "%VERSION%"=="" (
    echo ❌ 错误：请指定版本号
    echo 使用方法：commit-version.bat v1.6.0
    exit /b 1
)

REM 切换到项目根目录
cd /d "%~dp0..\..\..\"

echo 📦 准备提交版本：%VERSION%
echo.

REM 检查 git 状态
echo 🔍 检查 git 状态...
git status

echo.
set /p CONTINUE="是否继续提交？(y/n) "
if /i not "%CONTINUE%"=="y" (
    echo ❌ 取消提交
    exit /b 1
)

REM 根据版本号设置提交信息
if "%VERSION%"=="v1.6.0" (
    set "TITLE=学习系统 - 答题数据结构扩展"
    set "BODY=- 新增 challengeStats 数据结构记录答题统计^

- 在 completeLearningChallenge 中记录答对/答错次数^

- 新增 getChallengeStats^(^) 统计查询函数^

- 为后续学习系统优化提供数据基础"
) else if "%VERSION%"=="v1.6.1" (
    set "TITLE=学习系统 - 宝箱绑定学习"
    set "BODY=- 宝箱开启前触发答题，消除随机弹窗打断心流^

- 答对提升宝箱稀有度，强化学习动机^

- 答错也能开箱，降低学习压力^

- 关闭随机 Challenge 触发，保留 WordGate 机制^

- 新增 chestLearningEnabled 配置项^

- 设置面板增加宝箱学习开关"
) else if "%VERSION%"=="v1.6.2" (
    set "TITLE=学习系统 - 环境单词标签"
    set "BODY=- 敌人/物品上方显示英文名标签^

- 实现零压力的被动浸入式学习^

- 新增 ENTITY_NAMES 映射表（30+实体）^

- 新增 drawEntityLabel^(^) 通用渲染函数^

- 支持敌人、傀儡、宝箱等实体^

- 新增 showEnvironmentWords 配置项^

- 设置面板增加环境单词开关"
) else if "%VERSION%"=="v1.6.3" (
    set "TITLE=学习系统 - Biome 切换复习"
    set "BODY=- Biome 切换时触发快速复习（3题）^

- 基于间隔重复算法选择复习单词^

- 优先复习错误率高和久未复习的单词^

- 全对奖励：+90分 +1💎^

- 新增 reviewOnBiomeSwitch 配置项^

- 复习过程游戏暂停，不受干扰"
) else if "%VERSION%"=="v1.6.4" (
    set "TITLE=学习系统 - 个人资料面板扩展"
    set "BODY=- 个人资料面板显示答题统计（次数、正确率、单词数）^

- 新增单词本功能，查看所有答题单词^

- 单词按掌握程度排序（需复习的在前）^

- 颜色标记：红色（^<50%%）、黄色（50-79%%）、绿色（≥80%%）^

- 显示每个单词的答对/答错次数^

- 可视化学习成长，提升长期动力"
) else if "%VERSION%"=="v1.6.5" (
    set "TITLE=学习系统 - 集成测试与优化"
    set "BODY=- 完成学习系统全功能集成测试^

- 修复全局状态冲突问题^

- 优化宝箱学习提示文字^

- 优化复习倒计时提示^

- 新增单词本搜索功能（可选）^

- 确认所有配置开关正常工作^

- 性能测试通过，无卡顿"
) else (
    echo ❌ 错误：未知版本号 %VERSION%
    echo 支持的版本：v1.6.0, v1.6.1, v1.6.2, v1.6.3, v1.6.4, v1.6.5
    exit /b 1
)

REM 添加所有修改
echo.
echo 📝 添加文件到暂存区...
git add .

REM 创建提交
echo.
echo 💾 创建提交...
git commit -m "feat: !TITLE! (!VERSION!)

!BODY!"

REM 显示提交信息
echo.
echo ✅ 提交创建成功！
echo.
git log -1 --oneline

REM 推送到远程
echo.
set /p PUSH="是否推送到远程？(y/n) "
if /i "%PUSH%"=="y" (
    echo 🚀 推送到远程...
    git push origin main
    echo.
    echo ✅ 推送成功！
) else (
    echo ⏸️  跳过推送，稍后可手动执行：git push origin main
)

echo.
echo 🎉 版本 %VERSION% 提交完成！
echo.
echo 📋 下一步：
if "%VERSION%"=="v1.6.0" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 开始实施 v1.6.1 - 宝箱绑定学习
) else if "%VERSION%"=="v1.6.1" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 开始实施 v1.6.2 - 环境单词标签
) else if "%VERSION%"=="v1.6.2" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 开始实施 v1.6.3 - Biome 切换复习
) else if "%VERSION%"=="v1.6.3" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 开始实施 v1.6.4 - 扩展个人资料面板
) else if "%VERSION%"=="v1.6.4" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 开始实施 v1.6.5 - 集成测试与优化
) else if "%VERSION%"=="v1.6.5" (
    echo   1. 更新 apk/docs/version/CHANGELOG.md
    echo   2. 🎉 学习系统优化全部完成！
)

endlocal
