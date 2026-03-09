项目整理与扩展规划

现状摘要
- 当前只有一个 Game.html 文件，HTML/CSS/JS 全部内联，逻辑、数据、渲染、配置混在一起
- 关键数据直接写死：关卡列表、单词库、按键、参数等都在同一文件内
- 未来扩展会导致单文件快速膨胀，维护和调试难度增加

目标方向
- 让内容与代码分离
- 让资源与逻辑分离
- 让可配置项可在不改代码的情况下替换
- 保持纯前端静态文件可直接打开运行

建议目录结构
- /src
  - /core
  - /systems
  - /entities
  - /scenes
  - /ui
  - /data
  - /utils
- /assets
  - /images
  - /audio
  - /fonts
- /config
  - game.json
  - controls.json
  - levels.json
- /words
  - words-base.json
  - words-animals.json
  - words-colors.json
  - words-import.json
- /tools
  - dev-loader.js

核心模块划分建议
- GameCore：启动、暂停、重置、切关逻辑
- Renderer：绘制角色与场景
- Physics 与 Collision：重力与碰撞
- Spawner：生成平台、道具、怪物、单词
- WordManager：词库加载、筛选与重复控制
- InputManager：按键映射与多设备适配
- ConfigManager：读取配置与词库
- AudioManager：发音与音效播放

调试与可配置设计
- 支持配置文件修改即可生效
- 配置重力、速度、跳跃、判定容差
- 按键设置
- 词库与场景切换
- 调试模式显示碰撞框、FPS、坐标

兼容未来功能的预留
- 新场景：新增 scenes 与 levels.json
- 新动作：扩展玩家行为状态
- 新图片：assets/images 管理
- 新词库：新增 json 即可
- 导入词库：支持加载外部 words-import.json 或远程 JSON
