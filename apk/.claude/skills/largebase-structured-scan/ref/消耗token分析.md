Token 消耗分析（基于当前项目 116 文件 / 281k tokens）
谁吃的多？
消费者	阶段	估算消耗	计费方
Cartographer subagents	扫描	~300-400k	Claude API（你的 yunyi）
CC 主会话编排	扫描+开发	~30-50k	Claude API
Codex 生成 scan-data.json	扫描	~250-350k	OpenAI API
CC 侧的大头是 Cartographer。它 spawn 3-5 个 Sonnet 子代理，每个子代理通过 Read 工具读文件 → 文件内容进入 Claude API 上下文 → Claude 分析 → 返回摘要。文件内容本身就是 token，Read 工具虽然是本地操作，但读出来的内容要送进 Claude API 才能被理解。

Codex 侧消耗和 Cartographer 差不多量级，但走的是 OpenAI 计费，你说不太在意。

所以瓶颈很明确：Cartographer 的 Sonnet 子代理是 CC 侧最大的 token 消费者。

为什么 Cartographer 不能封装成本地 Skill 省 token？
关键误解在这里：Claude Code 里的 "Skill" 只是一个 prompt 模板，执行时仍然走 Claude API。把 Cartographer 改成 Skill 不会省一个 token。

但 Cartographer 已经做了一件对的事：scan-codebase.py 是纯本地 Python 脚本，负责文件遍历、token 计数、二进制检测。这部分零 token。

真正吃 token 的是下一步：Sonnet 子代理读文件内容并分析语义。这一步必须用 AI，因为你要的是"这个模块干什么、API 是什么、依赖关系是什么"——这不是 grep import 能解决的。

真正能省 token 的路径
Cartographer 的工作可以拆成两层：

层	内容	是否需要 AI
结构层	目录树、文件列表、import 关系、函数签名	不需要，本地解析即可
语义层	模块职责、设计模式、业务逻辑、gotchas	需要 AI
现在 Cartographer 把两层都交给 Sonnet 子代理做。如果把结构层用本地工具（scan-codebase.py 已有 + 简单 import 提取）先做完，Sonnet 子代理只需要处理语义层，输入 token 可以砍掉 50-70%——因为你不需要把完整文件内容发给 AI，只需要发"这个文件导出了 X、依赖了 Y、有 Z 行代码，请总结职责"。

这比切 API 更根本：减少发给 AI 的内容量，而不是换一个更便宜的 AI。

具体方案

现在：
  scan-codebase.py（本地）→ 文件列表 + token 数
  Sonnet 子代理 → 读完整文件 + 分析语义
  = 每个文件的全部内容都过 API

优化后：
  scan-codebase.py（本地）→ 文件列表 + token 数
  local-extract.py（新增，本地）→ import 关系 + 函数签名 + 类定义
  Sonnet 子代理 → 只收到摘要信息 + 关键代码片段，分析语义
  = 只有关键片段过 API，输入量减少 50-70%
这个 local-extract.py 不需要 tree-sitter，用 Python 的 ast 模块处理 .py 文件、用正则处理 JS/TS 的 import/export 就够了。

要不要往这个方向做？还是你更倾向先拿大代码库验证现有流程的实际消耗？