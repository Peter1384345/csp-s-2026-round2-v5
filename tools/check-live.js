/* ============================================================================
 * 线上部署自检 (tools/check-live.js)
 *   检查 GitHub Pages 上实际提供的资源是否与仓库一致，以及关键功能代码是否已上线。
 *   用法: node tools/check-live.js [baseUrl]
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'https://peter1384345.github.io/csp-s-2026-round2-v5/';
const ROOT = path.join(__dirname, '..');

(async () => {
  let pass = 0, fail = 0;
  function ok(cond, label, extra) {
    if (cond) { pass++; console.log('  ✅ ' + label + (extra ? '  ' + extra : '')); }
    else { fail++; console.log('  ❌ ' + label + (extra ? '  ' + extra : '')); }
  }

  console.log('线上自检: ' + BASE);

  /* 1. index.html 与本地一致 */
  const localIdx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const liveIdx = await (await fetch(BASE + 'index.html')).text();
  const ver = (liveIdx.match(/v=(\d+)/) || [])[1];
  ok(liveIdx.length === localIdx.length, 'index.html 与本地一致',
    `local=${localIdx.length} live=${liveIdx.length} ver=${ver}`);

  /* 2. 关键资源可达 */
  const assets = liveIdx.match(/(?:src|href)="([^"]+)"/g).map(s => s.replace(/^(?:src|href)="/, '').replace(/"$/, ''));
  const localAssets = assets.filter(a => !/^https?:/.test(a) && !a.startsWith('data:'));
  let badAssets = [];
  for (const a of localAssets) {
    const r = await fetch(BASE + a);
    if (!r.ok) badAssets.push(r.status + ' ' + a);
  }
  ok(badAssets.length === 0, `全部 ${localAssets.length} 个页面资源可访问（含带版本号的 JS/CSS）`,
    badAssets.length ? badAssets.join(', ') : '');

  /* 3. 关键能力代码已上线 */
  const problemJs = await (await fetch(BASE + (localAssets.find(a => a.indexOf('problem.js') >= 0) || 'js/views/problem.js'))).text();
  ok(problemJs.indexOf('id="vz-input" class="viz-input" rows') >= 0,
    '可视化输入框已是 textarea（保留多行测试数据的换行）');
  ok(problemJs.indexOf('serviceErrors') >= 0, '评测服务繁忙不再计为用户错题');
  ok(problemJs.indexOf('vz-loadcase') >= 0, '随机对拍支持一键载入反例');

  const runnerJs = await (await fetch(BASE + (localAssets.find(a => a.indexOf('runner.js') >= 0) || 'js/core/runner.js'))).text();
  ok(runnerJs.indexOf('mode === "fuzz"') >= 0 || runnerJs.indexOf("mode === 'fuzz'") >= 0,
    '对拍在单个 Worker 内完成（不会卡住页面）');

  const judgeJs = await (await fetch(BASE + (localAssets.find(a => a.indexOf('judge.js') >= 0) || 'js/core/judge.js'))).text();
  ok(judgeJs.indexOf('serviceErrors') >= 0, '判题器上报 serviceErrors 字段');

  /* 4. 数据规模 */
  let total = 0;
  for (const f of ['syllabus', 'problems-A', 'problems-B', 'problems-C', 'problems-D', 'problems-E',
    'problems-F', 'problems-G', 'problems-H', 'problems-I', 'problems-J',
    'cards-A', 'cards-B', 'cards-C']) {
    const r = await fetch(BASE + 'js/data/' + f + '.js');
    const txt = await r.text();
    if (f.startsWith('problems')) total += (txt.match(/id:\s*'p\d+'/g) || []).length;
  }
  ok(total === 75, '线上题库题目数 = 75', '实际 ' + total);

  console.log('\n结果: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
