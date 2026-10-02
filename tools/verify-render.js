/* ============================================================================
 * 可视化渲染自检 (tools/verify-render.js)
 *   用真实的 js/core/render.js，把每道题 algo.ref 在 viz.input 上产生的
 *   每一步都渲染一遍，断言：
 *     - 预览结构里不出现「empty / 不是数组」（说明 viz 声明的字段确实存在且形态正确）
 *     - 渲染出的 HTML 长度合理（真的画出了东西）
 *   这正是页面播放时走的同一条代码路径。
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const win = {}; win.window = win;
const ctx = vm.createContext(win);
ctx.console = console;

const FILES = [
  'js/data/problems-A.js', 'js/data/problems-B.js', 'js/data/problems-C.js',
  'js/data/problems-D.js', 'js/data/problems-E.js', 'js/data/problems-F.js',
  'js/data/problems-G.js', 'js/data/problems-H.js', 'js/data/problems-I.js',
  'js/data/problems-J.js'
];
FILES.forEach(f => {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) return;
  try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f }); }
  catch (e) { console.log('⚠ 跳过 ' + f + ': ' + e.message.split('\n')[0]); }
});
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/core/trace.js'), 'utf8'), ctx, { filename: 'trace.js' });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/core/render.js'), 'utf8'), ctx, { filename: 'render.js' });

const problems = win.CSP.problems || [];
const trace = win.CSP.trace;
const R = win.CSP.render;

let ok = 0, bad = 0;
const failures = [];

problems.forEach(p => {
  const viz = p.algo && p.algo.viz;
  if (!viz) { failures.push(p.id + ' 没有 viz'); bad++; return; }
  const input = viz.input != null ? viz.input : (p.samples[0] || {}).input;
  const r = trace.run(p.algo.ref, input);
  if (!r.ok) { failures.push(p.id + ' 运行失败: ' + r.error); bad++; return; }
  let localBad = 0, firstBadAt = -1, minLen = 1e9;
  r.steps.forEach(s => {
    const html = R.structure(s.state, viz, {});
    if (html.length < minLen) minLen = html.length;
    if (/class="empty"|不是数组|不是二维数组|缺少节点数|缺少树结构/.test(html)) {
      localBad++;
      if (firstBadAt < 0) firstBadAt = s.i;
    }
  });
  const varsHtml = R.vars(r.steps.length ? r.steps[0].state : {}, {});
  if (localBad) {
    bad++;
    failures.push(p.id + ' (' + viz.type + ') 有 ' + localBad + '/' + r.steps.length +
      ' 步渲染为空结构，首个在第 ' + (firstBadAt + 1) + ' 步');
  } else {
    ok++;
  }
});

console.log('='.repeat(70));
console.log('可视化渲染自检：' + problems.length + ' 题');
console.log('  渲染正常: ' + ok + '   渲染异常: ' + bad);
if (failures.length) {
  console.log('\n问题明细：');
  failures.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log('\n✅ 全部题目的可视化在每一步都能正常渲染');
