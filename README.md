# 飞书缺陷工作流 · DSH 插件

在 DeepSeek Harness（DSH）Web GUI 里读取飞书项目（Feishu Project / Meegle）中**分配给我**的缺陷，逐条在独立分支上修复，并把「重复确认、验收、合并」留在人手里。

一条缺陷 = 一个分支 = 一个可审查的执行会话；修复提交只落在该缺陷的分支上，推送与合并始终由你做。

> A DSH bundle that turns your Feishu Project bug queue into isolated, review-gated repair branches. Human-only duplicate decisions, verification, and merging.

## 它解决什么

- 飞书项目里几十上百条 bug，人工挑选、拉分支、写上下文很碎。
- 希望每个 bug 独立分支、互不污染，修完由人验证。
- 重复缺陷不该重复开分支，但机器判断不可靠，需要人先确认。

## 界面

真实运行截图（本地仓库路径已打码）：

![飞书缺陷工作流面板](docs/panel-overview.png)

顶部是四个门禁计数：待修复、疑似重复待确认、修复中、待你验证。下面依次是扫码授权、本轮范围（项目 / 工作项类型 / 状态筛选 / 仓库目录 / 修复模型）与缺陷列表。

## 工作流

1. **扫码授权**：面板生成官方 Meegle Device Code 二维码，用飞书扫码并在官方页面确认。插件不接触令牌，令牌由官方 CLI 存入系统钥匙串。
2. **读取范围**：选项目 → 选工作项类型（缺陷）→ 按工作流状态筛选（默认 `BUG,REOPENED`）→ 选本地仓库根目录 →（可选）选修复模型 → 读取分配给我的未完成缺陷。模型列表来自 Harness 当前可路由的模型，默认「跟随 Agent 默认」，只影响之后启动的修复任务。
3. **重复确认**：标题相似度 ≥ 0.72 的条目标为「疑似重复 · 待确认」。确认重复 → 跳过、不开分支；确认不重复 → 才允许开始。
4. **隔离修复**：开始前先看仓库状态。工作树干净时，直接在仓库里从本地 `develop` 检出 `fix/feishu-<bug编号>[-标题片段]`；工作树里有你未提交的改动（比如正在 develop 上改别的 bug）时，绝不动它，自动改为在数据目录的 `worktrees/` 下开一个隔离 worktree，复用主仓的 Pods 与 workspace，主仓继续留在你原来的分支。两种模式都拒绝已存在的同名分支。
5. **面板内验证（可选）**：缺陷卡片上的「编译验证」直接在该分支目录里跑模拟器构建（独立 DerivedData，不传 `-sdk`），把结果、耗时和 `.app` 路径回填到卡片，失败时给出日志尾部；「在 Xcode 打开」直接打开该目录的 `.xcworkspace`。两条路都不需要先合并 develop。
6. **人工验收**：agent 在修复分支上提交（不推送、不合并），面板显示提交号。在主仓修复时分支已经检出，直接编译运行即可；隔离 worktree 里的修复用该目录下的 `.xcworkspace` 编译，主仓不受影响。不通过可「反馈并重试」（说明随任务带回 agent）；通过只标记「待手动合并」，可用「主仓切回 develop」收尾。**验证通过即释放隔离目录**：该缺陷的 worktree、构建产物与截图一并删除，卡片改为显示释放的路径和体积，分支和提交仍在仓库里，合并照旧。工作树里还有未提交改动时宁可保留，并在历史里记一条原因；在主仓修复的记录本来就不占额外目录，不受影响。旧的 worktree 记录仍可验收：需要时用「补齐构建前置」把 `xcworkspace` 与 `Pods` 补进去。
7. **失败与重试**：执行失败时卡片直接显示原因（例如 agent 回合被中断、构建失败、同名分支已存在）。分支已经建好的，用「反馈并重试」继续；在准备分支阶段就失败的（例如主仓有未提交改动），用「重新开始」按当前 `develop` 重新准备并启动，同样可以补充可选说明（留空即直接开始）。
8. **你来合并**：提交、推送、合并 `develop` 始终由你在自己的终端完成。

## 支持版本

| 组件 | 支持范围 | 本次验证 |
| --- | --- | --- |
| DeepSeek Harness | `>= 0.2.1-rc.2`（`dsh.engines.dsh`） | 0.2.1-rc.2（macOS） |
| 面板运行环境 | DSH Web GUI（`dsh web`） | 当前桌面版 |
| Node.js（随 DSH 提供） | `>= 22` | 25.2.0 |
| 官方 Meegle CLI | 固定 `@lark-project/meegle@1.0.27` | 1.0.27 |
| 必需 DSH 扩展 | 无（只用核心服务 `webServer`/`connection`/`tools`/`slots`/`locale`） | — |
| 可选 DSH 扩展 | 无（旧记录可读任务面板；关闭也不影响启动修复） | — |
| 面板内构建（可选） | Xcode + iOS Simulator SDK（`xcodebuild`，不传 `-sdk`） | Xcode 27.1 / iOS 27.1 SDK |
| 操作系统 | 需要系统钥匙串与 git | macOS |

