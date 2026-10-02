/* ============================================================================
 * 内容自检脚本 (tools/verify.js)
 *   独立于出题 agent 的二次校验：加载全部数据 + 追踪引擎，逐题检查
 *     1. 字段完整性 / knowledge id 合法性 / 测试点与分数
 *     2. algo.ref 在每组测试点上运行，输出必须与 tests[i].output 完全一致
 *     3. algo.ref 在 viz.input 上能跑通，且步骤数在可视化可承受范围内
 *     4. viz 声明的字段在 state 里真实存在
 *     5. algo.userTemplate / algo.gen 语法合法、可运行
 *   用法: node tools/verify.js [--verbose]
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const verbose = process.argv.includes('--verbose');

/* ---- 构造浏览器式环境 ---- */
function makeWindow() {
  const win = {};
  win.window = win;
  win.performance = { now: () => Date.now() };
  const ctx = vm.createContext(win);
  return { win, ctx };
}

const loadFailures = [];
function loadInto(ctx, rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { loadFailures.push(rel + '（文件不存在）'); return false; }
  const code = fs.readFileSync(file, 'utf8');
  try {
    vm.runInContext(code, ctx, { filename: rel });
    return true;
  } catch (e) {
    loadFailures.push(rel + ' → ' + e.message.split('\n')[0]);
    return false;
  }
}

const { win, ctx } = makeWindow();
ctx.console = console;
ctx.Math = Math; ctx.JSON = JSON; ctx.Date = Date; ctx.Number = Number;

const DATA_FILES = [
  'js/data/syllabus.js',
  'js/data/problems-A.js', 'js/data/problems-B.js', 'js/data/problems-C.js',
  'js/data/problems-D.js', 'js/data/problems-E.js',
  'js/data/problems-F.js', 'js/data/problems-G.js', 'js/data/problems-H.js',
  'js/data/problems-I.js',
  'js/data/cards-A.js', 'js/data/cards-B.js', 'js/data/cards-C.js'
];
const loadedOk = DATA_FILES.map(f => loadInto(ctx, f)).filter(Boolean).length;
loadInto(ctx, 'js/core/trace.js');

const CSP = win.CSP;
const syllabus = CSP.syllabus || [];
const problems = CSP.problems || [];
const cards = CSP.cards || {};
const trace = CSP.trace;

const ids = new Set(syllabus.map(k => k.id));
const errors = [];
const warns = [];
function err(pid, msg) { errors.push(`[${pid}] ${msg}`); }
function warn(pid, msg) { warns.push(`[${pid}] ${msg}`); }

console.log('='.repeat(72));
console.log(`考纲考点: ${syllabus.length}   题目: ${problems.length}   知识卡: ${Object.keys(cards).length}`);
if (loadFailures.length) {
  console.log('\n⚠ 加载失败的文件：');
  loadFailures.forEach(f => console.log('  - ' + f));
}
console.log('='.repeat(72));

/* ---------------- 1. 结构检查 ---------------- */
const seenIds = new Set();
const seenNo = new Set();
problems.forEach(p => {
  const pid = p.id || '(无 id)';
  if (!p.id) err(pid, '缺少 id');
  if (seenIds.has(p.id)) err(pid, '题目 id 重复');
  seenIds.add(p.id);
  if (seenNo.has(p.no)) err(pid, '题目编号 no 重复');
  seenNo.add(p.no);
  ['title', 'statement', 'inputFormat', 'outputFormat', 'tier'].forEach(k => {
    if (!p[k]) err(pid, `缺少字段 ${k}`);
  });
  if (!p.diff || p.diff < 1 || p.diff > 6) err(pid, `diff 非法: ${p.diff}`);
  if (!p.knowledge || !p.knowledge.length) err(pid, '缺少 knowledge');
  else p.knowledge.forEach(k => {
    if (!ids.has(k)) err(pid, `knowledge id 不在 syllabus 中: ${k}`);
  });
  if (!p.samples || !p.samples.length) err(pid, '缺少 samples');
  if (!p.tests || p.tests.length !== 5) err(pid, `tests 数量应为 5，实际 ${p.tests ? p.tests.length : 0}`);
  else {
    const sum = p.tests.reduce((s, t) => s + (t.score || 0), 0);
    if (sum !== 100) warn(pid, `测试点总分 ${sum} ≠ 100`);
    p.tests.forEach((t, i) => {
      if (t.input == null) err(pid, `tests[${i}] 缺 input`);
      if (t.output == null) err(pid, `tests[${i}] 缺 output`);
    });
  }
  if (!p.std || !p.std.code) err(pid, '缺少 std.code（C++ 参考程序）');
  if (!p.algo) { err(pid, '缺少 algo'); return; }
  const a = p.algo;
  if (!a.ref) err(pid, '缺少 algo.ref');
  if (!a.userTemplate) err(pid, '缺少 algo.userTemplate');
  if (!a.viz) warn(pid, '缺少 algo.viz（无可视化）');
  if (!a.gen) warn(pid, '缺少 algo.gen（无法随机对拍）');
  else {
    try { new Function('return (' + a.gen + ')')(); }
    catch (e) { err(pid, 'algo.gen 语法错误: ' + e.message); }
  }
});

