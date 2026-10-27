#!/usr/bin/env node
// 触发 DSH 热重载，让改动过的插件代码在运行中的会话里生效，省掉重启 DSH。
//
// 原理：profile 的 cordis.patch.yml 里 `hmr.root` 指向本目录，DSH 的 hmr 插件
// 监听文件变更后重建插件实例。@deepseek-ai/dsh-hmr 的 watcher 忽略 node_modules，
// 只往 index.js / client.js 写入一次 mtime 即可命中。
//
// 客户端（client.js → 面板 bundle）在插件重载后仍需刷新一次页面，见结尾提示。
import {existsSync, readFileSync, utimesSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';

const pluginDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const profilePatch = join(homedir(), '.dsh', 'profiles', 'desktop', 'cordis.patch.yml');

// hmr 没配时 touch 不会有人监听，先说清楚，避免"脚本跑了但没生效"的迷惑。
if (existsSync(profilePatch)) {
  const patch = readFileSync(profilePatch, 'utf8');
  if (!patch.includes(pluginDir)) {
    console.warn(`⚠ ${profilePatch} 的 hmr.root 未包含 ${pluginDir}`);
    console.warn('  本脚本只会更新 mtime，不会被监听；请在 patch 里补上 hmr.root 后重启一次 DSH。');
  }
} else {
  console.warn(`⚠ 找不到 ${profilePatch}，跳过 hmr 配置检查`);
}

const targets = ['index.js', 'client.js'].filter(name => existsSync(join(pluginDir, name)));
if (targets.length === 0) {
  console.error(`✗ ${pluginDir} 下没有 index.js / client.js`);
  process.exit(1);
}

const now = new Date();
for (const name of targets) {
  const file = join(pluginDir, name);
  // touch：mtime 变新即可，内容不动，避免顺手改坏文件。
  utimesSync(file, now, now);
  console.log(`· touched ${name}`);
}
console.log(`
已触发重载，DSH 会在毫秒级重建插件：
  · 宿主侧（工具 feishu_bug_status、工作流、清理逻辑）—— 立即生效，无需任何操作
  · 客户端面板（client.js 的 UI）—— 刷新一次页面（⌘R）后生效
  · 只改了 README / locale / cordis.patch.yml 里的 config 时不必跑本脚本，
    配置变更需重启 DSH；locale 文案随下一次页面刷新读取
`);