**支持策略**

- `1.13.x` 为当前支持版本，修复以补丁版本发布（当前 `1.13.9`）。
- DSH 或 Meegle CLI 出现破坏性变更时，发布新的次版本并在 [CHANGELOG.md](CHANGELOG.md) 标注兼容范围。
- 低于 `0.2.1-rc.2` 的 DSH 不受支持；任务面板插件不是依赖，关闭或卸载它不会影响面板加载与修复执行。
- 仅支持单用户本机使用：Host 必须运行，面板跟随 owner 浏览器身份。

## 安装

前置：DSH `>= 0.2.1-rc.2`。除此之外**不硬依赖任何第三方插件**：

- 宿主只声明核心服务 `webServer`、`connection`、`tools`；修复会话直接用 DSH 自带的会话服务（`sessionController`）启动，不需要任务面板，也不需要工作区注册表。
- 客户端只声明核心服务 `slots`、`locale`；目录选择器（`uiWorkspace`）按需获取，取不到就退回手动输入路径。
- 因此关掉任务面板（`@linxin666/dsh-client-ui-task-board`）后，缺陷面板照常打开，「修复这条」「依次修复队列」「反馈并重试」照常可用：每次修复都是一个普通会话，出现在侧栏会话列表里。

```sh
git clone https://github.com/PetterWong-L/dsh-feishu-bugs.git
cd dsh-feishu-bugs
npm install --omit=dev
```

在 DSH 中把这个目录作为 bundle 安装（插件管理里选择该目录的绝对路径），然后重启 DSH。侧栏会出现「飞书缺陷工作流」。

数据默认写入 `~/.dsh/feishu-bugs-data`；如需自定义，在 bundle 配置里设置绝对路径 `storageDir`。

**本机安装位置（2026-10-27 迁移）**：插件源码在 `/Users/wanglichao/飞书缺陷工作流/feishu-bugs`，运行时数据在 `/Users/wanglichao/飞书缺陷工作流/feishu-bugs-data`。DSH profile（`~/.dsh/profiles/desktop`）用 `link:` 指向源码目录，并在 `cordis.patch.yml` 里用 `storageDir` 显式钉住数据目录——数据已不在 `~/.dsh/` 或 `~/dsh/` 的默认位置，省略 `storageDir` 会新建空队列。挪动目录后要重启 DSH；旧 worktree 记录的位置已随数据目录改写，但它们与主仓 `oog101-ios-swift` 的 git 绑定仍是旧路径（这些记录已验收归档，需要重新构建时用「补齐构建前置」）。

升级：拉取新版本后重启 DSH。执行状态、分支与选择都会持久化，重启不会重放分支创建。0.x 版本把数据放在 `~/dsh/feishu-bugs-data`，1.0 会一次性接管该目录，不会显示成空队列。1.10 起新缺陷改为在仓库内拉分支，不再创建 worktree；旧记录仍可验收，需要时用面板上的「补齐构建前置」。1.11 起主仓有未提交改动时自动改为隔离 worktree；1.12 起可在面板内直接编译验证或用 Xcode 打开该分支目录，失败可直接重新开始。1.13 起任务面板改为可选依赖，任务面板被关闭或卸载时缺陷面板不再整块消失。1.13.10 起验证通过会自动删除该缺陷的隔离 worktree 与构建产物（分支保留），并用一次启动清理回收历史遗留的已验证目录。

卸载：在插件管理里禁用/移除该 bundle；数据目录不会自动删除。

## 安全模型

- 授权使用官方 CLI 的专用 profile `dsh-feishu-bugs` 与固定 host `project.feishu.cn`，不继承其他飞书 CLI 登录或环境令牌。
- 访问令牌只存在系统钥匙串；插件、浏览器、模型都不读取或转存。
- 面板 HTTP/SSE 使用 Harness 的 owner 连接鉴权；POST 额外校验同源、JSON 与大小。模型侧只有只读状态工具，无法启动授权、确认重复、验收或执行。
- CLI 通过 `execFile` 固定参数调用，不经 shell；原始错误不返回给浏览器。
- Bug 正文与截图按**不可信数据**处理；提示词禁止合并、推送、跨仓库修改和读取凭据，并要求图片只当证据、不得提交。
- 附件只下载 `project.feishu.cn` 签名地址上的图片（PNG/JPEG/GIF/WebP/HEIC），最多 5 张、单张 20MB；文件名重写为安全名，写入 `.feishu-attachments/`，不执行。
- 修复分支只从本地 `develop` 创建，不改写历史；插件与代理都不执行 `push` 或合并，也不动其它仓库。
- 这不是针对本机恶意进程的沙箱；组织级保护请对 `develop` 设置分支保护。