/* 编号连续性提示 */
const nums = problems.map(p => p.no).sort((a, b) => a - b);
for (let i = 1; i <= nums.length; i++) {
  if (nums[i - 1] !== i) { warns.push(`题目编号不连续：期望 ${i}，实际 ${nums[i - 1]}`); break; }
}

/* ---------------- 2. 轨迹运行检查 ---------------- */
let refPass = 0, refFail = 0, vizOk = 0, vizBad = 0, tmplOk = 0, tmplBad = 0;
const detail = [];

problems.forEach(p => {
  const pid = p.id;
  if (!p.algo || !p.algo.ref) return;
  const row = { pid, title: p.title, tests: 0, pass: 0, vizSteps: 0, vizType: p.algo.viz && p.algo.viz.type };

  /* 2a. 测试点：ref 输出必须等于期望输出 */
  (p.tests || []).forEach((t, i) => {
    row.tests++;
    let r;
    try { r = trace.run(p.algo.ref, t.input); }
    catch (e) { err(pid, `ref 在 tests[${i}] 抛出异常: ${e.message}`); return; }
    if (!r.ok) { err(pid, `ref 在 tests[${i}] 运行失败: ${r.error}`); return; }
    const got = trace.norm(r.answer);
    const exp = trace.norm(t.output);
    if (got !== exp) {
      err(pid, `ref 输出与 tests[${i}] 期望不一致\n      期望: ${JSON.stringify(exp.slice(0, 120))}\n      实际: ${JSON.stringify(got.slice(0, 120))}`);
    } else { row.pass++; refPass++; }
  });
  if (row.pass < row.tests) refFail += (row.tests - row.pass);

  /* 2b. 可视化输入：跑得通、步数合理、viz 字段存在 */
  const viz = p.algo.viz;
  if (viz) {
    const vin = viz.input != null ? viz.input : (p.samples && p.samples[0] ? p.samples[0].input : null);
    if (vin == null) { err(pid, '无法确定 viz.input'); }
    else {
      let r;
      try { r = trace.run(p.algo.ref, vin); }
      catch (e) { err(pid, `ref 在 viz.input 抛出异常: ${e.message}`); r = null; }
      if (r) {
        if (!r.ok) err(pid, `ref 在 viz.input 运行失败: ${r.error}`);
        row.vizSteps = r.steps.length;
        if (r.steps.length === 0) { err(pid, 'viz 输入下没有产生任何步骤（未调用 T.step）'); }
        else if (r.steps.length > 260) warn(pid, `viz 步骤数偏多: ${r.steps.length}（建议 ≤ 200）`);
        if (r.ok) vizOk++; else vizBad++;

        /* viz 引用的键是否真的出现在 state 中 */
        const need = [];
        ['mainKey', 'edgesKey', 'distKey', 'curKey', 'childrenKey', 'rowKey', 'colKey', 'matchKey', 'valKey'].forEach(k => {
          if (viz[k]) need.push(viz[k]);
        });
        (viz.pointers || []).forEach(k => need.push(k));
        (viz.highlight || []).forEach(k => need.push(k));
        const allKeys = new Set();
        r.steps.forEach(s => Object.keys(s.state || {}).forEach(k => allKeys.add(k)));
        need.forEach(k => {
          if (!allKeys.has(k)) warn(pid, `viz 引用的 state.${k} 在所有步骤中都没出现`);
        });
        /* 图/树类型的必要键 */
        if (viz.type === 'graph') {
          ['n', 'edges'].forEach(k => { if (!allKeys.has(k)) err(pid, `graph 类型缺少 state.${k}`); });
        }
        if (viz.type === 'matrix' && viz.mainKey) {
          const st = r.steps.find(s => trace.clone && Array.isArray(s.state[viz.mainKey]));
          if (!st) err(pid, `matrix 类型的 state.${viz.mainKey} 不是二维数组`);
        }
      }
    }
  }

  /* 2c. userTemplate 必须语法正确、能运行（答案可以错，但不能崩） */
  if (p.algo.userTemplate) {
    const vin = (viz && viz.input) || (p.samples[0] && p.samples[0].input) || '';
    let r;
    try { r = trace.run(p.algo.userTemplate, vin); }
    catch (e) { err(pid, 'userTemplate 抛出异常: ' + e.message); r = null; }
    if (r) {
      if (r.errorType === 'SyntaxError') err(pid, 'userTemplate 语法错误: ' + r.error);
      else tmplOk++;
    }
    if (r && r.errorType && r.errorType !== 'SyntaxError' && r.ok === false) tmplOk++;
  }

  detail.push(row);
});

/* ---------------- 3. 知识卡覆盖率 ---------------- */
const sylNoCard = syllabus.filter(k => !cards[k.id]);
const cardNoSyl = Object.keys(cards).filter(k => !ids.has(k));
if (sylNoCard.length) warns.push(`以下考点缺少知识卡(${sylNoCard.length}): ${sylNoCard.map(k => k.name).join(', ')}`);
if (cardNoSyl.length) errors.push(`以下知识卡 id 不在考纲中: ${cardNoSyl.join(', ')}`);

/* 每张卡字段完整性 */
let cardBad = 0;
Object.keys(cards).forEach(k => {
  const c = cards[k];
  ['definition', 'complexity', 'pattern', 'template'].forEach(f => {
    if (!c[f]) { errors.push(`[card ${k}] 缺少 ${f}`); cardBad++; }
  });
  if (!Array.isArray(c.keyPoints) || c.keyPoints.length < 3) { errors.push(`[card ${k}] keyPoints < 3`); cardBad++; }
  if (!Array.isArray(c.pitfalls) || c.pitfalls.length < 2) { errors.push(`[card ${k}] pitfalls < 2`); cardBad++; }
});

/* ---------------- 4. 考点覆盖：每个考点至少被一道题覆盖 ---------------- */
const covered = new Set();
problems.forEach(p => (p.knowledge || []).forEach(k => covered.add(k)));
const uncovered = syllabus.filter(k => !covered.has(k.id));
if (uncovered.length) warns.push(`以下考点没有对应题目(${uncovered.length}): ${uncovered.map(k => k.name).join(', ')}`);

/* ---------------- 输出 ---------------- */
console.log('\n逐题结果：');
console.log('  题号   测试点通过    可视化步数  类型      题目');
detail.forEach(r => {
  console.log('  ' + r.pid.padEnd(6) +
    (r.pass + '/' + r.tests).padEnd(14) +
    String(r.vizSteps).padEnd(12) +
    String(r.vizType || '-').padEnd(10) + r.title);
});

console.log('\n统计：');
console.log(`  ref 测试点通过: ${refPass}  失败: ${refFail}`);
console.log(`  可视化可运行: ${vizOk}  失败: ${vizBad}`);
console.log(`  知识卡: ${Object.keys(cards).length} / 考纲 ${syllabus.length}（缺 ${sylNoCard.length}）`);
console.log(`  考点被题目覆盖: ${covered.size} / ${syllabus.length}（未覆盖 ${uncovered.length}）`);

if (warns.length) {
  console.log(`\n⚠ 警告 (${warns.length})：`);
  warns.forEach(w => console.log('  - ' + w));
}
if (errors.length) {
  console.log(`\n❌ 错误 (${errors.length})：`);
  errors.forEach(e => console.log('  - ' + e));
  console.log('\n校验未通过');
  process.exit(1);
}
console.log('\n✅ 校验通过（数据层）');