## 边界与已知限制

- 重复检测只做标题文本相似度，不能替代语义判断。
- 一次只运行一个修复会话；队列在重启后需手动继续。
- 主仓有未提交改动时会自动切到隔离 worktree；这类修复在侧栏会临时多一个工作区，验收通过后连同目录一起删除（分支与提交保留）。
- 修复会话直接跑在你的仓库里，不会再为每个缺陷注册侧栏工作区。旧版本用 worktree 跑出来的记录仍保留原工作区：只有分支已包含提交（或已被你合并）时才移除；工作树里还有未提交改动时宁可留着。
- 开始修复前要求仓库工作树干净；同名分支已存在会拒绝。切换分支、提交修复由插件/代理完成，推送与合并始终由你做。
- 「编译验证」在本机串行执行，同一时间只允许一个构建；构建日志只回填末尾 60 行。
- 执行失败后的「重新开始」会复用原缺陷记录，不会新建重复条目；若该缺陷的会话仍在运行，会拒绝重试并提示先去处理。
- 验证通过后 `worktrees/` 下该缺陷的目录与 `build/` 下的 DerivedData 会被删除，磁盘占用不会随缺陷数无限增长；被删的只是检出的副本，分支、提交与主仓的 Pods 都不动。删除前会重新检查工作树，有未提交改动就跳过并在「最近操作」里记一条 `worktree-kept`。
- 修复跑在普通会话里，因此不会为缺陷建任务、建工作区；你可以在侧栏找到该会话继续追问，面板会在 30 分钟内把它重新显示为「修复中」。
- 无飞书消息推送、系统通知、定时同步或 webhook。
- 单次最多导入最近更新的 200 条缺陷（面板会提示截断）。
- 面板「编译验证」只做模拟器 Debug 构建，不签名、不装真机；需要真机时用 Xcode 打开该分支自己跑。
- 构建验证优先使用已连接的 Xcode MCP（`mcp__xcode__*`），未连接时才退回 `xcrun xcodebuild`；任务总结会注明走了哪条路径。
- 修复质量取决于 DSH 会话；完成不等于修好，必须人工验收。
- 只读取附件字段里的图片，不解析富文本正文中的内联图片；非图片附件（日志、录屏）不会下载。
- 截图下载失败不会卡住修复，但会把失败原因写进提示词，代理需显式说明缺图。
- 读取、筛选、分支、截图下载与面板状态流转已用真实账号验证；真实缺陷的修复闭环建议先小范围试用。

## 开发

```sh
npm install
npm test          # node --test *.test.js
node --check client.js
node --check index.js
```

| 文件 | 职责 |
| --- | --- |
| `index.js` | Host 扩展：动作、状态机、任务启动、HTTP/SSE 路由 |
| `client.js` | 侧栏与主面板 UI（React，经 DSH 插槽挂载） |
| `meegle.js` / `mql.js` | 官方 CLI 调用、MQL 查询、分页与 typed 字段解码 |
| `auth.js` / `cli.js` | Device Code 授权、CLI 执行封装 |
| `git.js` | 仓库内分支创建与校验、脏仓库隔离、旧 worktree 处理 |
| `build.js` | 面板内构建：workspace/scheme 发现、`xcodebuild` 执行、产物与日志 |
| `workflow.js` / `store.js` | 人工门禁状态机（含失败重试/重新开始）与持久化 |
| `http.js` | owner 鉴权路由 |

### 改完不用重启 DSH

DSH 只在启动时求值插件的 ESM 模块并缓存，所以默认情况下改代码必须重启才生效。开启 HMR 后可以省掉这一步：

```yaml
# ~/.dsh/profiles/desktop/cordis.patch.yml
- id: hmr
  config:
    root:
      - "/Users/wanglichao/飞书缺陷工作流/feishu-bugs"
```

`@deepseek-ai/dsh-hmr` 会监听该目录（`node_modules` 默认排除），文件变动后重建插件实例：`ctx.set/ctx.tool/事件` 重新注册，进行中的任务不受影响。改完执行：

```sh
npm run reload     # touch index.js / client.js，触发 watcher
```

生效范围：宿主侧（工具、动作、工作流、清理逻辑）立即生效；`client.js` 的面板 UI 需要刷新一次页面（⌘R）；`cordis.patch.yml` 里的 `config` 改动、以及 `package.json` 的依赖变更仍需重启。副作用是插件实例重建、内存态丢失（本插件状态都在 `storageDir`，无影响）。

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。

## License

[MIT](LICENSE)
